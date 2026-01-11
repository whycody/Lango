import AsyncStorage from "@react-native-async-storage/async-storage";
import { Evaluation, EvaluationGrade, LanguageCode, Session, SessionMode, SessionModel, Word } from "../../types";
import uuid from "react-native-uuid";
import { saveWords } from "../WordsRepository";
import { saveSessions } from "../SessionRepository";
import { saveEvaluations } from "../EvaluationsRepository";
import { toLocalDateString } from "../../utils/dateUtil";

type AsyncStorageWord = {
  id: string;
  text: string;
  translation: string;
  firstLang: string;
  secondLang: string;
  source: string;
  interval: number;
  addDate?: string;
  repetitionCount: number;
  lastReviewDate: string;
  nextReviewDate: string;
  EF: number;
}

type AsyncStorageEvaluation = {
  id: string;
  wordId: string;
  grade: EvaluationGrade;
  date: string;
}

export const migrateV0ToV1 = async (userId: string) => {
  const storedWords = await loadAndClear("words", x => x as AsyncStorageWord[]);
  const storedEvaluations = await loadAndClear("evaluations", x => x as AsyncStorageEvaluation[]);

  const words = mapStoredWordsToWords(storedWords);
  const groupedEvaluations = groupByDate(storedEvaluations);
  const sessions = mapGroupedEvaluationsToSessions(groupedEvaluations);
  const evaluations = mapStoredEvaluationsToEvaluations(storedEvaluations, sessions);

  await Promise.all([
    saveWords(userId, words),
    saveSessions(userId, sessions),
    saveEvaluations(userId, evaluations),
  ]);
};

const now = () => new Date().toISOString();

const loadAndClear = async <T>(key: string, parser: (raw: any) => T[]): Promise<T[]> => {
  const stored = await AsyncStorage.getItem(key);
  await AsyncStorage.removeItem(key);
  if (!stored) return [];
  return parser(JSON.parse(stored));
};

const mapStoredWordsToWords = (stored: AsyncStorageWord[]): Word[] => {
  const timestamp = now();
  return stored.map(word => ({
    id: word.id,
    text: word.text,
    translation: word.translation,
    mainLang: word.firstLang as LanguageCode,
    translationLang: word.secondLang as LanguageCode,
    source: word.source,
    addDate: word.addDate ?? timestamp,
    synced: false,
    active: true,
    removed: false,
    updatedAt: null,
    locallyUpdatedAt: timestamp,
  }));
};

const mapGroupedEvaluationsToSessions = (grouped: Record<string, AsyncStorageEvaluation[]>): Session[] => {
  const timestamp = now();
  return Object.entries(grouped).map(([date, evaluations]) => {
    const averageScore =
      evaluations.reduce((sum, e) => sum + e.grade, 0) / evaluations.length;
    return {
      id: uuid.v4() as string,
      date,
      localDay: toLocalDateString(new Date(date)),
      mode: SessionMode.UNKNOWN,
      sessionModel: SessionModel.HEURISTIC,
      averageScore,
      wordsCount: evaluations.length,
      finished: evaluations.length % 10 === 0,
      synced: false,
      updatedAt: null,
      locallyUpdatedAt: timestamp,
    };
  }) as unknown as Session[];
};

const mapStoredEvaluationsToEvaluations = (stored: AsyncStorageEvaluation[], sessions: Session[]): Evaluation[] => {
  const timestamp = now();
  return stored.map(e => ({
    id: e.id,
    wordId: e.wordId,
    grade: e.grade,
    date: e.date,
    sessionId: sessions.find(s => s.date === e.date)?.id ?? null,
    synced: false,
    updatedAt: null,
    locallyUpdatedAt: timestamp,
  }));
};

const groupByDate = <T extends { date: string }>(items: T[]): Record<string, T[]> =>
  items.reduce((acc, item) => {
    acc[item.date] = acc[item.date] || [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, T[]>);