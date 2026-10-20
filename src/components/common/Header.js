/**
 * Header Component for Dharani Herbbals
 * Fully responsive for ALL mobile devices with notch, punch-hole, and status bar safe areas.
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { Icon } from './Icons';
import { AnimatedLogo } from './AnimatedLogo';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';

export const Header = ({
  title,
  showBack = false,
  showSearch = false,
  showCart = true,
  showWishlist = true,
  showLanguage = true,
  showLogo = true,
  onBackPress,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { totalItemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { language, setLanguage, isTamil } = useLanguage();

  // Dynamic top padding to ensure header is NEVER hidden behind camera notch/hole on ANY mobile
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 20
  );

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  return (
    <View style={[styles.container, { paddingTop: topInset, height: 60 + topInset }]}>
      <View style={styles.contentRow}>
        {/* Left Side: Back button or Logo + Brand */}
        <View style={styles.leftRow}>
          {showBack ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.75}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Icon name="back" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          ) : null}

          {showLogo && !title ? (
            <TouchableOpacity
              style={styles.logoRow}
              onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
              activeOpacity={0.85}
            >
              <View style={styles.logoWrapper}>
                <AnimatedLogo size={38} />
              </View>
              <View style={styles.brandTitleContainer}>
                <Image
                  source={require('../../assets/brand_logotype_horizontal.png')}
                  style={styles.brandLogotype}
                  resizeMode="contain"
                />
                <Text style={styles.brandSubtitle} numberOfLines={1}>
                  {isTamil ? '100% இயற்கை நலவாழ்வு' : '100% Natural Wellness'}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <Text style={styles.titleText} numberOfLines={1}>
              {title}
            </Text>
          )}
        </View>

        {/* Right Side: Language Toggle + Wishlist + Cart */}
        <View style={styles.rightRow}>
          {showLanguage ? (
            <TouchableOpacity
              style={styles.langPill}
              onPress={toggleLanguage}
              activeOpacity={0.75}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            >
              <Text style={styles.langText}>{language === 'en' ? 'தமிழ்' : 'EN'}</Text>
            </TouchableOpacity>
          ) : null}

          {showSearch ? (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('MainTabs', { screen: 'SearchTab' })}
              activeOpacity={0.75}
            >
              <Icon name="search" size={19} color={COLORS.text} />
            </TouchableOpacity>
          ) : null}

          {showWishlist ? (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('WishlistScreen')}
              activeOpacity={0.75}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            >
              <Icon
                name={wishlistCount > 0 ? 'heart-filled' : 'heart'}
                size={20}
                color={wishlistCount > 0 ? '#C25E3E' : COLORS.textSecondary}
              />
              {wishlistCount > 0 ? (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ) : null}

          {showCart ? (
            <TouchableOpacity
              style={[styles.iconButton, styles.cartButton]}
              onPress={() => navigation.navigate('MainTabs', { screen: 'CartTab' })}
              activeOpacity={0.75}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            >
              <Icon name="cart" size={20} color={COLORS.primary} focused={true} />
              {totalItemCount > 0 ? (
                <View style={[styles.badgeContainer, styles.cartBadge]}>
                  <Text style={styles.cartBadgeText}>
                    {totalItemCount > 9 ? '9+' : totalItemCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27, 77, 62, 0.07)',
    ...SHADOWS.small,
    zIndex: 100,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: SPACING.xs,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F6F4',
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoWrapper: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitleContainer: {
    marginLeft: SPACING.sm,
    justifyContent: 'center',
    flex: 1,
  },
  brandLogotype: {
    height: 18,
    width: 155,
    tintColor: '#133E2B',
  },
  brandSubtitle: {
    fontSize: 9.5,
    color: '#5B8266',
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.1,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#133E2B',
    marginLeft: SPACING.xs,
    flex: 1,
    letterSpacing: 0.1,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: '#EAF1EB',
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.25)',
  },
  langText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#133E2B',
    letterSpacing: 0.2,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    position: 'relative',
  },
  cartButton: {
    backgroundColor: '#EBF2ED',
    borderColor: 'rgba(27, 77, 62, 0.18)',
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#D9534F',
    minWidth: 17,
    height: 17,
    borderRadius: 8.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  cartBadge: {
    backgroundColor: '#1B4D3E',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});

export default Header;
