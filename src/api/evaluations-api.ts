import { ApiResponse } from 'apisauce';

import { Evaluation, SyncResultWithRejections } from '../types';
import { resolveApiErrorCode } from '../utils/apiErrorUtils';
import { Api, api } from './api';
import { FetchUpdatedEvaluationsApi, SyncEvaluationsOnServerApi } from './api.types';

const EVALUATIONS_API_ROUTES = {
    evaluations: (since: string) => `/evaluations?since=${since}`,
    sync: '/evaluations/sync',
} as const;

class EvaluationsApi {
    api: Api;

    constructor(api: Api) {
        this.api = api;
    }

    async syncEvaluationsOnServer(evaluations: Evaluation[]): Promise<SyncEvaluationsOnServerApi> {
        const response: ApiResponse<SyncResultWithRejections<Evaluation>> =
            await this.api.apisauce.post(EVALUATIONS_API_ROUTES.sync, evaluations);
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }

    async fetchUpdatedEvaluations(since: string): Promise<FetchUpdatedEvaluationsApi> {
        const response: ApiResponse<Evaluation[]> = await this.api.apisauce.get(
            EVALUATIONS_API_ROUTES.evaluations(since),
        );
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }
}

export const evaluationsApi = new EvaluationsApi(api);
