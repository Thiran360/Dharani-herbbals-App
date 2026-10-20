/**
 * Policies Screen for Dharani Herbbals
 * Primary source of truth: https://dharaniherbbals.in/policies
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { SHIPPING_RULES } from '../../constants/config';
import { useLanguage } from '../../context/LanguageContext';

const TABS = [
  { id: 'shipping', label: 'Shipping & Delivery' },
  { id: 'returns', label: 'Returns & Refund' },
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'terms', label: 'Terms & Conditions' },
];

export const PoliciesScreen = () => {
  const { isTamil } = useLanguage();
  const [activeTab, setActiveTab] = useState('shipping');

  const renderContent = () => {
    switch (activeTab) {
      case 'shipping':
        return (
          <View style={styles.policyBlock}>
            <Text style={styles.policyTitle}>Shipping & Delivery Policy</Text>
            <Text style={styles.policyText}>
              At Dharani Herbbals, we ship authentic Siddha and herbal formulations across India with reliable courier partners (ST Courier, Professional Couriers, India Post).
            </Text>

            <View style={styles.tableBox}>
              <Text style={styles.tableTitle}>Domestic Shipping Rates & Thresholds:</Text>
              
              <View style={styles.tableRow}>
                <Text style={styles.tableColBold}>Tamil Nadu</Text>
                <Text style={styles.tableCol}>₹50 Flat • FREE on orders above ₹750 (Min. order ₹110)</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.tableColBold}>South States (Kerala, Karnataka, Andhra)</Text>
                <Text style={styles.tableCol}>₹150 Flat • FREE on orders above ₹1000 (Min. order ₹400)</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.tableColBold}>Rest of India (Telangana, Delhi, MH, etc.)</Text>
                <Text style={styles.tableCol}>₹200 - ₹250 Flat • FREE on orders above ₹1000 (Min. order ₹500)</Text>
              </View>
            </View>

            <Text style={styles.policySubheading}>Dispatch & Transit Timelines</Text>
            <Text style={styles.policyText}>
              All herbal orders are freshly dispatched within 24-48 business hours of confirmation. Delivery within Tamil Nadu typically takes 2-4 business days. Other states take approximately 4-7 business days depending on transit logistics.
            </Text>
          </View>
        );

      case 'returns':
        return (
          <View style={styles.policyBlock}>
            <Text style={styles.policyTitle}>Returns & Refund Policy</Text>
            <Text style={styles.policyText}>
              Because our formulations are natural herbal personal care, skincare, and food items, we adhere to strict hygiene and quality protocols.
            </Text>

            <Text style={styles.policySubheading}>Transit Damage & Defective Shipments</Text>
            <Text style={styles.policyText}>
              If your package arrives damaged, leaked, or incorrect, please notify us within 48 hours of delivery with photographic evidence via WhatsApp (+91 97881 22001) or email (info@dharaniherbbals.in).
            </Text>

            <Text style={styles.policySubheading}>Replacement & Refunds</Text>
            <Text style={styles.policyText}>
              Upon verified review, we will immediately dispatch a fresh replacement free of charge or initiate a full refund to your original payment method within 5-7 business days.
            </Text>
          </View>
        );

      case 'privacy':
        return (
          <View style={styles.policyBlock}>
            <Text style={styles.policyTitle}>Privacy Policy</Text>
            <Text style={styles.policyText}>
              Dharani Herbbals respects your privacy. We collect customer contact numbers, delivery addresses, and order records solely to process shipments, provide order tracking, and assist customer service.
            </Text>

            <Text style={styles.policySubheading}>Data Security</Text>
            <Text style={styles.policyText}>
              We never sell, rent, or trade your personal data to any third-party marketing companies. All payment processing is handled through secure, PCI-DSS compliant official gateways like Paytm.
            </Text>
          </View>
        );

      case 'terms':
        return (
          <View style={styles.policyBlock}>
            <Text style={styles.policyTitle}>Terms of Service</Text>
            <Text style={styles.policyText}>
              By using the Dharani Herbbals mobile application or placing orders, you agree to these terms of service.
            </Text>

            <Text style={styles.policySubheading}>Herbal Wellness Guidance</Text>
            <Text style={styles.policyText}>
              Our products are crafted following traditional Siddha and herbal heritage. While natural herbs promote holistic health, individuals with specific allergies or pregnant/nursing mothers should consult their physician before using concentrated herbs.
            </Text>

            <Text style={styles.policySubheading}>Governing Law</Text>
            <Text style={styles.policyText}>
              All transactions and disputes are governed under the legal jurisdiction of Sathyamangalam / Erode, Tamil Nadu, India.
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={isTamil ? 'கொள்கைகள்' : 'Policies & Terms'}
        showBack={true}
        showLogo={false}
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={`tab-${tab.id}`}
                style={[styles.tabButton, isActive ? styles.tabButtonActive : null]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.75}
              >
                <Text style={[styles.tabText, isActive ? styles.tabTextActive : null]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  tabsScroll: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
  },
  tabButtonActive: {
    backgroundColor: '#1B4D3E',
    borderColor: '#1B4D3E',
    ...SHADOWS.small,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A6E62',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  policyBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  policyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B4D3E',
    marginBottom: SPACING.md,
    letterSpacing: -0.2,
  },
  policySubheading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#14231A',
    marginTop: SPACING.lg,
    marginBottom: 6,
  },
  policyText: {
    fontSize: 13,
    color: '#5A6E62',
    lineHeight: 20,
    marginBottom: 6,
  },
  tableBox: {
    backgroundColor: '#EBF2ED',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.12)',
  },
  tableTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1B4D3E',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    marginVertical: 4,
  },
  tableColBold: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1B4D3E',
  },
  tableCol: {
    fontSize: 12,
    color: '#14231A',
    marginTop: 2,
    lineHeight: 16,
  },
});

export default PoliciesScreen;

