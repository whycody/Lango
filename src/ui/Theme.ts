import { Theme } from '@react-navigation/native';

export type CustomTheme = Theme & {
    colors: {
        cardAccent: string;
        cardAccent300: string;
        cardAccent600: string;
        green600: string;
        primary300: string;
        primary600: string;
        red: string;
        red600: string;
        yellow600: string;
    };
};
