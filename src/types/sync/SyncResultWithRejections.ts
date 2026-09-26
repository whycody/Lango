import { SyncResult } from './SyncResult';

export type SyncResultWithRejections<T> = {
    rejectedIds: string[];
    synced: SyncResult[];
    unauthorized: T[];
};
