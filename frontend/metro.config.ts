const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

const config = getDefaultConfig(__dirname);

config.watchFolders = [path.resolve(__dirname, '../../chalda/react-native-web-maps')];

const ALIASES_WEB = {
  'react-native-maps': path.resolve(__dirname, '../../chalda/react-native-web-maps'),
};

// config.resolver.extraNodeModules = {
//   'react-native-maps': path.resolve(__dirname, '../../chalda/react-native-web-maps'),
//   react: path.resolve(__dirname, 'node_modules/react'),
//   'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
// };

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    return context.resolveRequest(context, ALIASES_WEB[moduleName] || moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

//module.exports = wrapWithReanimatedMetroConfig(config);
module.exports = config;
