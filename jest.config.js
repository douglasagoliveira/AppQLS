// Testes cobrem apenas lógica pura (sem componentes RN), então rodam em node
// com um transform Babel mínimo, independente do babel.config.js do app (nativewind).
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/__tests__/**/*.test.ts?(x)'],
  transform: {
    '^.+\\.[jt]sx?$': [
      'babel-jest',
      { configFile: false, babelrc: false, presets: ['babel-preset-expo'] },
    ],
  },
  clearMocks: true,
};
