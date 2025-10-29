import { Evaluation } from "../store/types";
import { getDb } from "./utils/db";

const columns: Array<keyof Evaluation> = ['id', 'wordId', 'sessionId', 'grade', 'date', 'synced', 'updatedAt', 'locallyUpdatedAt'];

export const createTables = async (userId: string) => {
  const db = await getDb(userId);
  await db.transaction(async (tx) => {
    tx.execute(`
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

      tx.execute(
        `REPLACE INTO evaluations (${columns.join(', ')})
         VALUES (${placeholders})`,
        values
      );
    });
  });
};

export const getAllEvaluations = async (userId: string): Promise<Evaluation[]> => {
  const db = await getDb(userId);

  const results = db.execute(`SELECT * FROM evaluations`, []);
  return results.rows._array.map(row => ({
    id: String(row.id),
    wordId: String(row.wordId),
    sessionId: String(row.sessionId),
    grade: Number(row.grade) as 1 | 2 | 3,
    date: String(row.date),
    synced: row.synced === 1,
    updatedAt: row.updatedAt != null ? String(row.updatedAt) : null,
    locallyUpdatedAt: row.locallyUpdatedAt != null ? String(row.locallyUpdatedAt) : new Date().toISOString(),
  }));
};