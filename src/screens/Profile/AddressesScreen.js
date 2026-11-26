/**
 * Saved Addresses Screen for Dharani Herbbals
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon } from '../../components/common/Icons';
import { SuccessModal } from '../../components/common/SuccessModal';
import { SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import storage from '../../services/storage';
import api from '../../services/api';
import locationService from '../../services/locationService';

export const AddressesScreen = () => {
  const { user } = useAuth();
  const { isTamil, t } = useLanguage();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleDetectLiveLocation = async () => {
    setIsLocating(true);
    try {
      const loc = await locationService.getLiveLocation(isTamil);
      if (loc) {
        if (loc.streetAddress) setStreet(loc.streetAddress);
        else if (loc.fullAddress && !street) setStreet(loc.fullAddress);
        if (loc.city) setCity(loc.city);
        if (loc.state) setState(loc.state);
        if (loc.pincode) setPincode(loc.pincode);
      }
    } catch (err) {
      Alert.alert(
        isTamil ? 'இருப்பிட தகவல்' : 'Location Information',
        err.message || (isTamil
          ? 'இருப்பிடத்தை கண்டறிய முடியவில்லை. தயவுசெய்து ஊர் மற்றும் அஞ்சல் குறியீட்டை உள்ளிடவும்.'
          : 'Could not auto-detect location. Please enter manually.')
      );
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        if (user?.id) {
          const remoteAddrs = await api.getAddresses(user.id);
          if (Array.isArray(remoteAddrs) && remoteAddrs.length > 0) {
            setAddresses(remoteAddrs);
            await storage.setAddresses(remoteAddrs);
            setIsLoading(false);
            return;
          }
        }
        const localAddrs = await storage.getAddresses();
        setAddresses(localAddrs || []);
      } catch (e) {
        console.warn('Addresses error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, [user]);

  const handleSaveAddress = async () => {
    if (!fullName.trim() || !phone.trim() || !street.trim() || !city.trim() || !pincode.trim()) {
      Alert.alert(t('required'), isTamil ? 'தேவையான அனைத்து முகவரி விவரங்களையும் நிரப்பவும்.' : 'Please fill in all the required address fields.');
      return;
    }

    setIsSaving(true);
    const newAddress = {
      id: Date.now(),
      user_id: user?.id || 1,
      full_name: fullName.trim(),
      phone: phone.trim(),
      address: street.trim(),
      city: city.trim(),
      state: state,
      pincode: pincode.trim(),
    };

    try {
      if (user?.id && !user.isGuest) {
        await api.addAddress(newAddress);
      }
    } catch (e) {
      console.warn('API save address note:', e.message);
    }

    const updated = [newAddress, ...addresses];
    setAddresses(updated);
    await storage.setAddresses(updated);

    setIsSaving(false);
    setIsModalOpen(false);

    // Reset Form
    setFullName('');
    setPhone('');
    setStreet('');
    setCity('');
    setPincode('');
    setShowSuccessModal(true);
  };

  const handleDeleteAddress = addressId => {
    Alert.alert(
      isTamil ? 'முகவரியை நீக்கவா?' : 'Delete Address',
      isTamil ? 'நிச்சயமாக இந்த முகவரியை நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this address?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            const updated = addresses.filter(a => (a.id || a.address_id) !== addressId);
            setAddresses(updated);
            await storage.setAddresses(updated);
            try {
              if (user?.id && !user.isGuest) {
                await api.deleteAddress(addressId);
              }
            } catch {}
          },
        },
      ]
    );
  };

  const renderAddressCard = ({ item }) => {
    const id = item.id || item.address_id;
    return (
      <View style={styles.addressCard}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.addrHeaderLeft}>
            <View style={styles.mapPinBadge}>
              <Icon name="map-pin" size={13} color="#1B4D3E" />
            </View>
            <Text style={styles.addrName}>{item.full_name}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDeleteAddress(id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.deleteBtn}
          >
            <Icon name="trash" size={15} color="#C25E3E" />
          </TouchableOpacity>
        </View>

        <Text style={styles.addrText}>{item.address}</Text>
        <Text style={styles.addrText}>{item.city}, {item.state} - {item.pincode}</Text>
        <View style={styles.phoneBadge}>
          <Icon name="phone" size={11} color="#1B4D3E" />
          <Text style={styles.addrPhone}>{item.phone}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title={t('savedAddresses')} showBack={true} showCart={false} showLogo={false} />

      {isLoading ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color="#1B4D3E" />
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item, idx) => `addr-${item.id || item.address_id || idx}`}
          renderItem={renderAddressCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setIsModalOpen(true)}
              activeOpacity={0.88}
            >
              <Icon name="plus" size={16} color="#FFFFFF" />
              <Text style={styles.addBtnText}>{t('addAddress')}</Text>
            </TouchableOpacity>
          }
          ListEmptyComponent={
            <EmptyState
              icon="map-pin"
              title={t('noSavedAddresses')}
              subtitle={isTamil ? 'எளிதான செக்அவுட்டிற்கு உங்கள் வீட்டு அல்லது அலுவலக முகவரிகளை சேமியுங்கள்.' : 'Save your home, office, or family delivery addresses for a seamless checkout experience.'}
              buttonText={t('addAddress')}
              onButtonPress={() => setIsModalOpen(true)}
            />
          }
        />
      )}

      {/* Add Address Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent={true}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{t('addAddress')}</Text>
                <Text style={styles.modalSub}>{isTamil ? 'தூய மூலிகைகளை உங்கள் வீட்டு வாசலில் பெறுங்கள்' : 'Ship pure herbal remedies safely to your door'}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.closeBtn}
              >
                <Icon name="close" size={16} color="#14231A" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              <TouchableOpacity
                style={styles.gpsAutoBtn}
                onPress={handleDetectLiveLocation}
                disabled={isLocating}
                activeOpacity={0.85}
              >
                {isLocating ? (
                  <ActivityIndicator size="small" color="#1B4D3E" style={{ marginRight: 6 }} />
                ) : (
                  <Icon name="map-pin" size={15} color="#1B4D3E" style={{ marginRight: 6 }} />
                )}
                <Text style={styles.gpsAutoBtnText}>
                  {isTamil ? '🎯 தற்போதைய இருப்பிடத்தை தானாக நிரப்பவும்' : '🎯 Auto-Detect Live Location (GPS)'}
                </Text>
              </TouchableOpacity>
              <TextInput
                style={styles.modalInput}
                placeholder={isTamil ? 'முழு பெயர் *' : 'Full Name *'}
                placeholderTextColor="#8A9E92"
                value={fullName}
                onChangeText={setFullName}
              />

              <TextInput
                style={styles.modalInput}
                placeholder={isTamil ? '10 இலக்க மொபைல் எண் *' : '10-digit Phone Number *'}
                placeholderTextColor="#8A9E92"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />

              <TextInput
                style={[styles.modalInput, styles.textArea]}
                placeholder={isTamil ? 'கதவு எண், கட்டிடம், தெரு முகவரி, பகுதி *' : 'Door No, Building, Street Name, Area *'}
                placeholderTextColor="#8A9E92"
                multiline
                value={street}
                onChangeText={setStreet}
              />

              <View style={styles.formRow}>
                <TextInput
                  style={[styles.modalInput, { flex: 1, marginRight: 8 }]}
                  placeholder={isTamil ? 'நகரம் / ஊர் *' : 'City / Town *'}
                  placeholderTextColor="#8A9E92"
                  value={city}
                  onChangeText={setCity}
                />
                <TextInput
                  style={[styles.modalInput, { flex: 1 }]}
                  placeholder={isTamil ? '6 இலக்க அஞ்சல் குறியீடு *' : '6-digit Pincode *'}
                  placeholderTextColor="#8A9E92"
                  keyboardType="numeric"
                  maxLength={6}
                  value={pincode}
                  onChangeText={setPincode}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, isSaving ? styles.btnDisabled : null]}
                onPress={handleSaveAddress}
                disabled={isSaving}
                activeOpacity={0.88}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>{t('saveAddress')} ›</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Success Celebration Modal Matching User Mockup */}
      <SuccessModal
        visible={showSuccessModal}
        title={isTamil ? 'முகவரி சேமிக்கப்பட்டது!' : 'Address Saved!'}
        subtitle={isTamil ? 'தாரணி ஹெர்பல்ஸ்' : 'Dharani Herbals'}
        message={isTamil ? 'உங்கள் புதிய டெலிவரி முகவரி வெற்றிகரமாக சேர்க்கப்பட்டது.' : 'Your delivery address has been saved successfully.'}
        buttonText={isTamil ? 'சரி →' : 'Done →'}
        onPress={() => setShowSuccessModal(false)}
        onClose={() => setShowSuccessModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  gpsAutoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  gpsAutoBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0D382B',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B4D3E',
    paddingVertical: 14,
    borderRadius: RADIUS.full,
    gap: 8,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  addrHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapPinBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EBF2ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    padding: 4,
  },
  addrName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#14231A',
  },
  addrText: {
    fontSize: 13,
    color: '#5A6E62',
    lineHeight: 18,
    marginTop: 2,
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
  },
  addrPhone: {
    fontSize: 11.5,
    color: '#1B4D3E',
    fontWeight: '700',
  },
  loaderCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B4D3E',
    letterSpacing: -0.2,
  },
  modalSub: {
    fontSize: 11.5,
    color: '#5A6E62',
    marginTop: 2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FAF8F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalInput: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1.2,
    borderColor: 'rgba(27, 77, 62, 0.12)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 46,
    fontSize: 13.5,
    color: '#14231A',
    marginBottom: SPACING.md,
    fontWeight: '500',
  },
  textArea: {
    height: 72,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  formRow: {
    flexDirection: 'row',
  },
  saveBtn: {
    backgroundColor: '#1B4D3E',
    borderRadius: RADIUS.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: SPACING.xs,
    ...SHADOWS.small,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default AddressesScreen;

