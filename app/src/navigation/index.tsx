import { NavigationProp } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import React from 'react';

import About from '../screens/About';
import DriverLogin from '../screens/DriverLogin';
import HireGlinda from '../screens/HireGlinda';
import Map from '../screens/Map';
import Header from './Header';

export type HeaderNavigatorParamList = {
  Login: undefined;
  Map: undefined;
  About: undefined;
  Hire: undefined;
};

export type HeaderNavigation = NavigationProp<HeaderNavigatorParamList>;
const Stack = createStackNavigator<HeaderNavigatorParamList>();

const Tab = createMaterialTopTabNavigator();

const HeaderNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <Header {...props} />}
      screenOptions={{
        swipeEnabled: false,
      }}>
      <Tab.Screen name="Map" component={Map} />
      <Tab.Screen name="About" component={About} />
      <Tab.Screen name="Hire" component={HireGlinda} />
      <Tab.Screen name="Login" component={DriverLogin} />
    </Tab.Navigator>
  );
};

// Combined HeaderNavigator (Stack Navigator + Header)
// const HeaderNavigator = () => {
//   return (
//     <Stack.Navigator
//       initialRouteName="Map"
//       screenOptions={{
//         header: ({ navigation }) => <Header navigation={navigation} />, // Custom header globally applied
//       }}>
//       <Stack.Screen name="Map" component={Map} />
//       <Stack.Screen name="About" component={About} />
//       <Stack.Screen name="Hire" component={HireGlinda} />
//       <Stack.Screen name="Login" component={DriverLogin} />
//     </Stack.Navigator>
//   );
// };

HeaderNavigator.displayName = 'HeaderNavigator';

export default HeaderNavigator;

/****
 * 
 * import { createDrawerNavigator, DrawerNavigatorProps } from '@react-navigation/drawer';
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

 */

/**
 * #nav-bar {
border-radius: 20px !important;
margin-block: 0 5px !important;
margin-inline: 10px !important;
--toolbar-start-end-padding: 8px !important;
}

#nav-bar #back-button image {
border-top-left-radius: 50% !important;
border-bottom-left-radius: 50% !important;
}

#PanelUI-button .toolbarbutton-badge-stack {
border-top-right-radius: 50% !important;
border-bottom-right-radius: 50% !important;
}

 */
