import { Evaluation } from "../store/types";
import { getDb } from "./utils/db";

const columns = ['id', 'wordId', 'sessionId', 'grade', 'date', 'synced', 'updatedAt', 'locallyUpdatedAt'];

export const createTables = async (userId: string) => {
  const db = await getDb(userId);
  await db.transaction(tx => {
    tx.executeSql(`
        CREATE TABLE IF NOT EXISTS evaluations
        (
            id               TEXT PRIMARY KEY,
            wordId           TEXT,
            sessionId        TEXT,
            grade            INTEGER,
            date             TEXT,
            synced           INTEGER,
            updatedAt        TEXT,
            locallyUpdatedAt TEXT
        )
    `);
  });
};

export const saveEvaluations = async (userId: string, evaluations: Evaluation[]) => {
  const db = await getDb(userId);
  await db.transaction(tx => {
    evaluations.forEach(evaluation => {
      const values = columns.map(col => {
        if (col === 'synced') return evaluation.synced ? 1 : 0;
        return evaluation[col as keyof Evaluation] || null;
      });
      const placeholders = columns.map(() => '?').join(', ');

      tx.executeSql(
        `REPLACE INTO evaluations (${columns.join(', ')})
         VALUES (${placeholders})`,
        values
      );
    });
  });
};

export const getAllEvaluations = async (userId: string): Promise<Evaluation[]> => {
  const db = await getDb(userId);
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT *
         FROM evaluations`,
        [],
        (_, results) => {
          const rows = results.rows;
          const evaluations: Evaluation[] = [];
          for (let i = 0; i < rows.length; i++) {
            const row = rows.item(i);
            evaluations.push({
              id: row.id,
              wordId: row.wordId,
              sessionId: row.sessionId,
              grade: row.grade,
              date: row.date,
              synced: row.synced === 1,
              updatedAt: row.updatedAt || null,
              locallyUpdatedAt: row.locallyUpdatedAt || new Date().toISOString(),
            });
          }
          resolve(evaluations);
        },
        error => reject(error)
      );
    });
  });
};