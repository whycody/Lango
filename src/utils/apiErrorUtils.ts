import { ApiResponse } from 'apisauce';

import { ApiErrorCode } from '../types';

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
        default:
            return 'unknown';
    }
};
