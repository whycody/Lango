import { palette } from './palette';
import { FlashcardSortingMethod } from './UserPreferences';

export const SORTING_COLORS: Record<FlashcardSortingMethod, string> = {
    [FlashcardSortingMethod.ADD_DATE_ASC]: palette.blue,
    [FlashcardSortingMethod.ADD_DATE_DESC]: palette.blue,
    [FlashcardSortingMethod.GRADE_THREE_PROB_ASC]: palette.yellow,
    [FlashcardSortingMethod.GRADE_THREE_PROB_DESC]: palette.yellow,
    [FlashcardSortingMethod.REPETITIONS_COUNT_ASC]: palette.green,
    [FlashcardSortingMethod.REPETITIONS_COUNT_DESC]: palette.green,
};
