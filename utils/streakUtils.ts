export type Streak = {
  numberOfDays: number
  active: boolean
}

export const getCurrentStreak = (studyDaysList: string[]): Streak => {
  const toDateOnlyString = (date: Date) =>
    date.toISOString().split('T')[0];

  const studySet = new Set(studyDaysList);
  const todayStr = toDateOnlyString(new Date());
  const active = studySet.has(todayStr);

  let streak = 0;
  let currentDate = new Date();

  if (!active) currentDate.setDate(currentDate.getDate() - 1);

  while (true) {
    const dateStr = toDateOnlyString(currentDate);
    if (studySet.has(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return { numberOfDays: streak, active };
};