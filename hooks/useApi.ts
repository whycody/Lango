import { apiCall } from "../auth/ApiHandler";
import { User } from "../auth/AuthProvider";
import DeviceInfo from 'react-native-device-info';

const deviceId = DeviceInfo.getUniqueId();

export const getUserInfo: () => Promise<User | null> = async () => {
  try {
    return await apiCall({
      method: 'GET',
      url: '/users/users',
      data: {}
    });
  } catch (e) {
    console.error('GET /users/users', e);
    return null;
  }
}

export const signInWithGoogle = async (idToken: string) => {
  try {
    return await apiCall({
      method: 'POST',
      url: '/auth/login/google',
      data: { idToken, deviceId }
    }, true);
  } catch (e) {
    console.error('POST /auth/login/google', e);
    return null;
  }
}

export const signInWithFacebook = async (accessToken: string) => {
  try {
    return await apiCall({
      method: 'POST',
      url: '/auth/login/facebook',
      data: { accessToken, deviceId }
    }, true);
  } catch (e) {
    console.error('POST /auth/login/facebook', e);
    return null;
  }
}

export const refreshToken = async (refreshToken: string) => {
  try {
    return await apiCall({
      method: 'POST',
      url: '/auth/auth/refresh',
      data: { refreshToken, deviceId }
    }, true);
  } catch (e) {
    console.error('POST /auth/auth/refresh', e);
    return null;
  }
}

export const signOut = async () => {
  try {
    return await apiCall({
      method: 'POST',
      url: '/auth/auth/logout',
      data: { deviceId }
    }, true);
  } catch (e) {
    console.error('POST /auth/auth/logout', e);
    return null;
  }
}