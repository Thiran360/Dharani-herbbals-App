/**
 * Splash Screen for Dharani Herbbals
 * Professional WhatsApp-style clean white splash entrance
 * - Centered Dharani Herbbals botanical app logo
 * - Bottom brand text: "from Dharani Herbbals"
 * - Stays visible for ~2 seconds on cold start, then transitions to MainTabs
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { prefetchImages } from '../utils/imageOptimizer';

export const SplashScreen = ({ navigation }) => {
  const logoOpacity = useRef(new Animated.Value(0.85)).current;
  const logoScale = useRef(new Animated.Value(0.96)).current;
  const footerOpacity = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    // Subtle, gentle micro-animation for a seamless transition from native launch
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    const startTime = Date.now();

    // Prefetch product and category cache and images in background
    const prepareApp = async () => {
      try {
        const [prodRes, catRes, lovedRes] = await Promise.allSettled([
          api.getProducts(),
          api.getCategories(),
          api.getMostLoved(),
        ]);

        const products = prodRes.status === 'fulfilled' && Array.isArray(prodRes.value) ? prodRes.value : [];
        const categories = catRes.status === 'fulfilled' && Array.isArray(catRes.value) ? catRes.value : [];
        const loved = lovedRes.status === 'fulfilled' && Array.isArray(lovedRes.value) ? lovedRes.value : [];

        // Pre-warm native disk cache for top images before Home screen renders
        prefetchImages([
          ...loved.map(p => p.image),
          ...products.slice(0, 10).map(p => p.image),
          ...categories.slice(0, 8).map(c => c.image),
        ], 18);
      } catch (e) {
        console.warn('Splash prefetch error:', e);
      } finally {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 500 - elapsed);
        setTimeout(() => {
          navigation.replace('MainTabs');
        }, remaining);
      }
    };

    // Guarantee snappy transition within 650ms max
    const timerFallback = setTimeout(() => {
      navigation.replace('MainTabs');
    }, 650);

    prepareApp().finally(() => clearTimeout(timerFallback));

    return () => clearTimeout(timerFallback);
  }, [logoOpacity, logoScale, footerOpacity, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" animated={true} />

      <View style={styles.container}>
        {/* Centered App Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('../assets/app_icon_transparent.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Bottom Brand Identity (WhatsApp style) */}
        <Animated.View style={[styles.footerContainer, { opacity: footerOpacity }]}>
          <Text style={styles.footerFrom}>from</Text>
          <Text style={styles.footerBrand}>Dharani Herbbals</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 104,
    height: 104,
  },
  logo: {
    width: 96,
    height: 96,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerFrom: {
    fontSize: 12,
    color: '#7A8E82',
    fontWeight: '400',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  footerBrand: {
    fontSize: 16.5,
    color: '#1B4D3E',
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});

export default SplashScreen;
