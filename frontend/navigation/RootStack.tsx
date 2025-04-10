import '../utils/gesture-handler';
import { Platform, Image } from 'react-native';

// if (Platform.OS !== 'web') {
//   // Import gesture-handler only for native platforms (iOS and Android)
//   require('react-native-gesture-handler');
// }

import { createDrawerNavigator, DrawerNavigatorProps } from '@react-navigation/drawer';
import {
  NavigationContainer,
  DefaultTheme,
  NavigationProp,
  useNavigationContainerRef,
} from '@react-navigation/native';
import React from 'react';
// import { Image } from 'react-native';

import { AppProvider } from '../context/AppContext'; // Import AppProvider
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

const Drawer = createDrawerNavigator<RootStackParamList>();
const RootStack = () => {
  // const navigationRef = useNavigationContainerRef();

  // useLogger(navigationRef);
  // <NavigationContainer theme={DefaultTheme} ref={navigationRef}>

  return (
    <AppProvider>
      <NavigationContainer theme={DefaultTheme}>
        <Drawer.Navigator
          // id={'root-router'} // ts-ignore
          initialRouteName="Map" // Set Map as the initial route
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
          <Drawer.Screen
            name="Map"
            component={Map}
            options={{ drawerLabel: 'Find Glinda' }} // Map is the default screen
          />
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
      </NavigationContainer>
    </AppProvider>
  );
};

RootStack.displayName = 'RootStack';
export default RootStack;
