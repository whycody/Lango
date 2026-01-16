import { getDb } from "../utils/db";

export const migrateV2ToV3 = async (userId: string) => {
  const db = await getDb(userId);

  await db.transaction(tx => {
    tx.executeSql(`
      ALTER TABLE sessions ADD COLUMN sessionModelVersion TEXT;
    `);
  });
};