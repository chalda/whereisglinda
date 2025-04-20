module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      //   'react-native-web',
      //    'react-native-web-google-api-maps/babel-plugin',
      '@babel/plugin-transform-export-namespace-from',
      '@babel/plugin-transform-nullish-coalescing-operator',
      '@babel/plugin-transform-numeric-separator',
      '@babel/plugin-transform-optional-catch-binding',
      '@babel/plugin-transform-optional-chaining',
      '@babel/plugin-proposal-function-bind',
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
