import { SyncMetadata } from "./SyncMetadata";

export type Suggestion = SyncMetadata & {
  id: string;
  userId: string;
  word: string;
  translation: string;
  firstLang: string;
  secondLang: string;
  displayCount: number;
  skipped: boolean;
}
