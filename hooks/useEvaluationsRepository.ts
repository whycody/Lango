import { createTables, getAllEvaluations, saveEvaluations } from "../database/EvaluationsRepository";
import { useAuth } from "./useAuth";
import { Evaluation } from "../store/EvaluationsContext";

export const useEvaluationsRepository = () => {
  const userId = useAuth().user.userId;

  if (!userId) throw new Error("User not logged in");

  return {
    createTables: () => createTables(userId),
    saveEvaluations: (evaluations: Evaluation[]) => saveEvaluations(userId, evaluations),
    getAllEvaluations: () => getAllEvaluations(userId),
  };
};