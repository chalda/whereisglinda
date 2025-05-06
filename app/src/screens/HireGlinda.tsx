import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';

const HireGlinda = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hire Glinda!</Text>
      <Text style={styles.description}>Unfortunately Glinda doesn't run on dreams alone.</Text>
      <Text style={styles.description}>Hire the bus for your next party, parade, or pageant! </Text>

      <View>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://www.instagram.com/glindathegoodbus/')}>
          <Text style={{ color: 'blue' }}>Reach out on Instagram to book your ride</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>
        Whatever it is you are scheming, a party bus is the perfect entrance or getaway vehicle.
      </Text>
      <Text style={styles.description}>Comes with: </Text>
      <Text style={styles.description}>- speakers (2) </Text>
      <Text style={styles.description}>- Michele Joni (1) </Text>
      <Text style={styles.description}>- Minimum 4 hours of a bus fun</Text>
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
