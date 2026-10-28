/**
 * OTP Verification Screen for Dharani Herbbals
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { Icon } from '../../components/common/Icons';
import { SuccessModal } from '../../components/common/SuccessModal';
import { SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { startOtpListener } from '../../services/otpAutoFill';

export const OtpScreen = ({ route, navigation }) => {
  const { mobile, pendingUserId, pendingAction, returnToCheckout } = route?.params || {};
  const { verifyOtp } = useAuth();
  const { addToCart } = useCart();
  const { isTamil, t } = useLanguage();

  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const inputRef = useRef(null);
  const cleanupListenerRef = useRef(null);

  // Auto-fill listener lifecycle
  useEffect(() => {
    let isMounted = true;
    startOtpListener((receivedOtp) => {
      if (!isMounted) return;
      if (receivedOtp) {
        const rawOtp = typeof receivedOtp === 'string' ? receivedOtp : (receivedOtp?.otp || '');
        const cleaned = String(rawOtp).replace(/[^0-9]/g, '').slice(0, 6);
        if (cleaned.length >= 4) {
          setOtp(cleaned);
          if (cleaned.length === 6) {
            handleVerify(cleaned);
          }
        }
      }
    }).then(cleanup => {
      if (isMounted) {
        cleanupListenerRef.current = cleanup;
      } else if (typeof cleanup === 'function') {
        cleanup();
      }
    });

    return () => {
      isMounted = false;
      if (cleanupListenerRef.current) {
        cleanupListenerRef.current();
      }
    };
  }, []);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const completeNavigation = () => {
    setOtp('');
    if (pendingAction) {
      if (pendingAction.type === 'ADD_TO_CART') {
        addToCart(pendingAction.product, pendingAction.quantity || 1, pendingAction.variation);
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
        }
        return;
      } else if (pendingAction.type === 'BUY_NOW') {
        addToCart(pendingAction.product, pendingAction.quantity || 1, pendingAction.variation);
        navigation.reset({
          index: 1,
          routes: [{ name: 'MainTabs' }, { name: 'CheckoutScreen' }],
        });
        return;
      } else if (pendingAction.type === 'CHECKOUT') {
        navigation.reset({
          index: 1,
          routes: [{ name: 'MainTabs' }, { name: 'CheckoutScreen' }],
        });
        return;
      }
    }

    if (returnToCheckout) {
      navigation.reset({
        index: 1,
        routes: [{ name: 'MainTabs' }, { name: 'CheckoutScreen' }],
      });
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs', params: { screen: 'HomeTab' } }],
      });
    }
  };

  const handleVerify = async (otpOverride = null) => {
    if (isLoading) return;
    const cleanOtp = (typeof otpOverride === 'string' ? otpOverride : otp).trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      Alert.alert(
        isTamil ? 'தவறான OTP' : 'Invalid OTP',
        t('invalidOtp')
      );
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp({
        mobile: mobile,
        otp: cleanOtp,
        pendingUserId: pendingUserId,
      });

      setShowSuccessModal(true);
    } catch (e) {
      Alert.alert(
        isTamil ? 'சரிபார்ப்பு தோல்வி' : 'Verification Failed',
        e?.message || t('otpFailed')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = text => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(cleaned);
    if (cleaned.length === 6) {
      handleVerify(cleaned);
    }
  };

  const handleResend = async () => {
    if (!canResend || isLoading) return;
    setTimer(30);
    setCanResend(false);
    setOtp('');

    // Re-arm listener for the fresh incoming OTP SMS
    if (cleanupListenerRef.current) {
      cleanupListenerRef.current();
    }
    startOtpListener((receivedOtp) => {
      if (receivedOtp) {
        const rawOtp = typeof receivedOtp === 'string' ? receivedOtp : (receivedOtp?.otp || '');
        const cleaned = String(rawOtp).replace(/[^0-9]/g, '').slice(0, 6);
        if (cleaned.length >= 4) {
          setOtp(cleaned);
          if (cleaned.length === 6) {
            handleVerify(cleaned);
          }
        }
      }
    }).then(cleanup => {
      cleanupListenerRef.current = cleanup;
    });

    try {
      const res = await api.resendOtp(mobile);
      if (res && res.success === false) {
        throw new Error(res.message || 'Failed to resend OTP.');
      }
      Alert.alert(
        isTamil ? 'OTP அனுப்பப்பட்டது' : 'OTP Resent',
        isTamil
          ? `+91 ${mobile} எண்ணிற்கு புதிய OTP அனுப்பப்பட்டுள்ளது.`
          : `A new OTP has been sent to +91 ${mobile}`
      );
    } catch (e) {
      Alert.alert(
        isTamil ? 'பிழை' : 'Notice',
        e?.message || (isTamil ? 'OTP அனுப்ப முடியவில்லை.' : 'Failed to resend OTP.')
      );
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('enterOtp')}
        showBack={true}
        showCart={false}
        showLogo={false}
        onBackPress={() => {
          navigation.replace('LoginScreen', {
            pendingAction,
            returnToCheckout,
          });
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconCircleOuter}>
            <View style={styles.iconCircle}>
              <Icon name="shield" size={28} color="#1B4D3E" />
            </View>
          </View>

          <Text style={styles.title}>{t('enterOtp')}</Text>
          <Text style={styles.subtitle}>
            {t('otpSentTo')} <Text style={styles.boldText}>+91 {mobile}</Text>
          </Text>

          <View style={styles.inputCard}>
            {/* Multi-digit 6-box OTP visual layout backed by single accessible TextInput */}
            <TouchableOpacity
              style={styles.otpBoxesRow}
              activeOpacity={1}
              onPress={() => inputRef.current?.focus()}
            >
              {[0, 1, 2, 3, 4, 5].map(index => {
                const digit = otp[index] || '';
                const isFocused = otp.length === index;
                return (
                  <View
                    key={index}
                    style={[
                      styles.digitBox,
                      digit ? styles.digitBoxFilled : null,
                      isFocused ? styles.digitBoxActive : null,
                    ]}
                  >
                    <Text style={styles.digitText}>{digit}</Text>
                  </View>
                );
              })}
            </TouchableOpacity>

            {/* Transparent full-width TextInput handling keyboard, paste, and Android autoComplete="sms-otp" */}
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={handleOtpChange}
              autoFocus={true}
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              importantForAutofill="yes"
              caretHidden={true}
            />

            <TouchableOpacity
              style={[styles.verifyBtn, isLoading || otp.length < 4 ? styles.btnDisabled : null]}
              onPress={() => handleVerify()}
              disabled={isLoading || otp.length < 4}
              activeOpacity={0.88}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.verifyBtnText}>{t('verifyAndProceed')}</Text>
              )}
            </TouchableOpacity>

            {/* Resend Timer */}
            <View style={styles.resendContainer}>
              {canResend ? (
                <TouchableOpacity onPress={handleResend} activeOpacity={0.8}>
                  <Text style={styles.resendActiveText}>{t('resendOtp')}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.resendTimerText}>
                  {t('resendIn')} <Text style={styles.boldTimer}>{timer}s</Text>
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Celebration Modal Matching User Mockup */}
      <SuccessModal
        visible={showSuccessModal}
        title={t('loginSuccess')}
        subtitle={t('welcomeBack')}
        message={t('loginSuccessDesc')}
        buttonText={t('continueBtn')}
        onPress={() => {
          setShowSuccessModal(false);
          completeNavigation();
        }}
        onClose={() => {
          setShowSuccessModal(false);
          completeNavigation();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  content: {
    padding: SPACING.lg,
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 36,
    flexGrow: 1,
  },
  iconCircleOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#EBF2ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: 'rgba(27, 77, 62, 0.12)',
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B4D3E',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    color: '#5A6E62',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '800',
    color: '#14231A',
  },
  inputCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.medium,
  },
  otpBoxesRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    gap: 6,
  },
  digitBox: {
    flex: 1,
    maxWidth: 46,
    minWidth: 32,
    aspectRatio: 0.85,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: 'rgba(27, 77, 62, 0.20)',
    backgroundColor: '#FAF8F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitBoxActive: {
    borderColor: '#1B4D3E',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    ...SHADOWS.small,
  },
  digitBoxFilled: {
    borderColor: '#1B4D3E',
    backgroundColor: '#FFFFFF',
  },
  digitText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1B4D3E',
  },
  hiddenInput: {
    position: 'absolute',
    top: SPACING.xl,
    left: SPACING.xl,
    right: SPACING.xl,
    height: 54,
    opacity: 0,
  },
  verifyBtn: {
    width: '100%',
    backgroundColor: '#1B4D3E',
    borderRadius: RADIUS.full,
    paddingVertical: 14,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  resendContainer: {
    marginTop: SPACING.lg,
  },
  resendActiveText: {
    fontSize: 13,
    color: '#1B4D3E',
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  resendTimerText: {
    fontSize: 12,
    color: '#5A6E62',
  },
  boldTimer: {
    fontWeight: '800',
    color: '#1B4D3E',
  },
});

export default OtpScreen;

