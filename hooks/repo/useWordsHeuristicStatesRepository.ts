import {
  createHeuristicTable,
  getAllWordsHeuristicStates,
  saveWordsHeuristicStates,
  updateWordHeuristicState,
} from "../../database/WordsHeuristicStatesRepository";
import { useAuth } from "../../api/auth/AuthProvider";
import { WordHeuristicState } from "../../store/types";
import { WordsStatesRepository } from "../../database/WordsStatesRepository";

export const useWordsHeuristicStatesRepository = (): WordsStatesRepository<WordHeuristicState> => {
  const userId = useAuth().user.userId;
  if (!userId) throw new Error("User not logged in");

  return {
    createTables: () => createHeuristicTable(userId),
    save: (items) => saveWordsHeuristicStates(userId, items),
    getAll: () => getAllWordsHeuristicStates(userId),
    update: (item) => updateWordHeuristicState(userId, item),
  };
};
