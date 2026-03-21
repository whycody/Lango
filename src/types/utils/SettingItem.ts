import { Ionicons } from "@expo/vector-icons";

export type SettingItem = {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  section: number;
  enabled?: boolean;
};
