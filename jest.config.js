/* eslint-disable no-undef */
/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  preset: "ts-jest",
  verbose: true,
  transform: {
    // eslint-disable-next-line no-useless-escape
    "^.+\.tsx?$": ["ts-jest", {}],
  },
};
