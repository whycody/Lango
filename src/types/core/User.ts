import { LanguageCode } from "../../constants/LanguageCode";

export enum SESSION_MODEL {
  HEURISTIC = 'heuristic',
  ML = 'ml',
  HYBRID = 'hybrid',
  NONE = 'none',
}

export type UserStats = {
  sessionCount: number;
  averageScore: number;
  evaluationCount: number;
  studyDays: string[];
};

export type User = {
  userId: string;
  name: string;
  email: string;
  picture: string;
  provider: 'google' | 'facebook';
  mainLang: LanguageCode | null;
  translationLang: LanguageCode | null;
  sessionModel: SESSION_MODEL;
  notificationsEnabled: boolean;
  stats?: UserStats;
};