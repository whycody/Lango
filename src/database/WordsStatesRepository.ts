export interface WordsStatesRepository<T> {
  createTables(): Promise<void>;
  save(items: T[]): Promise<void>;
  getAllWordsStates(): Promise<T[]>;
  update(item: T): Promise<void>;
}