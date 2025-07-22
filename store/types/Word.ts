export type Word = {
  id: string;
  text: string;
  translation: string;
  firstLang: string;
  secondLang: string;
  source: string;
  interval: number;
  addDate: string;
  repetitionCount: number;
  lastReviewDate: string;
  nextReviewDate: string;
  EF: number;
  active: boolean;
  removed: boolean;
  synced: boolean;
  updatedAt?: string;
  locallyUpdatedAt: string;
}