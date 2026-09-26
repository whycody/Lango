import { GRADE_THREE_PROB_THRESHOLDS } from '../../../constants/Evaluation';
import { MASTERY_RING_GAP_RATIO } from './constants';
import { RingSegment, RingSegmentCount, WordMasteryCounts } from './types';

export const classifyWordMastery = (gradeThreeProb: number): keyof WordMasteryCounts => {
    if (gradeThreeProb <= GRADE_THREE_PROB_THRESHOLDS.BAD_MAX) return 'learning';
    if (gradeThreeProb >= GRADE_THREE_PROB_THRESHOLDS.GOOD_MIN) return 'mastered';
    return 'review';
};

export const countWordsByMastery = (words: { gradeThreeProb: number }[]): WordMasteryCounts => {
    const counts: WordMasteryCounts = { learning: 0, mastered: 0, review: 0 };

    words.forEach(word => {
        counts[classifyWordMastery(word.gradeThreeProb)]++;
    });

    return counts;
};

export const computeMasteryRingSegments = (
    counts: RingSegmentCount[],
    circumference: number,
): RingSegment[] => {
    const total = counts.reduce((sum, segment) => sum + segment.count, 0);
    if (total === 0) return [];

    const gap = circumference * MASTERY_RING_GAP_RATIO;
    let offset = 0;

    return counts
        .filter(segment => segment.count > 0)
        .map(segment => {
            const segmentLength = (segment.count / total) * circumference;
            const dashArray = `${Math.max(segmentLength - gap, 0)} ${circumference}`;
            const dashOffset = -offset;
            offset += segmentLength;

            return { color: segment.color, dashArray, dashOffset };
        });
};
