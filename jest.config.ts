import type { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => {
  return {
    verbose: true,
    transform: {
      '^.+\\.(ts|tsx|js|jsx)$': 'ts-jest',
    },
    testPathIgnorePatterns: [
      'scripts/dist',
    ],
    coveragePathIgnorePatterns: [
      'builder/codegen/tests/example',
      'src/index.ts',
      '.d.ts$',
    ],
  };
};
