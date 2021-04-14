module.exports = {
  plugins: ['prettier'],
  extends: [
    'airbnb-typescript',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
  ],
  parserOptions: {
    project: './tsconfig.json',
    warnOnUnsupportedTypeScriptVersion: false,
  },
  settings: {
    react: {
      version: '17.0.1',
    },
  },
  ignorePatterns: ['/*.*'],
  rules: {
    'no-underscore-dangle': 0,
  },
};
