module.exports = {
  plugins: ['prettier', 'import', 'react'],
  root: true,
  extends: [
    'airbnb-base',
    'airbnb-typescript',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    warnOnUnsupportedTypeScriptVersion: false,
  },
  ignorePatterns: ['/*.*'],
  rules: {
    'no-underscore-dangle': 0,
    'no-param-reassign': 0,
    'no-restricted-syntax': 0,
    'no-plusplus': 0,
    'import/no-extraneous-dependencies': ["error", {"devDependencies": ["**/*.test.ts", "**/TestUtils.ts"]}],
  },
};
