import { isIOS } from './deviceUtils';

const ANDROID_STORE_URL = 'https://play.google.com/store/apps/details?id=com.whycody.lango&hl=pl';
const IOS_STORE_URL = 'https://apps.apple.com/pl/app/lango-smart-ai-flashcards/id6763920383';

export const getStoreUrl = (): string => (isIOS ? IOS_STORE_URL : ANDROID_STORE_URL);

export const isVersionLower = (current: string, minimal: string | undefined | null): boolean => {
    if (!minimal) return false;

    const currentParts = current.split('.').map(Number);
    const minimalParts = minimal.split('.').map(Number);
    const length = Math.max(currentParts.length, minimalParts.length);

    for (let i = 0; i < length; i++) {
        const currentPart = currentParts[i] ?? 0;
        const minimalPart = minimalParts[i] ?? 0;

        if (currentPart < minimalPart) return true;
        if (currentPart > minimalPart) return false;
    }

    return false;
};
