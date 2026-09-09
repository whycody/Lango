import { ApiErrorCode } from '../../api/api.types';
import { BundleMember } from './BundleMember';

export type JoinBundleWithCodeStoreResult =
    | { member: BundleMember; success: true }
    | { errorCode: ApiErrorCode; success: false };
