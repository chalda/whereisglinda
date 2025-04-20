import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');
const IS_SMALL_SCREEN = screenWidth < 480;
const TIRE_SIZE = IS_SMALL_SCREEN ? screenWidth * 0.3 : screenWidth * 0.19;
const CENTER = TIRE_SIZE / 2;

const BUTTONS = [
  { label: 'Hire', route: 'Hire' },
  { label: 'Find Glinda', route: 'Map' },
  { label: 'About', route: 'About' },
];

const PARALLAX_CROP_HEIGHT = 260;
const PARALLAX_TOP_OFFSET = 60;

const Header = ({ navigation }) => {
  const [active, setActive] = useState('Map');
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const parallaxAnim = useRef(new Animated.Value(0)).current;

  const triggerSpin = () => {
    rotateAnim.setValue(0);
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(parallaxAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => parallaxAnim.setValue(0));
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const parallaxShift = parallaxAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  return (
    <View style={styles.headerContainer}>
      {/* Top Yellow Band with Buttons */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginButton}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
        <View style={styles.topButtonRow}>
          {BUTTONS.map((btn) => {
            const isActive = active === btn.label;
            return (
              <TouchableOpacity
                key={btn.label}
                onPress={() => {
                  setActive(btn.label);
                  if (navigation?.navigate && typeof navigation.navigate === 'function') {
                    navigation.navigate(btn.route);
                  }
                  triggerSpin();
                }}
                style={[
                  styles.sliceButton,
                  {
                    transform: [{ skewY: '-15deg' }],
                    backgroundColor: isActive ? '#f8b878' : '#e0a96d',
                    borderColor: isActive ? '#fff' : '#444',
                    shadowColor: isActive ? '#fffacd' : '#000',
                    shadowOpacity: isActive ? 0.9 : 0.4,
                    shadowRadius: isActive ? 12 : 5,
                    marginHorizontal: 6,
                  },
                ]}>
                <Text
                  style={[
                    styles.buttonText,
                    isActive && {
                      color: '#fff',
                      textShadowColor: '#fce38a',
                      textShadowRadius: 8,
                    },
                  ]}>
                  {btn.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Middle Band - City Panorama */}
      <View style={styles.cityBand}>
        <Animated.View
          style={[
            styles.parallaxBackground,
            {
              transform: [{ translateX: parallaxShift }],
              top: -PARALLAX_TOP_OFFSET,
            },
          ]}>
          <Image
            source={require('../assets/cartoon_city.png')}
            style={styles.cityImage}
            resizeMode="cover"
          />
        </Animated.View>
      </View>

      {/* Tire Overlaid */}
      <Animated.View
        style={[
          styles.tireContainer,
          {
            width: TIRE_SIZE * 1.15,
            height: TIRE_SIZE * 1.15,
            borderRadius: (TIRE_SIZE * 1.15) / 2,
            transform: [{ rotate: spin }],
          },
        ]}>
        <LinearGradient
          colors={['#333', '#000']}
          style={[StyleSheet.absoluteFill, { borderRadius: (TIRE_SIZE * 1.15) / 2 }]}
          start={{ x: 0.3, y: 0.3 }}
          end={{ x: 0.7, y: 0.7 }}
        />
        <Image
          source={require('../assets/where_is_glinda_text.png')}
          style={{ width: CENTER * 1.2, height: CENTER * 1.2, borderRadius: (CENTER * 1.2) / 2 }}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Bottom Pavement Band */}
      <View style={styles.bottomBand}>
        <Text style={styles.infoText}>Where will Glinda appear next?</Text>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#ccc',
  },
  topBar: {
    backgroundColor: '#FFD800',
    width: '100%',
    paddingTop: 6,
    paddingBottom: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    position: 'relative',
    zIndex: 3,
  },
  loginButton: {
    position: 'absolute',
    top: 8,
    right: 12,
    padding: 6,
  },
  loginText: {
    color: '#333',
    fontSize: 14,
    opacity: 0.6,
  },
  topButtonRow: {
    flexDirection: 'row',
    marginTop: 6,
    justifyContent: 'center',
  },
  cityBand: {
    backgroundColor: '#a0c4ff',
    width: '100%',
    height: TIRE_SIZE * 0.18,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
  },
  parallaxBackground: {
    position: 'absolute',
    left: 0,
    height: PARALLAX_CROP_HEIGHT,
    width: '200%',
  },
  cityImage: {
    height: '100%',
    width: '100%',
  },
  bottomBand: {
    backgroundColor: '#777',
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2, // <-- above the background
    marginTop: TIRE_SIZE * 0.25, // show below the tire
  },

  tireContainer: {
    position: 'absolute',
    top: TIRE_SIZE * 0.15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#444',
    overflow: 'hidden',
    zIndex: 2,
  },
  sliceButton: {
    width: 90,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 6,
    borderBottomColor: '#6b4c1e',
    elevation: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  buttonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 13,
  },
  infoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
