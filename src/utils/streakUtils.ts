import { toLocalDateString } from "./dateUtil";

export type Streak = {
  numberOfDays: number
  active: boolean
}

export const getCurrentStreak = (studyDaysList: string[]): Streak => {
  const studySet = new Set(studyDaysList);
  const todayStr = toLocalDateString(new Date());
  const active = studySet.has(todayStr);

  let streak = 0;
  let currentDate = new Date();
  if (!active) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  let missedInARow = 0;

  while (true) {
    const dateStr = toLocalDateString(currentDate);

    if (studySet.has(dateStr)) {
      streak++;
      missedInARow = 0;
    } else {
      missedInARow++;
      if (missedInARow >= 2) break;
    }

    currentDate.setDate(currentDate.getDate() - 1);
  }

  return { numberOfDays: streak, active };
};