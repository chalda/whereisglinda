import { AppRegistry } from 'react-native';

import RootStack from './navigation';

// use for expo navigation:
// import { registerRootComponent } from 'expo';
//registerRootComponent(RootStack);

AppRegistry.registerComponent('Root', () => RootStack);
AppRegistry.runApplication('Root', {
  // eslint-disable-next-line no-undef
  rootTag: document.getElementById('root'),
});
