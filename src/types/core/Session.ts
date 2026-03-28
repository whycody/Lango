import { LanguageCode } from '../../constants/Language';
import { SessionMode, SessionModel, SessionModelVersion } from '../../constants/Session';
import { SyncMetadata } from '../sync/SyncMetadata';

export type Session = SyncMetadata & {
    averageScore: number;
    date: string;
    finished: boolean;
    id: string;
    localDay: string;
    mainLang: LanguageCode;
    mode: SessionMode;
    sessionModel: SessionModel;
    sessionModelVersion: SessionModelVersion;
    translationLang: LanguageCode;
    wordsCount: number;
};
