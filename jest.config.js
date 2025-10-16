module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/app/$1',
    '^@domain/(.*)$': '<rootDir>/domain/$1',
    '^@interfaces/(.*)$': '<rootDir>/interfaces/$1',
    '^@infra/(.*)$': '<rootDir>/infra/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        baseUrl: './src',
        paths: {
          '@app/*': ['app/*'],
          '@domain/*': ['domain/*'],
          '@interfaces/*': ['interfaces/*'],
          '@infra/*': ['infra/*'],
          '@shared/*': ['shared/*'],
        },
      },
    },
  },
};
