export type Streak = {
  numberOfDays: number
  active: boolean
}

export const getCurrentStreak = (studyDaysList: string[]): Streak => {
  const toDateOnlyString = (date: Date) => date.toISOString().split("T")[0];

  const studySet = new Set(studyDaysList);
  const today = new Date();
  const todayStr = toDateOnlyString(today);
  const active = studySet.has(todayStr);

  let streak = 0;
  let currentDate = new Date();
  if (!active) currentDate.setDate(currentDate.getDate() - 1);

  let missedInARow = 0;

  while (true) {
    const dateStr = toDateOnlyString(currentDate);
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