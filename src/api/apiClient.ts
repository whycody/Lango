import { LanguageCode } from '../constants/Language';
import {
    Evaluation,
    LanguageLevel,
    LanguageLevelRange,
    Session,
    Suggestion,
    SyncResult,
    TranslateResponse,
    User,
    Word,
} from '../types';
import { createAuthData } from '../utils/authUtils';
import { apiCall } from './apiHandler';

export const getUserInfo: () => Promise<User | null> = async () => {
    return await apiCall({ method: 'GET', url: '/users/users' }, false, 10000);
};

export const updateUserLanguages = async (
    mainLang: LanguageCode,
    translationLang: LanguageCode,
    level: LanguageLevelRange,
) => {
    try {
        return await apiCall({
            data: { level, mainLang, translationLang },
            method: 'PUT',
            url: '/users/languages',
        });
    } catch (e) {
        console.error('PUT /users/languages', e);
        return null;
    }
};

export const signInWithGoogle = async (idToken: string) => {
    try {
        const data = await createAuthData({ idToken });
        return await apiCall({ data, method: 'POST', url: '/auth/login/google' }, true);
    } catch (e) {
        console.error('POST /auth/login/google', e);
        return null;
    }
};

export const signInWithFacebook = async (accessToken: string) => {
    try {
        const data = await createAuthData({ accessToken });
        return await apiCall({ data, method: 'POST', url: '/auth/login/facebook' }, true);
    } catch (e) {
        console.error('POST /auth/login/facebook', e);
        return null;
    }
};

export const signInWithApple = async (accessToken: string, fullName: string) => {
    try {
        const data = await createAuthData({ accessToken, fullName });
        return await apiCall({ data, method: 'POST', url: '/auth/login/apple' }, true);
    } catch (e) {
        console.error('POST /auth/login/apple', e);
        return null;
    }
};

export const signOut = async () => {
    try {
        const data = await createAuthData();
        return await apiCall({ data, method: 'POST', url: '/auth/auth/logout' }, true);
    } catch (e) {
        console.error('POST /auth/auth/logout', e);
        return null;
    }
};

export const updateSuggestionsInSession = async (enabled: boolean) => {
    try {
        return await apiCall({
            data: { enabled },
            method: 'PATCH',
            url: '/users/suggestions-in-session',
        });
    } catch (e) {
        console.error('PATCH /users/suggestions-in-session', e);
        return null;
    }
};

export const updateNotificationsEnabled = async (enabled: boolean) => {
    try {
        return await apiCall({ data: { enabled }, method: 'PATCH', url: '/notifications' });
    } catch (e) {
        console.error('PATCH /notifications', e);
        return null;
    }
};

export const updateLanguageLevels = async (languageLevels: LanguageLevel[]) => {
    try {
        return await apiCall(
            {
                data: { languageLevels },
                method: 'PUT',
                url: '/users/language-levels',
            },
            true,
        );
    } catch (e) {
        console.error('PUT /users/language-levels', e);
        return null;
    }
};

export const registerDeviceToken = async (token: string) => {
    try {
        const data = await createAuthData({ token });
        return await apiCall({ data, method: 'POST', url: '/notifications/devices' }, true);
    } catch (e) {
        console.error('POST /notifications/devices', e);
        return null;
    }
};

export const syncWordsOnServer = async (words: Word[]): Promise<SyncResult[] | null> => {
    try {
        return await apiCall({
            data: words,
            method: 'POST',
            url: '/api/words/sync',
        });
    } catch (e) {
        console.error('POST /api/words/sync', e);
        return null;
    }
};

export const fetchUpdatedWords = async (since: string): Promise<Word[]> => {
    try {
        return await apiCall({
            data: {},
            method: 'GET',
            url: `/api/words?since=${since}`,
        });
    } catch (e) {
        console.error('GET /api/words', e);
        return [];
    }
};

export const syncSessionsOnServer = async (sessions: Session[]): Promise<SyncResult[] | null> => {
    try {
        return await apiCall({
            data: sessions,
            method: 'POST',
            url: '/sessions/sessions/sync',
        });
    } catch (e) {
        console.error('POST /sessions/sessions/sync', e);
        return null;
    }
};

export const fetchUpdatedSessions = async (since: string): Promise<Session[]> => {
    try {
        return await apiCall({
            data: {},
            method: 'GET',
            url: `/sessions/sessions?since=${since}`,
        });
    } catch (e) {
        console.error('GET /sessions/sessions', e);
        return [];
    }
};

export const fetchUpdatedEvaluations = async (since: string): Promise<Evaluation[]> => {
    try {
        return await apiCall({
            data: {},
            method: 'GET',
            url: `/evaluations/evaluations/?since=${since}`,
        });
    } catch (e) {
        console.error(`GET /evaluations/?since=${since}`, e);
        return [];
    }
};

export const syncEvaluationsOnServer = async (
    evaluations: Evaluation[],
): Promise<SyncResult[] | null> => {
    try {
        return await apiCall({
            data: evaluations,
            method: 'POST',
            url: '/evaluations/evaluations/sync',
        });
    } catch (e) {
        console.error('POST /evaluations/evaluations/sync', e);
        return null;
    }
};

export const fetchUpdatedSuggestions = async (
    mainLang: string,
    translationLang: string,
    since: string,
): Promise<Suggestion[]> => {
    try {
        return await apiCall(
            {
                data: {},
                method: 'GET',
                url: `/suggestions/?since=${since}&mainLang=${mainLang}&translationLang=${translationLang}`,
            },
            false,
            30000,
        );
    } catch (e) {
        console.error(`GET /suggestions/?since=${since}`, e);
        return [];
    }
};

export const syncSuggestionsOnServer = async (
    suggestions: Suggestion[],
): Promise<SyncResult[] | null> => {
    try {
        return await apiCall({
            data: suggestions,
            method: 'POST',
            url: '/suggestions/sync',
        });
    } catch (e) {
        console.error('POST /suggestions/sync', e);
        return null;
    }
};

export const translateText = async (
    text: string,
    from: string,
    to: string,
    signal?: AbortSignal,
): Promise<string> => {
    const response = await apiCall<TranslateResponse>({
        data: { from, text, to },
        method: 'POST',
        signal,
        url: '/translations/translate',
    });

    return response.translation;
};
