import { Word } from "../store/types";
import { getDb } from "./utils/db";

export const WORDS_COLUMNS: Array<keyof Word> = ['id', 'text', 'translation', 'mainLang', 'translationLang', 'source',
  'addDate', 'active', 'removed', 'synced', 'locallyUpdatedAt', 'updatedAt'];
export const WORDS = 'words';

export const createTables = async (userId: string) => {
  const db = await getDb(userId);
  await db.transaction(tx => {
    tx.executeSql(`
        CREATE TABLE IF NOT EXISTS ${WORDS}
        (
            id               TEXT PRIMARY KEY,
            text             TEXT,
            translation      TEXT,
            mainLang         TEXT,
            translationLang  TEXT,
            source           TEXT,
            addDate          TEXT,
            active           INTEGER,
            removed          INTEGER,
            synced           INTEGER,
            locallyUpdatedAt TEXT,
            updatedAt        TEXT
        )
    `);

    tx.executeSql(`CREATE INDEX IF NOT EXISTS idx_words_removed ON ${WORDS}(removed)`);
    tx.executeSql(`CREATE INDEX IF NOT EXISTS idx_words_updatedAt ON ${WORDS}(locallyUpdatedAt)`);
  });
};

export const saveWords = async (userId: string, words: Word[]) => {
  const db = await getDb(userId);
  await db.transaction(tx => {
    words.forEach(word => {
      const values = WORDS_COLUMNS.map(col => {
        if (col === 'active' || col === 'removed' || col === 'synced') {
          return word[col] ? 1 : 0;
        }
        if (col === 'addDate') {
          return word.addDate ?? new Date().toISOString();
        }
        if (col === 'updatedAt') {
          return word.updatedAt ?? word.locallyUpdatedAt;
        }
        return word[col];
      });

      const placeholders = WORDS_COLUMNS.map(() => '?').join(', ');

      tx.executeSql(
        `REPLACE INTO ${WORDS} (${WORDS_COLUMNS.join(', ')})
         VALUES (${placeholders})`,
        values
      );
    });
  });
};

export const getAllWords = async (userId: string): Promise<Word[]> => {
  const db = await getDb(userId);
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT *
         FROM ${WORDS}`,
        [],
        (_, results) => {
          const rows = results.rows;
          const words: Word[] = [];
          for (let i = 0; i < rows.length; i++) {
            const row = rows.item(i);
            words.push({
              ...row,
              active: row.active === 1,
              removed: row.removed === 1,
              synced: row.synced === 1,
              locallyUpdatedAt: row.locallyUpdatedAt || new Date().toISOString(),
            } satisfies Word);
          }
          resolve(words);
        },
        error => reject(error)
      );
    });
  });
};

export const updateWord = async (userId: string, word: Word) => {
  await saveWords(userId, [word]);
};