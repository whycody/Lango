import { WordsBundle } from '../types';
import { getCurrentISO } from '../utils/dateUtil';
import { getDb } from './utils/db';

export const WORDS_BUNDLE_COLUMNS: Array<keyof WordsBundle> = [
    'id',
    'ownerId',
    'title',
    'description',
    'mainLang',
    'translationLang',
    'visibility',
    'removed',
    'wordsBackfilled',
    'synced',
    'locallyUpdatedAt',
    'updatedAt',
];
export const WORDS_BUNDLES = 'words_bundles';

export const createTables = async (userId: string) => {
    const db = await getDb(userId);
    await db.transaction(tx => {
        tx.executeSql(`
        CREATE TABLE IF NOT EXISTS ${WORDS_BUNDLES}
        (
            id                   TEXT PRIMARY KEY,
            ownerId              TEXT,
            title                TEXT,
            description          TEXT,
            mainLang             TEXT,
            translationLang      TEXT,
            visibility           TEXT,
            removed              INTEGER,
            wordsBackfilled      INTEGER,
            synced               INTEGER,
            locallyUpdatedAt     TEXT,
            updatedAt            TEXT
        )
    `);

        tx.executeSql(
            `CREATE INDEX IF NOT EXISTS idx_words_bundles_removed ON ${WORDS_BUNDLES}(removed)`,
        );
        tx.executeSql(
            `CREATE INDEX IF NOT EXISTS idx_words_bundles_updatedAt ON ${WORDS_BUNDLES}(locallyUpdatedAt)`,
        );
    });
};

export const saveWordsBundles = async (userId: string, bundles: WordsBundle[]) => {
    const db = await getDb(userId);
    await db.transaction(tx => {
        bundles.forEach(bundle => {
            const values = WORDS_BUNDLE_COLUMNS.map(col => {
                if (col === 'removed' || col === 'synced' || col === 'wordsBackfilled') {
                    return bundle[col] ? 1 : 0;
                }
                if (col === 'updatedAt') {
                    return bundle.updatedAt ?? bundle.locallyUpdatedAt;
                }
                return bundle[col];
            });

            const placeholders = WORDS_BUNDLE_COLUMNS.map(() => '?').join(', ');

            tx.executeSql(
                `REPLACE INTO ${WORDS_BUNDLES} (${WORDS_BUNDLE_COLUMNS.join(', ')})
         VALUES (${placeholders})`,
                values,
            );
        });
    });
};

export const getAllWordsBundles = async (userId: string): Promise<WordsBundle[]> => {
    const db = await getDb(userId);
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT *
         FROM ${WORDS_BUNDLES}`,
                [],
                (_, results) => {
                    const rows = results.rows;
                    const bundles: WordsBundle[] = [];
                    for (let i = 0; i < rows.length; i++) {
                        const row = rows.item(i);
                        bundles.push({
                            ...row,
                            locallyUpdatedAt: row.locallyUpdatedAt || getCurrentISO(),
                            removed: row.removed === 1,
                            synced: row.synced === 1,
                            wordsBackfilled: row.wordsBackfilled === 1,
                        } satisfies WordsBundle);
                    }
                    resolve(bundles);
                },
                error => reject(error),
            );
        });
    });
};

export const updateWordsBundle = async (userId: string, bundle: WordsBundle) => {
    await saveWordsBundles(userId, [bundle]);
};

export const deleteWordsBundle = async (userId: string, bundleId: string) => {
    const db = await getDb(userId);
    await db.transaction(tx => {
        tx.executeSql(`DELETE FROM ${WORDS_BUNDLES} WHERE id = ?`, [bundleId]);
    });
};
