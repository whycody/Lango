import { WordsBundleBase } from './WordsBundle';

export type BundleSearchResult = WordsBundleBase & {
    creatorName?: string;
    flashcardsCount: number;
};

export type BundleSearchResponse = {
    data: BundleSearchResult[];
    total: number;
};
