import { FlashcardSortingMethod } from "../store/UserPreferencesContext";
import { t } from "i18next";
import { WordWithDetails } from "../types";

export const getSortingMethodLabel = (method: FlashcardSortingMethod) => {
  switch (method) {
    case FlashcardSortingMethod.ADD_DATE_ASC:
      return t('sorting.addDateAsc');
    case FlashcardSortingMethod.ADD_DATE_DESC:
      return t('sorting.add_date_desc');
    case FlashcardSortingMethod.GRADE_THREE_PROB_ASC:
      return t('sorting.gradeThreeProbAsc');
    case FlashcardSortingMethod.GRADE_THREE_PROB_DESC:
      return t('sorting.gradeThreeProbDesc');
    case FlashcardSortingMethod.REPETITIONS_COUNT_ASC:
      return t('sorting.repetitionsCountAsc');
    case FlashcardSortingMethod.REPETITIONS_COUNT_DESC:
      return t('sorting.repetitionsCountDesc');
  }
}

export const getSortingMethod = (sortingMethod: FlashcardSortingMethod) => {
  switch (sortingMethod) {
    case FlashcardSortingMethod.ADD_DATE_DESC:
      return (a: WordWithDetails, b: WordWithDetails) =>
        new Date(b.addDate).getTime() - new Date(a.addDate).getTime();
    case FlashcardSortingMethod.ADD_DATE_ASC:
      return (a: WordWithDetails, b: WordWithDetails) =>
        new Date(a.addDate).getTime() - new Date(b.addDate).getTime();
    case FlashcardSortingMethod.GRADE_THREE_PROB_DESC:
      return (a: WordWithDetails, b: WordWithDetails) =>
        (b.gradeThreeProb ?? 0) - (a.gradeThreeProb ?? 0);
    case FlashcardSortingMethod.GRADE_THREE_PROB_ASC:
      return (a: WordWithDetails, b: WordWithDetails) =>
        (a.gradeThreeProb ?? 0) - (b.gradeThreeProb ?? 0);
    case FlashcardSortingMethod.REPETITIONS_COUNT_DESC:
      return (a: WordWithDetails, b: WordWithDetails) =>
        b.repetitionsCount - a.repetitionsCount;
    case FlashcardSortingMethod.REPETITIONS_COUNT_ASC:
      return (a: WordWithDetails, b: WordWithDetails) =>
        a.repetitionsCount - b.repetitionsCount;
    default:
      return () => 0;
  }
}