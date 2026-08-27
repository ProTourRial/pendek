import { globalIgnores } from "eslint/config";
import tsParser from "@typescript-eslint/parser";

export default [
  globalIgnores([".next/**", "node_modules/**", "coverage/**", "generated/**"]),
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
  },
  {
    files: ["**/*.{js,mjs}"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
  },
];

