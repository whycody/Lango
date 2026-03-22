import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

import {
    Evaluation,
    EvaluationGrade,
    LanguageCode,
    Session,
    SessionMode,
    SessionModel,
    Word,
} from '../../types';
import { toLocalDateString } from '../../utils/dateUtil';
import { saveEvaluations } from '../EvaluationsRepository';
import { saveSessions } from '../SessionRepository';
import { saveWords } from '../WordsRepository';

type AsyncStorageWord = {
    EF: number;
    addDate?: string;
    firstLang: string;
    id: string;
    interval: number;
    lastReviewDate: string;
    nextReviewDate: string;
    repetitionCount: number;
    secondLang: string;
    source: string;
    text: string;
    translation: string;
};

type AsyncStorageEvaluation = {
    date: string;
    grade: EvaluationGrade;
    id: string;
    wordId: string;
};

export const migrateV0ToV1 = async (userId: string) => {
    const storedWords = await loadAndClear('words', x => x as AsyncStorageWord[]);
    const storedEvaluations = await loadAndClear('evaluations', x => x as AsyncStorageEvaluation[]);

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
    // @ts-ignore
    return stored.map(word => ({
        active: true,
        addDate: word.addDate ?? timestamp,
        id: word.id,
        locallyUpdatedAt: timestamp,
        mainLang: word.firstLang as LanguageCode,
        removed: false,
        source: word.source,
        synced: false,
        text: word.text,
        translation: word.translation,
        translationLang: word.secondLang as LanguageCode,
        updatedAt: null,
    }));
};

const mapGroupedEvaluationsToSessions = (
    grouped: Record<string, AsyncStorageEvaluation[]>,
): Session[] => {
    const timestamp = now();
    return Object.entries(grouped).map(([date, evaluations]) => {
        const averageScore = evaluations.reduce((sum, e) => sum + e.grade, 0) / evaluations.length;
        return {
            averageScore,
            date,
            finished: evaluations.length % 10 === 0,
            id: uuid.v4() as string,
            localDay: toLocalDateString(new Date(date)),
            locallyUpdatedAt: timestamp,
            mode: SessionMode.UNKNOWN,
            sessionModel: SessionModel.HEURISTIC,
            synced: false,
            updatedAt: null,
            wordsCount: evaluations.length,
        };
    }) as unknown as Session[];
};

const mapStoredEvaluationsToEvaluations = (
    stored: AsyncStorageEvaluation[],
    sessions: Session[],
): Evaluation[] => {
    const timestamp = now();
    return stored.map(e => ({
        date: e.date,
        grade: e.grade,
        id: e.id,
        locallyUpdatedAt: timestamp,
        sessionId: sessions.find(s => s.date === e.date)?.id ?? null,
        synced: false,
        updatedAt: null,
        wordId: e.wordId,
    }));
};

const groupByDate = <T extends { date: string }>(items: T[]): Record<string, T[]> =>
    items.reduce(
        (acc, item) => {
            acc[item.date] = acc[item.date] || [];
            acc[item.date].push(item);
            return acc;
        },
        {} as Record<string, T[]>,
    );
