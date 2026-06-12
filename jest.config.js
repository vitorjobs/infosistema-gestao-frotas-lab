const baseConfig = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
  },
};

/** @type {import('jest').Config} */
module.exports = {
  coverageDirectory: './coverage',
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  projects: [
    {
      ...baseConfig,
      displayName: 'unit',
      testRegex: '(/__tests__/.*|(\\.|/)(spec))\\.ts$',
      testPathIgnorePatterns: ['/node_modules/', '/dist/', '/test/', '\\.e2e-spec\\.ts$'],
    },
    {
      ...baseConfig,
      displayName: 'e2e',
      setupFiles: ['<rootDir>/test/setup-e2e.ts'],
      testRegex: '\\.e2e-spec\\.ts$',
    },
  ],
};
