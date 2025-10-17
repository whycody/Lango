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
  const { user } = useAuth();

  const getUserId = () => {
    if (!user?.userId) throw new Error("User not logged in");
    return user.userId;
  };

  return {
    createTables: () => createHeuristicTable(getUserId()),
    save: (items) => saveWordsHeuristicStates(getUserId(), items),
    getAllWordsStates: () => getAllWordsHeuristicStates(getUserId()),
    update: (item) => updateWordHeuristicState(getUserId(), item),
  };
};
