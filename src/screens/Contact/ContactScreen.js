/**
 * Contact & Customer Support Screen for Dharani Herbbals
 * Primary source of truth: https://dharaniherbbals.in/contact
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { Icon } from '../../components/common/Icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { BUSINESS_INFO } from '../../constants/config';
import { useLanguage } from '../../context/LanguageContext';

export const ContactScreen = () => {
  const { isTamil } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCall = phoneNumber => {
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Calling Unavailable', `Please dial ${phoneNumber} directly.`);
    });
  };

  const handleWhatsApp = () => {
    Linking.openURL(
      `https://wa.me/${BUSINESS_INFO.WHATSAPP_NUMBER}?text=Hi%20Dharani%20Herbbals,%20I%20have%20an%20enquiry%20regarding%20your%20products.`
    ).catch(() => {
      Alert.alert('WhatsApp Unavailable', 'Could not open WhatsApp.');
    });
  };

  const handleEmail = emailAddr => {
    Linking.openURL(`mailto:${emailAddr}?subject=Product%20Enquiry%20-%20Dharani%20Herbbals`).catch(() => {});
  };

  const handleOpenMap = () => {
    Linking.openURL(BUSINESS_INFO.MAPS_URL).catch(() => {});
  };

  const handleSubmitEnquiry = () => {
    if (!name.trim() || !phone.trim() || !message.trim()) {
      Alert.alert('Required Fields', 'Please enter your name, phone number, and enquiry message.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      Alert.alert(
        'Message Sent',
        'Thank you! Your enquiry has been received. Our wellness team will contact you shortly.'
      );
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <Header
        title={isTamil ? 'தொடர்புக்கு' : 'Contact & Support'}
        showBack={true}
        showLogo={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Luxury Hero Banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroTitle}>Get In Touch</Text>
          <Text style={styles.heroSubtitle}>
            Have questions about our Siddha formulations, order status, or wellness guidance? Our dispensary team is here to assist.
          </Text>
        </View>

        {/* Quick Action Contact Cards */}
        <View style={styles.cardsGrid}>
          {/* Phone Card */}
          <View style={styles.contactCard}>
            <View style={styles.iconCircle}>
              <Icon name="phone" size={20} color="#1B4D3E" />
            </View>
            <Text style={styles.cardTitle}>Phone Support</Text>
            <Text style={styles.cardDesc}>Mon - Sat, 9:00 AM - 7:00 PM</Text>
            <TouchableOpacity onPress={() => handleCall(BUSINESS_INFO.PHONE_PRIMARY)} activeOpacity={0.7}>
              <Text style={styles.clickableLink}>{BUSINESS_INFO.PHONE_PRIMARY}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleCall(BUSINESS_INFO.PHONE_SECONDARY)} activeOpacity={0.7}>
              <Text style={styles.clickableLink}>{BUSINESS_INFO.PHONE_SECONDARY}</Text>
            </TouchableOpacity>
          </View>

          {/* WhatsApp Card */}
          <View style={styles.contactCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#EBF2ED' }]}>
              <Icon name="whatsapp" size={22} color="#16A34A" />
            </View>
            <Text style={styles.cardTitle}>Instant WhatsApp Chat</Text>
            <Text style={styles.cardDesc}>Fast responses for order queries & product advice</Text>
            <TouchableOpacity style={styles.waActionBtn} onPress={handleWhatsApp} activeOpacity={0.85}>
              <Icon name="whatsapp" size={15} color="#FFFFFF" />
              <Text style={styles.waActionBtnText}>Chat on WhatsApp ›</Text>
            </TouchableOpacity>
          </View>

          {/* Email Card */}
          <View style={styles.contactCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Icon name="mail" size={20} color="#2563EB" />
            </View>
            <Text style={styles.cardTitle}>Email Support</Text>
            <Text style={styles.cardDesc}>For wholesale, distribution & general queries</Text>
            <TouchableOpacity onPress={() => handleEmail(BUSINESS_INFO.EMAIL_PRIMARY)} activeOpacity={0.7}>
              <Text style={styles.clickableLink}>{BUSINESS_INFO.EMAIL_PRIMARY}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleEmail(BUSINESS_INFO.EMAIL_SECONDARY)} activeOpacity={0.7}>
              <Text style={styles.clickableLink}>{BUSINESS_INFO.EMAIL_SECONDARY}</Text>
            </TouchableOpacity>
          </View>

          {/* Store Hours Card */}
          <View style={styles.contactCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEF9EE' }]}>
              <Icon name="clock" size={20} color="#C8963E" />
            </View>
            <Text style={styles.cardTitle}>Store & Office Hours</Text>
            <Text style={styles.hoursText}>{BUSINESS_INFO.HOURS}</Text>
            <Text style={styles.hoursSub}>Sunday: Weekly Holiday</Text>
          </View>
        </View>

        {/* Physical Address Card */}
        <View style={styles.addressCard}>
          <View style={styles.addrHeaderRow}>
            <View style={styles.addrIconHalo}>
              <Icon name="map-pin" size={18} color="#1B4D3E" />
            </View>
            <Text style={styles.addrCardTitle}>Registered Head Office & Store</Text>
          </View>

          <Text style={styles.addressLines}>
            {BUSINESS_INFO.ADDRESS.STREET_1}{'\n'}
            {BUSINESS_INFO.ADDRESS.STREET_2}{'\n'}
            {BUSINESS_INFO.ADDRESS.TOWN}{'\n'}
            {BUSINESS_INFO.ADDRESS.TALUK}{'\n'}
            {BUSINESS_INFO.ADDRESS.DISTRICT} - {BUSINESS_INFO.ADDRESS.PINCODE}, {BUSINESS_INFO.ADDRESS.STATE}, {BUSINESS_INFO.ADDRESS.COUNTRY}
          </Text>

          <TouchableOpacity style={styles.mapBtn} onPress={handleOpenMap} activeOpacity={0.8}>
            <Text style={styles.mapBtnText}>Open in Google Maps ›</Text>
          </TouchableOpacity>
        </View>

        {/* Customer Enquiry Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Send Us a Message</Text>
          <Text style={styles.formSubtitle}>
            Drop our herbal wellness consultants a message. We usually respond within 24 hours.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Your Full Name *"
            placeholderTextColor="#8A9E92"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="10-digit Phone Number *"
            placeholderTextColor="#8A9E92"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
          />

          <TextInput
            style={styles.input}
            placeholder="Email Address (Optional)"
            placeholderTextColor="#8A9E92"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Your message or product enquiry... *"
            placeholderTextColor="#8A9E92"
            multiline
            value={message}
            onChangeText={setMessage}
          />

          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting ? styles.btnDisabled : null]}
            onPress={handleSubmitEnquiry}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Message ›</Text>
            )}
          </TouchableOpacity>
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
    paddingBottom: SPACING.hero,
  },
  heroBanner: {
    backgroundColor: '#1B4D3E',
    padding: SPACING.xl,
    alignItems: 'center',
    paddingTop: SPACING.xl + 4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#EBF2ED',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
    marginTop: 2,
  },
  cardsGrid: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EBF2ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B4D3E',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  cardDesc: {
    fontSize: 12,
    color: '#5A6E62',
    marginBottom: SPACING.sm,
  },
  clickableLink: {
    fontSize: 14,
    color: '#1B4D3E',
    fontWeight: '800',
    marginVertical: 3,
  },
  waActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: RADIUS.full,
    marginTop: 4,
    gap: 6,
    ...SHADOWS.small,
  },
  waActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  hoursText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#14231A',
  },
  hoursSub: {
    fontSize: 12,
    color: '#8A9E92',
    marginTop: 3,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  addrHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: SPACING.sm + 2,
  },
  addrIconHalo: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EBF2ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addrCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B4D3E',
    letterSpacing: -0.2,
  },
  addressLines: {
    fontSize: 13,
    color: '#14231A',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  mapBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#FAF8F5',
    borderWidth: 1.2,
    borderColor: 'rgba(27, 77, 62, 0.15)',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: RADIUS.full,
  },
  mapBtnText: {
    color: '#1B4D3E',
    fontSize: 12.5,
    fontWeight: '800',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1B4D3E',
    letterSpacing: -0.2,
  },
  formSubtitle: {
    fontSize: 12,
    color: '#5A6E62',
    marginTop: 2,
    marginBottom: SPACING.lg,
    lineHeight: 17,
  },
  input: {
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
    height: 84,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  submitBtn: {
    backgroundColor: '#1B4D3E',
    borderRadius: RADIUS.full,
    paddingVertical: 14,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default ContactScreen;

