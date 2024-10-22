import { Theme } from "@react-navigation/native";

export type CustomTheme = Theme & {
  colors: {
    tint: string;
    primary600: string;
  };
}