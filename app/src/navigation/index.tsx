import { DefaultTheme, NavigationProp } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
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

// Combined HeaderNavigator (Stack Navigator + Header)
const HeaderNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Map"
      screenOptions={{
        header: ({ navigation }) => <Header navigation={navigation} />, // Custom header globally applied
      }}>
      <Stack.Screen name="Map" component={Map} />
      <Stack.Screen name="About" component={About} />
      <Stack.Screen name="Hire" component={HireGlinda} />
      <Stack.Screen name="Login" component={DriverLogin} />
    </Stack.Navigator>
  );
};

HeaderNavigator.displayName = 'HeaderNavigator';

export default HeaderNavigator;
