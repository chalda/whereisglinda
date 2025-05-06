import React, { useRef, useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
  Platform,
  StyleSheet,
} from 'react-native';
import Svg, { Rect, Polygon } from 'react-native-svg';
import { AppContext } from '../AppContext';
import { getTimeAgo } from '../utils/getTimeAgo';

const { width: SW, height: SH } = Dimensions.get('window');

const MAX_WIDTH = 700;
const YELLOW_HEIGHT = Math.max(60, Math.min(SH * 0.12, 100));
const ROAD_HEIGHT = Math.max(70, Math.min(SH * 0.08, 90));
const WHEEL_SIZE = Math.max(50, Math.min(SW * 0.15, 90));
const BUTTON_FONT = Math.max(16, Math.min(SW * 0.04, 22));

const BUTTONS = [
  { label: 'Hire', route: 'Hire' },
  { label: 'Find Glinda', route: 'Map' },
  { label: 'About', route: 'About' },
];

const Header = ({ navigation, state }) => {
  const { activeTrip } = useContext(AppContext);
  const activeRoute = state.routeNames[state.index];

  const spin = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(0);
  const [spinVelocity, setSpinVelocity] = useState(0);
  const spinFrame = useRef<number>();

  const translateX = useRef(new Animated.Value(0)).current;

  // useEffect(() => {
  //   let frameId: number;
  //   const animate = () => {
  //     spinValue.current = (spinValue.current + spinVelocity) % 1;
  //     spin.setValue(spinValue.current);
  //     if (spinVelocity > 0.001) {
  //       setSpinVelocity((v) => v * 0.985);
  //     } else {
  //       setSpinVelocity(0);
  //     }
  //     frameId = requestAnimationFrame(animate);
  //   };
  //   animate();
  //   return () => cancelAnimationFrame(frameId);
  // }, [spinVelocity]);

  useEffect(() => {
    animateWheels(10000, 1);
    animateBackground(10000, -SW);
  }, [activeTrip]);

  const boostSpin = () => {
    setSpinVelocity(0.02);
  };

  const animateWheels = (duration, distance) => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: distance,
        duration: duration,
        useNativeDriver: true,
      })
    ).start();
  };

  const animateBackground = (duration, distance) => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: distance,
        duration: duration,
        useNativeDriver: true,
      })
    ).start();
  };

  const rotation = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shortAnimation = (direction) => {
    spin.stopAnimation((value) => {
      animateWheels(1000, value + value * 0.5 * direction);
    });
    translateX.stopAnimation((value) => {
      animateBackground(1000, value + value * 0.5 * direction);
    });
  };

  const handleButtonPress = (route, direction) => {
    shortAnimation(direction);
    navigation.navigate(route);
  };

  const generateNavButtons = () => {
    let curActiveIdx = 999999;
    const btns = BUTTONS.map((b, idx) => {
      const isActive = activeRoute === b.route;
      if (isActive) {
        curActiveIdx = idx;
      }
      return (
        <TouchableOpacity
          key={b.route}
          onPress={() => {
            handleButtonPress(b.route, idx > curActiveIdx ? 1 : -1);
          }}
          style={[styles.button, isActive ? styles.active : styles.inactive]}>
          <Text style={isActive ? styles.buttonTextActive : styles.buttonText}>{b.label}</Text>
        </TouchableOpacity>
      );
    });
    return btns;
  };

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <Animated.Image
        source={require('../assets/cartoon_city.png')}
        resizeMode="repeat"
        style={[styles.parallax, { transform: [{ translateX }] }]}
      />

      {/* Bus Body */}
      <View style={styles.busBand}>
        <View style={styles.svgContainer}>
          <Svg height={YELLOW_HEIGHT} width="100%" viewBox="0 0 700 100" preserveAspectRatio="none">
            <Rect x="0" y="0" width="620" height="100" fill="#FFD800" />
            <Polygon points="620,0 700,0 680,100 620,100" fill="#FFD800" />
            <Polygon points="660,0 700,0 680,40 660,40" fill="#fff" opacity="0.25" />
          </Svg>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>{generateNavButtons()}</View>

        {/* Login Button */}
        <TouchableOpacity
          onPress={() => {
            boostSpin();
            navigation.navigate('Login');
          }}
          style={styles.loginButton}>
          <Text style={styles.loginIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Road & Message Block */}
      <View style={styles.roadBand}>
        <Animated.View style={[styles.wheel, { transform: [{ rotate: rotation }] }]}>
          <Image
            source={require('../assets/glinda_icon.png')}
            style={styles.wheelImage}
            resizeMode="cover"
          />
        </Animated.View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Bus Status: {activeTrip?.rideStatus || 'N/A'}</Text>
          {activeTrip?.lastUpdate && (
            <Text style={styles.statusText}>Last seen: {getTimeAgo(activeTrip.lastUpdate)}</Text>
          )}
        </View>
        <Animated.View style={[styles.wheel, { transform: [{ rotate: rotation }] }]}>
          <Image source={require('../assets/glinda_icon.png')} style={styles.wheelImage} />
        </Animated.View>
      </View>
    </View>
  );
};

//<View style={styles.wheel}>
//<Animated.Image source={require('../assets/glinda_icon.png')} style={[styles.wheelImage, { transform: [{ //rotate:rotation }] }]} />
//</View>
// <Animated.View style={[styles.wheel, { transform: [{ rotate: rotation }] }]}>
// <Image source={require('../assets/glinda_icon.png')} style={styles.wheelImage} />
// </Animated.View>

export default Header;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#ccc',
  },
  parallax: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SW * 2,
    height: YELLOW_HEIGHT + ROAD_HEIGHT + 50,
    zIndex: 1,
  },
  busBand: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    height: YELLOW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
  },
  svgContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 2,
  },
  button: {
    marginHorizontal: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    transform: [{ skewY: '-15deg' }],
    borderBottomWidth: 6,
    borderBottomColor: '#6b4c1e',
    borderRadius: 8,
  },
  active: {
    backgroundColor: '#f8b878',
  },
  inactive: {
    backgroundColor: '#e0a96d',
  },
  buttonText: {
    transform: [{ skewY: '15deg' }],
    fontSize: BUTTON_FONT,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonTextActive: {
    transform: [{ skewY: '15deg' }],
    fontSize: BUTTON_FONT,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#fce38a',
    textShadowRadius: 6,
  },
  loginButton: {
    position: 'absolute',
    right: 12,
    top: 8,
    zIndex: 3,
  },
  loginIcon: {
    fontSize: BUTTON_FONT * 1.2,
  },
  roadBand: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    backgroundColor: '#777',
    height: ROAD_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SW < 400 ? 8 : 20,
    zIndex: 2,
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  wheelImage: {
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
  },
  statusContainer: {
    flex: 1,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
