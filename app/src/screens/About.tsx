import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { ScreenContent } from '../components/ScreenContent';
import { StyleSheet, View, Text } from 'react-native';

import { HeaderNavigatorParamList } from '../navigation';

type AboutScreenRouteProp = RouteProp<HeaderNavigatorParamList, 'About'>;

const About = () => {
  const router = useRoute<AboutScreenRouteProp>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About Glinda the Goodbus</Text>
      <Text style={styles.description}>Is a bus. Add more stuff here.</Text>
      <Text style={styles.title}>Upcoming Events</Text>
      <Text style={styles.description}>
        You can catch Glinda driving around the city as well as participating in public events,
        parades and extravaganzas:
      </Text>
      <Text style={styles.description}>Metro Gala 5/12</Text>
      <Text style={styles.title}>Michele Joni Lapidos</Text>
      <Text style={styles.description}>Bus mama.</Text>
      <Text style={styles.title}>App</Text>
      <Text style={styles.description}>
        App developer: <a href="https://github.com/chalda">Alex</a>
      </Text>
      <Text style={styles.description}>
        <a href="https://github.com/chalda/whereisglinda">App source code on github</a>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default About;
