import { SyncMetadata } from "../sync/SyncMetadata";

export type Suggestion = SyncMetadata & {
  id: string;
  userId: string;
  word: string;
  translation: string;
  mainLang: string;
  translationLang: string;
  displayCount: number;
  skipped: boolean;
  added: boolean;
}
