import React, { createContext, FC, ReactNode, useContext, useEffect, useState } from 'react';
import { removeAccessToken, removeRefreshToken, setAccessToken, setRefreshToken } from './apiHandler';
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { AccessToken, LoginManager } from "react-native-fbsdk-next";
import { getUserInfo, signInWithApple, signInWithFacebook, signInWithGoogle, signOut } from "../apiClient";
import { User, UserProvider } from '../../types';
import LoadingView from "../../ui/components/LoadingView";
import { useMMKVObject } from "react-native-mmkv";
import axios, { AxiosError } from "axios";
import * as AppleAuthentication from 'expo-apple-authentication';
import { setAnalyticsUserData, trackEvent } from "../../utils/analytics";
import { AnalyticsEventName } from "../../constants/AnalyticsEventName";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: UserProvider | false;
  login: (method: UserProvider) => Promise<void>;
  authError: string | null;
  user: User | null;
  getSession: () => Promise<void>;
  logout: () => void;
}

GoogleSignin.configure({
  webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
  scopes: ['profile', 'email'],
});

export const AuthContext = createContext<AuthContextType | null>(null);
const USER_PROFILE_INFO = "@user_info";

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<UserProvider | false>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useMMKVObject<User | null>(USER_PROFILE_INFO);

  useEffect(() => {
    getSession();
  }, []);

  const getSession = async () => {
    try {
      const loggedUser = await getUserInfo();
      if (loggedUser) {
        setUser(loggedUser);
        await setAnalyticsUserData(loggedUser, true);
        setIsAuthenticated(true);
        return;
      }

      if (user) {
        setUser(user);
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
  }

  const removeData = async () => {
    setIsAuthenticated(false);
    await removeAccessToken();
    await removeRefreshToken();
    setUser(null);
  }

  const login = async (method: UserProvider) => {
    setLoading(method);
    setAuthError(null);

    if (method == UserProvider.GOOGLE) {
      await loginWithGoogle();
      return
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
          reason: 'User cancelled the login process'
        })
        return;
      }

      const data = await AccessToken.getCurrentAccessToken();
      const res = await signInWithFacebook(data.accessToken);

      if (!res) return;

      await handleReceivedTokens(res);
      await trackEvent(AnalyticsEventName.LOGIN_SUCCESS, { provider: UserProvider.FACEBOOK })
    } catch (apiError) {
      const errorMessage = apiError?.response?.data?.error?.message || 'Something went wrong'
      await trackEvent(AnalyticsEventName.LOGIN_FAILURE, {
        provider: UserProvider.FACEBOOK,
        reason: errorMessage
      });
      setAuthError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleSignInError = async (error) => {
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
          errorMessage = `Google error: ${error.code}`;
      }
    } else if (error?.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    await trackEvent(AnalyticsEventName.LOGIN_FAILURE, {
      provider: UserProvider.GOOGLE,
      reason: errorMessage,
      raw: error,
    });

    setAuthError(errorMessage);
  }

  const loginWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (!response.data) return;

      const res = await signInWithGoogle(response.data.idToken);

      if (!res) return;

      await handleReceivedTokens(res);
      await trackEvent(AnalyticsEventName.LOGIN_SUCCESS, { provider: UserProvider.GOOGLE });
    } catch (apiError) {
      await handleGoogleSignInError(apiError);
    } finally {
      setLoading(false);
    }
  }

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
      ].filter(Boolean).join(' ');

      const res = await signInWithApple(credential.identityToken, fullName);

      if (!res) return;

      await handleReceivedTokens(res);
      await trackEvent(AnalyticsEventName.LOGIN_SUCCESS, { provider: UserProvider.APPLE });
    } catch (e: any) {
      const errorMessage = e?.response?.data?.error?.message || e?.message || 'Something went wrong';

      await trackEvent(AnalyticsEventName.LOGIN_FAILURE, {
        provider: UserProvider.APPLE,
        reason: e.code === 'ERR_CANCELED' ? 'User cancelled the login process' : errorMessage
      });

      if (e.code === 'ERR_CANCELED') return;
      setAuthError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReceivedTokens = async (res) => {
    await setAccessToken(res.accessToken);
    await setRefreshToken(res.refreshToken);
    await getSession();
  }

  async function logout() {
    const { provider } = user;
    try {
      const res = await signOut();
      if (!res) return;
      await removeData();
      await trackEvent(AnalyticsEventName.LOGOUT_SUCCESS, { provider });
    } catch (error) {
      const errorMessage = error?.response?.data?.error?.message || 'Something went wrong';
      await trackEvent(AnalyticsEventName.LOGOUT_FAILURE, { provider, reason: errorMessage });
      console.log('Sign-Out Error: ', errorMessage);
    }
  }

  if (isAuthenticated == null) return <LoadingView/>;

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, authError, user, getSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};

export default AuthProvider;