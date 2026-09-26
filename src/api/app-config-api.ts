import { ApiResponse } from 'apisauce';

import { AppConfig } from '../types';
import { resolveApiErrorCode } from '../utils/apiErrorUtils';
import { Api, api } from './api';
import { GetAppConfigApi } from './api.types';

const APP_CONFIG_API_ROUTES = {
    appConfig: '/app-config',
} as const;

class AppConfigApi {
    api: Api;

    constructor(api: Api) {
        this.api = api;
    }

    async getAppConfig(): Promise<GetAppConfigApi> {
        const response: ApiResponse<AppConfig> = await this.api.apisauce.get(
            APP_CONFIG_API_ROUTES.appConfig,
        );
        if (!response.ok) return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        return { data: response.data ?? null, kind: 'ok' };
    }
}

export const appConfigApi = new AppConfigApi(api);
