import { SyncMetadata } from "./SyncMetadata";

export type Word = SyncMetadata & {
  id: string;
  text: string;
  translation: string;
  firstLang: string;
  secondLang: string;
  source: string;
  addDate: string;
  active: boolean;
  removed: boolean;
}