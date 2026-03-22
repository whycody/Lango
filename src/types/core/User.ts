import { LanguageCode } from '../../constants/Language';
import { SessionModel } from '../../constants/Session';
import { UserProvider } from '../../constants/User';

export type LanguageLevelRange = 1 | 2 | 3 | 4 | 5;

export type LanguageLevel = {
    language: LanguageCode;
    level: LanguageLevelRange;
};

export type UserStats = {
    averageScore: number;
    evaluationCount: number;
    sessionCount: number;
    studyDays: string[];
};

export type UserUpdatePayload = {
    languageLevels?: LanguageLevel[];
    notificationsEnabled?: boolean;
};

export type User = {
    email: string;
    languageLevels: LanguageLevel[];
    mainLang: LanguageCode | null;
    name: string;
    notificationsEnabled: boolean;
    picture: string;
    provider: UserProvider;
    sessionModel: SessionModel;
    stats: UserStats;
    translationLang: LanguageCode | null;
    userId: string;
};
