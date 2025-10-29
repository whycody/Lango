import { getDb } from "./db";
import { migrateV0ToV1 } from "./migrations/migrateV0ToV1";

export const runMigrations = async (userId: string) => {
  const db = await getDb(userId);

  const result = db.execute("PRAGMA user_version", []);
  let version = Number(result.rows._array[0]?.user_version || 0);

  if (version < 1) {
    await migrateV0ToV1(userId);
    version = 1;
  }

  db.execute(`PRAGMA user_version = ${version}`, []);
};