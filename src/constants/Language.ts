export enum LanguageCode {
    ENGLISH = 'en',
    ITALIAN = 'it',
    POLISH = 'pl',
    SPANISH = 'es',
}

export const LANGUAGE_LEVEL_KEYS = [
    { code: 'A1', key: 'beginner', level: 1 },
    { code: 'A2', key: 'elementary', level: 2 },
    { code: 'B1', key: 'intermediate', level: 3 },
    { code: 'B2', key: 'advanced', level: 4 },
    { code: 'C1', key: 'proficient', level: 5 },
] as const;

export enum LanguageTypes {
    APPLICATION = 'application',
    MAIN = 'main',
    TRANSLATION = 'translation',
}
