import { ApiResponse } from 'apisauce';

import { ApiErrorCode } from '../api/api.types';

export const resolveApiErrorCode = (response: ApiResponse<unknown>): ApiErrorCode => {
    if (response.problem === 'NETWORK_ERROR' || response.problem === 'CONNECTION_ERROR') {
        return 'network';
    }

    switch (response.status) {
        case 401:
            return 'unauthorized';
        case 403:
            return 'forbidden';
        case 404:
            return 'not-found';
        case 409:
            return 'already-member';
        default:
            if (response.status === undefined) return 'unknown';
            if (response.status >= 400 && response.status < 500) return 'validation-error';
            if (response.status >= 500) return 'server-error';
            return 'unknown';
    }
};
