import { Suggestion } from "../store/types";
import { getDb } from "./utils/db";

const columns = [
  'id', 'userId', 'word', 'translation', 'mainLang', 'translationLang', 'displayCount', 'skipped', 'synced', 'updatedAt',
  'locallyUpdatedAt'
];

export const createTables = async (userId: string) => {
  const db = await getDb(userId);
  await db.transaction(tx => {
    tx.executeSql(`
        CREATE TABLE IF NOT EXISTS suggestions
        (
            id               TEXT PRIMARY KEY,
            userId           TEXT,
            word             TEXT,
            translation      TEXT,
            mainLang         TEXT,
            translationLang  TEXT,
            displayCount     INTEGER,
            skipped          INTEGER,
            synced           INTEGER,
            updatedAt        TEXT,
            locallyUpdatedAt TEXT
        )
    `);
  });
};

export const saveSuggestions = async (userId: string, suggestions: Suggestion[]) => {
  const db = await getDb(userId);
  await db.transaction(tx => {
    suggestions.forEach(suggestion => {
      const values = columns.map(col => {
        if (col === 'synced') return suggestion.synced ? 1 : 0;
        return suggestion[col as keyof Suggestion] || null;
      });
      const placeholders = columns.map(() => '?').join(', ');

      tx.executeSql(
        `REPLACE INTO suggestions (${columns.join(', ')})
         VALUES (${placeholders})`,
        values
      );
    });
  });
};

export const getAllSuggestions = async (userId: string): Promise<Suggestion[]> => {
  const db = await getDb(userId);
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT *
         FROM suggestions`,
        [],
        (_, results) => {
          const rows = results.rows;
          const suggestions: Suggestion[] = [];
          for (let i = 0; i < rows.length; i++) {
            const row = rows.item(i);
            suggestions.push({
              id: row.id,
              userId: row.userId,
              word: row.word,
              translation: row.translation,
              mainLang: row.mainLang,
              translationLang: row.translationLang,
              displayCount: row.displayCount || 0,
              skipped: row.skipped === 1,
              synced: row.synced === 1,
              updatedAt: row.updatedAt || null,
              locallyUpdatedAt: row.locallyUpdatedAt || new Date().toISOString(),
            });
          }
          resolve(suggestions);
        },
        error => reject(error)
      );
    });
  });
};

export const deleteSuggestions = async (userId: string, ids: string[]) => {
  const db = await getDb(userId);
  await db.transaction(tx => {
    const placeholders = ids.map(() => '?').join(', ');
    tx.executeSql(
      `DELETE
       FROM suggestions
       WHERE id IN (${placeholders})`,
      ids
    );
  });
};