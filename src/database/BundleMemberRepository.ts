import { BundleMember } from '../types';
import { getCurrentISO } from '../utils/dateUtil';
import { buildSqlPlaceholders, fromSqlBoolean, toSqlBoolean } from '../utils/helpers';
import { getDb } from './utils/db';

export const BUNDLE_MEMBER_COLUMNS: Array<keyof BundleMember> = [
    'id',
    'bundleId',
    'userId',
    'role',
    'subscribed',
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
                    return toSqlBoolean(member[col]);
                }
                if (col === 'updatedAt') {
                    return member.updatedAt ?? member.locallyUpdatedAt;
                }
                return member[col];
            });

            const placeholders = buildSqlPlaceholders(BUNDLE_MEMBER_COLUMNS.length);

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
                            removed: fromSqlBoolean(row.removed),
                            subscribed: fromSqlBoolean(row.subscribed),
                            synced: fromSqlBoolean(row.synced),
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
    const placeholders = buildSqlPlaceholders(ids.length);
    await db.transaction(tx => {
        tx.executeSql(`DELETE FROM ${BUNDLE_MEMBERS} WHERE id IN (${placeholders})`, ids);
    });
};
