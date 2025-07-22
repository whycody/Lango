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
  stats?: UserStats;
};