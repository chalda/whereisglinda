import { createDrawerNavigator, DrawerNavigatorProps } from '@react-navigation/drawer';
import {
  NavigationContainer,
  DefaultTheme,
  NavigationProp,
  useNavigationContainerRef,
} from '@react-navigation/native';
import React from 'react';
import { Platform, Image } from 'react-native';

import { AppProvider } from '../AppContext'; // Import AppProvider
import About from '../screens/About';
import DriverLogin from '../screens/DriverLogin'; // Import DriverLogin screen
import HireGlinda from '../screens/HireGlinda';
import Map from '../screens/Map';

export type RootStackParamList = {
  DriverLogin: undefined;
  Map: undefined;
  About: undefined;
  HireGlinda: undefined;
};

export type RootStackNavigation = NavigationProp<RootStackParamList>;

// const RootStack = createNativeStackNavigator({
//   screens: {
//     HomeTabs: {
//       screen: HomeTabs,
//       options: {
//         title: 'Home',
//         headerShown: false,
//       },
//     },
//     Profile: {
//       screen: Profile,
//       linking: {
//         path: ':user(@[a-zA-Z0-9-_]+)',
//         parse: {
//           user: (value) => value.replace(/^@/, ''),
//         },
//         stringify: {
//           user: (value) => `@${value}`,
//         },
//       },
//     },
//     Settings: {
//       screen: Settings,
//       options: ({ navigation }) => ({
//         presentation: 'modal',
//         headerRight: () => (
//           <HeaderButton onPress={navigation.goBack}>
//             <Text>Close</Text>
//           </HeaderButton>
//         ),
//       }),
//     },
//     NotFound: {
//       screen: NotFound,
//       options: {
//         title: '404',
//       },
//       linking: {
//         path: '*',
//       },
//     },
//   },
// });
// // export const Navigation = createStaticNavigation(RootStack);

//export const DrawerNavigation = createDrawerNavigator<RootStackParamList>();

const Drawer = createDrawerNavigator<RootStackParamList>();
export const RootStack = () => {
  // const navigationRef = useNavigationContainerRef();

  // useLogger(navigationRef);
  // <NavigationContainer theme={DefaultTheme} ref={navigationRef}>

  return (
    <Drawer.Navigator
      initialRouteName="About"
      screenOptions={{
        headerTitle: () => (
          <Image
            source={{
              uri: 'https://via.placeholder.com/150',
            }}
            style={{ width: 100, height: 40, resizeMode: 'contain' }}
          />
        ),
        headerTitleAlign: 'center',
        drawerActiveBackgroundColor: '#e0e0e0',
        drawerInactiveTintColor: '#000',
      }}>
      <Drawer.Screen name="Map" component={Map} options={{ drawerLabel: 'Find Glinda' }} />
      <Drawer.Screen
        name="DriverLogin"
        component={DriverLogin}
        options={{
          drawerLabel: 'Driver Login',
        }}
      />
      <Drawer.Screen name="About" component={About} options={{ drawerLabel: 'About Glinda' }} />
      <Drawer.Screen
        name="HireGlinda"
        component={HireGlinda}
        options={{ drawerLabel: 'Hire Glinda' }}
      />
    </Drawer.Navigator>
  );
};

RootStack.displayName = 'RootStack';

// type RootStackParamList = StaticParamList<typeof RootStack>;

// declare global {
//   namespace ReactNavigation {
//     interface RootParamList extends RootStackParamList {}
//   }
// }
