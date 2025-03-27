import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import React from 'react';
import { Image } from 'react-native';

import About from '../screens/About';
import HireGlinda from '../screens/HireGlinda';
import Map from '../screens/Map';
import Tracker from '../screens/Tracker';
import DriverLogin from '../screens/DriverLogin'; // Import DriverLogin screen
import { AppProvider } from '../context/AppContext'; // Import AppProvider

export type RootStackParamList = {
  DriverLogin: undefined;
  Map: undefined;
  About: undefined;
  HireGlinda: undefined;
  Tracker: undefined;
};

const Drawer = createDrawerNavigator<RootStackParamList>();

export default function RootStack() {
  return (
    <AppProvider>
      <NavigationContainer theme={DefaultTheme}>
        <Drawer.Navigator
          id="rootDrawer"
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
          }}>
          <Drawer.Screen
            name="Map"
            component={Map}
            options={{ drawerLabel: 'Find Glinda' }} // Map is the default screen
          />
          <Drawer.Screen
            name="DriverLogin"
            component={DriverLogin}
            options={{ drawerLabel: 'Driver Login', headerShown: true }} // Allow navigation to DriverLogin
          />
          <Drawer.Screen name="About" component={About} options={{ drawerLabel: 'About Glinda' }} />
          <Drawer.Screen
            name="HireGlinda"
            component={HireGlinda}
            options={{ drawerLabel: 'Hire Glinda' }}
          />
          <Drawer.Screen name="Tracker" component={Tracker} options={{ drawerLabel: 'Tracker' }} />
        </Drawer.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
