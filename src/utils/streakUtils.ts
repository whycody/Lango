import { BASE_MILESTONES } from '../constants/Streak';
import { Streak } from '../types';
import { toLocalDateString } from './dateUtil';

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

    return { active, numberOfDays: streak };
};

export const getNextMilestone = (value: number) => {
    const base = BASE_MILESTONES.find(m => m > value);
    if (base) return base;
    return Math.ceil(value / 100) * 100;
};

export const getPrevMilestone = (value: number) => {
    const maxMilestone = Math.max(...BASE_MILESTONES);
    const reversed = [...BASE_MILESTONES].reverse().find(m => value < maxMilestone && m <= value);
    if (maxMilestone <= value || !reversed) return Math.floor(value / 100) * 100;
    return reversed;
};
