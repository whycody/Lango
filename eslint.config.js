const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const reactPlugin = require('eslint-plugin-react');
const simpleImportSortPlugin = require('eslint-plugin-simple-import-sort');
const sortDestructureKeysPlugin = require('eslint-plugin-sort-destructure-keys');
const sortKeysFixPlugin = require('eslint-plugin-sort-keys-fix');
const typescriptSortKeysPlugin = require('eslint-plugin-typescript-sort-keys');
const globals = require('globals');

module.exports = [
    {
        ignores: [
            'node_modules/**',
            'build/**',
            '*.json',
            '**/*config.js',
            'detox/**',
            '**/reactotron/**',
            'bin/**',
            '**/__tests__/*',
            'test/mocks/*',
            '**/*.test.ts',
            '**/*.test.tsx',
            'e2e/*',
            'test/**',
            'utils/mocks/**',
            'lint-staged.js',
            'src/utils/model.js',
        ],
    },
    js.configs.recommended,
    {
        files: ['src/**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: { jsx: true },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
                __DEV__: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            react: reactPlugin,
            'simple-import-sort': simpleImportSortPlugin,
            'sort-destructure-keys': sortDestructureKeysPlugin,
            'sort-keys-fix': sortKeysFixPlugin,
            'typescript-sort-keys': typescriptSortKeysPlugin,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            'no-undef': 'off',
            'no-redeclare': 'off',
            'no-use-before-define': 'off',
            'no-global-assign': 'off',
            'no-unused-vars': 'off',
            eqeqeq: 'off',
            'prefer-const': 'off',
            'object-shorthand': ['warn', 'always'],
            'sort-keys': 'off',
            'sort-keys-fix/sort-keys-fix': [
                'warn',
                'asc',
                {
                    caseSensitive: false,
                    natural: true,
                },
            ],
            'react/display-name': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-member-accessibility': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            'sort-imports': 'off',
            quotes: 'off',
            'comma-dangle': 'off',
            'multiline-ternary': 'off',
            'no-restricted-syntax': 'off',
            'react/jsx-sort-props': [
                'warn',
                {
                    callbacksLast: true,
                    shorthandFirst: true,
                    multiline: 'last',
                    noSortAlphabetically: false,
                    reservedFirst: ['key'],
                },
            ],
            'simple-import-sort/imports': [
                'warn',
                {
                    groups: [
                        ['^react$', '^react-native$', '^@?\\w'],
                        ['^(src|@)/'],
                        ['^\\u0000'],
                        ['^\\.'],
                    ],
                },
            ],
            'simple-import-sort/exports': 'warn',
            'sort-destructure-keys/sort-destructure-keys': 'warn',
            'typescript-sort-keys/interface': 'warn',
            'typescript-sort-keys/string-enum': 'warn',
        },
    },
];
