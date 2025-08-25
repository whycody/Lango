import { createTables, saveWordsMLStates, getAllWordsMLStates, updateWordMLState, } from "../../database/WordsMLStatesRepository";
import { WordMLState } from "../../store/types";
import { useAuth } from "../../api/auth/AuthProvider";

export const useWordsMLStatesRepository = () => {
  const userId = useAuth().user.userId;

  if (!userId) throw new Error("User not logged in");

  return {
    createTables: () => createTables(userId),
    saveWordsMLStates: (wordsMLStates: WordMLState[]) => saveWordsMLStates(userId, wordsMLStates),
    getAllWordsMLStates: () => getAllWordsMLStates(userId),
    updateWordMLState: (wordMLState: WordMLState) => updateWordMLState(userId, wordMLState),
  };
};