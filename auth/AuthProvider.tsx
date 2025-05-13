import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { ActivityIndicator, Image, View } from 'react-native';
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

const GoogleLogin = async () => {
  await GoogleSignin.hasPlayServices();
  return await GoogleSignin.signIn();
};

export type User = {
  userId: string;
  name: string;
  email: string;
  picture: string;
  provider: 'google' | 'facebook';
}

export const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_METHOD_KEY = '@auth_method';
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
    const loggedUser = await getUserInfo();
    if (loggedUser) {
      setUser(loggedUser);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
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

  const removeData = async () => {
    setIsAuthenticated(false);
    await removeAccessToken();
    await removeRefreshToken();
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
      const response = await GoogleLogin();
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