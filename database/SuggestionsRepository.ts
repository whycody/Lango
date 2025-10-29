import { Suggestion } from "../store/types";
import { getDb } from "./utils/db";

const columns: Array<keyof Suggestion> = [
  'id', 'userId', 'word', 'translation', 'mainLang', 'translationLang', 'displayCount', 'skipped', 'added', 'synced',
  'updatedAt', 'locallyUpdatedAt'
];

export const createTables = async (userId: string) => {
  const db = await getDb(userId);
  await db.transaction(tx => {
    tx.execute(`
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
            added            INTEGER,
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
        if (col === 'skipped') return suggestion.skipped ? 1 : 0;
        if (col === 'added') return suggestion.added ? 1 : 0;
        return suggestion[col as keyof Suggestion] ?? null;
      });
      const placeholders = columns.map(() => '?').join(', ');
      if (values[0] == '68dbb7f72c43da3dfa266290') console.log(placeholders, values)
      tx.execute(
        `INSERT OR
         REPLACE
         INTO suggestions (${columns.join(', ')})
         VALUES (${placeholders})`,
        values
      );
    });
  });
};

export const getAllSuggestions = async (userId: string): Promise<Suggestion[]> => {
  const db = await getDb(userId);

  const results = db.execute(`SELECT * FROM suggestions`, []);

  return results.rows._array.map(row => ({
    id: String(row.id),
    userId: String(row.userId),
    word: String(row.word),
    translation: String(row.translation),
    mainLang: String(row.mainLang),
    translationLang: String(row.translationLang),
    displayCount: row.displayCount != null ? Number(row.displayCount) : 0,
    skipped: row.skipped === 1,
    added: row.added === 1,
    synced: row.synced === 1,
    updatedAt: row.updatedAt != null ? String(row.updatedAt) : null,
    locallyUpdatedAt: row.locallyUpdatedAt != null ? String(row.locallyUpdatedAt) : new Date().toISOString(),
  }));
};

export const deleteSuggestions = async (userId: string, ids: string[]) => {
  const db = await getDb(userId);
  await db.transaction(tx => {
    const placeholders = ids.map(() => '?').join(', ');
    tx.execute(
      `DELETE
       FROM suggestions
       WHERE id IN (${placeholders})`,
      ids
    );
  });
};