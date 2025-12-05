import { SyncMetadata } from "../sync/SyncMetadata";
import { LanguageCode } from "../../constants/LanguageCode";

export type Word = SyncMetadata & {
  id: string;
  text: string;
  translation: string;
  mainLang: LanguageCode;
  translationLang: LanguageCode;
  source: string;
  addDate: string;
  active: boolean;
  removed: boolean;
}