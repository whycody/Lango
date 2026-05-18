import { DarkTheme as NavigationDarkTheme } from '@react-navigation/native';

import { AppTheme } from '../constants/UserPreferences';
import { CustomTheme } from './Theme';

const baseColors = {
    blue: '#4e8cff',
    border: '#333333',
    coral: '#ff7043',
    green: '#73c576',
    green300: 'rgba(115,197,118,0.15)',
    green600: '#73c576',
    notification: '#ffffff',
    orange: '#ff9f43',
    orange300: 'rgba(255, 158, 67, 0.50)',
    orange600: 'rgba(255, 158, 67, 0.15)',
    red: '#ff6060',
    red300: 'rgba(228,129,129,0.15)',
    red600: '#e48181',
    text: '#DCF2F1',
    white: '#fff',
    white300: 'rgba(255,255,255,0.70)',
    white600: 'rgba(255,255,255,0.50)',
    yellow: '#e0c218',
    yellow300: 'rgba(227,197,98,0.15)',
    yellow600: '#e3c562',
};

export const DarkTheme: CustomTheme = {
    ...NavigationDarkTheme,
    colors: {
        ...NavigationDarkTheme.colors,
        ...baseColors,
        background: '#090B22',
        card: '#23233d',
        cardAccent: '#2f2f47',
        cardAccent300: '#434366',
        cardAccent600: '#3a3a58',
        primary: '#4758c5',
        primary300: '#5465d3',
        primary600: '#4E5AA6',
        primary800: '#2e3875',
    },
    dark: true,
};

const GreenTheme: CustomTheme = {
    ...NavigationDarkTheme,
    colors: {
        ...NavigationDarkTheme.colors,
        ...baseColors,
        background: '#020A05',
        card: '#1a1d1b',
        cardAccent: '#222422',
        cardAccent300: '#2c2f2d',
        cardAccent600: '#262928',
        primary: '#2E9E5B',
        primary300: '#3DB36E',
        primary600: '#278A4F',
        primary800: '#1A5C34',
    },
    dark: true,
};

const PinkTheme: CustomTheme = {
    ...NavigationDarkTheme,
    colors: {
        ...NavigationDarkTheme.colors,
        ...baseColors,
        background: '#0D0309',
        card: '#1f1820',
        cardAccent: '#271f29',
        cardAccent300: '#342838',
        cardAccent600: '#2d222f',
        primary: '#C2447A',
        primary300: '#D45690',
        primary600: '#A83B6A',
        primary800: '#7A2B4E',
    },
    dark: true,
};

const RedTheme: CustomTheme = {
    ...NavigationDarkTheme,
    colors: {
        ...NavigationDarkTheme.colors,
        ...baseColors,
        background: '#0D0303',
        card: '#1f1818',
        cardAccent: '#271f1f',
        cardAccent300: '#342828',
        cardAccent600: '#2d2222',
        primary: '#C24444',
        primary300: '#D45656',
        primary600: '#A83B3B',
        primary800: '#7A2B2B',
    },
    dark: true,
};

const OrangeTheme: CustomTheme = {
    ...NavigationDarkTheme,
    colors: {
        ...NavigationDarkTheme.colors,
        ...baseColors,
        background: '#0D0702',
        card: '#2a2620',
        cardAccent: '#322e28',
        cardAccent300: '#403b33',
        cardAccent600: '#38332c',
        primary: '#C27A2A',
        primary300: '#D48E3E',
        primary600: '#A86A22',
        primary800: '#7A4D18',
    },
    dark: true,
};

const PurpleTheme: CustomTheme = {
    ...NavigationDarkTheme,
    colors: {
        ...NavigationDarkTheme.colors,
        ...baseColors,
        background: '#08030F',
        card: '#1c1825',
        cardAccent: '#241f2e',
        cardAccent300: '#302a3d',
        cardAccent600: '#2a2436',
        primary: '#8B5CF6',
        primary300: '#9D72F7',
        primary600: '#7A4DE0',
        primary800: '#5B35B0',
    },
    dark: true,
};

export const themes: Record<AppTheme, CustomTheme> = {
    [AppTheme.BLUE]: DarkTheme,
    [AppTheme.GREEN]: GreenTheme,
    [AppTheme.PINK]: PinkTheme,
    [AppTheme.RED]: RedTheme,
    [AppTheme.ORANGE]: OrangeTheme,
    [AppTheme.PURPLE]: PurpleTheme,
};
