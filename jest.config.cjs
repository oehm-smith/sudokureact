// ABOUTME: Jest configuration — ts-jest over a jsdom environment for the React components.
// ABOUTME: Stylesheet and SVG imports are stubbed; Jest does not bundle assets.

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '\\.(css|svg)$': '<rootDir>/test/assetStub.cjs',
  },
};
