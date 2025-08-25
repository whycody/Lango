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
  sessionModel: SESSION_MODEL;
  stats?: UserStats;
};