import { ApiErrorCode } from '../../api/api.types';

export type DeleteBundleResult = { success: true } | { errorCode: ApiErrorCode; success: false };
