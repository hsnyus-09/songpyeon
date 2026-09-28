import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist", "node_modules", "coverage", ".pack-smoke", "test-results", "playwright-report"]
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      "@typescript-eslint/no-magic-numbers": "off",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { "allowNumber": true, "allowBoolean": true }
      ]
    }
  },
  {
    files: ["scripts/*.mjs", "eslint.config.js"],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        projectService: false
      },
      globals: {
        console: "readonly",
        process: "readonly",
        URL: "readonly"
      }
    }
  }
);
