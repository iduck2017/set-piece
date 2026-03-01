module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js', 'tsx'],
    testMatch: ['**/*.test.ts'],
    cache: true,
    cacheDirectory: '.jest',
}; 