import { DarkTheme as NavigationDarkTheme } from '@react-navigation/native';

import { CustomTheme } from './Theme';

export const DarkTheme: CustomTheme = {
    ...NavigationDarkTheme,
    colors: {
        ...NavigationDarkTheme.colors,
        background: '#0f0f30',
        border: '#333333',
        card: '#07071b',

        cardAccent: '#334c88',
        cardAccent300: '#24355e',
        cardAccent600: '#1f2f53',
        green300: 'rgba(115,197,118,0.15)',
        green600: '#73c576',

        notification: '#ffffff',
        primary: '#DCF2F1',
        primary300: '#A8DAE7',

        primary600: '#719cea',
        red: '#ff6060',
        red300: 'rgba(228,129,129,0.15)',
        red600: '#e48181',
        text: '#DCF2F1',
        yellow300: 'rgba(227,197,98,0.15)',
        yellow600: '#e3c562',
    },
    dark: true,
};
