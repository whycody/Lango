import { ApiResponse } from 'apisauce';

import { ApiErrorCode, Session, SyncResult } from '../types';
import { resolveApiErrorCode } from '../utils/apiErrorUtils';
import { Api, api } from './api';

const SESSIONS_API_ROUTES = {
    sessions: (since: string) => `/sessions/sessions?since=${since}`,
    sync: '/sessions/sessions/sync',
} as const;

export type SessionsApiResult<T> =
    | { data: T; kind: 'ok' }
    | { errorCode: ApiErrorCode; kind: 'error' };

class SessionsApi {
    api: Api;
    constructor(api: Api) {
        this.api = api;
    }

    async syncSessionsOnServer(sessions: Session[]): Promise<SessionsApiResult<SyncResult[]>> {
        const response: ApiResponse<SyncResult[]> = await this.api.apisauce.post(
            SESSIONS_API_ROUTES.sync,
            sessions,
        );
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }

    async fetchUpdatedSessions(since: string): Promise<SessionsApiResult<Session[]>> {
        const response: ApiResponse<Session[]> = await this.api.apisauce.get(
            SESSIONS_API_ROUTES.sessions(since),
        );
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }
}

export const sessionsApi = new SessionsApi(api);
