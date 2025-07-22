export type Suggestion = {
  id: string;
  userId: string;
  word: string;
  translation: string;
  firstLang: string;
  secondLang: string;
  displayCount: number;
  skipped: boolean;
  synced: boolean;
  updatedAt?: string;
  locallyUpdatedAt: string;
}
