import {
  createTables,
  getAllWordsMLStates,
  saveWordsMLStates,
  updateWordMLState,
} from "../../database/WordsMLStatesRepository";
import { WordMLState } from "../../store/types";
import { useAuth } from "../../api/auth/AuthProvider";
import { WordsStatesRepository } from "../../database/WordsStatesRepository";

export const useWordsMLStatesRepository = (): WordsStatesRepository<WordMLState> => {
  const userId = useAuth().user.userId;
  if (!userId) throw new Error("User not logged in");

  return {
    createTables: () => createTables(userId),
    save: (items) => saveWordsMLStates(userId, items),
    getAllWordsStates: () => getAllWordsMLStates(userId),
    update: (item) => updateWordMLState(userId, item),
  };
};