/* eslint-disable no-undef */
/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  preset: "ts-jest",
  verbose: true,
  collectCoverage: true,
  coverageProvider: "v8",
  collectCoverageFrom: ["src/**/*.ts", "!tests/**", "!**/node_modules/**"],
  transform: {
    // eslint-disable-next-line no-useless-escape
    "^.+\.tsx?$": ["ts-jest", {}],
  },
};
