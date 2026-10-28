/**
 * Mobile Number Login Screen for Dharani Herbbals
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { Icon } from '../../components/common/Icons';
import { SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const LoginScreen = ({ navigation, route }) => {
  const { user, loginWithMobile, logout } = useAuth();
  const { isTamil, t } = useLanguage();
  const [mobile, setMobile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const pendingAction = route?.params?.pendingAction || null;
  const returnToCheckout = route?.params?.returnToCheckout || false;

  const handleSendOtp = async () => {
    const cleanMobile = mobile.trim();
    if (!cleanMobile || cleanMobile.length !== 10 || !/^[6-9]\d{9}$/.test(cleanMobile)) {
      Alert.alert(
        isTamil ? 'தவறான மொபைல் எண்' : 'Invalid Mobile Number',
        isTamil
          ? 'தயவுசெய்து சரியான 10 இலக்க இந்திய மொபைல் எண்ணை உள்ளிடவும் (6-9 இல் தொடங்கும்).'
          : 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.'
      );
      return;
    }

    setIsLoading(true);
    try {
      // If a previous session exists with a different number, safely logout first to prevent session reuse
      if (user && (user.mobile !== cleanMobile && user.phone_number !== cleanMobile)) {
        await logout();
      }

      const res = await loginWithMobile(cleanMobile);
      if (!res || res.success === false) {
        throw new Error(res?.message || (isTamil ? 'OTP அனுப்ப முடியவில்லை.' : 'Failed to send OTP. Please try again.'));
      }

      const pendingUserId = res.user_id || res.id || null;

      // Navigate to OTP entry screen without any serverOtp or auto-authentication payload
      navigation.replace('OtpScreen', {
        mobile: cleanMobile,
        pendingUserId: pendingUserId,
        pendingAction: pendingAction,
        returnToCheckout: returnToCheckout,
      });
    } catch (e) {
      Alert.alert(
        isTamil ? 'பிழை' : 'Login Error',
        e?.message || (isTamil ? 'OTP அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'Failed to send OTP. Please try again.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title={t('login')} showBack={true} showCart={false} showLogo={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Banner with Botanical Profile Halo */}
        <View style={styles.brandHero}>
          <View style={styles.logoHalo}>
            <View style={styles.logoCircle}>
              <Icon name="account" size={46} color="#1B4D3E" />
            </View>
          </View>
          <Image
            source={require('../../assets/brand_logotype_horizontal.png')}
            style={styles.brandLogotype}
            resizeMode="contain"
          />
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>
              {isTamil ? '100% இயற்கை நலவாழ்வு' : '100% Pure Botanical Wellness'}
            </Text>
          </View>
          <Text style={styles.brandSubtitle}>
            {isTamil ? 'பாரம்பரிய சித்த & ஆயுர்வேத மருத்துவ மூலிகைகள்' : 'Authentic Siddha & Herbal Remedies from Tamil Nadu'}
          </Text>
        </View>

        {/* Login Card */}
        <View style={styles.loginCard}>
          <Text style={styles.cardHeading}>{t('login')}</Text>
          <Text style={styles.cardSub}>
            {t('loginSubtitle')}
          </Text>

          {/* Mobile Input Group */}
          <View style={styles.inputContainer}>
            <View style={styles.countryCodeBox}>
              <Text style={styles.countryCode}>+91</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder={isTamil ? '10 இலக்க மொபைல் எண்' : '10-digit mobile number'}
              placeholderTextColor="#8A9E92"
              keyboardType="phone-pad"
              maxLength={10}
              value={mobile}
              onChangeText={setMobile}
              autoFocus={true}
            />
          </View>

          {/* Send OTP Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, isLoading ? styles.btnDisabled : null]}
            onPress={handleSendOtp}
            disabled={isLoading}
            activeOpacity={0.88}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>{t('sendOtp')}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Trust Badges */}
        <View style={styles.trustRow}>
          <View style={styles.trustBadge}>
            <Icon name="shield" size={15} color="#1B4D3E" />
            <Text style={styles.trustText}>{isTamil ? 'பாதுகாப்பானது' : 'Safe & Secure'}</Text>
          </View>
          <View style={styles.trustBadge}>
            <Icon name="leaf" size={15} color="#1B4D3E" />
            <Text style={styles.trustText}>{isTamil ? '100% தூய மூலிகை' : '100% Pure Herbs'}</Text>
          </View>
          <View style={styles.trustBadge}>
            <Icon name="truck" size={15} color="#1B4D3E" />
            <Text style={styles.trustText}>{isTamil ? 'நேரடியாக ஈரோட்டிலிருந்து' : 'Direct from Erode'}</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.hero,
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoHalo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E8F3ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: '#C8DFD2',
    ...SHADOWS.small,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2EBE5',
    ...SHADOWS.small,
  },
  logo: {
    width: 52,
    height: 52,
  },
  brandLogotype: {
    height: 24,
    maxWidth: 200,
    width: '60%',
    tintColor: '#1B4D3E',
    marginBottom: 2,
  },
  badgePill: {
    backgroundColor: '#EBF2ED',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.12)',
  },
  badgePillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1B4D3E',
    letterSpacing: 0.4,
  },
  brandSubtitle: {
    fontSize: 11.5,
    color: '#5A6E62',
    marginTop: 6,
    textAlign: 'center',
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    ...SHADOWS.medium,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#14231A',
    letterSpacing: -0.2,
  },
  cardSub: {
    fontSize: 12.5,
    color: '#5A6E62',
    marginTop: 4,
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    height: 50,
    borderWidth: 1.2,
    borderColor: 'rgba(27, 77, 62, 0.15)',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    backgroundColor: '#FAF8F5',
  },
  countryCodeBox: {
    backgroundColor: '#EBF2ED',
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(27, 77, 62, 0.12)',
  },
  countryCode: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1B4D3E',
  },
  input: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    paddingHorizontal: SPACING.md,
    fontSize: 15,
    color: '#14231A',
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: '#1B4D3E',
    borderRadius: RADIUS.full,
    paddingVertical: 14,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(27, 77, 62, 0.08)',
  },
  orText: {
    marginHorizontal: 12,
    fontSize: 11,
    fontWeight: '800',
    color: '#8A9E92',
    letterSpacing: 0.5,
  },
  guestBtn: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1.2,
    borderColor: 'rgba(27, 77, 62, 0.15)',
    borderRadius: RADIUS.full,
    paddingVertical: 13,
    alignItems: 'center',
  },
  guestBtnText: {
    color: '#5A6E62',
    fontSize: 13,
    fontWeight: '700',
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: SPACING.lg,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EBF2ED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B4D3E',
  },
});

export default LoginScreen;

