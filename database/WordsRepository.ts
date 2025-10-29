import { Word } from "../store/types";
import { getDb } from "./utils/db";

export const WORDS_COLUMNS: Array<keyof Word> = ['id', 'text', 'translation', 'mainLang', 'translationLang', 'source',
  'addDate', 'active', 'removed', 'synced', 'locallyUpdatedAt', 'updatedAt'];
export const WORDS = 'words';

export const createTables = async (userId: string) => {
  const db = await getDb(userId);
  await db.transaction(tx => {
    tx.execute(`
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

    tx.execute(`CREATE INDEX IF NOT EXISTS idx_words_removed ON ${WORDS} (removed)`);
    tx.execute(`CREATE INDEX IF NOT EXISTS idx_words_updatedAt ON ${WORDS} (locallyUpdatedAt)`);
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

      tx.execute(
        `REPLACE INTO ${WORDS} (${WORDS_COLUMNS.join(', ')})
         VALUES (${placeholders})`,
        values
      );
    });
  });
};

export const getAllWords = async (userId: string): Promise<Word[]> => {
  const db = await getDb(userId);

  const results = await db.execute(`SELECT * FROM ${WORDS}`, []);

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
  }));
};

export const updateWord = async (userId: string, word: Word) => {
  await saveWords(userId, [word]);
};