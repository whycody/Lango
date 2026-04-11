import { getDb } from '../utils/db';

export const migrateV3ToV4 = async (userId: string) => {
    const db = await getDb(userId);

    await db.transaction(tx => {
        tx.executeSql(`ALTER TABLE suggestions ADD COLUMN example TEXT;`);
    });
};
