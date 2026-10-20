import { Word } from '../types';
import { getCurrentISO } from '../utils/dateUtil';
import { buildSqlPlaceholders, fromSqlBoolean, toSqlBoolean } from '../utils/helpers';
import { getDb } from './utils/db';

export const WORDS_COLUMNS: Array<keyof Word> = [
    'id',
    'text',
    'translation',
    'mainLang',
    'translationLang',
    'source',
    'addDate',
    'active',
    'removed',
    'bundleId',
    'synced',
    'locallyUpdatedAt',
    'updatedAt',
];
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
        tx.executeSql(
            `CREATE INDEX IF NOT EXISTS idx_words_updatedAt ON ${WORDS}(locallyUpdatedAt)`,
        );
    });
};

export const saveWords = async (userId: string, words: Word[]) => {
    const db = await getDb(userId);
    await db.transaction(tx => {
        words.forEach(word => {
            const values = WORDS_COLUMNS.map(col => {
                if (col === 'active' || col === 'removed' || col === 'synced') {
                    return toSqlBoolean(word[col]);
                }
                if (col === 'addDate') {
                    return word.addDate ?? getCurrentISO();
                }
                if (col === 'updatedAt') {
                    return word.updatedAt ?? word.locallyUpdatedAt;
                }
                return word[col];
            });

            const placeholders = buildSqlPlaceholders(WORDS_COLUMNS.length);

            tx.executeSql(
                `REPLACE INTO ${WORDS} (${WORDS_COLUMNS.join(', ')})
         VALUES (${placeholders})`,
                values,
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
                            active: fromSqlBoolean(row.active),
                            locallyUpdatedAt: row.locallyUpdatedAt || getCurrentISO(),
                            removed: fromSqlBoolean(row.removed),
                            synced: fromSqlBoolean(row.synced),
                        } satisfies Word);
                    }
                    resolve(words);
                },
                error => reject(error),
            );
        });
    });
};

export const updateWord = async (userId: string, word: Word) => {
    await saveWords(userId, [word]);
};

export const deleteWordsByBundleId = async (userId: string, bundleId: string) => {
    const db = await getDb(userId);
    await db.transaction(tx => {
        tx.executeSql(`DELETE FROM ${WORDS} WHERE bundleId = ?`, [bundleId]);
    });
};

export const deleteWordsByIds = async (userId: string, ids: string[]) => {
    if (ids.length === 0) return;
    const db = await getDb(userId);
    const placeholders = buildSqlPlaceholders(ids.length);
    await db.transaction(tx => {
        tx.executeSql(`DELETE FROM ${WORDS} WHERE id IN (${placeholders})`, ids);
    });
};
