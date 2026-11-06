/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.test.json",
      },
    ],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  setupFiles: ["<rootDir>/tests/setup.ts"],
  collectCoverageFrom: [
    "src/services/**/*.ts",
    "src/utils/**/*.ts",
    "src/config/**/*.ts",
    "!src/config/swagger.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "text-summary"],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  clearMocks: true,
};
