module.exports = {
  extends: ["airbnb-typescript"],
  parserOptions: {
    project: "./tsconfig.json",
  },
  ignorePatterns: ["/*.*"],
  rules: {
    "no-underscore-dangle": 0,
  },
};
