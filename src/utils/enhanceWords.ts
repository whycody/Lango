import { SessionWord, WordMLState, WordTag } from "../types";

const DAY = 24 * 60 * 60 * 1000;

const addTag = (tags: WordTag[], condition: boolean, tag: WordTag) => {
  if (condition) tags.push(tag);
};

export const enhanceWords = (sessionWords: SessionWord[], mlStates: WordMLState[]): SessionWord[] => {
  const mlMap = new Map(mlStates.map(s => [s.wordId, s]));
  const now = Date.now();

  return sessionWords.map(word => {
    const state = mlMap.get(word.id);
    const tags: WordTag[] = [];

    if (!state) return { ...word, tags };

    const {
      gradesTrend,
      repetitionsCount,
      gradeThreeProb,
      studyStreak,
      gradesAverage,
      hoursSinceLastRepetition,
    } = state;

    const isRecentlyAdded = now - new Date(word.addDate).getTime() <= 3 * DAY;

    addTag(tags, gradesTrend > 0.1, "improving");
    addTag(tags, repetitionsCount < 5 && gradeThreeProb < 0.85, "in_progress");
    addTag(tags, isRecentlyAdded, "recently_added");
    addTag(tags, hoursSinceLastRepetition > 24 * 14, "long_time_no_see");
    addTag(tags, repetitionsCount > 10, "frequently_repeated");
    addTag(tags, gradeThreeProb > 0.8, "well_known");
    addTag(tags, studyStreak >= 3, "streak");

    if (repetitionsCount > 5) {
      addTag(tags, gradesAverage <= 1.5, "struggling");
      addTag(tags, gradesAverage > 1.5 && gradesAverage <= 2, "often_mistaken");
    }

    return { ...word, tags };
  });
};