import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { removeAccessToken, removeRefreshToken, setAccessToken, setRefreshToken } from './apiHandler';
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { AccessToken, LoginManager } from "react-native-fbsdk-next";
import { getUserInfo, signInWithFacebook, signInWithGoogle, signOut } from "../apiClient";
import { User } from '../../store/types';
import LoadingView from "../../components/LoadingView";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: "Google" | "Facebook" | false;
  login: (method: 'Google' | 'Facebook') => Promise<void>;
  authError: string | null;
  user: User | null;
  getSession: () => Promise<void>;
  logout: () => void;
}

GoogleSignin.configure({
  webClientId: process.env["GOOGLE_WEB_CLIENT_ID"],
  iosClientId: process.env["GOOGLE_IOS_CLIENT_ID"],
  scopes: ['profile', 'email'],
});

export const AuthContext = createContext<AuthContextType | null>(null);
const USER_PROFILE_INFO = "@user_info";

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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