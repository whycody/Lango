import { Suggestion } from '../types';
import { getCurrentISO } from '../utils/dateUtil';
import { getDb } from './utils/db';

const columns: Array<keyof Suggestion> = [
    'id',
    'userId',
    'word',
    'translation',
    'example',
    'mainLang',
    'translationLang',
    'displayCount',
    'skipped',
    'added',
    'synced',
    'updatedAt',
    'locallyUpdatedAt',
];

/* First version of Suggestions table, now it includes a few more fields */
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
                if (col === 'example')
                    return suggestion.example ? JSON.stringify(suggestion.example) : null;
                return suggestion[col as keyof Suggestion] ?? null;
            });
            const placeholders = columns.map(() => '?').join(', ');
            tx.executeSql(
                `INSERT OR REPLACE INTO suggestions (${columns.join(', ')}) VALUES (${placeholders})`,
                values,
            );
        });
    });
};

export const getAllSuggestions = async (userId: string): Promise<Suggestion[]> => {
    const db = await getDb(userId);
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM suggestions`,
                [],
                (_, results) => {
                    const rows = results.rows;
                    const suggestions: Suggestion[] = [];
                    for (let i = 0; i < rows.length; i++) {
                        const row = rows.item(i);
                        suggestions.push({
                            added: row.added === 1,
                            displayCount: row.displayCount || 0,
                            example: row.example ? JSON.parse(row.example) : null,
                            id: row.id,
                            locallyUpdatedAt: row.locallyUpdatedAt || getCurrentISO(),
                            mainLang: row.mainLang,
                            skipped: row.skipped === 1,
                            synced: row.synced === 1,
                            translation: row.translation,
                            translationLang: row.translationLang,
                            updatedAt: row.updatedAt || row.locallyUpdatedAt || getCurrentISO(),
                            userId: row.userId,
                            word: row.word,
                        });
                    }
                    resolve(suggestions);
                },
                error => reject(error),
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
            ids,
        );
    });
};
