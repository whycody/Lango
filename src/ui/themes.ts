import { DarkTheme as NavigationDarkTheme } from '@react-navigation/native';

import { CustomTheme } from './Theme';

export const DarkTheme: CustomTheme = {
    ...NavigationDarkTheme,
    colors: {
        ...NavigationDarkTheme.colors,
        background: '#090B22',
        border: '#333333',
        card: '#23233d',

        cardAccent: '#2f2f47',
        cardAccent300: '#434366',
        cardAccent600: '#3a3a58',

        green300: 'rgba(115,197,118,0.15)',
        green600: '#73c576',
        notification: '#ffffff',
        orange: '#ff9f43',
        orange300: 'rgba(255, 158, 67, 0.50)',
        orange600: 'rgba(255, 158, 67, 0.15)',

        primary: '#4653ac',
        primary300: '#606eca',
        primary600: '#4E5AA6',
        primary800: '#2e3875',

        red: '#ff6060',
        red300: 'rgba(228,129,129,0.15)',
        red600: '#e48181',
        text: '#DCF2F1',
        white: '#fff',
        white300: 'rgba(255,255,255,0.70)',
        yellow: '#FFD700',
        yellow300: 'rgba(227,197,98,0.15)',
        yellow600: '#e3c562',
    },
    dark: true,
};
