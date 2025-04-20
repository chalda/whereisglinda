import { Assets as NavigationAssets } from '@react-navigation/elements';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useCallback, useState } from 'react';

import { AppProvider } from './AppContext';
import { RootStack } from './navigation/RootStack';

const assetsToLoad = [
  ...NavigationAssets,
  require('./assets/glinda_icon.png'),
  require('./assets/octopus_icon.png'),
  require('./assets/glinda_wtext_circle.png'),
  require('./assets/where_is_glinda_plain.png'),
  require('./assets/where_is_glinda_text.png'),
];

SplashScreen.preventAutoHideAsync();

export function App() {
  const [appReady, setAppReady] = useState(false);

  const loadAssetsAsync = useCallback(async () => {
    try {
      await Asset.loadAsync(assetsToLoad);
    } catch (e) {
      console.warn('Asset loading failed:', e);
    } finally {
      setAppReady(true);
      SplashScreen.hideAsync();
    }
  }, []);

  useEffect(() => {
    loadAssetsAsync();
  }, []);

  if (!appReady) return null;

  return (
    <AppProvider>
      <NavigationContainer
        theme={DefaultTheme}
        linking={{
          enabled: 'auto',
          prefixes: ['glindaapp://'],
        }}>
        <RootStack />
      </NavigationContainer>
    </AppProvider>
  );
}
