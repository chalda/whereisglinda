//import 'react-native-reanimated';
import './utils/gesture-handler';

//import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
//////import { AppRegistry, Platform } from 'react-native';

import RootStack from './navigation/RootStack';

// use for expo navigation:import { registerRootComponent } from 'expo';
//registerRootComponent(RootStack);

// registerRootComponent(RootStack);
// AppRegistry.registerComponent('main', () => RootStack);
// AppRegistry.runApplication('main', {
//   // eslint-disable-next-line no-undef
//   rootTag: document.getElementById('root'),
// });

// if (Platform.OS === 'web') {
//   AppRegistry.registerComponent('main', () => RootStack);
//   AppRegistry.runApplication('main', {
//     // eslint-disable-next-line no-undef
//     rootTag: document.getElementById('root'),
//   });
// } else {
//   registerRootComponent(App);
// }

// export default function App() {
//   return <RootStack />;
// }

registerRootComponent(RootStack);
