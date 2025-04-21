import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HireGlinda = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hire Glinda!</Text>
      <Text style={styles.description}>
        Unfortunately Glinda doesn't run on dreams alone.
        Hire the bus for your next party, parade, or pageant!
        Whatever it is you are scheming, a party bus is the perfect entrance or getaway vehicle. 

        Comes with:
                - speakers (2)
                - Michele Joni (1)
                - Minimum 4 hours of a bus fun
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

export default HireGlinda;
