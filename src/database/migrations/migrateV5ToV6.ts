import { getDb } from '../utils/db';

export const migrateV5ToV6 = async (userId: string) => {
    const db = await getDb(userId);

    await db.transaction(tx => {
        tx.executeSql(`ALTER TABLE words_bundles ADD COLUMN category TEXT;`);
        tx.executeSql(`ALTER TABLE words_bundles ADD COLUMN level TEXT;`);
        tx.executeSql(`ALTER TABLE words_bundles ADD COLUMN wordsGenerated INTEGER;`);
        tx.executeSql(`ALTER TABLE words_bundles ADD COLUMN premiumOnly INTEGER;`);
    });
};
