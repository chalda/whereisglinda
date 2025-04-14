module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      //   'react-native-web',
      //    'react-native-web-google-api-maps/babel-plugin',
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-optional-catch-binding',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      '@babel/plugin-proposal-numeric-separator',
      '@babel/plugin-proposal-function-bind',
      '@babel/plugin-proposal-export-namespace-from',
      '@babel/plugin-proposal-export-default-from',
      '@babel/plugin-proposal-do-expressions',
    ],
    // overrides: [
    //   {
    //     test: (fileName) => !fileName.includes('node_modules/react-native-maps'),
    //     plugins: [
    //       ['@babel/plugin-transform-class-properties', { loose: true }],
    //       ['@babel/plugin-transform-private-methods', { loose: true }],
    //       ['@babel/plugin-transform-private-property-in-object', { loose: true }],
    //     ],
    //   },
    // ],
  };
};
