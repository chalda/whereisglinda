module.exports = function (api) {
  api.cache(true);

  //const platform = api.caller((caller) => caller && caller.platform);

  return {
    presets: ['@babel/preset-typescript', ['babel-preset-expo', { reanimated: false }]],
    plugins: [
      //'@babel/preset-typescript',
      //   'react-native-web',
      'react-native-paper/babel',
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-optional-catch-binding',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      '@babel/plugin-proposal-numeric-separator',
      '@babel/plugin-proposal-function-bind',
      '@babel/plugin-proposal-export-namespace-from',
      '@babel/plugin-proposal-export-default-from',
      '@babel/plugin-proposal-do-expressions',
      'react-native-reanimated/plugin',
    ],
  };
};
// ...(platform === 'web'
//   ? [
//       [
//         'module-resolver',
//         {
//           alias: {
//             '^react-native-maps$': 'react-native-web-maps',
//           },
//         },
//       ],
//     ]
//   : []),
