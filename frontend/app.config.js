import 'dotenv/config';

const cfg = {
  expo: {
    name: 'whereisglinda',
    slug: 'whereisglinda',
    version: '1.0.0',
    sdkVersion: '52.0.0',
    platforms: ['ios', 'android', 'web'],
    extra: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      'react-native-web-maps': '../../chalda/react-native-web-maps',
      backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080',
    },
    experiments: {
      tsconfigPaths: true,
    },
    plugins: [],
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
      bundleIdentifier: 'com.whereisglinda',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
      package: 'com.whereisglinda',
    },
    web: {
      bundler: 'metro',
      output: 'single',
      favicon: './assets/favicon.png',
    },
  },
};

export default cfg;
