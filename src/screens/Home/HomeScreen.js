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
  Alert,
  Platform,
  FlatList,
  useWindowDimensions,
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
import { prefetchImages } from '../../utils/imageOptimizer';
import api from '../../services/api';

export const HomeScreen = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const horizontalCardWidth = Math.min(176, Math.max(148, Math.round(width * 0.44)));
  const isTablet = width >= 640;
  const featuredCardWidth = isTablet
    ? Math.floor((width - SPACING.lg * 2 - 24) / 3)
    : Math.floor((width - SPACING.lg * 2 - 12) / 2);
  const { isTamil, t } = useLanguage();

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

  const announcementMsg = t('announcementDelivery');

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
  }, [announcementContentWidth, isTamil, marqueeAnim]);

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

      // Prefetch images for top visible products on Home screen
      const lovedArr = loved.status === 'fulfilled' && Array.isArray(loved.value) ? loved.value : [];
      const prodsArr = prods.status === 'fulfilled' && Array.isArray(prods.value) ? prods.value : [];
      prefetchImages([
        ...lovedArr.slice(0, 6).map(p => p.image),
        ...prodsArr.slice(0, 6).map(p => p.image),
      ], 12);
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

  const handleCall = async () => {
    const rawNumber = BUSINESS_INFO.PHONE_PRIMARY || '+919788122001';
    const cleanNumber = rawNumber.replace(/[^0-9+]/g, '');
    const phoneUrl = `tel:${cleanNumber}`;
    try {
      await Linking.openURL(phoneUrl);
    } catch {
      Alert.alert(
        isTamil ? 'அழைக்க' : 'Call Specialist',
        `${t('dialerUnavailable')}${rawNumber}`
      );
    }
  };

  const handleWhatsApp = async () => {
    const waNumber = (BUSINESS_INFO.WHATSAPP_NUMBER || '919788122001').replace(/[^0-9]/g, '');
    const msg = isTamil
      ? 'வணக்கம் தரணி ஹெர்பல்ஸ், தயாரிப்புகள் குறித்த வழிகாட்டுதல் தேவைப்படுகிறது.'
      : 'Hello Dharani Herbbals, I have an enquiry about your herbal products.';
    const appUrl = `whatsapp://send?phone=${waNumber}&text=${encodeURIComponent(msg)}`;
    const webUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

    try {
      await Linking.openURL(appUrl);
    } catch {
      try {
        await Linking.openURL(webUrl);
      } catch {
        Alert.alert('WhatsApp', t('whatsappUnavailable'));
      }
    }
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

          {/* Water Glacier Frosted Glass Search Bar */}
          <TouchableOpacity
            style={styles.searchBarTrigger}
            onPress={() => navigation.navigate('MainTabs', { screen: 'SearchTab' })}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Search natural herbal oils, powders and teas"
          >
            {/* Subtle Glacier Top Gloss Line */}
            <View style={styles.glacierGlossHighlight} pointerEvents="none" />

            {/* Mint-Green Circular Search Icon Badge */}
            <View style={styles.searchIconBox}>
              <Icon name="search" size={13.5} color="#1B4D3E" />
            </View>

            {/* Full-width Search Placeholder Text */}
            <Text style={styles.searchPlaceholder} numberOfLines={1}>
              {t('searchPlaceholder')}
            </Text>
          </TouchableOpacity>

          {/* Hero Banner Carousel */}
          <BannerSlider />

          {/* Shop By Category Section */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>
                {t('topCategories')}
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
                {t('viewAll')}
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
                  <Text style={styles.sectionBadgeText}>{t('topRatedBadge')}</Text>
                </View>
              </View>
              <Text style={styles.sectionTitle}>
                {t('mostLovedPicks')}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {t('mostLovedSubtitle')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => navigation.navigate('ProductListScreen', { title: t('mostLovedPicks') })}
              activeOpacity={0.75}
            >
              <Text style={styles.viewAllText}>
                {t('seeAll')}
              </Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <FlatList
              horizontal
              data={mostLoved}
              keyExtractor={item => `loved-${item.id}`}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  width={horizontalCardWidth}
                  style={styles.horizontalCard}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalProductsList}
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={3}
              removeClippedSubviews={Platform.OS === 'android'}
            />
          )}

          {/* Highlight Brand Story Card */}
          <View style={styles.brandStoryCard}>
            <View style={styles.storyDecorCircle} />
            <View style={styles.storyHeaderRow}>
              <View style={styles.storyBadge}>
                <Text style={styles.storyBadgeText}>{t('heritageSince2004')}</Text>
              </View>
              <Text style={styles.storyLocation}>{t('storyLocation')}</Text>
            </View>
            <Text style={styles.storyTitle}>{t('rootedInHeritage')}</Text>
            <Text style={styles.storyDesc}>
              {t('storyDesc')}
            </Text>
            <TouchableOpacity
              style={styles.storyButton}
              onPress={() => navigation.navigate('AboutScreen')}
              activeOpacity={0.88}
            >
              <Text style={styles.storyButtonText}>{t('readHeritageStory')}</Text>
            </TouchableOpacity>
          </View>

          {/* Featured Products Grid */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>
                {t('featuredFormulations')}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {t('featuredSubtitle')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => navigation.navigate('ProductListScreen', { title: t('featuredFormulations') })}
              activeOpacity={0.75}
            >
              <Text style={styles.viewAllText}>
                {t('viewAll')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.productsGrid}>
            {featuredProducts.slice(0, 6).map(prod => (
              <View
                key={`feat-${prod.id}`}
                style={[styles.gridProductCard, { width: featuredCardWidth }]}
              >
                <ProductCard product={prod} />
              </View>
            ))}
          </View>

          {/* Why Choose Dharani Herbbals / Core Values Bento */}
          <View style={styles.valuesSection}>
            <View style={styles.valuesHeadingBlock}>
              <Text style={styles.valuesPillBadge}>{t('whyDharaniPill')}</Text>
              <Text style={styles.valuesTitle}>{t('whyDharaniTitle')}</Text>
              <Text style={styles.valuesSubtitle}>
                {t('whyDharaniSubtitle')}
              </Text>
            </View>

            <View style={styles.valuesGrid}>
              {CORE_VALUES.map((val, idx) => (
                <View key={`val-${idx}`} style={styles.valueCard}>
                  <View style={styles.valueIconCircle}>
                    <Icon name={val.icon} size={24} color="#1B4D3E" />
                  </View>
                  <Text style={styles.valueCardTitle}>
                    {isTamil && val.titleTa ? val.titleTa : val.title}
                  </Text>
                  <Text style={styles.valueCardDesc}>
                    {isTamil && val.descriptionTa ? val.descriptionTa : val.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Authentic Company Statistics */}
          <View style={styles.statsSection}>
            <View style={styles.statsDecorGlow} />
            <Text style={styles.statsSectionHeading}>{t('twoDecades')}</Text>
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
              <Icon name="phone" size={24} color="#1B4D3E" />
            </View>
            <Text style={styles.supportTitle}>{t('needHelp')}</Text>
            <Text style={styles.supportSubtitle}>
              {t('needHelpSubtitle')}
            </Text>

            <View style={styles.supportButtonsRow}>
              <TouchableOpacity
                style={[styles.supportBtn, styles.callBtn]}
                onPress={handleCall}
                activeOpacity={0.85}
              >
                <Icon name="phone" size={17} color="#FFFFFF" />
                <Text style={styles.supportBtnText}>{t('callSpecialist')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.supportBtn, styles.waBtn]}
                onPress={handleWhatsApp}
                activeOpacity={0.85}
              >
                <Icon name="whatsapp" size={19} color="#FFFFFF" />
                <Text style={styles.supportBtnText}>{t('whatsapp')}</Text>
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
              <Text style={styles.footerTagline}>{t('footerHeritageTag')}</Text>
            </View>
            <Text style={styles.footerAddress}>
              {BUSINESS_INFO.ADDRESS.FULL}
            </Text>
            <Text style={styles.footerCopyright}>
              © {new Date().getFullYear()} Dharani Herbbals. {t('allRightsReserved')}
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
    backgroundColor: '#FFFFFF', // Clean bright white theme
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
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    marginHorizontal: SPACING.lg,
    marginTop: 10,
    marginBottom: 4,
    paddingLeft: 5,
    paddingRight: SPACING.md,
    height: 40,
    borderRadius: RADIUS.full,
    borderWidth: 1.2,
    borderColor: 'rgba(27, 77, 62, 0.22)',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#00A896',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
        shadowColor: '#00A896',
      },
    }),
  },
  glacierGlossHighlight: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 1,
  },
  searchIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E2F7EE',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  searchPlaceholder: {
    marginLeft: 10,
    fontSize: 12.5,
    color: '#5A6E62',
    fontWeight: '500',
    flex: 1,
    letterSpacing: 0.1,
    includeFontPadding: false,
    textAlignVertical: 'center',
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
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.12)',
    ...SHADOWS.small,
  },
  storyDecorCircle: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(167, 243, 208, 0.18)',
  },
  storyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  storyBadge: {
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  storyBadgeText: {
    color: '#1B4D3E',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  storyLocation: {
    color: '#2E7D5A',
    fontSize: 11,
    fontWeight: '600',
  },
  storyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#133E2B',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  storyDesc: {
    fontSize: 12.5,
    color: '#4E6B5A',
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  storyButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#1B4D3E',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: RADIUS.full,
  },
  storyButtonText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: 12,
    justifyContent: 'flex-start',
  },
  gridProductCard: {
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
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  valueIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDF7F1',
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
    backgroundColor: '#F7FAF8',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    position: 'relative',
    overflow: 'hidden',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
  },
  statsDecorGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(167, 243, 208, 0.22)',
  },
  statsSectionHeading: {
    color: '#2E6F54',
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
    color: '#1B4D3E',
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 11,
    color: '#4E6B5A',
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
    width: '100%',
    paddingHorizontal: SPACING.xs,
  },
  supportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    paddingHorizontal: 14,
    borderRadius: RADIUS.full,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.12,
    shadowRadius: 2.5,
  },
  callBtn: {
    backgroundColor: '#1B4D3E', // Dark herbal green
  },
  waBtn: {
    backgroundColor: '#25D366', // Official WhatsApp green
  },
  supportBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  footerContainer: {
    padding: SPACING.xl,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    marginTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(27, 77, 62, 0.08)',
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

