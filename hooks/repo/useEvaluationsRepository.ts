import { createTables, getAllEvaluations, saveEvaluations } from "../../database/EvaluationsRepository";
import { Evaluation } from "../../store/types";
import { useAuth } from "../../api/auth/AuthProvider";

export const useEvaluationsRepository = () => {
  const { user } = useAuth();

  const getUserId = () => {
    if (!user?.userId) throw new Error("User not logged in");
    return user.userId;
  };

  return {
    createTables: () => createTables(getUserId()),
    saveEvaluations: (evaluations: Evaluation[]) => saveEvaluations(getUserId(), evaluations),
    getAllEvaluations: () => getAllEvaluations(getUserId()),
  };
};