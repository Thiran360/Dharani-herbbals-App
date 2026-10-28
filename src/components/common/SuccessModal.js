/**
 * SuccessModal Component for Dharani Herbbals
 * 100% faithful implementation of modern botanical success celebration card
 * Matches user's reference mockup with high-fidelity animations, botanical leaves,
 * celebration burst rays, and smooth native spring transition.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Icon } from './Icons';
import { useLanguage } from '../../context/LanguageContext';

export const SuccessModal = ({
  visible,
  title,
  subtitle,
  message,
  buttonText,
  onPress,
  onClose,
}) => {
  const { isTamil } = useLanguage();
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.88,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opacityAnim, scaleAnim]);

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalRoot}>
        {/* Semi-transparent dark frosted backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        {/* Success Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Subtle Mint Wave at bottom */}
          <View style={styles.mintBottomWave} pointerEvents="none" />

          {/* Left Botanical Sprig */}
          <Image
            source={require('../../assets/icons/success_leaf_left.png')}
            style={styles.leafLeft}
            resizeMode="contain"
            pointerEvents="none"
          />

          {/* Right Floating Botanical Leaf */}
          <Image
            source={require('../../assets/icons/success_leaf_right.png')}
            style={styles.leafRight}
            resizeMode="contain"
            pointerEvents="none"
          />

          {/* Close Icon Top-Right */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Close"
          >
            <Icon name="close" size={15} color="#334155" />
          </TouchableOpacity>

          {/* Celebration Checkmark Badge */}
          <View style={styles.badgeContainer}>
            {/* Celebration Sparkles / Rays */}
            <View style={[styles.ray, styles.rayTop]} />
            <View style={[styles.ray, styles.rayTopLeft]} />
            <View style={[styles.ray, styles.rayTopRight]} />
            <View style={[styles.ray, styles.rayLeft]} />
            <View style={[styles.ray, styles.rayRight]} />

            <View style={styles.badgeCircle}>
              <Icon name="check" size={26} color="#FFFFFF" />
            </View>
          </View>

          {/* Heading */}
          <Text style={styles.title}>
            {title || (isTamil ? 'உள்நுழைவு வெற்றிகரமாக முடிந்தது!' : 'Login Successful!')}
          </Text>

          {/* Subtitle */}
          {(subtitle !== undefined && subtitle !== null) ? (
            <Text style={styles.subtitle}>{subtitle}</Text>
          ) : (
            <Text style={styles.subtitle}>
              {isTamil ? 'தாரணி ஹெர்பல்ஸுக்கு நல்வரவு!' : 'Welcome to Dharani Herbals!'}
            </Text>
          )}

          {/* Message / Description */}
          {(message !== undefined && message !== null) ? (
            <Text style={styles.message}>{message}</Text>
          ) : (
            <Text style={styles.message}>
              {isTamil
                ? 'உங்கள் கணக்கில் வெற்றிகரமாக உள்நுழைந்துள்ளீர்கள்.'
                : 'You are now logged in to your account.'}
            </Text>
          )}

          {/* Continue Pill Button */}
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={onPress || onClose}
            activeOpacity={0.88}
          >
            <Text style={styles.continueBtnText}>
              {buttonText || (isTamil ? 'தொடரவும் →' : 'Continue →')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 25, 18, 0.65)',
  },
  card: {
    width: '88%',
    maxWidth: 350,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 22,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.22,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  mintBottomWave: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    right: -40,
    height: 130,
    borderRadius: 130,
    backgroundColor: '#E8F5E9',
    opacity: 0.7,
  },
  leafLeft: {
    position: 'absolute',
    left: -14,
    top: 60,
    width: 80,
    height: 120,
    opacity: 0.95,
  },
  leafRight: {
    position: 'absolute',
    right: -6,
    top: 85,
    width: 50,
    height: 75,
    opacity: 0.9,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  badgeContainer: {
    width: 84,
    height: 84,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  badgeCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  ray: {
    position: 'absolute',
    backgroundColor: '#16A34A',
    borderRadius: 1.5,
  },
  rayTop: {
    top: 2,
    width: 3,
    height: 8,
  },
  rayTopLeft: {
    top: 7,
    left: 10,
    width: 3,
    height: 8,
    transform: [{ rotate: '-45deg' }],
  },
  rayTopRight: {
    top: 7,
    right: 10,
    width: 3,
    height: 8,
    transform: [{ rotate: '45deg' }],
  },
  rayLeft: {
    left: 2,
    width: 8,
    height: 3,
  },
  rayRight: {
    right: 2,
    width: 8,
    height: 3,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: '#14231A',
    letterSpacing: -0.2,
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1B4D3E',
    textAlign: 'center',
    marginTop: 6,
  },
  message: {
    fontSize: 12.5,
    color: '#5A6E62',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 6,
  },
  continueBtn: {
    width: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    zIndex: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default SuccessModal;
