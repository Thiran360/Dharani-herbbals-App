/**
 * Splash Screen for Dharani Herbbals
 * Luxury botanical entrance with staggered animations
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import api from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SplashScreen = ({ navigation }) => {
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandTranslateY = useRef(new Animated.Value(18)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0.9)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered botanical entrance sequence
    Animated.sequence([
      // 1. Logo entrance (scale + opacity)
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6.5,
          tension: 45,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      // 2. Reveal brand name smoothly with upward drift
      Animated.parallel([
        Animated.timing(brandOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(brandTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // 3. Badges and subtle loader
      Animated.parallel([
        Animated.timing(badgeOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(badgeScale, {
          toValue: 1,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(loaderOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Prefetch products and initialize (preserving exact logic)
    const prepareApp = async () => {
      try {
        await Promise.allSettled([
          api.getProducts(),
          api.getCategories(),
          api.getMostLoved(),
        ]);
      } catch (e) {
        console.warn('Splash prefetch error:', e);
      } finally {
        setTimeout(() => {
          navigation.replace('MainTabs');
        }, 1900);
      }
    };

    prepareApp();
  }, [
    logoScale,
    logoOpacity,
    brandOpacity,
    brandTranslateY,
    badgeOpacity,
    badgeScale,
    loaderOpacity,
    navigation,
  ]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D2818" />

      {/* Luxury Botanical Layered Backdrop Circles */}
      <View style={styles.outerGlowCircle} />
      <View style={styles.decorCircleTop} />
      <View style={styles.decorCircleBottom} />
      <View style={styles.botanicalLeafAccent} />

      <View style={styles.content}>
        {/* Animated Logo Card */}
        <Animated.View
          style={[
            styles.logoCard,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoInnerBorder}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Smooth Brand Title Entrance */}
        <Animated.View
          style={[
            styles.brandGroup,
            {
              opacity: brandOpacity,
              transform: [{ translateY: brandTranslateY }],
            },
          ]}
        >
          <Image
            source={require('../assets/brand_logotype_horizontal.png')}
            style={styles.brandLogotype}
            resizeMode="contain"
          />
          <Text style={styles.brandTamil}>தரணி ஹெர்பல்ஸ்</Text>
        </Animated.View>

        {/* Botanical Quality Seal Badge */}
        <Animated.View
          style={[
            styles.taglineBadge,
            {
              opacity: badgeOpacity,
              transform: [{ scale: badgeScale }],
            },
          ]}
        >
          <View style={styles.goldDot} />
          <Text style={styles.taglineText}>PURE SIDDHA BOTANICALS</Text>
          <View style={styles.goldDot} />
        </Animated.View>

        <Animated.Text style={[styles.heritageText, { opacity: badgeOpacity }]}>
          Ancient Wisdom • Sustainable Wellness • Since 2004
        </Animated.Text>

        {/* Elegant Loader */}
        <Animated.View style={[styles.loaderContainer, { opacity: loaderOpacity }]}>
          <ActivityIndicator size="small" color="#D4A373" />
          <Text style={styles.loadingText}>Crafting pure wellness...</Text>
        </Animated.View>
      </View>

      <Text style={styles.footerNote}>
        Handcrafted with Integrity in Tamil Nadu, India
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D2818', // Regal deep forest pine
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  outerGlowCircle: {
    position: 'absolute',
    width: 440,
    height: 440,
    borderRadius: 220,
    backgroundColor: 'rgba(27, 77, 62, 0.45)',
    top: '25%',
  },
  decorCircleTop: {
    position: 'absolute',
    top: -90,
    right: -90,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(212, 163, 115, 0.08)', // subtle champagne glow
  },
  decorCircleBottom: {
    position: 'absolute',
    bottom: -120,
    left: -120,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(27, 77, 62, 0.25)',
  },
  botanicalLeafAccent: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    zIndex: 10,
  },
  logoCard: {
    width: 126,
    height: 126,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: SPACING.lg,
    padding: 8,
    borderWidth: 2,
    borderColor: 'rgba(212, 163, 115, 0.4)', // Warm gold accent ring
  },
  logoInnerBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 90,
    height: 90,
  },
  brandGroup: {
    alignItems: 'center',
  },
  brandLogotype: {
    width: 260,
    height: 32,
    tintColor: '#FAF8F5',
  },
  brandTamil: {
    fontSize: 17,
    color: '#C5D8C7', // soft sage
    fontWeight: '600',
    marginTop: 4,
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  taglineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.45)', // Warm gold accent border
    marginBottom: SPACING.sm,
  },
  goldDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D4A373',
  },
  taglineText: {
    color: '#FAF8F5',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  heritageText: {
    color: '#A3B899',
    fontSize: 12,
    opacity: 0.9,
    marginBottom: SPACING.xl,
    letterSpacing: 0.3,
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  loadingText: {
    color: '#D4A373',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  footerNote: {
    position: 'absolute',
    bottom: 30,
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
});

export default SplashScreen;

