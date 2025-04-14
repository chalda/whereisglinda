module.exports = {
  root: true,
  extends: [
    'universe/native',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-native/all',
  ],
  parser: '@babel/eslint-parser',
  plugins: ['react', 'react-native'],
  env: {
    browser: true,
    es2021: true,
  },
  rules: {
    'react/prop-types': 'off',
  },
};
