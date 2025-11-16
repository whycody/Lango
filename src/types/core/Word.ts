import { SyncMetadata } from "../sync/SyncMetadata";

export type Word = SyncMetadata & {
  id: string;
  text: string;
  translation: string;
  mainLang: string;
  translationLang: string;
  source: string;
  addDate: string;
  active: boolean;
  removed: boolean;
}