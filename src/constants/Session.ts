export enum SessionModel {
  HEURISTIC = "heuristic",
  ML = "ml",
  HYBRID = "hybrid",
  NONE = "none",
}

export enum SessionModelVersion {
  NONE = "none",
  H1 = "h1",
  ML1 = "ml1",
  ML2 = "ml2",
  O1 = "o1",
  R1 = "r1",
}

export enum SessionMode {
  STUDY = "STUDY",
  RANDOM = "RANDOM",
  OLDEST = "OLDEST",
  UNKNOWN = "UNKNOWN",
}

export const PICKED_SESSION_MODEL_VERSION = SessionModelVersion.ML2;
