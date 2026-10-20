/**
 * Home Screen for Dharani Herbbals
 * Luxury botanical mobile shopping experience with smooth entrance animations
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  StatusBar,
  Linking,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components/common/Header';
import { BannerSlider } from '../../components/common/BannerSlider';
import { ProductCard } from '../../components/common/ProductCard';
import { CategoryCard } from '../../components/common/CategoryCard';
import { Icon } from '../../components/common/Icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { BUSINESS_INFO, COMPANY_STATS, CORE_VALUES } from '../../constants/config';
import { STATIC_CATEGORIES } from '../../constants/categories';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

export const HomeScreen = () => {
  const navigation = useNavigation();
  const { isTamil } = useLanguage();

  const [categories, setCategories] = useState(STATIC_CATEGORIES);
  const [mostLoved, setMostLoved] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Smooth content entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateYAnim]);

  // Seamless Left-to-Right Continuous Announcement Marquee
  const [announcementContentWidth, setAnnouncementContentWidth] = useState(0);
  const marqueeAnim = useRef(new Animated.Value(0)).current;

  const announcementMsg = isTamil
    ? 'தமிழ்நாட்டிற்குள் ₹750க்கு மேல் இலவச டெலிவரி!'
    : 'FREE DELIVERY ON ORDERS ABOVE 750 ACROSS TAMIL NADU';

  useEffect(() => {
    if (announcementContentWidth <= 0) return;
    marqueeAnim.setValue(0);
    const marqueeLoop = Animated.loop(
      Animated.timing(marqueeAnim, {
        toValue: 1,
        duration: Math.max(7000, announcementContentWidth * 25),
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    marqueeLoop.start();
    return () => marqueeLoop.stop();
  }, [announcementContentWidth, isTamil]);

  const marqueeTranslateX = marqueeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-announcementContentWidth, 0], // Smooth, continuous movement from left to right
  });

  const loadHomeData = useCallback(async () => {
    try {
      const [cats, loved, prods] = await Promise.allSettled([
        api.getCategories(),
        api.getMostLoved(),
        api.getProducts(),
      ]);

      if (cats.status === 'fulfilled' && Array.isArray(cats.value)) {
        setCategories(cats.value);
      }

      if (loved.status === 'fulfilled' && Array.isArray(loved.value) && loved.value.length > 0) {
        setMostLoved(loved.value);
      }

      if (prods.status === 'fulfilled' && Array.isArray(prods.value)) {
        setFeaturedProducts(prods.value.slice(0, 10));
        if (loved.status !== 'fulfilled' || loved.value.length === 0) {
          setMostLoved(prods.value.slice(0, 8));
        }
      }
    } catch (e) {
      console.warn('Failed to load home data:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadHomeData();
  };

  const handleCall = () => {
    Linking.openURL(`tel:${BUSINESS_INFO.PHONE_PRIMARY}`).catch(() => {});
  };

  const handleWhatsApp = () => {
    Linking.openURL(
      `https://wa.me/${BUSINESS_INFO.WHATSAPP_NUMBER}?text=Hello%20Dharani%20Herbbals,%20I%20have%20an%20enquiry.`
    ).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          }}
        >
          {/* Announcement Ribbon with Continuous Left-to-Right Marquee */}
          <View style={styles.announcementBar}>
            <Animated.View
              style={[
                styles.marqueeTrack,
                announcementContentWidth > 0 ? { transform: [{ translateX: marqueeTranslateX }] } : null,
              ]}
            >
              <View
                style={styles.announcementContent}
                onLayout={e => {
                  const w = e.nativeEvent.layout.width;
                  if (w > 0 && Math.abs(w - announcementContentWidth) > 1) {
                    setAnnouncementContentWidth(w);
                  }
                }}
              >
                <Icon name="truck" size={13} color="#D4A373" />
                <Text style={styles.announcementText}>{announcementMsg}</Text>
              </View>

              <View style={styles.announcementContent}>
                <Icon name="truck" size={13} color="#D4A373" />
                <Text style={styles.announcementText}>{announcementMsg}</Text>
              </View>

              <View style={styles.announcementContent}>
                <Icon name="truck" size={13} color="#D4A373" />
                <Text style={styles.announcementText}>{announcementMsg}</Text>
              </View>

              <View style={styles.announcementContent}>
                <Icon name="truck" size={13} color="#D4A373" />
                <Text style={styles.announcementText}>{announcementMsg}</Text>
              </View>
            </Animated.View>
          </View>

          {/* Quick Search Bar Trigger */}
          <TouchableOpacity
            style={styles.searchBarTrigger}
            onPress={() => navigation.navigate('MainTabs', { screen: 'SearchTab' })}
            activeOpacity={0.88}
          >
            <View style={styles.searchIconBox}>
              <Icon name="search" size={17} color={COLORS.primary} />
            </View>
            <Text style={styles.searchPlaceholder}>
              {isTamil
                ? 'மூலிகை தயாரிப்புகளைத் தேடுங்கள்...'
                : 'Search 270+ authentic herbal formulations...'}
            </Text>
            <View style={styles.searchBadge}>
              <Text style={styles.searchBadgeText}>Filter</Text>
            </View>
          </TouchableOpacity>

          {/* Hero Banner Carousel */}
          <BannerSlider />

          {/* Shop By Category Section */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>
                {isTamil ? 'பிரிவுகள் வாரியாக வாங்குக' : 'Shop by Category'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {isTamil
                  ? 'பாரம்பரிய மூலிகை தொகுப்புகள்'
                  : 'Authentic Siddha & Ayurvedic Collections'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => navigation.navigate('MainTabs', { screen: 'CategoriesTab' })}
              activeOpacity={0.75}
            >
              <Text style={styles.viewAllText}>
                {isTamil ? 'அனைத்தும் ›' : 'View All ›'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          >
            {categories.map(cat => (
              <CategoryCard key={`cat-${cat.id}`} category={cat} variant="circle" />
            ))}
          </ScrollView>

          {/* Most Loved Picks (Top Rated Products) */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleBlock}>
              <View style={styles.badgeRow}>
                <View style={styles.sectionBadge}>
                  <Icon name="star" size={10} color="#B45309" />
                  <Text style={styles.sectionBadgeText}>TOP RATED PICKS</Text>
                </View>
              </View>
              <Text style={styles.sectionTitle}>
                {isTamil ? 'வாடிக்கையாளர்களின் விருப்பங்கள்' : 'Our Most Loved Picks'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {isTamil
                  ? 'அதிகம் விரும்பப்படும் இயற்கை தயாரிப்புகள்'
                  : 'Time-tested herbal remedies with proven results'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => navigation.navigate('ProductListScreen', { title: 'Most Loved Picks' })}
              activeOpacity={0.75}
            >
              <Text style={styles.viewAllText}>
                {isTamil ? 'அனைத்தும் ›' : 'See All ›'}
              </Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalProductsList}
            >
              {mostLoved.map(prod => (
                <ProductCard
                  key={`loved-${prod.id}`}
                  product={prod}
                  width={172}
                  style={styles.horizontalCard}
                />
              ))}
            </ScrollView>
          )}

          {/* Highlight Brand Story Card */}
          <View style={styles.brandStoryCard}>
            <View style={styles.storyDecorCircle} />
            <View style={styles.storyHeaderRow}>
              <View style={styles.storyBadge}>
                <Text style={styles.storyBadgeText}>HERITAGE SINCE 2004</Text>
              </View>
              <Text style={styles.storyLocation}>Punjai Puliampatti, TN</Text>
            </View>
            <Text style={styles.storyTitle}>Rooted in Siddha Heritage</Text>
            <Text style={styles.storyDesc}>
              Our journey began in 2004 with deep research into timeless Siddha and Ayurvedic botanical wisdom, formally establishing Dharani Herbbals in 2007 to deliver chemical-free natural living to every home.
            </Text>
            <TouchableOpacity
              style={styles.storyButton}
              onPress={() => navigation.navigate('AboutScreen')}
              activeOpacity={0.88}
            >
              <Text style={styles.storyButtonText}>Read Our Heritage Story ›</Text>
            </TouchableOpacity>
          </View>

          {/* Featured Products Grid */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>
                {isTamil ? 'சிறப்பு தயாரிப்புகள்' : 'Featured Formulations'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {isTamil
                  ? '100% தூய இயற்கை ஊட்டச்சத்து'
                  : '100% Naturally Derived Ayurvedic Care'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => navigation.navigate('ProductListScreen', { title: 'All Products' })}
              activeOpacity={0.75}
            >
              <Text style={styles.viewAllText}>
                {isTamil ? 'அனைத்தும் ›' : 'View All ›'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.productsGrid}>
            {featuredProducts.slice(0, 6).map(prod => (
              <ProductCard
                key={`feat-${prod.id}`}
                product={prod}
                style={styles.gridProductCard}
              />
            ))}
          </View>

          {/* Why Choose Dharani Herbbals / Core Values Bento */}
          <View style={styles.valuesSection}>
            <View style={styles.valuesHeadingBlock}>
              <Text style={styles.valuesPillBadge}>WHY DHARANI HERBBALS</Text>
              <Text style={styles.valuesTitle}>Crafted with Purity & Care</Text>
              <Text style={styles.valuesSubtitle}>
                Authentic Siddha standards for your family's health
              </Text>
            </View>

            <View style={styles.valuesGrid}>
              {CORE_VALUES.map((val, idx) => (
                <View key={`val-${idx}`} style={styles.valueCard}>
                  <View style={styles.valueIconCircle}>
                    <Icon name={val.icon} size={22} color={COLORS.primary} />
                  </View>
                  <Text style={styles.valueCardTitle}>
                    {isTamil && val.titleTa ? val.titleTa : val.title}
                  </Text>
                  <Text style={styles.valueCardDesc}>{val.description}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Authentic Company Statistics */}
          <View style={styles.statsSection}>
            <View style={styles.statsDecorGlow} />
            <Text style={styles.statsSectionHeading}>Two Decades of Trusted Healing</Text>
            <View style={styles.statsGrid}>
              {COMPANY_STATS.map((stat, idx) => (
                <View key={`stat-${idx}`} style={styles.statBox}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>
                    {isTamil && stat.labelTa ? stat.labelTa : stat.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Customer Support Card */}
          <View style={styles.supportCard}>
            <View style={styles.supportIconCircle}>
              <Icon name="phone" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.supportTitle}>Need Help Choosing Herbs?</Text>
            <Text style={styles.supportSubtitle}>
              Our herbal wellness specialists are ready to guide you with personalized recommendations.
            </Text>

            <View style={styles.supportButtonsRow}>
              <TouchableOpacity
                style={[styles.supportBtn, styles.callBtn]}
                onPress={handleCall}
                activeOpacity={0.85}
              >
                <Icon name="phone" size={15} color="#FFFFFF" />
                <Text style={styles.supportBtnText}>Call Specialist</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.supportBtn, styles.waBtn]}
                onPress={handleWhatsApp}
                activeOpacity={0.85}
              >
                <Icon name="whatsapp" size={16} color="#FFFFFF" />
                <Text style={styles.supportBtnText}>WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Info */}
          <View style={styles.footerContainer}>
            <View style={styles.footerBrandRow}>
              <Image
                source={require('../../assets/brand_logotype_horizontal.png')}
                style={styles.footerBrandLogo}
                resizeMode="contain"
              />
              <Text style={styles.footerTagline}>Traditional Siddha Wisdom Since 2004</Text>
            </View>
            <Text style={styles.footerAddress}>
              {BUSINESS_INFO.ADDRESS.FULL}
            </Text>
            <Text style={styles.footerCopyright}>
              © {new Date().getFullYear()} Dharani Herbbals. All rights reserved.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5', // Warm ivory natural background
  },
  announcementBar: {
    backgroundColor: '#0D2818', // Deep forest pine (preserved)
    paddingVertical: 7,
    overflow: 'hidden',
    height: 31,
    justifyContent: 'center',
  },
  marqueeTrack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  announcementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 28,
  },
  announcementText: {
    color: '#FAF8F5',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  searchBarTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    height: 48,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.1)',
    ...SHADOWS.small,
  },
  searchIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F7F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchPlaceholder: {
    marginLeft: SPACING.sm,
    fontSize: 13,
    color: '#5A6E62',
    flex: 1,
    letterSpacing: 0.1,
  },
  searchBadge: {
    backgroundColor: '#EBF2ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  searchBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1B4D3E',
    letterSpacing: 0.3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  sectionTitleBlock: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  badgeRow: {
    marginBottom: 4,
  },
  sectionBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: RADIUS.xs,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionBadgeText: {
    color: '#B45309',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#133E2B',
    letterSpacing: 0.1,
  },
  sectionSubtitle: {
    fontSize: 11.5,
    color: '#5A6E62',
    marginTop: 2,
  },
  viewAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1B4D3E',
    letterSpacing: 0.2,
  },
  categoriesList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xs,
  },
  horizontalProductsList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  horizontalCard: {
    marginRight: SPACING.md,
  },
  loadingContainer: {
    height: 190,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandStoryCard: {
    backgroundColor: '#0D2818',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.35)', // Warm gold accent
    ...SHADOWS.medium,
  },
  storyDecorCircle: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(212, 163, 115, 0.08)',
  },
  storyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  storyBadge: {
    backgroundColor: 'rgba(212, 163, 115, 0.2)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: '#D4A373',
  },
  storyBadgeText: {
    color: '#D4A373',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  storyLocation: {
    color: '#A3B899',
    fontSize: 11,
    fontWeight: '600',
  },
  storyTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FAF8F5',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  storyDesc: {
    fontSize: 12.5,
    color: '#C5D8C7',
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  storyButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: RADIUS.full,
  },
  storyButtonText: {
    color: '#133E2B',
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
  },
  gridProductCard: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  valuesSection: {
    backgroundColor: '#FFFFFF',
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.06)',
  },
  valuesHeadingBlock: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  valuesPillBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#5B8266',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  valuesTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#133E2B',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  valuesSubtitle: {
    fontSize: 12,
    color: '#5A6E62',
    textAlign: 'center',
    marginTop: 2,
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  valueCard: {
    width: '48%',
    backgroundColor: '#FAF8F5',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.06)',
  },
  valueIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EBF2ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  valueCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#14231A',
    textAlign: 'center',
    marginBottom: 4,
  },
  valueCardDesc: {
    fontSize: 11,
    color: '#5A6E62',
    textAlign: 'center',
    lineHeight: 15,
  },
  statsSection: {
    backgroundColor: '#0D2818',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    position: 'relative',
    overflow: 'hidden',
  },
  statsDecorGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(212, 163, 115, 0.06)',
  },
  statsSectionHeading: {
    color: '#A3B899',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  statValue: {
    fontSize: 27,
    fontWeight: '900',
    color: '#D4A373', // warm champagne gold
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 11,
    color: '#C5D8C7',
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  supportCard: {
    backgroundColor: '#FFFFFF',
    margin: SPACING.lg,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  supportIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF2ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  supportTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#133E2B',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  supportSubtitle: {
    fontSize: 12,
    color: '#5A6E62',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.md,
    maxWidth: 290,
    lineHeight: 17,
  },
  supportButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    gap: 7,
  },
  callBtn: {
    backgroundColor: '#1B4D3E',
  },
  waBtn: {
    backgroundColor: '#16A34A',
  },
  supportBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  footerContainer: {
    padding: SPACING.xl,
    backgroundColor: '#F3EFE8', // warm sand beige
    alignItems: 'center',
    marginTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(27, 77, 62, 0.06)',
  },
  footerBrandRow: {
    alignItems: 'center',
    marginBottom: 6,
  },
  footerBrandLogo: {
    height: 20,
    width: 170,
    tintColor: '#133E2B',
    marginBottom: 4,
  },
  footerTagline: {
    fontSize: 11,
    color: '#5B8266',
    fontWeight: '600',
    marginTop: 1,
  },
  footerAddress: {
    fontSize: 11,
    color: '#5A6E62',
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 300,
    marginBottom: SPACING.sm,
  },
  footerCopyright: {
    fontSize: 10,
    color: '#8F9F94',
  },
});

export default HomeScreen;

