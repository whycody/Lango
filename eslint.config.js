const js = require("@eslint/js");
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const globals = require("globals");

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "build/**",
      "*.json",
      "**/*config.js",
      "detox/**",
      "**/reactotron/**",
      "bin/**",
      "**/__tests__/*",
      "test/mocks/*",
      "**/*.test.ts",
      "**/*.test.tsx",
      "e2e/*",
      "test/**",
      "utils/mocks/**",
      "lint-staged.js",
      "src/utils/model.js",
    ],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        __DEV__: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      "no-undef": "off",
      "no-redeclare": "off",
      "no-use-before-define": "off",
      "no-global-assign": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-member-accessibility": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "quotes": "off",
      "comma-dangle": "off",
      "multiline-ternary": "off",
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXAttribute[name.name='style'] JSXExpressionContainer > ObjectExpression",
          message:
            "Inline style object is not allowed. Move styles to StyleSheet.create.",
        },
      ],
    },
  },
];