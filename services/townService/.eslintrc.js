module.exports = {
  plugins: ['prettier'],
  root: true,
  extends: [
    'airbnb-typescript',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parserOptions: {
    project: './tsconfig.eslint.json',
    warnOnUnsupportedTypeScriptVersion: false,
  },
  settings: {
    react: {
      version: 'latest',
    },
  },
  ignorePatterns: ['/*.*'],
  rules: {
    'no-underscore-dangle': 0,
    'no-param-reassign': 0,
    'no-restricted-syntax': 0,
  },
};
