module.exports = function (api) {
  //api.cache(true);

  const platform = api.caller((caller) => caller && caller.platform);

  return {
    presets: ['babel-preset-expo'],

    plugins:
      platform === 'web'
        ? [
            [
              'module-resolver',
              {
                alias: {
                  '^react-native$': 'react-native-web',
                  '^react-native-maps$': 'react-native-web-maps',
                },
              },
            ],
            'react-native-reanimated/plugin',
          ]
        : [
            'react-native-reanimated/plugin',
            
          ],
  };
};
