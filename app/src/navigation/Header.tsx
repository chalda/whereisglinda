// app/src/navigation/Header.tsx
import React, { useRef, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import { AppContext } from '../AppContext';
import { getTimeAgo } from '../utils/getTimeAgo';

const { width: SW, height: SH } = Dimensions.get('window');

// Responsive constraints
const MAX_HEADER_WIDTH = 700;
const YB_HEIGHT = Math.max(60, Math.min(SH * 0.15, 120)); // Yellow bar height
const WHEEL = Math.max(60, Math.min(SW * 0.13, 120)); // Wheel diameter
const BTN_FONT = Math.max(16, Math.min(SW * 0.04, 22)); // Button font-size
const PAR_H = Math.max(120, Math.min(SH * 0.2, 240)); // Parallax height

const BUTTONS = [
  { label: 'Hire', route: 'Hire' },
  { label: 'Find Glinda', route: 'Map' },
  { label: 'About', route: 'About' },
];

const Header = ({ navigation, state }) => {
  const { activeTrip } = useContext(AppContext);
  const spin = useRef(new Animated.Value(0)).current;
  const activeRoute = state.routeNames[state.index];

  // Unified loop for both wheels & parallax
  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    ).start();
  }, [spin]);

  // Trigger on route or trip change
  useEffect(() => {
    spin.setValue(0);
  }, [activeRoute, activeTrip]);

  // Interpolations
  const rotation = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const translateX = spin.interpolate({ inputRange: [0, 1], outputRange: [0, -SW * 0.1] });

  return (
    <View style={styles.container}>
      {/* Parallax background */}
      <Animated.Image
        source={require('../assets/cartoon_city.png')}
        style={[styles.parallaxBg, { transform: [{ translateX }] }]}
        resizeMode="cover"
      />

      {/* Yellow bus band */}
      <View style={styles.yellowBar}>
        {/* Left Wheel */}
        <Animated.View
          style={[styles.wheel, styles.leftWheel, { transform: [{ rotate: rotation }] }]}
        />

        {/* Slice-angled buttons */}
        <View style={styles.sliceRow}>
          {BUTTONS.map((b) => {
            const isActive = activeRoute === b.route;
            return (
              <TouchableOpacity
                key={b.route}
                onPress={() => navigation.navigate(b.route)}
                style={[styles.sliceBtn, isActive ? styles.sliceActive : styles.sliceInactive]}>
                <Text style={[styles.sliceText, isActive && styles.sliceTextActive]}>
                  {b.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Login icon */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginBtn}>
          <Text style={styles.loginIcon}>👤</Text>
        </TouchableOpacity>

        {/* Right Wheel */}
        <Animated.View
          style={[styles.wheel, styles.rightWheel, { transform: [{ rotate: rotation }] }]}
        />
      </View>

      {/* Grey pavement band */}
      <View style={styles.greyBand}>
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>Bus Status: {activeTrip?.rideStatus || 'N/A'}</Text>
          {activeTrip?.lastUpdate && (
            <Text style={styles.statusText}>Last seen: {getTimeAgo(activeTrip.lastUpdate)}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },

  // Parallax: full width, sits at bottom of headerContainer behind bars
  parallaxBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: YB_HEIGHT + PAR_H + 40, // total header height
    // height: '100%',
    zIndex: 0,
  },

  // Yellow bar holds wheels + nav
  yellowBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: MAX_HEADER_WIDTH,
    height: YB_HEIGHT,
    marginBottom: 12,
    backgroundColor: '#FFD800',
    zIndex: 4,
  },

  // Wheels: 80% above bar, 20% overlay
  wheel: {
    position: 'absolute',
    width: WHEEL,
    height: WHEEL,
    borderRadius: WHEEL / 2,
    backgroundColor: '#000',
    zIndex: 5,
    bottom: -WHEEL * 0.7,
  },
  leftWheel: {
    left: '5%',
    // top: -WHEEL * 0.8,
  },
  rightWheel: {
    right: '5%',
    // top: -WHEEL * 0.8,
  },

  // Slice-angled button row
  sliceRow: {
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'center',
    marginHorizontal: WHEEL + 8,
    zIndex: 4,
  },
  sliceBtn: {
    marginHorizontal: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    transform: [{ skewY: '-15deg' }],
    borderBottomWidth: 6,
    borderBottomColor: '#6b4c1e',
  },
  sliceActive: {
    backgroundColor: '#f8b878',
    borderColor: '#fff',
  },
  sliceInactive: {
    backgroundColor: '#e0a96d',
    borderColor: '#444',
  },
  sliceText: {
    transform: [{ skewY: '15deg' }],
    fontSize: BTN_FONT,
    fontWeight: 'bold',
    color: '#333',
  },
  sliceTextActive: {
    color: '#fff',
    textShadowColor: '#fce38a',
    textShadowRadius: 6,
  },

  // Login: floats right but part of flex
  loginBtn: {
    padding: 8,
    marginRight: 16,
    zIndex: 3,
  },
  loginIcon: {
    fontSize: BTN_FONT * 1.2,
  },

  // Grey band
  greyBand: {
    width: '100%',
    backgroundColor: '#777',
    paddingVertical: 12,
    alignItems: 'center',
    zIndex: 1,
  },
  statusBox: {
    marginLeft: 'auto',
    marginRight: 'auto',
    // width: '90%',
    maxWidth: MAX_HEADER_WIDTH,
  },
  statusText: {
    color: '#fff',
    fontSize: Math.max(14, Math.min(SW * 0.035, 18)),
    fontWeight: '600',
  },
});
