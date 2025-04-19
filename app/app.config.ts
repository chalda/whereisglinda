import 'ts-node/register'; // Add this to import TypeScript files
import { ExpoConfig } from 'expo/config';
import 'dotenv/config';

const cfg: ExpoConfig = {
  name: 'whereisglinda',
  slug: 'whereisglinda',
  version: '1.0.0',
  sdkVersion: '52.0.0',
  platforms: ['ios', 'android', 'web'],
  extra: {
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080',
  },
  experiments: {
    tsconfigPaths: true,
  },
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: false,
  scheme: 'glindaapp',

  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*', 'index.js'],
  plugins: [
    [
      'expo-location',
      {
        locationAlwaysPermission:
          'We use your location to see how far you are from spots, and also to show you your position in the map',
        locationAlwaysAndWhenInUsePermission:
          'We check your location in background to alert you while traveling. We will never send this information to our servers',
        locationWhenInUsePermission:
          'We use your location to see how far you are from spots, and also to show you your position in the map',
        isIosBackgroundLocationEnabled: true,
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          hermes: true,
          buildToolsVersion: '34.0.0',
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          minSdkVersion: 34,
        },
        ios: {
          hermes: true,
          deploymentTarget: '15.1',
          // extraPods: [
          //   'GoogleUtilities',
          //   //    'Google-Maps-iOS-Utils',
          //   //   'GoogleMaps',
          //   // include any another library that needs `modular_headers: true`
          // ].map((podName) => ({
          //   name: podName,
          //   modular_headers: true,
          // })),
        },
      },
    ],
    'expo-asset',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#ffffff',
        image: './assets/splash.png',
      },
    ],
    'react-native-edge-to-edge',
  ],

  ios: {
    supportsTablet: true,
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
    bundleIdentifier: 'com.chalda.whereisglinda',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    // production: {
    //   android: {
    //     image: 'latest',
    //   },
    // },
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
    package: 'com.chalda.whereisglinda',
  },
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/favicon.png',
  },
};

export default cfg;
