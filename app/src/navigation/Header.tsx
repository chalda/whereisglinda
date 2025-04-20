import React from 'react';
import { Text, View, Image, TouchableOpacity, StyleSheet } from 'react-native';

// Header Component
const Header = ({ navigation }: any) => {
  return (
    <View style={styles.headerContainer}>
      {/* Title and Icon */}
      <View style={styles.titleContainer}>
        <Image source={require('../assets/glinda_icon.png')} style={styles.icon} />
        <Text style={styles.title}>Where in the world is glinda?!</Text>
      </View>

      {/* Button Row */}
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={() => navigation.navigate('About')} style={styles.button}>
          <Text style={styles.buttonText}>About</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Map')} style={styles.mainButton}>
          <Text style={styles.buttonText}>Find Glinda</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Hire')} style={styles.button}>
          <Text style={styles.buttonText}>Hire</Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginButton}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles for Header
const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    height: 120,
    paddingTop: 40,
    alignItems: 'center',
    backgroundColor: '#4E9F3D',
    position: 'relative',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Comic Sans MS',
    textAlign: 'center',
    transform: [{ rotate: '5deg' }],
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: -30,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#4E9F3D',
  },
  mainButton: {
    backgroundColor: '#4E9F3D',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 8,
  },
  buttonText: {
    color: '#4E9F3D',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
  },
  loginText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.6,
  },
});

export default Header;
