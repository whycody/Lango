import { DefaultNamespace, ParseKeys } from 'i18next';

/** The set of valid i18next translation keys, derived from the augmented resources typing. */
export type TranslationKey = ParseKeys<DefaultNamespace>;
