import { WordsBundleWithOwnerInfo } from './WordsBundle';

export type BundleSearchResponse = {
    data: WordsBundleWithOwnerInfo[];
    total: number;
};
