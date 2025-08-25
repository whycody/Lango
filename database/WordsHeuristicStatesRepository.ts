import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { WordHeuristicState } from "../store/types";

export const WORD_HEURISTIC_STATE_COLUMNS = ['wordId', 'interval', 'repetitionsCount', 'lastReviewDate', 'nextReviewDate',
  'EF', 'synced', 'updatedAt', 'locallyUpdatedAt'];
export const WORD_HEURISTIC_STATE = 'word_heuristic_state';

const getDb = async (userId: string): Promise<SQLiteDatabase> => {
  if (!userId) throw new Error("User ID not provided");
  return SQLite.openDatabase({ name: `${userId}_words.db` });
};

export const createHeuristicTable = async (userId: string) => {
  const db = await getDb(userId);
  await db.transaction(tx => {
    tx.executeSql(`
        CREATE TABLE IF NOT EXISTS ${WORD_HEURISTIC_STATE}
        (
            wordId           TEXT PRIMARY KEY,
            interval         INTEGER,
            repetitionsCount INTEGER,
            lastReviewDate   TEXT,
            nextReviewDate   TEXT,
            EF               REAL,
            synced           INTEGER,
            updatedAt        TEXT,
            locallyUpdatedAt TEXT
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
        state.lastReviewDate,
        state.nextReviewDate,
        state.EF,
        state.synced ? 1 : 0,
        state.updatedAt ?? null,
        state.locallyUpdatedAt
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
              lastReviewDate: row.lastReviewDate,
              nextReviewDate: row.nextReviewDate,
              EF: row.EF,
              synced: !!row.synced,
              updatedAt: row.updatedAt ?? undefined,
              locallyUpdatedAt: row.locallyUpdatedAt
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