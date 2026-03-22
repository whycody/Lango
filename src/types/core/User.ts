import { LanguageCode } from "../../constants/Language";
import { SessionModel } from "../../constants/Session";
import { UserProvider } from "../../constants/User";

export type LanguageLevelRange = 1 | 2 | 3 | 4 | 5;

export type LanguageLevel = {
  language: LanguageCode;
  level: LanguageLevelRange;
};

export type UserStats = {
  studyDays: string[];
  sessionCount: number;
  evaluationCount: number;
  averageScore: number;
};

export type UserUpdatePayload = {
  notificationsEnabled?: boolean;
  languageLevels?: LanguageLevel[];
};

export type User = {
  userId: string;
  name: string;
  email: string;
  picture: string;
  provider: UserProvider;
  mainLang: LanguageCode | null;
  translationLang: LanguageCode | null;
  sessionModel: SessionModel;
  notificationsEnabled: boolean;
  languageLevels: LanguageLevel[];
  stats: UserStats;
};
