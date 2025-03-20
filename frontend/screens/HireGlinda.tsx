import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HireGlinda = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hire Glinda</Text>
      <Text style={styles.description}>
        Welcome to the Hire Glinda page! Here you can learn more about hiring Glinda for your next
        project.
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
