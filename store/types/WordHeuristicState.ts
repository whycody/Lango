import { SyncMetadata } from "./SyncMetadata";

export type WordHeuristicState = SyncMetadata & {
  wordId: string;
  interval: number;
  repetitionsCount: number;
  lastReviewDate: string;
  nextReviewDate: string;
  EF: number;
};