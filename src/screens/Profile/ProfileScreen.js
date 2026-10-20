/**
 * Profile & Account Screen for Dharani Herbbals
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { Icon } from '../../components/common/Icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useWishlist } from '../../context/WishlistContext';

export const ProfileScreen = ({ navigation }) => {
  const { user, isAuthenticated, isGuest, logout } = useAuth();
  const { language, setLanguage, isTamil } = useLanguage();
  const { wishlistCount } = useWishlist();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  return (
    <View style={styles.container}>
      <Header
        title={isTamil ? 'என் கணக்கு' : 'My Account'}
        showBack={false}
        showCart={true}
        showLogo={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        {isAuthenticated ? (
          <View style={styles.profileCard}>
            <View style={styles.avatarHalo}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>
                  {(user?.name || 'D').charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.profileDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{user?.name || 'Valued Customer'}</Text>
                <View style={styles.memberBadge}>
                  <Text style={styles.memberBadgeText}>Member</Text>
                </View>
              </View>
              <Text style={styles.userPhone}>
                {user?.mobile || user?.phone_number || ''}
              </Text>
              {user?.email ? (
                <Text style={styles.userEmail}>{user.email}</Text>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.guestCard}>
            <View style={styles.guestIconCircle}>
              <Icon name="user" size={24} color="#1B4D3E" />
            </View>
            <View style={styles.guestTextContainer}>
              <Text style={styles.guestTitle}>
                {isTamil ? 'உள்நுழைக / பதிவு செய்க' : 'Sign in to Dharani Herbbals'}
              </Text>
              <Text style={styles.guestSubtitle}>
                {isTamil
                  ? 'உங்கள் ஆர்டர்களைக் கண்காணிக்கவும், சேமித்த முகவரிகளை அணுகவும்'
                  : 'Track past orders, save delivery addresses & access your wishlist'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={() => navigation.navigate('LoginScreen')}
              activeOpacity={0.85}
            >
              <Text style={styles.signInBtnText}>Sign In / Register ›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Account Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>Shopping & Orders</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              if (isAuthenticated) {
                navigation.navigate('OrderHistoryScreen');
              } else {
                navigation.navigate('LoginScreen');
              }
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#EBF2ED' }]}>
                <Icon name="truck" size={17} color="#1B4D3E" />
              </View>
              <Text style={styles.menuTitle}>My Orders & Live Tracking</Text>
            </View>
            <Icon name="chevron-right" size={18} color="#8A9E92" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('WishlistScreen')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#FDF2EE' }]}>
                <Icon name="heart-filled" size={17} color="#C25E3E" />
              </View>
              <Text style={styles.menuTitle}>My Wishlist</Text>
            </View>
            <View style={styles.menuRight}>
              {wishlistCount > 0 ? (
                <View style={styles.countPill}>
                  <Text style={styles.countPillText}>{wishlistCount}</Text>
                </View>
              ) : null}
              <Icon name="chevron-right" size={18} color="#8A9E92" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={() => {
              if (isAuthenticated) {
                navigation.navigate('AddressesScreen');
              } else {
                navigation.navigate('LoginScreen');
              }
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#EFF6FF' }]}>
                <Icon name="map-pin" size={17} color="#2563EB" />
              </View>
              <Text style={styles.menuTitle}>Saved Delivery Addresses</Text>
            </View>
            <Icon name="chevron-right" size={18} color="#8A9E92" />
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>Preferences & Language</Text>

          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={toggleLanguage} activeOpacity={0.7}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#FEF9EE' }]}>
                <Icon name="sparkles" size={17} color="#C8963E" />
              </View>
              <Text style={styles.menuTitle}>Language / மொழி</Text>
            </View>
            <View style={styles.langBadge}>
              <Text style={styles.langBadgeText}>
                {language === 'en' ? 'English (மாற்று)' : 'தமிழ் (Switch)'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Brand Information & Support */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>Dharani Herbbals</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AboutScreen')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#EBF2ED' }]}>
                <Icon name="leaf" size={17} color="#1B4D3E" />
              </View>
              <Text style={styles.menuTitle}>About Us & Siddha Heritage</Text>
            </View>
            <Icon name="chevron-right" size={18} color="#8A9E92" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ContactScreen')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#F5F3FF' }]}>
                <Icon name="phone" size={17} color="#7C3AED" />
              </View>
              <Text style={styles.menuTitle}>Customer Support & Store Info</Text>
            </View>
            <Icon name="chevron-right" size={18} color="#8A9E92" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={() => navigation.navigate('PoliciesScreen')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#F1F5F9' }]}>
                <Icon name="shield" size={17} color="#5A6E62" />
              </View>
              <Text style={styles.menuTitle}>Policies & Shipping Terms</Text>
            </View>
            <Icon name="chevron-right" size={18} color="#8A9E92" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        {isAuthenticated ? (
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutBtnText}>Log Out</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Dharani Herbbals • Version 1.0.0</Text>
          <Text style={styles.versionSub}>Official Mobile Application</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  avatarHalo: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EBF2ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(27, 77, 62, 0.12)',
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1B4D3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#14231A',
  },
  memberBadge: {
    backgroundColor: '#EBF2ED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  memberBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1B4D3E',
  },
  userPhone: {
    fontSize: 13,
    color: '#5A6E62',
    marginTop: 2,
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 12,
    color: '#8A9E92',
    marginTop: 2,
  },
  guestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  guestIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EBF2ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.12)',
  },
  guestTextContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  guestTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#14231A',
  },
  guestSubtitle: {
    fontSize: 12.5,
    color: '#5A6E62',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: SPACING.md,
    lineHeight: 17,
  },
  signInBtn: {
    backgroundColor: '#1B4D3E',
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    ...SHADOWS.small,
  },
  signInBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8A9E92',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27, 77, 62, 0.06)',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#14231A',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countPill: {
    backgroundColor: '#FDF2EE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  countPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C25E3E',
  },
  langBadge: {
    backgroundColor: '#FEF9EE',
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(200, 150, 62, 0.2)',
  },
  langBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C8963E',
  },
  logoutBtn: {
    backgroundColor: '#FDF2EE',
    paddingVertical: 14,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(194, 94, 62, 0.15)',
  },
  logoutBtnText: {
    color: '#C25E3E',
    fontSize: 13.5,
    fontWeight: '800',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A6E62',
  },
  versionSub: {
    fontSize: 10.5,
    color: '#8A9E92',
    marginTop: 2,
  },
});

export default ProfileScreen;

