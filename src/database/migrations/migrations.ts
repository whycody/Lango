import { getDb } from "../utils/db";
import { migrateV0ToV1 } from "./migrateV0ToV1";
import { migrateV1ToV2 } from "./migrateV1ToV2";
import { migrateV2ToV3 } from "./migrateV2ToV3";

export const runMigrations = async (userId: string) => {
  const db = await getDb(userId);

  let version = await new Promise<number>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        "PRAGMA user_version",
        [],
        (_, result) => {
          const userVersion = result.rows.item(0).user_version;
          resolve(typeof userVersion === "number" ? userVersion : 0);
        },
        (_, err) => reject(err)
      );
    });
  });

  if (version < 1) {
    await migrateV0ToV1(userId);
    version = 1;
  }

  if (version < 2) {
    await migrateV1ToV2(userId);
    version = 2;
  }

  if (version < 2) {
    await migrateV2ToV3(userId);
    version = 3;
  }

  await new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(`PRAGMA user_version = ${version}`, [], () => resolve(), (_, err) => reject(err));
    });
  });
};