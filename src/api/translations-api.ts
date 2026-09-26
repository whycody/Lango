import { ApiResponse } from 'apisauce';

import { resolveApiErrorCode } from '../utils/apiErrorUtils';
import { Api, api } from './api';
import { TranslateRequest, TranslateResponse, TranslateTextApi } from './api.types';

const TRANSLATIONS_API_ROUTES = {
    translate: '/translations/translate',
} as const;

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
    ): Promise<TranslateTextApi> {
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
