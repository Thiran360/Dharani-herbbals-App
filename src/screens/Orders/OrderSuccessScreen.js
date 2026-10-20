/**
 * Order Success Screen for Dharani Herbbals
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../components/common/Icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export const OrderSuccessScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    orderId = 'DH-918273',
    totalAmount = 0,
    paymentMethod = 'cod',
    shippingAddress = '',
    itemCount = 1,
  } = route?.params || {};

  const topPadding = Math.max(insets.top + 20, Platform.OS === 'android' ? 44 : 50);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: topPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Celebratory Botanical Halo */}
        <View style={styles.successHalo}>
          <View style={styles.successCircle}>
            <Icon name="check" size={38} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.title}>Order Confirmed!</Text>
        <Text style={styles.subtitle}>
          Thank you for trusting Dharani Herbbals. Your pure herbal formulations are being prepared with traditional Siddha care.
        </Text>

        {/* Order Details Receipt Card */}
        <View style={styles.orderCard}>
          <View style={styles.orderReceiptHeader}>
            <Text style={styles.receiptTitle}>Order Receipt</Text>
            <View style={styles.orderIdBadge}>
              <Text style={styles.orderIdBadgeText}>#{orderId}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.label}>Total Amount Paid/Due</Text>
            <Text style={styles.priceValue}>₹{parseFloat(totalAmount).toFixed(0)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Payment Method</Text>
            <Text style={styles.value}>
              {paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Formulations Selected</Text>
            <Text style={styles.value}>{itemCount} Product(s)</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>Shipping Destination:</Text>
            <Text style={styles.addressText}>{shippingAddress}</Text>
          </View>
        </View>

        {/* Delivery Timeline info */}
        <View style={styles.timelineCard}>
          <View style={styles.truckIconBadge}>
            <Icon name="truck" size={18} color="#1B4D3E" />
          </View>
          <View style={styles.timelineInfo}>
            <Text style={styles.timelineTitle}>Estimated Dispatch & Delivery</Text>
            <Text style={styles.timelineText}>
              2-4 business days for Tamil Nadu • 4-6 days for other states
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.trackBtn}
            onPress={() => navigation.navigate('OrderTrackingScreen', { orderId })}
            activeOpacity={0.88}
          >
            <Text style={styles.trackBtnText}>Track Order Live ›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
            activeOpacity={0.8}
          >
            <Text style={styles.homeBtnText}>Return to Shopping</Text>
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
    padding: SPACING.xl,
    alignItems: 'center',
    paddingBottom: SPACING.hero,
  },
  successHalo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EBF2ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'rgba(27, 77, 62, 0.15)',
  },
  successCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#1B4D3E',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1B4D3E',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#5A6E62',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: SPACING.xl,
    maxWidth: 320,
  },
  orderCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  orderReceiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  receiptTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#14231A',
  },
  orderIdBadge: {
    backgroundColor: '#EBF2ED',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  orderIdBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1B4D3E',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  label: {
    fontSize: 13,
    color: '#5A6E62',
  },
  value: {
    fontSize: 13,
    color: '#14231A',
    fontWeight: '700',
  },
  priceValue: {
    fontSize: 17,
    color: '#1B4D3E',
    fontWeight: '900',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(27, 77, 62, 0.08)',
    marginVertical: 10,
  },
  addressBlock: {
    marginTop: 2,
  },
  addressLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#8A9E92',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  addressText: {
    fontSize: 12.5,
    color: '#14231A',
    marginTop: 3,
    lineHeight: 17,
    fontWeight: '500',
  },
  timelineCard: {
    width: '100%',
    backgroundColor: '#EBF2ED',
    borderRadius: RADIUS.xl,
    padding: SPACING.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.12)',
    marginBottom: SPACING.xl,
  },
  truckIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineInfo: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1B4D3E',
  },
  timelineText: {
    fontSize: 11.5,
    color: '#5A6E62',
    marginTop: 2,
    lineHeight: 15,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  trackBtn: {
    backgroundColor: '#1B4D3E',
    paddingVertical: 15,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  trackBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  homeBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#1B4D3E',
    paddingVertical: 14,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  homeBtnText: {
    color: '#1B4D3E',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default OrderSuccessScreen;

