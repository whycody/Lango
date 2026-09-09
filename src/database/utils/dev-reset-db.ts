import { getDb } from './db';

const ALL_TABLES = [
    'words',
    'sessions',
    'evaluations',
    'suggestions',
    'word_ml_state',
    'word_heuristic_state',
];

// Dev-only helper: drops every local table so the next app start recreates the schema
// from scratch via createTables()/runMigrations(). Call once manually, then remove.
export const devResetDb = async (userId: string): Promise<void> => {
    const db = await getDb(userId);
    await db.transaction(tx => {
        ALL_TABLES.forEach(table => tx.executeSql(`DROP TABLE IF EXISTS ${table}`));
        tx.executeSql('PRAGMA user_version = 0');
    });
};
