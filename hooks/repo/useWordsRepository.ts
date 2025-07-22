import { createTables, getAllWords, saveWords, updateWord } from "../../database/WordsRepository";
import { Word } from "../../store/types";
import { useAuth } from "../../api/auth/AuthProvider";

export const useWordsRepository = () => {
  const userId = useAuth().user.userId;

  if (!userId) throw new Error("User not logged in");

  return {
    createTables: () => createTables(userId),
    saveWords: (words: Word[]) => saveWords(userId, words),
    getAllWords: () => getAllWords(userId),
    updateWord: (word: Word) => updateWord(userId, word),
  };
};