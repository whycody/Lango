import React, { createContext, FC, ReactNode, useContext, useEffect, useState } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import axios, { AxiosError } from 'axios';
import * as AppleAuthentication from 'expo-apple-authentication';
import { AccessToken, LoginManager } from 'react-native-fbsdk-next';
import { useMMKV, useMMKVObject } from 'react-native-mmkv';

import {
    getUserInfo,
    signInWithApple,
    signInWithFacebook,
    signInWithGoogle,
    signOut,
    updateLanguageLevels,
    updateNotificationsEnabled,
} from '../api/apiClient';
import {
    removeAccessToken,
    removeRefreshToken,
    setAccessToken,
    setRefreshToken,
} from '../api/apiHandler';
import { AnalyticsEventName } from '../constants/AnalyticsEventName';
import { UserProvider } from '../constants/User';
import { LanguageLevel, User, UserUpdatePayload } from '../types';
import { LoadingView } from '../ui/containers/login/LoadingView';
import { setAnalyticsUserData, trackEvent } from '../utils/analytics';
import { registerNotificationsToken } from '../utils/registerNotificationsToken';

interface AuthContextType {
    authError: string | null;
    getSession: () => Promise<void>;
    isAuthenticated: boolean;
    loading: UserProvider | false;
    login: (method: UserProvider) => Promise<void>;
    logout: () => void;
    updateUserLanguageLevels: (languageLevels: LanguageLevel) => Promise<void>;
    updateUserNotificationsEnabled: (notificationsEnabled: boolean) => Promise<void>;
    user: User | null;
}

GoogleSignin.configure({
    iosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
    scopes: ['profile', 'email'],
    webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
});

export const AuthContext = createContext<AuthContextType | null>(null);
const USER_PROFILE_INFO = '@user_info';

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<UserProvider | false>(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [user, setUser] = useMMKVObject<User | null>(USER_PROFILE_INFO);

    const storage = user?.userId ? useMMKV({ id: `user-${user.userId}` }) : useMMKV();
    const [userUpdatePayload, setUserUpdatePayload] = useMMKVObject<UserUpdatePayload>(
        'user-update-payload',
        storage,
    );

    useEffect(() => {
        getSession();
    }, []);

    const getSession = async () => {
        try {
            let loggedUser = await getUserInfo();

            if (loggedUser) {
                const userUpdated = await sendUserUpdates(userUpdatePayload);
                loggedUser = userUpdated ? await getUserInfo() : loggedUser;
                setUser(loggedUser);
                await setAnalyticsUserData(loggedUser, true);
                setIsAuthenticated(true);
                return;
            }

            if (user) {
                await setAnalyticsUserData(user, false);
                setIsAuthenticated(true);
                return;
            }

            setIsAuthenticated(false);
        } catch (error) {
            if (axios.isAxiosError(error) && error.code === AxiosError.ERR_NETWORK && user) {
                setUser(user);
                setIsAuthenticated(true);
            }
            if (error.response?.status !== 401) return;
            await removeData();
        }
    };

    const sendUserUpdates = async (payload?: UserUpdatePayload) => {
        if (!payload || (!payload.notificationsEnabled && !payload.languageLevels?.length))
            return false;

        let updated = false;

        if (payload?.notificationsEnabled !== undefined) {
            const res = await updateNotificationsEnabled(userUpdatePayload.notificationsEnabled);
            if (res) {
                if (userUpdatePayload.notificationsEnabled) await registerNotificationsToken();
                setUserUpdatePayload(payload =>
                    payload ? { ...payload, notificationsEnabled: undefined } : null,
                );
                updated = true;
            }
        }

        if (payload?.languageLevels?.length) {
            const res = await updateLanguageLevels(userUpdatePayload.languageLevels);
            if (res) {
                setUserUpdatePayload(payload =>
                    payload ? { ...payload, languageLevels: undefined } : null,
                );
                updated = true;
            }
        }

        return updated;
    };

    const updateUserNotificationsEnabled = async (notificationsEnabled: boolean) => {
        setUser(user => (user ? { ...user, notificationsEnabled } : null));
        const updated = await updateNotificationsEnabled(notificationsEnabled);
        if (updated) {
            await registerNotificationsToken();
            await getSession();
        } else {
            setUserUpdatePayload(
                userUpdatePayload
                    ? {
                          ...userUpdatePayload,
                          notificationsEnabled,
                      }
                    : { notificationsEnabled },
            );
        }
    };

    const updateUserLanguageLevels = async (languageLevel: LanguageLevel) => {
        const levelsToUpdate = [
            ...(userUpdatePayload?.languageLevels ?? []).filter(
                l => l.language !== languageLevel.language,
            ),
            languageLevel,
        ];

        setUser(user => (user ? { ...user, languageLevels: levelsToUpdate } : null));
        const updated = await updateLanguageLevels([languageLevel]);

        if (updated) {
            await getSession();
            setUserUpdatePayload({ ...userUpdatePayload, languageLevels: undefined });
            return;
        }

        setUserUpdatePayload({
            ...userUpdatePayload,
            languageLevels: levelsToUpdate,
        });
    };

    const removeData = async () => {
        setIsAuthenticated(false);
        await removeAccessToken();
        await removeRefreshToken();
        setUser(null);
    };

    const login = async (method: UserProvider) => {
        setLoading(method);
        setAuthError(null);

        if (method == UserProvider.GOOGLE) {
            await loginWithGoogle();
            return;
        }

        if (method == UserProvider.FACEBOOK) {
            await loginWithFacebook();
            return;
        }

        await loginWithApple();
    };

    const loginWithFacebook = async () => {
        try {
            const result = await LoginManager.logInWithPermissions(['public_profile']);

            if (result.isCancelled) {
                console.log('Login cancelled');
                await trackEvent(AnalyticsEventName.LOGIN_FAILURE, {
                    provider: UserProvider.FACEBOOK,
                    reason: 'User cancelled the login process',
                });
                return;
            }

            const data = await AccessToken.getCurrentAccessToken();
            const res = await signInWithFacebook(data.accessToken);

            if (!res) return;

            await handleReceivedTokens(res);
            await trackEvent(AnalyticsEventName.LOGIN_SUCCESS, {
                provider: UserProvider.FACEBOOK,
            });
        } catch (apiError) {
            const errorMessage = apiError?.response?.data?.error?.message || 'Something went wrong';
            await trackEvent(AnalyticsEventName.LOGIN_FAILURE, {
                provider: UserProvider.FACEBOOK,
                reason: errorMessage,
            });
            setAuthError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignInError = async error => {
        let errorMessage = 'Unknown error';

        if (error.code) {
            switch (error.code) {
                case statusCodes.SIGN_IN_CANCELLED:
                    errorMessage = 'User cancelled login';
                    break;

                case statusCodes.IN_PROGRESS:
                    errorMessage = 'Login already in progress';
                    break;

                case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                    errorMessage = 'Google Play Services not available or outdated';
                    break;

                default:
                    errorMessage = `Google error: ${error}`;
            }
        } else if (error?.response?.data?.error?.message) {
            errorMessage = error.response.data.error.message;
        } else if (error?.message) {
            errorMessage = error.message;
        }

        await trackEvent(AnalyticsEventName.LOGIN_FAILURE, {
            provider: UserProvider.GOOGLE,
            raw: JSON.stringify(error),
            reason: errorMessage,
        });

        setAuthError(errorMessage);
    };

    const loginWithGoogle = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();

            if (!response.data) return;

            const res = await signInWithGoogle(response.data.idToken);

            if (!res) return;

            await handleReceivedTokens(res);
            await trackEvent(AnalyticsEventName.LOGIN_SUCCESS, {
                provider: UserProvider.GOOGLE,
            });
        } catch (apiError) {
            await handleGoogleSignInError(apiError);
        } finally {
            setLoading(false);
        }
    };

    const loginWithApple = async () => {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            const fullName = [
                credential.fullName?.givenName,
                credential.fullName?.middleName,
                credential.fullName?.familyName,
            ]
                .filter(Boolean)
                .join(' ');

            const res = await signInWithApple(credential.identityToken, fullName);

            if (!res) return;

            await handleReceivedTokens(res);
            await trackEvent(AnalyticsEventName.LOGIN_SUCCESS, {
                provider: UserProvider.APPLE,
            });
        } catch (e: any) {
            const errorMessage =
                e?.response?.data?.error?.message || e?.message || 'Something went wrong';

            await trackEvent(AnalyticsEventName.LOGIN_FAILURE, {
                provider: UserProvider.APPLE,
                reason:
                    e.code === 'ERR_CANCELED' ? 'User cancelled the login process' : errorMessage,
            });

            if (e.code === 'ERR_CANCELED') return;
            setAuthError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleReceivedTokens = async res => {
        await setAccessToken(res.accessToken);
        await setRefreshToken(res.refreshToken);
        await getSession();
    };

    async function logout() {
        const { provider } = user;
        try {
            const res = await signOut();
            if (!res) return;
            await removeData();
            await trackEvent(AnalyticsEventName.LOGOUT_SUCCESS, { provider });
        } catch (error) {
            const errorMessage = error?.response?.data?.error?.message || 'Something went wrong';
            await trackEvent(AnalyticsEventName.LOGOUT_FAILURE, {
                provider,
                reason: errorMessage,
            });
            console.log('Sign-Out Error: ', errorMessage);
        }
    }

    if (isAuthenticated == null) return <LoadingView />;

    return (
        <AuthContext.Provider
            value={{
                authError,
                getSession,
                isAuthenticated,
                loading,
                login,
                logout,
                updateUserLanguageLevels,
                updateUserNotificationsEnabled,
                user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
};
