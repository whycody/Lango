import { SyncMetadata } from "../sync/SyncMetadata";
import { LanguageCode } from "../../constants/LanguageCode";
import { WordSource } from "../../store/WordsContext";

export type Word = SyncMetadata & {
  id: string;
  text: string;
  translation: string;
  mainLang: LanguageCode;
  translationLang: LanguageCode;
  source: WordSource;
  addDate: string;
  active: boolean;
  removed: boolean;
}