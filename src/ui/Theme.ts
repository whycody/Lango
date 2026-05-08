import { Theme } from '@react-navigation/native';

export type CustomTheme = Theme & {
    colors: Theme['colors'] & {
        cardAccent: string;
        cardAccent300: string;
        cardAccent600: string;
        green300: string;
        green600: string;
        primary300: string;
        primary600: string;
        red: string;
        red300: string;
        red600: string;
        orange: string;
        orange300: string;
        orange600: string;
        yellow: string;
        yellow300: string;
        yellow600: string;
        white: string;
    };
    fonts: Theme['fonts'];
};
