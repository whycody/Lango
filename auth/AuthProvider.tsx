import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { setAccessToken, setRefreshToken } from './ApiHandler';
import LoginScreen from "../screens/LoginScreen";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import CustomText from "../components/CustomText";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

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
  id: string;
  name: string;
  email: string;
  photo: string;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<"Google" | "Facebook" | false>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const getHighResPhoto = (photo: string) => photo.replace(/=s\d+-c$/, '=s400-c');

  useEffect(() => {
    const checkAuth = () => {
      try {
        const currentSession = GoogleSignin.getCurrentUser();
        setIsAuthenticated(!!currentSession);
        if (!currentSession) return;
        const currentUser = currentSession?.user;
        setUser({
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          photo: getHighResPhoto(currentUser.photo)
        });
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  async function logout() {
    try {
      await GoogleSignin.signOut();
      setIsAuthenticated(false);
    } catch (error) {
      console.log('Google Sign-Out Error: ', error);
    }
  }

  const login = async (method: 'Google' | 'Facebook') => {
    setLoading(method);
    if (method == 'Google') await loginWithGoogle();
    else {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const response = await GoogleLogin();
      if (response.data.idToken) {
        setIsAuthenticated(true);
        const currentUser = response.data.user;
        setUser({
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          photo: getHighResPhoto(currentUser.photo)
        });
      }
    } catch (apiError) {
      setAuthError(apiError?.response?.data?.error?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const setTokens = (accessToken: string, refreshToken: string) => {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setIsAuthenticated(true);
  };

  if (isAuthenticated === null)
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
    );

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, logout }}>
      {isAuthenticated ? children : <LoginScreen login={login} authError={authError} loading={loading}/>}
    </AuthContext.Provider>
  );
};

export default AuthProvider;