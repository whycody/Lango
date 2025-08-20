import SQLite from 'react-native-sqlite-storage';
import { WordWithDetails } from '../store/types';
import { WORDS, WORDS_COLUMNS } from "./WordsRepository";
import { WORD_DETAILS, WORDS_DETAILS_COLUMNS } from "./WordsDetailsRepository";

const getDb = async (userId: string) => {
  if (!userId) throw new Error("User ID not provided");
  return SQLite.openDatabase({ name: `${userId}_words.db` });
};

export const getAllWordsWithDetails = async (userId: string): Promise<WordWithDetails[]> => {
  const db = await getDb(userId);

  return new Promise((resolve, reject) => {
    db.readTransaction(tx => {
      tx.executeSql(
        `
        SELECT
          ${WORDS_COLUMNS.map(c => `w.${c}`).join(', ')},
          ${WORDS_DETAILS_COLUMNS.map(c => `d.${c}`).join(', ')}
        FROM ${WORDS} w
        LEFT JOIN ${WORD_DETAILS} d ON w.id = d.wordId
        `,
        [],
        (_, { rows }) => {
          const result: WordWithDetails[] = [];
          for (let i = 0; i < rows.length; i++) {
            const row = rows.item(i);
            result.push({
              id: row.id,
              text: row.text,
              translation: row.translation,
              firstLang: row.firstLang,
              secondLang: row.secondLang,
              source: row.source,
              interval: row.interval,
              addDate: row.addDate,
              repetitionCount: row.repetitionCount,
              lastReviewDate: row.lastReviewDate,
              nextReviewDate: row.nextReviewDate,
              EF: row.EF,
              active: row.active === 1,
              removed: row.removed === 1,
              synced: row.synced === 1,
              locallyUpdatedAt: row.locallyUpdatedAt || new Date().toISOString(),
              updatedAt: row.updatedAt,

              hoursSinceLastRepetition: row.hoursSinceLastRepetition,
              studyStreak: row.studyStreak,
              studyDuration: row.studyDuration,
              gradesAverage: row.gradesAverage,
              repetitionsCount: row.repetitionsCount,
              gradesTrend: row.gradesTrend,
              predictedGrade: row.predictedGrade,
              gradeThreeProb: row.gradeThreeProb,
            });
          }
          resolve(result);
        },
        (_, error) => {
          reject(error);
          return true;
        }
      );
    });
  });
};