import { Ionicons } from '@expo/vector-icons';

import { SettingsItems } from '../../constants/Settings';

export type SettingItem = {
    description: string;
    enabled?: boolean;
    icon: keyof typeof Ionicons.glyphMap;
    id: SettingsItems;
    label: string;
    section: number;
    color: string;
};
