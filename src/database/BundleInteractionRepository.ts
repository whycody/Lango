import { BundleInteraction } from '../types';
import { getCurrentISO } from '../utils/dateUtil';
import { getDb } from './utils/db';

export const BUNDLE_INTERACTION_COLUMNS: Array<keyof BundleInteraction> = [
    'id',
    'bundleId',
    'userId',
    'interactedAt',
    'synced',
    'locallyUpdatedAt',
    'updatedAt',
];
export const BUNDLE_INTERACTIONS = 'bundle_interactions';

export const createTables = async (userId: string) => {
    const db = await getDb(userId);
    await db.transaction(tx => {
        tx.executeSql(`
        CREATE TABLE IF NOT EXISTS ${BUNDLE_INTERACTIONS}
        (
            id               TEXT PRIMARY KEY,
            bundleId         TEXT,
            userId           TEXT,
            interactedAt     TEXT,
            synced           INTEGER,
            locallyUpdatedAt TEXT,
            updatedAt        TEXT
        )
    `);

        tx.executeSql(
            `CREATE INDEX IF NOT EXISTS idx_bundle_interactions_updatedAt ON ${BUNDLE_INTERACTIONS}(locallyUpdatedAt)`,
        );

        tx.executeSql(
            `CREATE INDEX IF NOT EXISTS idx_bundle_interactions_bundle_user ON ${BUNDLE_INTERACTIONS}(bundleId, userId)`,
        );
    });
};

export const saveBundleInteractions = async (userId: string, interactions: BundleInteraction[]) => {
    const db = await getDb(userId);
    await db.transaction(tx => {
        interactions.forEach(interaction => {
            const values = BUNDLE_INTERACTION_COLUMNS.map(col => {
                if (col === 'synced') {
                    return interaction[col] ? 1 : 0;
                }
                if (col === 'updatedAt') {
                    return interaction.updatedAt ?? interaction.locallyUpdatedAt;
                }
                return interaction[col];
            });

            const placeholders = BUNDLE_INTERACTION_COLUMNS.map(() => '?').join(', ');

            tx.executeSql(
                `REPLACE INTO ${BUNDLE_INTERACTIONS} (${BUNDLE_INTERACTION_COLUMNS.join(', ')})
         VALUES (${placeholders})`,
                values,
            );
        });
    });
};

export const getAllBundleInteractions = async (userId: string): Promise<BundleInteraction[]> => {
    const db = await getDb(userId);
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT *
         FROM ${BUNDLE_INTERACTIONS}`,
                [],
                (_, results) => {
                    const rows = results.rows;
                    const interactions: BundleInteraction[] = [];
                    for (let i = 0; i < rows.length; i++) {
                        const row = rows.item(i);
                        interactions.push({
                            ...row,
                            locallyUpdatedAt: row.locallyUpdatedAt || getCurrentISO(),
                            synced: row.synced === 1,
                        } satisfies BundleInteraction);
                    }
                    resolve(interactions);
                },
                error => reject(error),
            );
        });
    });
};

export const updateBundleInteraction = async (userId: string, interaction: BundleInteraction) => {
    await saveBundleInteractions(userId, [interaction]);
};

export const deleteBundleInteractionsByIds = async (userId: string, ids: string[]) => {
    if (ids.length === 0) return;
    const db = await getDb(userId);
    const placeholders = ids.map(() => '?').join(', ');
    await db.transaction(tx => {
        tx.executeSql(`DELETE FROM ${BUNDLE_INTERACTIONS} WHERE id IN (${placeholders})`, ids);
    });
};
