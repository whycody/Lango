import { Word } from '../../core/Word';
import { SyncResult } from '../../sync/SyncResult';

export type WordSyncWireResponse = {
    rejectedWordIds: string[];
    syncedWords: SyncResult[];
    unauthorizedWords: Word[];
};
