import { LanguageCode } from "../../constants/LanguageCode";

export enum SessionModel {
  HEURISTIC = 'heuristic',
  ML = 'ml',
  HYBRID = 'hybrid',
  NONE = 'none',
}

export enum SessionModelVersion {
  NONE = 'none',
  H1 = 'h1',
  ML1 = 'ml1',
  ML2 = 'ml2',
  O1 = 'o1',
  R1 = 'r1',
}

export type LanguageLevel = {
  language: LanguageCode;
  level: 1 | 2 | 3 | 4 | 5;
};

export const PICKED_SESSION_MODEL_VERSION = SessionModelVersion.ML2;

export type UserStats = {
  studyDays: string[];
  sessionCount: number;
  evaluationCount: number;
  averageScore: number;
}

export enum UserProvider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
}

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