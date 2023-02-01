// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // 'indent': [
    // 	'error',
    // 	'space'
    // ],
    // 'linebreak-style': [
    // 	'error',
    // 	'linux'
    // ],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    // 'no-unused-vars': ['warn;', { vars: 'all' }],
  },
};
