import { WordWithDetails } from '../store/types';
import { WORDS, WORDS_COLUMNS } from "./WordsRepository";
import { WORD_ML_STATE, WORD_ML_STATE_COLUMNS } from "./WordsMLStatesRepository";
import { getDb } from "./utils/db";

export const getAllWordsWithDetails = async (userId: string): Promise<WordWithDetails[]> => {
  const db = await getDb(userId);

  const results = db.execute(
    `
        SELECT ${WORDS_COLUMNS.map(c => `w.${c}`).join(', ')},
               ${WORD_ML_STATE_COLUMNS.map(c => `d.${c}`).join(', ')}
        FROM ${WORDS} w
                 INNER JOIN ${WORD_ML_STATE} d ON w.id = d.wordId
        WHERE w.REMOVED = 0
        ORDER BY w.locallyUpdatedAt DESC
    `,
    []
  );

  return results.rows._array.map(row => ({
    id: String(row.id),
    text: String(row.text),
    translation: String(row.translation),
    mainLang: String(row.mainLang),
    translationLang: String(row.translationLang),
    source: String(row.source),
    addDate: String(row.addDate),
    active: row.active === 1,
    removed: row.removed === 1,
    synced: row.synced === 1,
    updatedAt: row.updatedAt ? String(row.updatedAt) : undefined,
    locallyUpdatedAt: row.locallyUpdatedAt != null ? String(row.locallyUpdatedAt) : new Date().toISOString(),
    hoursSinceLastRepetition: Number(row.hoursSinceLastRepetition || 0),
    studyDuration: Number(row.studyDuration || 0),
    studyStreak: Number(row.studyStreak || 0),
    gradesAverage: Number(row.gradesAverage || 0),
    repetitionsCount: Number(row.repetitionsCount || 0),
    gradesTrend: Number(row.gradesTrend || 0),
    predictedGrade: Number(row.predictedGrade) as 1 | 2 | 3,
    gradeThreeProb: Number(row.gradeThreeProb || 0),
  } satisfies WordWithDetails));
};