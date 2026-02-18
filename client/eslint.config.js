import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginVue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tsEslint from "typescript-eslint";

export default defineConfig([
  {
    name: "app/ignores",
    ignores: [
      "dist/**",
      "coverage/**",
      // 自动生成的类型声明文件
      // 'src/auto-imports.d.ts',
      // 'src/components.d.ts',
    ],
  },
  {
    name: "app/files",
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,tsx,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  js.configs.recommended,
  ...tsEslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  {
    name: "app/vue-parser",
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tsEslint.parser,
      },
    },
  },
  {
    name: "app/rules",
    rules: {
      // JavaScript 基础规则
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "warn",
      "prefer-const": "error",
      "no-var": "error",

      // TypeScript 规则
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "warn",
      // 这两个规则依赖 type-aware lint；当前项目未启用 projectService，先关闭避免运行时崩溃
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/prefer-optional-chain": "off",

      // Vue 规则
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "warn",
      "vue/require-default-prop": "off",
      "vue/no-mutating-props": "error",
      "vue/no-side-effects-in-computed-properties": "error",
      "vue/html-self-closing": [
        "error",
        {
          html: { void: "always", normal: "never", component: "always" },
          svg: "always",
          math: "always",
        },
      ],
    },
  },
  eslintConfigPrettier,
]);
