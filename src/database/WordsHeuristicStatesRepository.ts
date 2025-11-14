import { WordHeuristicState } from "../types";
import { getDb } from "./utils/db";

export const WORD_HEURISTIC_STATE_COLUMNS: Array<keyof WordHeuristicState> = ['wordId', 'interval', 'repetitionsCount',
  'studyCount', 'lastReviewDate', 'nextReviewDate', 'EF'];
export const WORD_HEURISTIC_STATE = 'word_heuristic_state';

export const createHeuristicTable = async (userId: string) => {
  const db = await getDb(userId);
  await db.transaction(tx => {
    tx.executeSql(`
        CREATE TABLE IF NOT EXISTS ${WORD_HEURISTIC_STATE}
        (
            wordId           TEXT PRIMARY KEY,
            interval         INTEGER,
            repetitionsCount INTEGER DEFAULT 0,
            studyCount       INTEGER DEFAULT 0,
            lastReviewDate   TEXT,
            nextReviewDate   TEXT,
            EF               REAL
        )
    `);
  });
};

export const saveWordsHeuristicStates = async (userId: string, wordsHeuristicStates: WordHeuristicState[]) => {
  const db = await getDb(userId);
  await db.transaction(tx => {
    wordsHeuristicStates.forEach(state => {
      const values = [
        state.wordId,
        state.interval,
        state.repetitionsCount,
        state.studyCount,
        state.lastReviewDate,
        state.nextReviewDate,
        state.EF,
      ];

      const placeholders = WORD_HEURISTIC_STATE_COLUMNS.map(() => '?').join(', ');

      tx.executeSql(
        `REPLACE INTO ${WORD_HEURISTIC_STATE} (${WORD_HEURISTIC_STATE_COLUMNS.join(', ')})
         VALUES (${placeholders})`,
        values
      );
    });
  });
};

export const getAllWordsHeuristicStates = async (userId: string): Promise<WordHeuristicState[]> => {
  const db = await getDb(userId);

  return new Promise((resolve, reject) => {
    db.readTransaction(tx => {
      tx.executeSql(
        `SELECT *
         FROM ${WORD_HEURISTIC_STATE}`,
        [],
        (_, { rows }) => {
          const words = Array.from({ length: rows.length }, (_, i) => {
            const row = rows.item(i);
            return {
              wordId: row.wordId,
              interval: row.interval,
              repetitionsCount: row.repetitionsCount,
              studyCount: row.studyCount,
              lastReviewDate: row.lastReviewDate,
              nextReviewDate: row.nextReviewDate,
              EF: row.EF,
            } satisfies WordHeuristicState;
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

export const updateWordHeuristicState = async (userId: string, state: WordHeuristicState) => {
  await saveWordsHeuristicStates(userId, [state]);
};