import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  // Base config: JS & JSX
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { react, "react-hooks": reactHooks },
    settings: { react: { version: "detect" } },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // Make JSX identifiers count as "used" (fixes no-unused-vars on <Component />)
      "react/jsx-uses-vars": "error",
      // New JSX transform: no need to import React
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",

      // Your tweak
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^React$" },
      ],
    },
  },

  // Vitest component/unit tests under src
  {
    files: ["src/**/*.{test,spec}.{js,jsx}", "src/**/__tests__/**/*.{js,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        // Vitest globals
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        vi: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
      },
    },
  },

  // Tests: WDIO + Mocha globals only under /test
  {
    files: ["test/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.mocha,
        browser: "readonly",
        $: "readonly",
        $$: "readonly",
      },
    },
  },

  // Prettier integration — disables stylistic rules
  eslintConfigPrettier,

  // Ignore generated stuff
  {
    ignores: ["node_modules/**", "dist/**", "coverage/**"],
  },
];
