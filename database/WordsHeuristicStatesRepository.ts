import { WordHeuristicState } from "../store/types";
import { getDb } from "./utils/db";

export const WORD_HEURISTIC_STATE_COLUMNS: Array<keyof WordHeuristicState> = ['wordId', 'interval', 'repetitionsCount',
  'studyCount', 'lastReviewDate', 'nextReviewDate', 'EF'];
export const WORD_HEURISTIC_STATE = 'word_heuristic_state';

export const createHeuristicTable = async (userId: string) => {
  const db = await getDb(userId);
  await db.transaction(tx => {
    tx.execute(`
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

      tx.execute(
        `REPLACE INTO ${WORD_HEURISTIC_STATE} (${WORD_HEURISTIC_STATE_COLUMNS.join(', ')})
         VALUES (${placeholders})`,
        values
      );
    });
  });
};

export const getAllWordsHeuristicStates = async (userId: string): Promise<WordHeuristicState[]> => {
  const db = await getDb(userId);

  const results = db.execute(`SELECT * FROM ${WORD_HEURISTIC_STATE}`, []);

  return results.rows._array.map(row => ({
    wordId: String(row.wordId),
    interval: Number(row.interval),
    repetitionsCount: Number(row.repetitionsCount),
    studyCount: Number(row.studyCount),
    lastReviewDate: row.lastReviewDate != null ? String(row.lastReviewDate) : null,
    nextReviewDate: row.nextReviewDate != null ? String(row.nextReviewDate) : null,
    EF: Number(row.EF),
  }));
};

export const updateWordHeuristicState = async (userId: string, state: WordHeuristicState) => {
  await saveWordsHeuristicStates(userId, [state]);
};