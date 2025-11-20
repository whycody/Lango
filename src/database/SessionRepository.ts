import { Session } from "../types";
import { getDb } from "./utils/db";

const columns: Array<keyof Session> = ['id', 'date', 'localDay', 'mode', 'sessionModel', 'averageScore', 'wordsCount', 'finished',
  'synced', 'updatedAt', 'locallyUpdatedAt'];

export const createTables = async (userId: string) => {
  const db = await getDb(userId);
  await db.transaction(tx => {
    tx.executeSql(`
        CREATE TABLE IF NOT EXISTS sessions
        (
            id               TEXT PRIMARY KEY,
            date             TEXT,
            localDay         TEXT,
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

      tx.executeSql(
        `REPLACE INTO sessions (${columns.join(', ')})
         VALUES (${placeholders})`,
        values
      );
    });
  });
};

export const getAllSessions = async (userId: string): Promise<Session[]> => {
  const db = await getDb(userId);
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT *
         FROM sessions`,
        [],
        (_, results) => {
          const rows = results.rows;
          const sessions: Session[] = [];
          for (let i = 0; i < rows.length; i++) {
            const row = rows.item(i);
            sessions.push({
              id: row.id,
              date: row.date,
              localDay: row.localDay,
              mode: row.mode,
              sessionModel: row.sessionModel,
              averageScore: row.averageScore,
              wordsCount: row.wordsCount,
              finished: row.finished === 1,
              synced: row.synced === 1,
              updatedAt: row.updatedAt || null,
              locallyUpdatedAt: row.locallyUpdatedAt || new Date().toISOString(),
            });
          }
          resolve(sessions);
        },
        error => reject(error)
      );
    });
  });
};