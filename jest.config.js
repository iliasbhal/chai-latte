module.exports = {
  verbose: true,
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'ts-jest',
  },
  testPathIgnorePatterns: [
    'build',
  ],
  coveragePathIgnorePatterns: [
    'builder/codegen/tests/example',
    'src/index.ts',
    '.d.ts$',
  ],
};
