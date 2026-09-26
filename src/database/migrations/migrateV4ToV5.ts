import { getDb } from '../utils/db';

export const migrateV4ToV5 = async (userId: string) => {
    const db = await getDb(userId);

    await db.transaction(tx => {
        tx.executeSql(`ALTER TABLE words ADD COLUMN bundleId TEXT;`);
        tx.executeSql(`ALTER TABLE sessions ADD COLUMN bundleId TEXT;`);
    });
};
