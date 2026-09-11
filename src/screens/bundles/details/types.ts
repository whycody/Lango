import { Ionicons } from '@expo/vector-icons';

import { BundleMemberRole, TranslationKey, Word, WordsBundleVisibility } from '../../../types';

export type InviteRole = Extract<BundleMemberRole, 'editor' | 'viewer'>;

export type BundleVisibilityOption = {
    visibility: WordsBundleVisibility;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    labelKey: TranslationKey;
    descKey: TranslationKey;
};

export type BundleWord = Word & { gradeThreeProb: number };

export type BundleListItem = BundleWord | { id: 'header' | 'subheader' | 'empty' };
