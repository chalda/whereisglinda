import { Assets as NavigationAssets } from '@react-navigation/elements';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';

import { AppProvider } from './AppContext';
import { RootStack } from './navigation/RootStack';

Asset.loadAsync([...NavigationAssets]);

SplashScreen.preventAutoHideAsync();
export function App() {
  return (
    <AppProvider>
      <NavigationContainer
        theme={DefaultTheme}
        linking={{
          enabled: 'auto',
          prefixes: [
            // Change the scheme to match your app's scheme defined in app.json
            'glindaapp://',
          ],
        }}
        onReady={() => {
          SplashScreen.hideAsync();
        }}>
        <RootStack />
      </NavigationContainer>
    </AppProvider>
  );
}
