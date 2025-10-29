import { NitroSQLiteConnection, open } from 'react-native-nitro-sqlite'

export const getDb = async (userId: string): Promise<NitroSQLiteConnection> => {
  if (!userId) throw new Error("User ID not provided");
  return open({ name: `${userId}_sessions.sqlite`, location: 'default' });
};