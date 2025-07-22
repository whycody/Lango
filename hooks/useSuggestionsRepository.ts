import { useAuth } from "./useAuth";
import { createTables, deleteSuggestions, getAllSuggestions, saveSuggestions } from "../database/SuggestionsRepository";
import { Suggestion } from "../store/types";

export const useSuggestionsRepository = () => {
  const userId = useAuth().user.userId;

  if (!userId) throw new Error("User not logged in");

  return {
    createTables: () => createTables(userId),
    saveSuggestions: (suggestions: Suggestion[]) => saveSuggestions(userId, suggestions),
    getAllSuggestions: () => getAllSuggestions(userId),
    deleteSuggestions: (ids: string[]) => deleteSuggestions(userId, ids),
  };
};