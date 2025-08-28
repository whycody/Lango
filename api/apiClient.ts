import { apiCall } from "./auth/apiHandler";
import DeviceInfo from 'react-native-device-info';
import { Evaluation, Session, Suggestion, SyncResult, User, Word } from "../store/types";

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

export const syncWordsOnServer = async (words: Word[]): Promise<SyncResult[]> => {
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

export const syncSessionsOnServer = async (sessions: Session[]): Promise<SyncResult[]> => {
  try {
    return await apiCall({
      method: 'POST',
      url: '/sessions/sessions/sync',
      data: sessions
    });
  } catch (e) {
    console.error('POST /sessions/sessions/sync', e);
    return null;
  }
};

export const fetchUpdatedSessions = async (since: string): Promise<Session[]> => {
  try {
    return await apiCall({
      method: 'GET',
      url: `/sessions/sessions?since=${since}`,
      data: {}
    });
  } catch (e) {
    console.error('GET /sessions/sessions', e);
    return [];
  }
};

export const fetchUpdatedEvaluations = async (since: string): Promise<Evaluation[]> => {
  try {
    return await apiCall({
      method: 'GET',
      url: `/evaluations/evaluations/?since=${since}`,
      data: {}
    });
  } catch (e) {
    console.error(`GET /evaluations/?since=${since}`, e);
    return [];
  }
};


export const syncEvaluationsOnServer = async (evaluations: Evaluation[]): Promise<SyncResult[]> => {
  try {
    return await apiCall({
      method: 'POST',
      url: '/evaluations/evaluations/sync',
      data: evaluations
    });
  } catch (e) {
    console.error('POST /evaluations/evaluations/sync', e);
    return null;
  }
};

export const fetchUpdatedSuggestions = async (mainLang: string, translationLang: string, since: string): Promise<Suggestion[]> => {
  try {
    return await apiCall({
      method: 'GET',
      url: `/suggestions/?since=${since}&mainLang=${mainLang}&translationLang=${translationLang}`,
      data: {}
    }, false, 10000);
  } catch (e) {
    console.error(`GET /suggestions/?since=${since}`, e);
    return [];
  }
};

export const syncSuggestionsOnServer = async (suggestions: Suggestion[]): Promise<SyncResult[]> => {
  try {
    return await apiCall({
      method: 'POST',
      url: '/suggestions/sync',
      data: suggestions
    });
  } catch (e) {
    console.error('POST /suggestions/sync', e);
    return null;
  }
};