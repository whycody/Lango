import {
  createTables,
  getAllWordsMLStates,
  saveWordsMLStates,
  updateWordMLState,
} from "../../database/WordsMLStatesRepository";
import { WordMLState } from "../../types";
import { useAuth } from "../../api/auth/AuthProvider";
import { WordsStatesRepository } from "../../database/WordsStatesRepository";

export const useWordsMLStatesRepository = (): WordsStatesRepository<WordMLState> => {
  const { user } = useAuth();

  const getUserId = () => {
    if (!user?.userId) throw new Error("User not logged in");
    return user.userId;
  };

  return {
    createTables: () => createTables(getUserId()),
    save: (items) => saveWordsMLStates(getUserId(), items),
    getAllWordsStates: () => getAllWordsMLStates(getUserId()),
    update: (item) => updateWordMLState(getUserId(), item),
  };
};