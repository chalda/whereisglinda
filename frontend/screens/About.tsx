import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { ScreenContent } from '../components/ScreenContent';
import { StyleSheet, View, Text } from 'react-native';

import { RootStackParamList } from '../navigation/RootStack';

type AboutScreenRouteProp = RouteProp<RootStackParamList, 'About'>;

const About = () => {
  const router = useRoute<AboutScreenRouteProp>();

  return (
    <View style={styles.container}>
      <Text>Glinda is a bussy</Text>
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});

export default About;
