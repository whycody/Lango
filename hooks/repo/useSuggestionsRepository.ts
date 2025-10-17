import {
  createTables,
  deleteSuggestions,
  getAllSuggestions,
  saveSuggestions
} from "../../database/SuggestionsRepository";
import { Suggestion } from "../../store/types";
import { useAuth } from "../../api/auth/AuthProvider";

export const useSuggestionsRepository = () => {
  const { user } = useAuth();

  const getUserId = () => {
    if (!user?.userId) throw new Error("User not logged in");
    return user.userId;
  };

  return {
    createTables: () => createTables(getUserId()),
    saveSuggestions: (suggestions: Suggestion[]) => saveSuggestions(getUserId(), suggestions),
    getAllSuggestions: () => getAllSuggestions(getUserId()),
    deleteSuggestions: (ids: string[]) => deleteSuggestions(getUserId(), ids),
  };
};