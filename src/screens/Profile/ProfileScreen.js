/**
 * Profile & Account Screen for Dharani Herbbals
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { Icon } from '../../components/common/Icons';
import { SuccessModal } from '../../components/common/SuccessModal';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useWishlist } from '../../context/WishlistContext';

export const ProfileScreen = ({ navigation }) => {
  const { user, isAuthenticated, isGuest, updateProfile, logout } = useAuth();
  const { language, setLanguage, isTamil, t } = useLanguage();
  const { wishlistCount } = useWishlist();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleOpenEdit = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    const trimmedName = editName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      Alert.alert(
        isTamil ? 'பெயர் தேவை' : 'Name Required',
        isTamil ? 'தயவுசெய்து சரியான பெயரை உள்ளிடவும்.' : 'Please enter a valid full name.'
      );
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(trimmedName, editEmail.trim());
      setEditModalVisible(false);
      setShowSuccessModal(true);
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(t('logout'), t('logoutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('logout'),
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
                <Text style={styles.userName} numberOfLines={1}>{user?.name || 'Valued Customer'}</Text>
                <TouchableOpacity
                  style={styles.editChip}
                  onPress={handleOpenEdit}
                  activeOpacity={0.75}
                  accessibilityLabel="Edit profile name"
                >
                  <Icon name="pencil" size={12} color="#1B4D3E" />
                  <Text style={styles.editChipText}>{isTamil ? 'திருத்து' : 'Edit'}</Text>
                </TouchableOpacity>
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
                {isTamil ? 'உள்நுழைக' : 'Login to Dharani Herbbals'}
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
              <Text style={styles.signInBtnText}>{t('login')} ›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Account Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>{isTamil ? 'ஷாப்பிங் & ஆர்டர்கள்' : 'Shopping & Orders'}</Text>

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
                <Icon name="package" size={17} color="#1B4D3E" />
              </View>
              <Text style={styles.menuTitle}>{isTamil ? 'என் ஆர்டர்கள் & கண்காணிப்பு' : 'My Orders & Live Tracking'}</Text>
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
                <Icon name="heart" size={17} color="#C25E3E" />
              </View>
              <Text style={styles.menuTitle}>{isTamil ? 'விருப்பப்பட்டியல்' : 'My Wishlist'}</Text>
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

          {isAuthenticated ? (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleOpenEdit}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBg, { backgroundColor: '#EBF2ED' }]}>
                  <Icon name="pencil" size={16} color="#1B4D3E" />
                </View>
                <Text style={styles.menuTitle}>
                  {isTamil ? 'சுயவிவரப் பெயர் திருத்து' : 'Edit Profile Name'}
                </Text>
              </View>
              <View style={styles.menuRight}>
                <Text style={styles.editMenuHint}>{user?.name || ''}</Text>
                <Icon name="chevron-right" size={18} color="#8A9E92" />
              </View>
            </TouchableOpacity>
          ) : null}

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
              <Text style={styles.menuTitle}>{isTamil ? 'சேமிக்கப்பட்ட டெலிவரி முகவரிகள்' : 'Saved Delivery Addresses'}</Text>
            </View>
            <Icon name="chevron-right" size={18} color="#8A9E92" />
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>{isTamil ? 'விருப்பங்கள் & மொழி' : 'Preferences & Language'}</Text>

          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={toggleLanguage} activeOpacity={0.7}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#FEF9EE' }]}>
                <Icon name="languages" size={17} color="#C8963E" />
              </View>
              <Text style={styles.menuTitle}>{isTamil ? 'பயன்பாட்டு மொழி' : 'App Language'}</Text>
            </View>
            <View style={styles.langBadge}>
              <Text style={styles.langBadgeText}>
                {language === 'en' ? 'English (மாற்று ›)' : 'தமிழ் (Switch ›)'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Brand Information & Support */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>{isTamil ? 'தரணி ஹெர்பல்ஸ்' : 'Dharani Herbbals'}</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AboutScreen')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#EBF2ED' }]}>
                <Icon name="leaf" size={17} color="#1B4D3E" />
              </View>
              <Text style={styles.menuTitle}>{isTamil ? 'எங்களை பற்றி & பாரம்பரியம்' : 'About Us & Siddha Heritage'}</Text>
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
                <Icon name="headset" size={17} color="#7C3AED" />
              </View>
              <Text style={styles.menuTitle}>{isTamil ? 'வாடிக்கையாளர் ஆதரவு & முகவரி' : 'Customer Support & Store Info'}</Text>
            </View>
            <Icon name="chevron-right" size={18} color="#8A9E92" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={() => navigation.navigate('PoliciesScreen')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#EBF2ED' }]}>
                <Icon name="shield-check" size={17} color="#1B4D3E" />
              </View>
              <Text style={styles.menuTitle}>{isTamil ? 'கொள்கைகள் & விதிமுறைகள்' : 'Policies & Shipping Terms'}</Text>
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
            <Icon name="logout" size={16} color="#C25E3E" />
            <Text style={styles.logoutBtnText}>{t('logout')}</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Dharani Herbbals • Version 1.0.7</Text>
          <Text style={styles.versionSub}>Official Mobile Application</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          if (!isSaving) setEditModalVisible(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalIconCircle}>
                  <Icon name="pencil" size={17} color="#1B4D3E" />
                </View>
                <Text style={styles.modalTitle}>
                  {isTamil ? 'சுயவிவரப் பெயர் திருத்து' : 'Edit Profile Name'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                disabled={isSaving}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="close" size={18} color="#8A9E92" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              {isTamil
                ? 'உங்கள் பெயர் மற்றும் விவரங்களை இங்கே மாற்றலாம்.'
                : 'Update your display name for orders and delivery receipts.'}
            </Text>

            {/* Registered Mobile (Read-Only) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                {isTamil ? 'பதிவுசெய்த மொபைல் எண்' : 'Registered Mobile Number'}
              </Text>
              <View style={styles.readOnlyBox}>
                <Icon name="phone" size={14} color="#5A6E62" />
                <Text style={styles.readOnlyText}>
                  +91 {user?.mobile || user?.phone_number || ''}
                </Text>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedBadgeText}>Verified</Text>
                </View>
              </View>
            </View>

            {/* Name Input */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                {isTamil ? 'முழுப் பெயர் *' : 'Full Name *'}
              </Text>
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholder={isTamil ? 'உங்கள் பெயர்' : 'Enter your full name'}
                placeholderTextColor="#8A9E92"
                autoCapitalize="words"
                editable={!isSaving}
              />
            </View>

            {/* Email Input */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                {isTamil ? 'மின்னஞ்சல் முகவரி (விருப்பத்தேர்வு)' : 'Email Address (Optional)'}
              </Text>
              <TextInput
                style={styles.modalInput}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="customer@dharaniherbbals.in"
                placeholderTextColor="#8A9E92"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isSaving}
              />
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditModalVisible(false)}
                disabled={isSaving}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelBtnText}>
                  {isTamil ? 'ரத்து' : 'Cancel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSaveBtn, isSaving ? styles.btnDisabled : null]}
                onPress={handleSaveProfile}
                disabled={isSaving}
                activeOpacity={0.88}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveBtnText}>
                    {isTamil ? 'சேமி ›' : 'Save Changes ›'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Success Celebration Modal Matching User Mockup */}
      <SuccessModal
        visible={showSuccessModal}
        title={isTamil ? 'சுயவிவரம் புதுப்பிக்கப்பட்டது!' : 'Profile Updated!'}
        subtitle={isTamil ? 'தாரணி ஹெர்பல்ஸ்' : 'Dharani Herbals'}
        message={isTamil ? 'உங்கள் சுயவிவர விவரங்கள் வெற்றிகரமாக சேமிக்கப்பட்டன.' : 'Your profile details have been updated successfully.'}
        buttonText={isTamil ? 'சரி →' : 'Done →'}
        onPress={() => setShowSuccessModal(false)}
        onClose={() => setShowSuccessModal(false)}
      />
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
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#14231A',
    flexShrink: 1,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDF2EE',
    paddingVertical: 14,
    borderRadius: RADIUS.full,
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
  editChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF2ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.15)',
  },
  editChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  editMenuHint: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#5A6E62',
    marginRight: 6,
    maxWidth: 120,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 18, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 420,
    padding: SPACING.lg,
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF2ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#14231A',
  },
  modalSub: {
    fontSize: 12,
    color: '#5A6E62',
    marginBottom: SPACING.md,
    lineHeight: 17,
  },
  fieldGroup: {
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2C3E33',
    marginBottom: 6,
  },
  readOnlyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F3',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#E5E4E0',
    gap: 8,
  },
  readOnlyText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#4A5B50',
  },
  verifiedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2E7D32',
  },
  modalInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D4DDD6',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
    color: '#14231A',
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: SPACING.sm,
  },
  modalCancelBtn: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: RADIUS.full,
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5A6E62',
  },
  modalSaveBtn: {
    backgroundColor: '#1B4D3E',
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});

export default ProfileScreen;

