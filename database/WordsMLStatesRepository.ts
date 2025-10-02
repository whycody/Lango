import { WordMLState } from "../store/types";
import { getDb } from "./utils/db";

export const WORD_ML_STATE_COLUMNS: Array<keyof WordMLState> = ['wordId', 'hoursSinceLastRepetition', 'studyStreak',
  'studyDuration', 'gradesAverage', 'repetitionsCount', 'gradesTrend', 'predictedGrade', 'gradeThreeProb'];
export const WORD_ML_STATE = 'word_ml_state';

export const createTables = async (userId: string) => {
  const db = await getDb(userId);
  await db.transaction(tx => {
    tx.executeSql(`
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

      tx.executeSql(
        `REPLACE INTO ${WORD_ML_STATE} (${WORD_ML_STATE_COLUMNS.join(', ')})
         VALUES (${placeholders})`,
        values
      );
    });
  });
};

export const getAllWordsMLStates = async (userId: string): Promise<WordMLState[]> => {
  const db = await getDb(userId);

  return new Promise((resolve, reject) => {
    db.readTransaction(tx => {
      tx.executeSql(
        `SELECT *
         FROM ${WORD_ML_STATE}`,
        [],
        (_, { rows }) => {
          const words = Array.from({ length: rows.length }, (_, i) => {
            const row = rows.item(i);
            return {
              wordId: row.wordId,
              hoursSinceLastRepetition: row.hoursSinceLastRepetition,
              studyStreak: row.studyStreak,
              studyDuration: row.studyDuration,
              gradesAverage: row.gradesAverage,
              repetitionsCount: row.repetitionsCount,
              gradesTrend: row.gradesTrend,
              predictedGrade: row.predictedGrade,
              gradeThreeProb: row.gradeThreeProb
            } satisfies WordMLState;
          });
          resolve(words);
        },
        (_, error) => {
          reject(error);
          return true;
        }
      );
    });
  });
};

export const updateWordMLState = async (userId: string, wordsMLStates: WordMLState) => {
  await saveWordsMLStates(userId, [wordsMLStates]);
};