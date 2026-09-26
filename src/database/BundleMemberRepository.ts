import { BundleMember } from '../types';
import { getCurrentISO } from '../utils/dateUtil';
import { getDb } from './utils/db';

export const BUNDLE_MEMBER_COLUMNS: Array<keyof BundleMember> = [
    'id',
    'bundleId',
    'userId',
    'role',
    'subscribed',
    'joinedViaCodeId',
    'removed',
    'synced',
    'locallyUpdatedAt',
    'updatedAt',
];
export const BUNDLE_MEMBERS = 'bundle_members';

export const createTables = async (userId: string) => {
    const db = await getDb(userId);
    await db.transaction(tx => {
        tx.executeSql(`
        CREATE TABLE IF NOT EXISTS ${BUNDLE_MEMBERS}
        (
            id               TEXT PRIMARY KEY,
            bundleId         TEXT,
            userId           TEXT,
            role             TEXT,
            subscribed       INTEGER,
            joinedViaCodeId  TEXT,
            removed          INTEGER,
            synced           INTEGER,
            locallyUpdatedAt TEXT,
            updatedAt        TEXT
        )
    `);

        tx.executeSql(
            `CREATE INDEX IF NOT EXISTS idx_bundle_members_removed ON ${BUNDLE_MEMBERS}(removed)`,
        );
        tx.executeSql(
            `CREATE INDEX IF NOT EXISTS idx_bundle_members_updatedAt ON ${BUNDLE_MEMBERS}(locallyUpdatedAt)`,
        );
        tx.executeSql(
            `CREATE INDEX IF NOT EXISTS idx_bundle_members_bundleId ON ${BUNDLE_MEMBERS}(bundleId)`,
        );
    });
};

export const saveBundleMembers = async (userId: string, members: BundleMember[]) => {
    const db = await getDb(userId);
    await db.transaction(tx => {
        members.forEach(member => {
            const values = BUNDLE_MEMBER_COLUMNS.map(col => {
                if (col === 'removed' || col === 'synced' || col === 'subscribed') {
                    return member[col] ? 1 : 0;
                }
                if (col === 'updatedAt') {
                    return member.updatedAt ?? member.locallyUpdatedAt;
                }
                return member[col];
            });

            const placeholders = BUNDLE_MEMBER_COLUMNS.map(() => '?').join(', ');

            tx.executeSql(
                `REPLACE INTO ${BUNDLE_MEMBERS} (${BUNDLE_MEMBER_COLUMNS.join(', ')})
         VALUES (${placeholders})`,
                values,
            );
        });
    });
};

export const getAllBundleMembers = async (userId: string): Promise<BundleMember[]> => {
    const db = await getDb(userId);
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT *
         FROM ${BUNDLE_MEMBERS}`,
                [],
                (_, results) => {
                    const rows = results.rows;
                    const members: BundleMember[] = [];
                    for (let i = 0; i < rows.length; i++) {
                        const row = rows.item(i);
                        members.push({
                            ...row,
                            locallyUpdatedAt: row.locallyUpdatedAt || getCurrentISO(),
                            removed: row.removed === 1,
                            subscribed: row.subscribed === 1,
                            synced: row.synced === 1,
                        } satisfies BundleMember);
                    }
                    resolve(members);
                },
                error => reject(error),
            );
        });
    });
};

export const updateBundleMember = async (userId: string, member: BundleMember) => {
    await saveBundleMembers(userId, [member]);
};

export const deleteBundleMembersByIds = async (userId: string, ids: string[]) => {
    if (ids.length === 0) return;
    const db = await getDb(userId);
    const placeholders = ids.map(() => '?').join(', ');
    await db.transaction(tx => {
        tx.executeSql(`DELETE FROM ${BUNDLE_MEMBERS} WHERE id IN (${placeholders})`, ids);
    });
};
