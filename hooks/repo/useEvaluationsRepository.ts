import { createTables, getAllEvaluations, saveEvaluations, deleteEvaluations } from "../../database/EvaluationsRepository";
import { Evaluation } from "../../store/types";
import { useAuth } from "../../api/auth/AuthProvider";

export const useEvaluationsRepository = () => {
  const userId = useAuth().user.userId;

  if (!userId) throw new Error("User not logged in");

  return {
    createTables: () => createTables(userId),
    saveEvaluations: (evaluations: Evaluation[]) => saveEvaluations(userId, evaluations),
    getAllEvaluations: () => getAllEvaluations(userId),
    deleteEvaluations: (ids: string[]) => deleteEvaluations(userId, ids),
  };
};