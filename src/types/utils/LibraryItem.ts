import { Ionicons } from '@expo/vector-icons';

import { LibraryItems } from '../../constants/Library';

export type LibraryItem = {
    description?: string;
    enabled?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    id: LibraryItems;
    label: string;
    color: string;
};
