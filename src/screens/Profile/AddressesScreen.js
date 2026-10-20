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
} from 'react-native';
import { Header } from '../../components/common/Header';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon } from '../../components/common/Icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import storage from '../../services/storage';
import api from '../../services/api';

const STATES_LIST = ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Maharashtra', 'Delhi', 'Other'];

export const AddressesScreen = () => {
  const { user } = useAuth();
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

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const handleSaveAddress = async () => {
    if (!fullName.trim() || !phone.trim() || !street.trim() || !city.trim() || !pincode.trim()) {
      Alert.alert('Required Fields', 'Please fill in all the required address fields.');
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
    Alert.alert('Success', 'Delivery address saved successfully!');
  };

  const handleDeleteAddress = addressId => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
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
    ]);
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
      <Header title="Saved Addresses" showBack={true} showCart={false} showLogo={false} />

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
              <Text style={styles.addBtnText}>Add New Delivery Address</Text>
            </TouchableOpacity>
          }
          ListEmptyComponent={
            <EmptyState
              icon="map-pin"
              title="No Saved Addresses"
              subtitle="Save your home, office, or family delivery addresses for a seamless checkout experience."
              buttonText="Add Address"
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
                <Text style={styles.modalTitle}>Add Delivery Address</Text>
                <Text style={styles.modalSub}>Ship pure herbal remedies safely to your door</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.closeBtn}
              >
                <Icon name="close" size={16} color="#14231A" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Full Name *"
              placeholderTextColor="#8A9E92"
              value={fullName}
              onChangeText={setFullName}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="10-digit Phone Number *"
              placeholderTextColor="#8A9E92"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
            />

            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Door No, Building, Street Name, Area *"
              placeholderTextColor="#8A9E92"
              multiline
              value={street}
              onChangeText={setStreet}
            />

            <View style={styles.formRow}>
              <TextInput
                style={[styles.modalInput, { flex: 1, marginRight: 8 }]}
                placeholder="City / Town *"
                placeholderTextColor="#8A9E92"
                value={city}
                onChangeText={setCity}
              />
              <TextInput
                style={[styles.modalInput, { flex: 1 }]}
                placeholder="6-digit Pincode *"
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
                <Text style={styles.saveBtnText}>Save Address ›</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
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

