import { ApiResponse } from 'apisauce';

import { ApiErrorCode, SyncResult, Word } from '../types';
import { resolveApiErrorCode } from '../utils/apiErrorUtils';
import { Api, api } from './api';

const WORDS_API_ROUTES = {
    sync: '/api/words/sync',
    words: (since: string) => `/api/words?since=${since}`,
} as const;

export type WordsApiResult<T> =
    | { data: T; kind: 'ok' }
    | { errorCode: ApiErrorCode; kind: 'error' };

class WordsApi {
    api: Api;
    constructor(api: Api) {
        this.api = api;
    }

    async syncWordsOnServer(words: Word[]): Promise<WordsApiResult<SyncResult[]>> {
        const response: ApiResponse<SyncResult[]> = await this.api.apisauce.post(
            WORDS_API_ROUTES.sync,
            words,
        );
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }

    async fetchUpdatedWords(since: string): Promise<WordsApiResult<Word[]>> {
        const response: ApiResponse<Word[]> = await this.api.apisauce.get(
            WORDS_API_ROUTES.words(since),
        );
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }
}

export const wordsApi = new WordsApi(api);
