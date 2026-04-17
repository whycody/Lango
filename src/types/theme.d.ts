import '@react-navigation/native';

declare module '@react-navigation/native' {
    export type Theme = {
        colors: {
            background: string;
            border: string;
            card: string;

            cardAccent: string;
            cardAccent300: string;
            cardAccent600: string;
            green300: string;
            green600: string;

            notification: string;
            primary: string;
            primary300: string;

            primary600: string;
            red: string;
            red300: string;
            red600: string;

            text: string;
            yellow300: string;
            yellow600: string;
        };
        dark: boolean;
        fonts: any;
    };
}
