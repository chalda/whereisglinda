import { registerRootComponent } from 'expo';
import { AppRegistry, Platform } from 'react-native';
import "react-native-gesture-handler";


import RootStack from './navigation';

// use for expo navigation:
// import { registerRootComponent } from 'expo';
//registerRootComponent(RootStack);

if (Platform.OS === 'web') {
  AppRegistry.registerComponent('main', () => RootStack);
  AppRegistry.runApplication('main', {
    // eslint-disable-next-line no-undef
    rootTag: document.getElementById('root'),
  });
} else {
  registerRootComponent(RootStack);
}
