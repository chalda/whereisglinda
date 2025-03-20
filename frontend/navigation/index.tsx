import { createDrawerNavigator } from '@react-navigation/drawer';
import {
  NavigationContainer,
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
  useTheme,
} from '@react-navigation/native';
import React from 'react';
import { Image } from 'react-native';

import About from '../screens/About';
import HireGlinda from '../screens/HireGlinda';
import Map from '../screens/Map';
import Tracker from '../screens/Tracker'; // Updated import for Tracker

export type RootStackParamList = {
  Map: undefined;
  About: undefined;
  HireGlinda: undefined;
  Tracker: undefined; // Added Tracker route
};

const Drawer = createDrawerNavigator<RootStackParamList>();

export default function RootStack() {
  return (
    <NavigationContainer theme={DefaultTheme}>
      <Drawer.Navigator
        id="rootDrawer"
        initialRouteName="Map"
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
        <Drawer.Screen name="Map" component={Map} options={{ drawerLabel: 'Find Glinda' }} />
        <Drawer.Screen name="About" component={About} options={{ drawerLabel: 'About Glinda' }} />
        <Drawer.Screen
          name="HireGlinda"
          component={HireGlinda}
          options={{ drawerLabel: 'Hire Glinda' }}
        />
        <Drawer.Screen
          name="Tracker"
          component={Tracker} // Added Tracker screen
          options={{ drawerLabel: 'Tracker' }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
