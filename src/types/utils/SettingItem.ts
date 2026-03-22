import { Ionicons } from '@expo/vector-icons';

export type SettingItem = {
    description: string;
    enabled?: boolean;
    icon: keyof typeof Ionicons.glyphMap;
    id: string;
    label: string;
    section: number;
};
