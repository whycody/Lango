export enum SessionModel {
    HEURISTIC = 'heuristic',
    HYBRID = 'hybrid',
    ML = 'ml',
    NONE = 'none',
}

export enum SessionModelVersion {
    H1 = 'h1',
    ML1 = 'ml1',
    ML2 = 'ml2',
    NONE = 'none',
    O1 = 'o1',
    R1 = 'r1',
}

export enum SessionMode {
    OLDEST = 'OLDEST',
    RANDOM = 'RANDOM',
    STUDY = 'STUDY',
    UNKNOWN = 'UNKNOWN',
}

export const PICKED_SESSION_MODEL_VERSION = SessionModelVersion.ML2;
