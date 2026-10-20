/**
 * Order Tracking Screen for Dharani Herbbals
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { Icon } from '../../components/common/Icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { BUSINESS_INFO } from '../../constants/config';
import api from '../../services/api';

const TRACKING_STEPS = [
  {
    step: 1,
    title: 'Order Placed & Confirmed',
    desc: 'We received your order and the dispensary is assembling fresh herbal formulations.',
    time: 'Day 1',
  },
  {
    step: 2,
    title: 'Packed & Quality Verified',
    desc: 'Pure botanicals carefully inspected, sealed, and packed under strict hygiene standards.',
    time: 'Day 1 - 2',
  },
  {
    step: 3,
    title: 'Dispatched with Courier',
    desc: 'Handed over to carrier for express surface transport across India.',
    time: 'Day 2 - 3',
  },
  {
    step: 4,
    title: 'Out for Delivery',
    desc: 'Package is in transit with your local delivery agent for doorstep delivery.',
    time: 'Day 3 - 4',
  },
  {
    step: 5,
    title: 'Delivered Safely',
    desc: 'Package arrived safely at your doorstep.',
    time: 'Completed',
  },
];

export const OrderTrackingScreen = ({ route }) => {
  const { orderId = 'DH-Live' } = route?.params || {};
  const [currentStep, setCurrentStep] = useState(2); // Order packed
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (orderId) {
      setIsLoading(true);
      api.getOrderTracking(orderId)
        .then(res => {
          if (res) {
            setTrackingData(res);
            if (res.status === 'delivered') setCurrentStep(5);
            else if (res.status === 'shipped') setCurrentStep(3);
            else if (res.status === 'out_for_delivery') setCurrentStep(4);
            else setCurrentStep(2);
          }
        })
        .catch(e => {
          console.warn('Tracking fetch note:', e.message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [orderId]);

  const handleSupportWhatsApp = () => {
    Linking.openURL(
      `https://wa.me/${BUSINESS_INFO.WHATSAPP_NUMBER}?text=Hi%20Dharani%20Herbbals,%20I%20need%20tracking%20update%20for%20order%20%23${orderId}`
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Track Your Order" showBack={true} showCart={false} showLogo={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Order Header Card */}
        <View style={styles.orderHeaderCard}>
          <View>
            <Text style={styles.orderIdLabel}>Tracking Order</Text>
            <Text style={styles.orderIdValue}>#{orderId}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>
              {currentStep >= 5 ? 'DELIVERED' : currentStep >= 3 ? 'IN TRANSIT' : 'PROCESSING'}
            </Text>
          </View>
        </View>

        {/* Courier Details Card */}
        <View style={styles.courierCard}>
          <View style={styles.courierIconHalo}>
            <Icon name="truck" size={20} color="#1B4D3E" />
          </View>
          <View style={styles.courierInfo}>
            <Text style={styles.courierTitle}>Courier Service</Text>
            <Text style={styles.courierDesc}>
              {trackingData?.courier_name || 'Standard Express Surface Delivery (India Post / ST Courier)'}
            </Text>
            {trackingData?.tracking_number ? (
              <Text style={styles.awbText}>AWB / Docket: {trackingData.tracking_number}</Text>
            ) : null}
          </View>
        </View>

        {/* Visual Timeline Section */}
        <View style={styles.timelineSection}>
          <View style={styles.timelineHeaderRow}>
            <Text style={styles.timelineHeading}>Delivery Progress</Text>
            <View style={styles.timelineActivePill}>
              <Text style={styles.timelineActivePillText}>Step {currentStep} of 5</Text>
            </View>
          </View>

          {TRACKING_STEPS.map((stepItem, index) => {
            const isCompleted = stepItem.step <= currentStep;
            const isCurrent = stepItem.step === currentStep;

            return (
              <View key={`step-${stepItem.step}`} style={styles.stepRow}>
                {/* Step Marker & Vertical Line */}
                <View style={styles.markerColumn}>
                  <View
                    style={[
                      styles.circleMarker,
                      isCompleted ? styles.circleCompleted : styles.circlePending,
                      isCurrent ? styles.circleCurrent : null,
                    ]}
                  >
                    {isCompleted ? (
                      <Icon name="check" size={11} color="#FFFFFF" />
                    ) : (
                      <View style={styles.dot} />
                    )}
                  </View>
                  {index < TRACKING_STEPS.length - 1 ? (
                    <View
                      style={[
                        styles.verticalLine,
                        isCompleted ? styles.lineCompleted : styles.linePending,
                      ]}
                    />
                  ) : null}
                </View>

                {/* Step Details */}
                <View style={styles.stepDetails}>
                  <View style={styles.stepTitleRow}>
                    <Text
                      style={[
                        styles.stepTitle,
                        isCompleted ? styles.stepTitleCompleted : null,
                      ]}
                    >
                      {stepItem.title}
                    </Text>
                    <Text style={styles.stepTime}>{stepItem.time}</Text>
                  </View>
                  <Text style={styles.stepDesc}>{stepItem.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Need Help Card */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Have questions about your delivery?</Text>
          <Text style={styles.helpSubtitle}>
            Our herbal customer care team is available Mon-Sat, 9 AM - 7 PM to assist you.
          </Text>

          <TouchableOpacity
            style={styles.helpBtn}
            onPress={handleSupportWhatsApp}
            activeOpacity={0.85}
          >
            <Icon name="whatsapp" size={17} color="#FFFFFF" />
            <Text style={styles.helpBtnText}>Chat with Support on WhatsApp ›</Text>
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
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  orderHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  orderIdLabel: {
    fontSize: 11,
    color: '#8A9E92',
    textTransform: 'uppercase',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  orderIdValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1B4D3E',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#EBF2ED',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.12)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1B4D3E',
    letterSpacing: 0.5,
  },
  courierCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  courierIconHalo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EBF2ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courierInfo: {
    flex: 1,
  },
  courierTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#14231A',
  },
  courierDesc: {
    fontSize: 11.5,
    color: '#5A6E62',
    marginTop: 2,
    lineHeight: 16,
  },
  awbText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B4D3E',
    marginTop: 4,
  },
  timelineSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timelineHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B4D3E',
    letterSpacing: -0.2,
  },
  timelineActivePill: {
    backgroundColor: '#EBF2ED',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  timelineActivePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  stepRow: {
    flexDirection: 'row',
  },
  markerColumn: {
    alignItems: 'center',
    width: 28,
  },
  circleMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  circleCompleted: {
    backgroundColor: '#1B4D3E',
  },
  circlePending: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1.5,
    borderColor: 'rgba(27, 77, 62, 0.15)',
  },
  circleCurrent: {
    borderWidth: 3,
    borderColor: '#A8D5BA',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8A9E92',
  },
  verticalLine: {
    width: 2,
    height: 52,
    marginVertical: 2,
  },
  lineCompleted: {
    backgroundColor: '#1B4D3E',
  },
  linePending: {
    backgroundColor: 'rgba(27, 77, 62, 0.1)',
  },
  stepDetails: {
    flex: 1,
    marginLeft: SPACING.md,
    paddingBottom: 22,
  },
  stepTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A6E62',
  },
  stepTitleCompleted: {
    color: '#14231A',
    fontWeight: '800',
  },
  stepTime: {
    fontSize: 11,
    color: '#8A9E92',
    fontWeight: '600',
  },
  stepDesc: {
    fontSize: 11.5,
    color: '#5A6E62',
    marginTop: 2,
    lineHeight: 16,
  },
  helpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#14231A',
  },
  helpSubtitle: {
    fontSize: 12,
    color: '#5A6E62',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.md,
    lineHeight: 17,
  },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    gap: 8,
    ...SHADOWS.small,
  },
  helpBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

export default OrderTrackingScreen;

