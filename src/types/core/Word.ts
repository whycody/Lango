import { SyncMetadata } from "../sync/SyncMetadata";
import { LanguageCode } from "../../constants/Language";
import { WordSource } from "../../store";

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
};

export type SessionWord = {
  id: string;
  type: "suggestion" | "word";
  text: string;
  translation: string;
  mainLang: LanguageCode;
  translationLang: LanguageCode;
  tags: WordTag[];
  addDate: string;
};

export type WordTag =
  | "streak"
  | "improving"
  | "in_progress"
  | "recently_added"
  | "long_time_no_see"
  | "frequently_repeated"
  | "well_known"
  | "often_mistaken"
  | "struggling";
