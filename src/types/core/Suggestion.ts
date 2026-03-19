import { SyncMetadata } from "../sync/SyncMetadata";
import { LanguageCode } from "../../constants/LanguageCode";

export type Suggestion = SyncMetadata & {
  id: string;
  userId: string;
  word: string;
  translation: string;
  mainLang: LanguageCode;
  translationLang: LanguageCode;
  displayCount: number;
  skipped: boolean;
  added: boolean;
}
