import { LanguageCode } from "../../constants/LanguageCode";

export enum SessionModel {
  HEURISTIC = 'heuristic',
  ML = 'ml',
  HYBRID = 'hybrid',
  NONE = 'none',
}

export type UserStats = {
  studyDays: string[];
  sessionCount: number;
  evaluationCount: number;
  averageScore: number;
}

export type User = {
  userId: string;
  name: string;
  email: string;
  picture: string;
  provider: 'google' | 'facebook';
  mainLang: LanguageCode | null;
  translationLang: LanguageCode | null;
  sessionModel: SessionModel;
  notificationsEnabled: boolean;
  stats: UserStats;
};