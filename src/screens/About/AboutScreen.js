/**
 * About Us Screen for Dharani Herbbals
 * Authentic company history, mission, values, and Siddha heritage
 * Primary source of truth: https://dharaniherbbals.in/about
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { Icon } from '../../components/common/Icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { COMPANY_STATS, CORE_VALUES } from '../../constants/config';
import { useLanguage } from '../../context/LanguageContext';

export const AboutScreen = ({ navigation }) => {
  const { isTamil } = useLanguage();

  return (
    <View style={styles.container}>
      <Header
        title={isTamil ? 'எங்களை பற்றி' : 'About Dharani Herbbals'}
        showBack={true}
        showLogo={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Luxury Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>TIME-HONORED SIDDHA HERITAGE</Text>
          </View>
          <Text style={styles.heroTitle}>Rooted in Nature,{'\n'}Crafted with Wisdom</Text>
          <Text style={styles.heroSubtitle}>
            Your trusted sanctuary for authentic botanical wellness and traditional herbal health formulations from Tamil Nadu.
          </Text>
        </View>

        {/* Company History & Mission Cards */}
        <View style={styles.cardsSection}>
          <View style={styles.infoCard}>
            <View style={styles.iconCircle}>
              <Icon name="shield" size={24} color="#1B4D3E" />
            </View>
            <Text style={styles.cardTitle}>Our Sacred Mission</Text>
            <Text style={styles.cardDesc}>
              To make traditional Siddha and Ayurvedic botanical wisdom accessible to every home through pure, ethical, and meticulously crafted wellness remedies.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEF9EE' }]}>
              <Icon name="sparkles" size={24} color="#C8963E" />
            </View>
            <Text style={styles.cardTitle}>Our Living Heritage</Text>
            <Text style={styles.cardDesc}>
              Beginning in 2004 with deep research into ancient Siddha manuscripts, Dharani Herbbals was formally established in 2007 at Punjai Puliampatti near Sathyamangalam, Tamil Nadu.
            </Text>
          </View>
        </View>

        {/* Statistics Grid */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsSectionTitle}>Our Journey in Numbers</Text>
          <View style={styles.statsGrid}>
            {COMPANY_STATS.map((stat, idx) => (
              <View key={`stat-ab-${idx}`} style={styles.statBox}>
                <Text style={styles.statNum}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Core Values */}
        <View style={styles.valuesSection}>
          <Text style={styles.sectionHeaderTitle}>Our Guiding Values</Text>
          <Text style={styles.sectionHeaderSub}>These enduring principles guide every herbal harvest and formulation.</Text>

          {CORE_VALUES.map((val, idx) => (
            <View key={`val-ab-${idx}`} style={styles.valueRow}>
              <View style={styles.valueIconBox}>
                <Icon name={val.icon} size={18} color="#1B4D3E" />
              </View>
              <View style={styles.valueContent}>
                <Text style={styles.valueTitle}>{val.title}</Text>
                <Text style={styles.valueDesc}>{val.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* What Makes Us Different */}
        <View style={styles.diffSection}>
          <Text style={styles.sectionHeaderTitle}>The Dharani Difference</Text>
          <Text style={styles.sectionHeaderSub}>Our unwavering dedication to purity and authenticity.</Text>

          <View style={styles.diffList}>
            <View style={styles.diffItem}>
              <Text style={styles.diffItemTitle}>🌿 100% Pure Botanical Ingredients</Text>
              <Text style={styles.diffItemDesc}>Formulated with wild-harvested herbs, zero harsh chemicals, and no artificial parabens.</Text>
            </View>

            <View style={styles.diffItem}>
              <Text style={styles.diffItemTitle}>👨‍⚕️ Traditional Siddha Validation</Text>
              <Text style={styles.diffItemDesc}>Crafted following time-tested formulations preserved across generations in Tamil Nadu.</Text>
            </View>

            <View style={styles.diffItem}>
              <Text style={styles.diffItemTitle}>✨ 600,000+ Families Served</Text>
              <Text style={styles.diffItemDesc}>Customer trust and wellness inspire every small-batch preparation we brew.</Text>
            </View>

            <View style={styles.diffItem}>
              <Text style={styles.diffItemTitle}>🌱 Sustainable & Ethical Harvest</Text>
              <Text style={styles.diffItemDesc}>Environmentally conscious sourcing directly from regional agricultural farmers.</Text>
            </View>
          </View>
        </View>

        {/* Call to action */}
        <View style={styles.ctaBox}>
          <Text style={styles.ctaTitle}>Experience Pure Natural Care</Text>
          <Text style={styles.ctaDesc}>
            Join thousands of satisfied patrons embracing authentic Dharani Herbbals in their daily wellness routine.
          </Text>

          <View style={styles.ctaBtnRow}>
            <TouchableOpacity
              style={styles.ctaPrimaryBtn}
              onPress={() => navigation.navigate('MainTabs', { screen: 'CategoriesTab' })}
              activeOpacity={0.88}
            >
              <Text style={styles.ctaPrimaryBtnText}>Explore Collections ›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ctaSecondaryBtn}
              onPress={() => navigation.navigate('ContactScreen')}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaSecondaryBtnText}>Contact Team</Text>
            </TouchableOpacity>
          </View>
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
  badge: {
    backgroundColor: 'rgba(235, 242, 237, 0.18)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeText: {
    color: '#FAF8F5',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.xs,
    lineHeight: 31,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#EBF2ED',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 320,
    marginTop: 4,
  },
  cardsSection: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF2ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#1B4D3E',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  cardDesc: {
    fontSize: 13,
    color: '#5A6E62',
    lineHeight: 19,
  },
  statsContainer: {
    backgroundColor: '#133E2B',
    padding: SPACING.xl,
    marginVertical: SPACING.sm,
  },
  statsSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.md,
    letterSpacing: 0.4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  statNum: {
    fontSize: 24,
    fontWeight: '900',
    color: '#C8963E',
  },
  statLabel: {
    fontSize: 11.5,
    color: '#EBF2ED',
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '500',
  },
  valuesSection: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.lg,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  sectionHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1B4D3E',
    letterSpacing: -0.2,
  },
  sectionHeaderSub: {
    fontSize: 12,
    color: '#5A6E62',
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    gap: 12,
  },
  valueIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EBF2ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  valueContent: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#14231A',
  },
  valueDesc: {
    fontSize: 12,
    color: '#5A6E62',
    marginTop: 2,
    lineHeight: 17,
  },
  diffSection: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.lg,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  diffList: {
    gap: SPACING.sm + 2,
  },
  diffItem: {
    backgroundColor: '#FAF8F5',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.06)',
  },
  diffItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1B4D3E',
    marginBottom: 3,
  },
  diffItemDesc: {
    fontSize: 12,
    color: '#5A6E62',
    lineHeight: 17,
  },
  ctaBox: {
    backgroundColor: '#1B4D3E',
    margin: SPACING.md,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  ctaDesc: {
    fontSize: 12.5,
    color: '#EBF2ED',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: SPACING.lg,
    maxWidth: 300,
  },
  ctaBtnRow: {
    flexDirection: 'row',
    gap: SPACING.sm + 4,
  },
  ctaPrimaryBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    ...SHADOWS.small,
  },
  ctaPrimaryBtnText: {
    color: '#1B4D3E',
    fontSize: 13,
    fontWeight: '800',
  },
  ctaSecondaryBtn: {
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
  },
  ctaSecondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default AboutScreen;

