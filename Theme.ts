import { Theme } from "@react-navigation/native";

export type CustomTheme = Theme & {
  colors: {
    primary300: string;
    primary600: string;
    cardAccent: string;
  };
}