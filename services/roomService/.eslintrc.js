module.exports = {
  extends: [
    "airbnb-typescript",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parserOptions: {
    project: "./tsconfig.json",
  },
  settings: {
    react: {
      version: "latest",
    },
  },
  ignorePatterns: ["/*.*"],
  rules: {
    "no-underscore-dangle": 0,
  },
};
