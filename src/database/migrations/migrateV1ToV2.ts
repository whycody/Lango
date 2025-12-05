import { getDb } from "../utils/db";

export const migrateV1ToV2 = async (userId: string) => {
  const db = await getDb(userId);

  await db.transaction(tx => {
    tx.executeSql(`
      ALTER TABLE sessions ADD COLUMN mainLang TEXT;
    `);

    tx.executeSql(`
      ALTER TABLE sessions ADD COLUMN translationLang TEXT;
    `);
  });
};