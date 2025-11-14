import "@react-navigation/native";

declare module "@react-navigation/native" {
  export type Theme = {
    dark: boolean;
    colors: {
      primary: string;
      primary300: string;
      primary600: string;

      background: string;
      card: string;
      cardAccent: string;
      cardAccent300: string;
      cardAccent600: string;

      text: string;
      border: string;
      notification: string;

      red: string;
      red600: string;
      yellow600: string;
      green600: string;

      red300: string;
      yellow300: string;
      green300: string;
    };
  };
}