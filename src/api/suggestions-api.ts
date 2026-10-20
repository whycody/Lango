import { ApiResponse } from 'apisauce';

import {
    ExampleFlashcard,
    LanguageLevelRange,
    Suggestion,
    SyncResultWithRejections,
} from '../types';
import { resolveApiErrorCode } from '../utils/apiErrorUtils';
import { Api, api } from './api';
import {
    FetchExampleFlashcardsApi,
    FetchUpdatedSuggestionsApi,
    SyncSuggestionsOnServerApi,
} from './api.types';

const SUGGESTIONS_API_ROUTES = {
    examples: '/suggestions/examples',
    suggestions: (mainLang: string, translationLang: string, since: string) =>
        `/suggestions/?since=${since}&mainLang=${mainLang}&translationLang=${translationLang}`,
    sync: '/suggestions/sync',
} as const;

class SuggestionsApi {
    api: Api;

    constructor(api: Api) {
        this.api = api;
    }

    async fetchUpdatedSuggestions(
        mainLang: string,
        translationLang: string,
        since: string,
    ): Promise<FetchUpdatedSuggestionsApi> {
        const response: ApiResponse<Suggestion[]> = await this.api.apisauce.get(
            SUGGESTIONS_API_ROUTES.suggestions(mainLang, translationLang, since),
            {},
            { timeout: 30000 },
        );
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }

    async syncSuggestionsOnServer(suggestions: Suggestion[]): Promise<SyncSuggestionsOnServerApi> {
        const response: ApiResponse<SyncResultWithRejections<Suggestion>> =
            await this.api.apisauce.post(SUGGESTIONS_API_ROUTES.sync, suggestions);
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }

    async fetchExampleFlashcards(
        mainLang: string,
        translationLang: string,
        level: LanguageLevelRange,
        count: number = 15,
        signal?: AbortSignal,
    ): Promise<FetchExampleFlashcardsApi> {
        const response: ApiResponse<ExampleFlashcard[]> = await this.api.apisauce.get(
            SUGGESTIONS_API_ROUTES.examples,
            { count, level, mainLang, translationLang },
            { signal, timeout: 15000 },
        );
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }
}

export const suggestionsApi = new SuggestionsApi(api);
