// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');
const importPlugin = require('eslint-plugin-import');
const unusedImportsPlugin = require('eslint-plugin-unused-imports');

module.exports = defineConfig([
  {
    ignores: ['dist', 'coverage', 'src/index.html', 'src/app/api/generated/**'],
  },

  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    plugins: {
      prettier: prettierPlugin,
      import: importPlugin,
      'unused-imports': unusedImportsPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-vars': 'off',
      '@angular-eslint/prefer-inject': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],

      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'cf',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'cf',
          style: 'kebab-case',
        },
      ],
      'no-empty': 'off',
      'import/no-unresolved': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
          'newlines-between': 'never',
        },
      ],

      'unused-imports/no-unused-imports': 'error',
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  },

  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    plugins: {},
    rules: {
      'prettier/prettier': 'off',
      '@angular-eslint/template/click-events-have-key-events': 'off',
      '@angular-eslint/template/interactive-supports-focus': 'off',
      '@angular-eslint/template/label-has-associated-control': 'off',
    },
  },
]);
