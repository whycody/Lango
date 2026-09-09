import { ApiResponse } from 'apisauce';

import { ApiErrorCode, AppConfig } from '../types';
import { resolveApiErrorCode } from '../utils/apiErrorUtils';
import { Api, api } from './api';

const APP_CONFIG_API_ROUTES = {
    appConfig: '/app-config',
} as const;

export type AppConfigApiResult<T> =
    | { data: T; kind: 'ok' }
    | { errorCode: ApiErrorCode; kind: 'error' };

class AppConfigApi {
    api: Api;
    constructor(api: Api) {
        this.api = api;
    }

    async getAppConfig(): Promise<AppConfigApiResult<AppConfig | null>> {
        const response: ApiResponse<AppConfig> = await this.api.apisauce.get(
            APP_CONFIG_API_ROUTES.appConfig,
        );
        if (!response.ok) return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        return { data: response.data ?? null, kind: 'ok' };
    }
}

export const appConfigApi = new AppConfigApi(api);
