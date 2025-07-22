import { useAuth } from "./useAuth";
import { createTables, saveWordsDetails, getAllWordsDetails, updateWordDetails, } from "../database/WordsDetailsRepository";
import { WordDetails } from "../store/WordsDetailsContext";

export const useWordsDetailsRepository = () => {
  const userId = useAuth().user.userId;

  if (!userId) throw new Error("User not logged in");

  return {
    createTables: () => createTables(userId),
    saveWordsDetails: (wordsDetails: WordDetails[]) => saveWordsDetails(userId, wordsDetails),
    getAllWordsDetails: () => getAllWordsDetails(userId),
    updateWordDetails: (wordDetails: WordDetails) => updateWordDetails(userId, wordDetails),
  };
};