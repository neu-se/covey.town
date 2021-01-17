module.exports = {
  extends: [
    "airbnb-typescript",
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  parserOptions: {
    project: "./tsconfig.json",
  },
  ignorePatterns: ["/*.*"],
  rules: {
    "no-underscore-dangle": 0,
    "@typescript-eslint/no-explicit-any": "off",
  },
};
