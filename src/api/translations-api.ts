import { ApiResponse } from 'apisauce';

import { ApiErrorCode, TranslateRequest, TranslateResponse } from '../types';
import { resolveApiErrorCode } from '../utils/apiErrorUtils';
import { Api, api } from './api';

const TRANSLATIONS_API_ROUTES = {
    translate: '/translations/translate',
} as const;

export type TranslationsApiResult<T> =
    | { data: T; kind: 'ok' }
    | { errorCode: ApiErrorCode; kind: 'error' };

class TranslationsApi {
    api: Api;
    constructor(api: Api) {
        this.api = api;
    }

    async translateText(
        text: string,
        from: string,
        to: string,
        signal?: AbortSignal,
    ): Promise<TranslationsApiResult<TranslateResponse>> {
        const body: TranslateRequest = { from, text, to };
        const response: ApiResponse<TranslateResponse> = await this.api.apisauce.post(
            TRANSLATIONS_API_ROUTES.translate,
            body,
            { signal },
        );
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }
}

export const translationsApi = new TranslationsApi(api);
