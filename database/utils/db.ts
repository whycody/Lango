import SQLite, { SQLiteDatabase } from "react-native-sqlite-storage";

export const getDb = async (userId: string): Promise<SQLiteDatabase> => {
  if (!userId) throw new Error("User ID not provided");
  return SQLite.openDatabase({ name: `${userId}_sessions.db` });
};