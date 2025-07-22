import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { Word } from "../store/types";

const columns = [
  'id', 'text', 'translation', 'firstLang', 'secondLang', 'source', 'interval', 'addDate', 'repetitionCount',
  'lastReviewDate', 'nextReviewDate', 'EF', 'active', 'removed', 'synced', 'locallyUpdatedAt', 'updatedAt'
];

const getDb = async (userId: string): Promise<SQLiteDatabase> => {
  if (!userId) throw new Error("User ID not provided");
  return SQLite.openDatabase({ name: `${userId}_words.db` });
};

export const createTables = async (userId: string) => {
  const db = await getDb(userId);
  await db.transaction(tx => {
    tx.executeSql(`
        CREATE TABLE IF NOT EXISTS words
        (
            id               TEXT PRIMARY KEY,
            text             TEXT,
            translation      TEXT,
            firstLang        TEXT,
            secondLang       TEXT,
            source           TEXT,
            interval         INTEGER,
            addDate          TEXT,
            repetitionCount  INTEGER,
            lastReviewDate   TEXT,
            nextReviewDate   TEXT,
            EF               REAL,
            active           INTEGER,
            removed          INTEGER,
            synced           INTEGER,
            locallyUpdatedAt TEXT,
            updatedAt        TEXT
        )
    `);
  });
};

export const saveWords = async (userId: string, words: Word[]) => {
  const db = await getDb(userId);
  await db.transaction(tx => {
    words.forEach(word => {
      const values = columns.map(col => {
        if (col === 'active' || col === 'removed' || col === 'synced') {
          return word[col] ? 1 : 0;
        }
        if (col === 'updatedAt') {
          return word.updatedAt ?? word.locallyUpdatedAt;
        }
        return word[col];
      });

      const placeholders = columns.map(() => '?').join(', ');

      tx.executeSql(
        `REPLACE INTO words (${columns.join(', ')})
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
         FROM words`,
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
            });
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