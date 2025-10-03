import { WordWithDetails } from '../store/types';
import { WORDS, WORDS_COLUMNS } from "./WordsRepository";
import { WORD_ML_STATE, WORD_ML_STATE_COLUMNS } from "./WordsMLStatesRepository";
import { getDb } from "./utils/db";

export const getAllWordsWithDetails = async (userId: string): Promise<WordWithDetails[]> => {
  const db = await getDb(userId);

  return new Promise((resolve, reject) => {
    db.readTransaction(tx => {
      tx.executeSql(
        `
            SELECT ${WORDS_COLUMNS.map(c => `w.${c}`).join(', ')},
                   ${WORD_ML_STATE_COLUMNS.map(c => `d.${c}`).join(', ')}
            FROM ${WORDS} w
                     LEFT JOIN ${WORD_ML_STATE} d ON w.id = d.wordId
        `,
        [],
        (_, { rows }) => {
          const result: WordWithDetails[] = [];
          for (let i = 0; i < rows.length; i++) {
            const row = rows.item(i);
            result.push({
              ...row,
              active: row.active === 1,
              removed: row.removed === 1,
              synced: row.synced === 1,
              locallyUpdatedAt: row.locallyUpdatedAt || new Date().toISOString(),
            } satisfies WordWithDetails);
          }
          resolve(result);
        },
        (_, error) => {
          reject(error);
          return true;
        }
      );
    });
  });
};