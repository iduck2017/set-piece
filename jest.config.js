const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js'],
    testMatch: ['**/test/**/*.ts'],
    cache: true,
    cacheDirectory: '.jest',
  
    moduleNameMapper: pathsToModuleNameMapper(
        compilerOptions.paths, 
        { prefix: '<rootDir>/' }
    ),
}; 