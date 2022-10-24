module.exports = {
  plugins: ['prettier', 'react', 'import'],
  root: true,
  env: {
    browser: true, // Browser global variables like `window` etc.
    commonjs: true, // CommonJS global variables and CommonJS scoping.Allows require, exports and module.
    es6: true, // Enable all ECMAScript 6 features except for modules.
    jest: true, // Jest global variables like `it` etc.
    node: true, // Defines things like process.env when generating through node
  },
  extends: [
    'airbnb-typescript',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
  ],
  settings: {
    react: {
      version: 'detect', // Detect react version
    },
  },
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    warnOnUnsupportedTypeScriptVersion: false,
  },
  ignorePatterns: ['/*.*'],
  rules: {
    'prettier/prettier': 'error',
    'no-underscore-dangle': 0,
    'no-param-reassign': 0,
    'no-restricted-syntax': 0,
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'variable',
        format: ['camelCase'],
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
      {
        selector: 'variable',
        modifiers: ['global', 'const'],
        types: ['boolean', 'number', 'string', 'array'],
        format: ['UPPER_CASE'],
      },
      {
        selector: 'memberLike',
        modifiers: ['private'],
        format: ['camelCase'],
        leadingUnderscore: 'require',
      },
    ],
  },
  overrides: [
    {
      files: ['*.test.tsx', '**/TestUtils.ts'],
      rules: {
        'no-await-in-loop': 0,
        '@typescript-eslint/no-explicit-any': 0,
        'import/no-extraneous-dependencies': 0,
      },
    },
  ],
};
