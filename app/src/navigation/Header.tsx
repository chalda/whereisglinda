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
const TIRE_SIZE = IS_SMALL_SCREEN ? screenWidth * 0.28 : screenWidth * 0.175;
const CENTER = TIRE_SIZE / 2;

const BUTTONS = [
  { label: 'Hire', angle: 210, route: 'Hire' },
  { label: 'Find Glinda', angle: 270, route: 'MapScreen' },
  { label: 'About', angle: 330, route: 'About' },
];

const Header = ({ navigation }) => {
  const [active, setActive] = useState('Find Glinda');
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const triggerSpin = () => {
    rotateAnim.setValue(0);
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.headerBar, { height: TIRE_SIZE + 90 }]}>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginButton}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.tireContainer,
          {
            width: TIRE_SIZE,
            height: TIRE_SIZE,
            borderRadius: CENTER,
            transform: [{ rotate: spin }],
          },
        ]}>
        <LinearGradient
          colors={['#333', '#000']}
          style={[StyleSheet.absoluteFill, { borderRadius: CENTER }]}
          start={{ x: 0.3, y: 0.3 }}
          end={{ x: 0.7, y: 0.7 }}
        />
        <Image
          source={require('../assets/where_is_glinda_text.png')}
          style={{ width: CENTER, height: CENTER, borderRadius: CENTER / 2 }}
          resizeMode="cover"
        />
      </Animated.View>

      <View style={styles.flatButtonRow}>
        {BUTTONS.map((btn) => {
          const isActive = active === btn.label;
          return (
            <TouchableOpacity
              key={btn.label}
              onPress={() => {
                setActive(btn.label);
                navigation.navigate(btn.route);
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
  );
};

export default Header;

const styles = StyleSheet.create({
  headerBar: {
    backgroundColor: '#FFD800',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 10,
  },
  loginButton: {
    position: 'absolute',
    top: 10,
    right: 12,
    padding: 6,
  },
  loginText: {
    color: '#333',
    fontSize: 14,
    opacity: 0.6,
  },
  tireContainer: {
    position: 'absolute',
    top: 30,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#444',
    overflow: 'hidden',
    zIndex: -1,
  },
  buttonHolder: {
    position: 'absolute',
    top: 30,
    alignSelf: 'center',
    zIndex: 1,
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
  flatButtonRow: {
    flexDirection: 'row',
    marginTop: TIRE_SIZE + 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
