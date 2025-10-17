import { useAuth } from "../../api/auth/AuthProvider";
import { getAllWordsWithDetails } from "../../database/WordsWithDetailsRepository";

export const useWordsWithDetailsRepository = () => {
  const userId = useAuth().user.userId;

  if (!userId) throw new Error("User not logged in");

  return {
    getAllWordsWithDetails: () => getAllWordsWithDetails(userId),
  };
};