module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  collectCoverageFrom: [
    'src/**/*.{ts,js}'
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  // globalSetup: '<rootDir>/setup.ts',
  // globalTeardown: '<rootDir>/teardown.ts'
};