import { WordMLState } from "../store/types";
import { getDb } from "./utils/db";

export const WORD_ML_STATE_COLUMNS: Array<keyof WordMLState> = ['wordId', 'hoursSinceLastRepetition', 'studyStreak',
  'studyDuration', 'gradesAverage', 'repetitionsCount', 'gradesTrend', 'predictedGrade', 'gradeThreeProb'];
export const WORD_ML_STATE = 'word_ml_state';

export const createTables = async (userId: string) => {
  const db = await getDb(userId);
  await db.transaction(tx => {
    tx.execute(`
        CREATE TABLE IF NOT EXISTS ${WORD_ML_STATE}
        (
            wordId                   TEXT PRIMARY KEY,
            hoursSinceLastRepetition REAL,
            studyStreak              INTEGER,
            studyDuration            REAL,
            gradesAverage            REAL,
            repetitionsCount         INTEGER,
            gradesTrend              REAL,
            predictedGrade           INTEGER,
            gradeThreeProb           REAL
        )
    `);
  });
};

export const saveWordsMLStates = async (userId: string, wordsMLStates: WordMLState[]) => {
  const db = await getDb(userId);
  await db.transaction(tx => {
    wordsMLStates.forEach(wordDetails => {
      const values = [
        wordDetails.wordId,
        wordDetails.hoursSinceLastRepetition,
        wordDetails.studyStreak,
        wordDetails.studyDuration,
        wordDetails.gradesAverage,
        wordDetails.repetitionsCount,
        wordDetails.gradesTrend,
        wordDetails.predictedGrade,
        wordDetails.gradeThreeProb
      ];

      const placeholders = WORD_ML_STATE_COLUMNS.map(() => '?').join(', ');

      tx.execute(
        `REPLACE INTO ${WORD_ML_STATE} (${WORD_ML_STATE_COLUMNS.join(', ')})
         VALUES (${placeholders})`,
        values
      );
    });
  });
};

export const getAllWordsMLStates = async (userId: string): Promise<WordMLState[]> => {
  const db = await getDb(userId);

  const results = db.execute(`SELECT * FROM ${WORD_ML_STATE}`, []);

  return results.rows._array.map(row => ({
    wordId: String(row.wordId),
    hoursSinceLastRepetition: Number(row.hoursSinceLastRepetition || 0),
    studyDuration: Number(row.studyDuration || 0),
    studyStreak: Number(row.studyStreak || 0),
    gradesAverage: Number(row.gradesAverage || 0),
    repetitionsCount: Number(row.repetitionsCount || 0),
    gradesTrend: Number(row.gradesTrend || 0),
    predictedGrade: Number(row.predictedGrade) as 1 | 2 | 3,
    gradeThreeProb: Number(row.gradeThreeProb || 0),
  }));
};

export const updateWordMLState = async (userId: string, wordsMLStates: WordMLState) => {
  await saveWordsMLStates(userId, [wordsMLStates]);
};