import { ApiResponse } from 'apisauce';

import { ApiErrorCode, Evaluation, SyncResultWithRejections } from '../types';
import { resolveApiErrorCode } from '../utils/apiErrorUtils';
import { Api, api } from './api';

const EVALUATIONS_API_ROUTES = {
    evaluations: (since: string) => `/evaluations/evaluations/?since=${since}`,
    sync: '/evaluations/evaluations/sync',
} as const;

export type EvaluationsApiResult<T> =
    | { data: T; kind: 'ok' }
    | { errorCode: ApiErrorCode; kind: 'error' };

class EvaluationsApi {
    api: Api;
    constructor(api: Api) {
        this.api = api;
    }

    async syncEvaluationsOnServer(
        evaluations: Evaluation[],
    ): Promise<EvaluationsApiResult<SyncResultWithRejections<Evaluation>>> {
        const response: ApiResponse<SyncResultWithRejections<Evaluation>> =
            await this.api.apisauce.post(EVALUATIONS_API_ROUTES.sync, evaluations);
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }

    async fetchUpdatedEvaluations(since: string): Promise<EvaluationsApiResult<Evaluation[]>> {
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
