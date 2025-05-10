import tseslint from "@typescript-eslint/eslint-plugin";
import typescript from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";

export default [
  eslintConfigPrettier,
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    ignores: ["dist/**", "node_modules/**",],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    ignores: [
      "dist/**",
      "node_modules/**",
      ".eslintrc.js",
      "eslint.config.js",
      "postcss.config.js",
      "tailwind.config.ts",
      "vite.config.ts",
      "*.config.*",
      "**/*.test.ts",
    ],
    languageOptions: {
      parser: typescript,
      parserOptions: {
        project: true,
        ecmaVersion: "latest",
        sourceType: "module",
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      import: importPlugin,
      "unused-imports": unusedImports,
    },
    rules: {
      "no-undef": "off",
      "no-return-assign": "error",
      "no-extra-semi": "off",
      "no-console": "off",
      "prefer-destructuring": "off",
      "lines-between-class-members": [
        "error",
        "always",
        { exceptAfterSingleLine: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      "no-console": "off",
      "no-debugger": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
        },
      ],
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
];
