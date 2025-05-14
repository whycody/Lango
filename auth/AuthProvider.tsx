import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { ActivityIndicator, Image, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { removeAccessToken, removeRefreshToken, setAccessToken, setRefreshToken } from './ApiHandler';
import LoginScreen from "../screens/LoginScreen";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import CustomText from "../components/CustomText";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { AccessToken, LoginManager } from "react-native-fbsdk-next";
import { getUserInfo, signInWithFacebook, signInWithGoogle, signOut } from "../hooks/useApi";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  logout: () => void;
}

GoogleSignin.configure({
  webClientId: process.env["GOOGLE_WEB_CLIENT_ID"],
  iosClientId: process.env["GOOGLE_IOS_CLIENT_ID"],
  scopes: ['profile', 'email'],
});

export type User = {
  userId: string;
  name: string;
  email: string;
  picture: string;
  provider: 'google' | 'facebook';
}

export const AuthContext = createContext<AuthContextType | null>(null);
const USER_PROFILE_INFO = "@user_info";

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<"Google" | "Facebook" | false>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getSession();
  }, []);

  const getSession = async () => {
    try {
      const loggedUser = await getUserInfo();
      if (loggedUser) {
        await saveUserToStorage(loggedUser);
        setUser(loggedUser);
        setIsAuthenticated(true);
        return;
      }

      const storedUser = await getUserFromStorage();
      if (storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.log("Error loading session: ", error);
      await removeData();
    }
  }

  const saveUserToStorage = async (user: User) => {
    await AsyncStorage.setItem(USER_PROFILE_INFO, JSON.stringify(user));
  }

  const getUserFromStorage = async (): Promise<User | null> => {
    try {
      const userJson = await AsyncStorage.getItem(USER_PROFILE_INFO);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.log("Error loading user from storage: ", error);
      return null;
    }
  }

  const removeData = async () => {
    setIsAuthenticated(false);
    await removeAccessToken();
    await removeRefreshToken();
    await AsyncStorage.removeItem(USER_PROFILE_INFO);
    setUser(null);
  }

  const login = async (method: 'Google' | 'Facebook') => {
    setLoading(method);
    if (method == 'Google') await loginWithGoogle();
    else await loginWithFacebook();
  };

  const loginWithFacebook = async () => {
    try {
      const result = await LoginManager.logInWithPermissions(['public_profile']);

      if (result.isCancelled) {
        console.log('Login cancelled');
        return;
      }

      const data = await AccessToken.getCurrentAccessToken();
      const res = await signInWithFacebook(data.accessToken);
      if (res) await handleReceivedTokens(res);
    } catch (apiError) {
      setAuthError(apiError?.response?.data?.error?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const loginWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const res = await signInWithGoogle(response.data.idToken);
      if (res) await handleReceivedTokens(res);
    } catch (apiError) {
      setAuthError(apiError?.response?.data?.error?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const handleReceivedTokens = async (res) => {
    await setAccessToken(res.accessToken);
    await setRefreshToken(res.refreshToken);
    await getSession();
  }

  async function logout() {
    try {
      const res = await signOut();
      if (!res) return;
      await removeData();
    } catch (error) {
      console.log('Sign-Out Error: ', error);
    }
  }

  if (isAuthenticated == null)
    return (
      <>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 90 }}>
          <ActivityIndicator size="large" color={colors.primary}/>
          <CustomText
            weight={'Bold'}
            style={{ color: colors.primary300, fontSize: 17, marginTop: 30 }}
          >
            {t('loading_content')}
          </CustomText>
          <CustomText style={{ color: colors.primary600, fontSize: 14, marginTop: 5 }}>
            {t('loading_content_desc')}
          </CustomText>
        </View>
        <Image
          source={require('../assets/lango-logo.png')}
          style={{
            height: 40,
            alignSelf: 'center',
            marginBottom: 50,
          }}
          resizeMode="contain"
        />
      </>
    );

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, logout }}>
      {isAuthenticated ? children : <LoginScreen login={login} authError={authError} loading={loading}/>}
    </AuthContext.Provider>
  );
};

export default AuthProvider;