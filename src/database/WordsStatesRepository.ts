export interface WordsStatesRepository<T> {
    createTables(): Promise<void>;
    getAllWordsStates(): Promise<T[]>;
    save(items: T[]): Promise<void>;
    update(item: T): Promise<void>;
}
