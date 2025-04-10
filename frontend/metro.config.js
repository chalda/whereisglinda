const { getDefaultConfig } = require('@react-native/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.watchFolders = [path.resolve(__dirname, '../../chalda/react-native-web-maps')];

const ALIASES_WEB = {
  'react-native': 'react-native-web',
  'react-native-maps': path.resolve(__dirname, '../../chalda/react-native-web-maps'),
  react: path.resolve(__dirname, 'node_modules/react'),
  'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
};

const ALIASES = {
  react: path.resolve(__dirname, 'node_modules/react'),
  'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
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
  return context.resolveRequest(context, ALIASES[moduleName] || moduleName, platform);
};

module.exports = config;
