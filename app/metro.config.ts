const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const ALIASES_WEB = {
  'react-native-maps': path.resolve(__dirname, 'node_modules/react-native-web-google-api-maps'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    return context.resolveRequest(context, ALIASES_WEB[moduleName] || moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
