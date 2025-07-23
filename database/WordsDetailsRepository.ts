import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { WordDetails } from "../store/types";

export const WORDS_DETAILS_COLUMNS = ['wordId', 'hoursSinceLastRepetition', 'studyDuration', 'gradesAverage',
  'repetitionsCount', 'gradesTrend', 'predictedGrade', 'gradeThreeProb'];
export const WORD_DETAILS = 'words_details';

const getDb = async (userId: string): Promise<SQLiteDatabase> => {
  if (!userId) throw new Error("User ID not provided");
  return SQLite.openDatabase({ name: `${userId}_words.db` });
};

export const createTables = async (userId: string) => {
  const db = await getDb(userId);
  await db.transaction(tx => {
    tx.executeSql(`
        CREATE TABLE IF NOT EXISTS ${WORD_DETAILS}
        (
            wordId                   TEXT PRIMARY KEY,
            hoursSinceLastRepetition REAL,
            studyDuration            REAL,
            gradesAverage            REAL,
            repetitionsCount         INTEGER,
            gradesTrend              REAL,
            predictedGrade           INTEGER,
            gradeThreeProb           REAL
        )
    `);
  });
};

export const saveWordsDetails = async (userId: string, wordsDetails: WordDetails[]) => {
  const db = await getDb(userId);
  await db.transaction(tx => {
    wordsDetails.forEach(wordDetails => {
      const values = [
        wordDetails.wordId,
        wordDetails.hoursSinceLastRepetition,
        wordDetails.studyDuration,
        wordDetails.gradesAverage,
        wordDetails.repetitionsCount,
        wordDetails.gradesTrend,
        wordDetails.predictedGrade,
        wordDetails.gradeThreeProb
      ];

      const placeholders = WORDS_DETAILS_COLUMNS.map(() => '?').join(', ');

      tx.executeSql(
        `REPLACE INTO ${WORD_DETAILS} (${WORDS_DETAILS_COLUMNS.join(', ')})
         VALUES (${placeholders})`,
        values
      );
    });
  });
};

export const getAllWordsDetails = async (userId: string): Promise<WordDetails[]> => {
  const db = await getDb(userId);

  return new Promise((resolve, reject) => {
    db.readTransaction(tx => {
      tx.executeSql(
        `SELECT * FROM ${WORD_DETAILS}`,
        [],
        (_, { rows }) => {
          const words = Array.from({ length: rows.length }, (_, i) => {
            const row = rows.item(i);
            return {
              wordId: row.wordId,
              hoursSinceLastRepetition: row.hoursSinceLastRepetition,
              studyDuration: row.studyDuration,
              gradesAverage: row.gradesAverage,
              repetitionsCount: row.repetitionsCount,
              gradesTrend: row.gradesTrend,
              predictedGrade: row.predictedGrade,
              gradeThreeProb: row.gradeThreeProb
            } satisfies WordDetails;
          });
          resolve(words);
        },
        (_, error) => {
          reject(error);
          return true;
        }
      );
    });
  });
};

export const updateWordDetails = async (userId: string, wordDetails: WordDetails) => {
  await saveWordsDetails(userId, [wordDetails]);
};