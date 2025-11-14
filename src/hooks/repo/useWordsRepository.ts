import { createTables, getAllWords, saveWords, updateWord } from "../../database/WordsRepository";
import { Word } from "../../types";
import { useAuth } from "../../api/auth/AuthProvider";

export const useWordsRepository = () => {
  const { user } = useAuth();

  const getUserId = () => {
    if (!user?.userId) throw new Error("User not logged in");
    return user.userId;
  };

  return {
    createTables: () => createTables(getUserId()),
    saveWords: (words: Word[]) => saveWords(getUserId(), words),
    getAllWords: () => getAllWords(getUserId()),
    updateWord: (word: Word) => updateWord(getUserId(), word),
  };
};