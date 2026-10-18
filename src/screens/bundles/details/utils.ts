import { PREMIUM_LOCKED_FADED_WORDS_COUNT, PREMIUM_LOCKED_VISIBLE_WORDS_LIMIT } from './constants';
import { BundleListItem, BundleWord } from './types';

// A locked premium bundle shows only its first few words; the last of them are handed to the
// `premium-lock` item, which renders them faded out above the "Try Premium" prompt.
export const buildWordListItems = (
    words: BundleWord[],
    isPremiumLocked: boolean,
): BundleListItem[] => {
    if (!isPremiumLocked) return words;

    const visibleWords = words.slice(0, PREMIUM_LOCKED_VISIBLE_WORDS_LIMIT);
    const fadedStart = Math.max(visibleWords.length - PREMIUM_LOCKED_FADED_WORDS_COUNT, 0);

    return [
        ...visibleWords.slice(0, fadedStart),
        { fadedWords: visibleWords.slice(fadedStart), id: 'premium-lock' },
    ];
};
