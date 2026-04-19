import { AxiosResponse } from 'axios';

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
import { api } from './apiHandler';

const call = async <T, F>(
    label: string,
    fallback: F,
    fn: () => Promise<AxiosResponse<T>>,
): Promise<T | F> => {
    try {
        const res = await fn();
        return res.data;
    } catch (e) {
        console.error(label, e);
        return fallback;
    }
};

const SKIP_REFRESH = { _skipAuthRefresh: true };

export const getUserInfo = async (): Promise<User | null> => {
    const res = await api.get<User | null>('/users/users', { timeout: 10000 });
    return res.data;
};

export const updateUserLanguages = (
    mainLang: LanguageCode,
    translationLang: LanguageCode,
    level: LanguageLevelRange,
) =>
    call('PUT /users/languages', null, () =>
        api.put('/users/languages', { level, mainLang, translationLang }),
    );

export const signInWithGoogle = (idToken: string) =>
    call('POST /auth/login/google', null, async () => {
        const data = await createAuthData({ idToken });
        return api.post('/auth/login/google', data, SKIP_REFRESH);
    });

export const signInWithFacebook = (accessToken: string) =>
    call('POST /auth/login/facebook', null, async () => {
        const data = await createAuthData({ accessToken });
        return api.post('/auth/login/facebook', data, SKIP_REFRESH);
    });

export const signInWithApple = (accessToken: string, fullName: string) =>
    call('POST /auth/login/apple', null, async () => {
        const data = await createAuthData({ accessToken, fullName });
        return api.post('/auth/login/apple', data, SKIP_REFRESH);
    });

export const signOut = () =>
    call('POST /auth/auth/logout', null, async () => {
        const data = await createAuthData();
        return api.post('/auth/auth/logout', data);
    });

export const updateSuggestionsInSession = (enabled: boolean) =>
    call('PATCH /users/suggestions-in-session', null, () =>
        api.patch('/users/suggestions-in-session', { enabled }),
    );

export const updateNotificationsEnabled = (enabled: boolean) =>
    call('PATCH /notifications', null, () => api.patch('/notifications', { enabled }));

export const updateLanguageLevels = (languageLevels: LanguageLevel[]) =>
    call('PUT /users/language-levels', null, () =>
        api.put('/users/language-levels', { languageLevels }),
    );

export const registerDeviceToken = (token: string) =>
    call('POST /notifications/devices', null, async () => {
        const data = await createAuthData({ token });
        return api.post('/notifications/devices', data);
    });

export const syncWordsOnServer = (words: Word[]): Promise<SyncResult[] | null> =>
    call('POST /api/words/sync', null, () => api.post<SyncResult[]>('/api/words/sync', words));

export const fetchUpdatedWords = (since: string): Promise<Word[]> =>
    call<Word[], Word[]>('GET /api/words', [], () => api.get<Word[]>(`/api/words?since=${since}`));

export const syncSessionsOnServer = (sessions: Session[]): Promise<SyncResult[] | null> =>
    call('POST /sessions/sessions/sync', null, () =>
        api.post<SyncResult[]>('/sessions/sessions/sync', sessions),
    );

export const fetchUpdatedSessions = (since: string): Promise<Session[]> =>
    call<Session[], Session[]>('GET /sessions/sessions', [], () =>
        api.get<Session[]>(`/sessions/sessions?since=${since}`),
    );

export const fetchUpdatedEvaluations = (since: string): Promise<Evaluation[]> =>
    call<Evaluation[], Evaluation[]>(`GET /evaluations/?since=${since}`, [], () =>
        api.get<Evaluation[]>(`/evaluations/evaluations/?since=${since}`),
    );

export const syncEvaluationsOnServer = (evaluations: Evaluation[]): Promise<SyncResult[] | null> =>
    call('POST /evaluations/evaluations/sync', null, () =>
        api.post<SyncResult[]>('/evaluations/evaluations/sync', evaluations),
    );

export const fetchUpdatedSuggestions = (
    mainLang: string,
    translationLang: string,
    since: string,
): Promise<Suggestion[]> =>
    call<Suggestion[], Suggestion[]>(`GET /suggestions/?since=${since}`, [], () =>
        api.get<Suggestion[]>(
            `/suggestions/?since=${since}&mainLang=${mainLang}&translationLang=${translationLang}`,
            { timeout: 30000 },
        ),
    );

export const syncSuggestionsOnServer = (suggestions: Suggestion[]): Promise<SyncResult[] | null> =>
    call('POST /suggestions/sync', null, () =>
        api.post<SyncResult[]>('/suggestions/sync', suggestions),
    );

export const translateText = async (
    text: string,
    from: string,
    to: string,
    signal?: AbortSignal,
): Promise<string> => {
    const res = await api.post<TranslateResponse>(
        '/translations/translate',
        { from, text, to },
        { signal },
    );
    return res.data.translation;
};
