import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { ActivityIndicator, Image, View } from 'react-native';
import { setAccessToken, setRefreshToken } from './ApiHandler';
import LoginScreen from "../screens/LoginScreen";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import CustomText from "../components/CustomText";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { AccessToken, LoginManager } from "react-native-fbsdk-next";

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
  method: 'google' | 'facebook';
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
    const checkAuth = async () => {
      try {
        const currentSession = GoogleSignin.getCurrentUser();

        if (currentSession) {
          setGoogleUser(currentSession);
          return;
        }

        const data = await AccessToken.getCurrentAccessToken();

        if (data) {
          await setFacebookUser(data);
          return;
        }

        setIsAuthenticated(false);
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const setGoogleUser = (currentSession) => {
    const currentUser = currentSession?.user;
    setUser({
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      photo: getHighResPhoto(currentUser.photo),
      method: 'google'
    });
    setIsAuthenticated(true);
  }

  const setFacebookUser = async (data) => {
    const response = await fetch(`https://graph.facebook.com/me?fields=id,name,picture.type(large)&access_token=${data.accessToken}`);
    const userInfo = await response.json();

    setUser({
      id: userInfo.id,
      name: userInfo.name,
      email: '',
      photo: userInfo.picture.data.url,
      method: 'facebook'
    });

    setIsAuthenticated(true);
  }

  async function logout() {
    try {
      await GoogleSignin.signOut();
      LoginManager.logOut();
      setIsAuthenticated(false);
    } catch (error) {
      console.log('Google Sign-Out Error: ', error);
    }
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
      setFacebookUser(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const loginWithGoogle = async () => {
    try {
      const response = await GoogleLogin();
      if (response.data) {
        setGoogleUser(GoogleSignin.getCurrentUser());
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