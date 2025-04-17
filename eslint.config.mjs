import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  tseslint.configs.recommendedTypeChecked,
  {
    ignores: ["dist", "node_modules", "eslint.config.mjs", "scripts", "tests"],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["vite.config.ts"],
          defaultProject: "./tsconfig.json",
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    rules: {
      "no-console": "error",
      semi: "error",
      "prefer-const": "error",
      "dot-notation": "warn",
      "@typescript-eslint/no-misused-promises": "off",
    },
  },
);
