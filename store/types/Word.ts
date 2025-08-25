import { SyncMetadata } from "./SyncMetadata";

export type Word = SyncMetadata & {
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
}