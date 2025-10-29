import { Session, SESSION_MODE, SESSION_MODEL } from "../store/types";
import { getDb } from "./utils/db";

const columns: Array<keyof Session> = ['id', 'date', 'mode', 'sessionModel', 'averageScore', 'wordsCount', 'finished',
  'synced', 'updatedAt', 'locallyUpdatedAt'];

export const createTables = async (userId: string) => {
  const db = await getDb(userId);
  await db.transaction(tx => {
    tx.execute(`
        CREATE TABLE IF NOT EXISTS sessions
        (
            id               TEXT PRIMARY KEY,
            date             TEXT,
            mode             TEXT,
            sessionModel     TEXT,
            averageScore     REAL,
            wordsCount       INTEGER,
            finished         INTEGER,
            synced           INTEGER,
            updatedAt        TEXT,
            locallyUpdatedAt TEXT
        )
    `);
  });
};

export const saveSessions = async (userId: string, sessions: Session[]) => {
  const db = await getDb(userId);
  await db.transaction(tx => {
    sessions.forEach(session => {
      const values = columns.map(col => {
        if (col === 'finished') return session.finished ? 1 : 0;
        if (col === 'synced') return session.synced ? 1 : 0;
        return session[col as keyof Session] || null;
      });
      const placeholders = columns.map(() => '?').join(', ');

      tx.execute(
        `REPLACE INTO sessions (${columns.join(', ')})
         VALUES (${placeholders})`,
        values
      );
    });
  });
};

export const getAllSessions = async (userId: string): Promise<Session[]> => {
  const db = await getDb(userId);

  const results = db.execute(`SELECT * FROM sessions`, []);

  return results.rows._array.map(row => ({
    id: String(row.id),
    date: String(row.date),
    mode: String(row.mode) as SESSION_MODE,
    sessionModel: String(row.sessionModel) as SESSION_MODEL,
    averageScore: Number(row.averageScore),
    wordsCount: Number(row.wordsCount),
    finished: row.finished === 1,
    synced: row.synced === 1,
    updatedAt: row.updatedAt != null ? String(row.updatedAt) : null,
    locallyUpdatedAt: row.locallyUpdatedAt != null ? String(row.locallyUpdatedAt) : new Date().toISOString(),
  }));
};