export type RingSegment = {
    color: string;
    dashArray: string;
    dashOffset: number;
};

export type MasteryRingLabel = 'learning' | 'mastered' | 'review';

export type WordMasteryCounts = {
    learning: number;
    mastered: number;
    review: number;
};

export type RingSegmentCount = {
    color: string;
    count: number;
    label?: MasteryRingLabel;
};
