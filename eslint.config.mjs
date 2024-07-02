import typescriptParser from '@typescript-eslint/parser'
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin'
import stylisticEslintPlugin from '@stylistic/eslint-plugin'

export default [
  {
    files: ['**/*.ts', 'eslint.config.mjs'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 'latest',
      parserOptions: {
        project: './tsconfig.lint.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      '@stylistic': stylisticEslintPlugin,
    },
    rules: {
      ...typescriptEslintPlugin.configs['recommended'].rules,
      ...stylisticEslintPlugin.configs['recommended-flat'].rules,
      'linebreak-style': ['error', 'unix'],
      'indent': 'off',
      '@typescript-eslint/indent': ['error', 2],
      'no-void': ['error'],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-member-accessibility': 'error',
      '@typescript-eslint/array-type': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      'require-await': 'off',
      '@typescript-eslint/require-await': 'error',
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/block-spacing': ['error', 'always'],
      '@stylistic/brace-style': ['error', '1tbs'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/comma-spacing': ['error'],
      '@stylistic/function-call-spacing': ['error', 'never'],
      '@stylistic/key-spacing': ['error'],
      '@stylistic/keyword-spacing': ['error'],
      '@stylistic/lines-between-class-members': ['error', {
        enforce: [
          { blankLine: 'always', prev: '*', next: 'method' },
        ],
      }],
      '@stylistic/member-delimiter-style': ['error', {
        multiline: {
          delimiter: 'none',
          requireLast: false,
        },
        singleline: {
          delimiter: 'comma',
          requireLast: false,
        },
      }],
      '@stylistic/no-extra-parens': ['error', 'all'],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/space-before-blocks': ['error', 'always'],
      '@stylistic/space-before-function-paren': ['error', 'never'],
      '@stylistic/space-infix-ops': 'error',
      '@stylistic/type-annotation-spacing': 'error',
      '@stylistic/rest-spread-spacing': ['error', 'never'],
    },
  },
  {
    ignores: ['.yarn/**', 'coverage/**'],
  },
]
