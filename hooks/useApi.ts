import { apiCall } from "../auth/ApiHandler";
import { User } from "../auth/AuthProvider";
import DeviceInfo from 'react-native-device-info';
import { Word } from "../store/WordsContext";

const getDeviceId = async () => {
  try {
    return await DeviceInfo.getUniqueId();
  } catch (e) {
    console.error('Error getting device ID:', e);
    return '';
  }
}

export const getUserInfo: () => Promise<User | null> = async () => {
  return await apiCall({
    method: 'GET',
    url: '/users/users',
    data: {}
  });
}

export const signInWithGoogle = async (idToken: string) => {
  try {
    const deviceId = await getDeviceId();
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
    const deviceId = await getDeviceId();
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

export const refreshTokens = async (refreshToken: string) => {
  try {
    const deviceId = await getDeviceId();
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
    const deviceId = await getDeviceId();
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

export const syncWordsOnServer = async (words: Word[]) => {
  try {
    return await apiCall({
      method: 'POST',
      url: '/api/words/sync',
      data: words
    });
  } catch (e) {
    console.error('POST /api/words/sync', e);
    return null;
  }
};

export const fetchUpdatedWords = async (since: string): Promise<Word[]> => {
  try {
    return await apiCall({
      method: 'GET',
      url: `/api/words?since=${since}`,
      data: {}
    });
  } catch (e) {
    console.error('GET /api/words', e);
    return [];
  }
};