/**
 * Search Screen for Dharani Herbbals
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { ProductCard } from '../../components/common/ProductCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon } from '../../components/common/Icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import storage from '../../services/storage';
import api from '../../services/api';

import { filterProductsByQuery } from '../../utils/productSearch';
import { prefetchImages } from '../../utils/imageOptimizer';

const POPULAR_SEARCHES_EN = [
  'Chemparuthi Shampoo',
  'Kuppaimeni Soap',
  'Nalangu Powder',
  'Pirandai Pickle',
  'Sathu Maavu',
  'Wild Turmeric',
  'Deepa Oil',
  'Aloe Vera Facepack',
];

const POPULAR_SEARCHES_TA = [
  'செம்பருத்தி ஷாம்பு',
  'குப்பைமேனி சோப்பு',
  'நலங்கு மாவு',
  'பிரண்டை ஊறுகாய்',
  'சத்துமாவு',
  'கஸ்தூரி மஞ்சள்',
  'தீபா எண்ணெய்',
  'கற்றாழை சோப்பு',
];

export const SearchScreen = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const numColumns = width >= 640 ? 3 : 2;
  const { isTamil } = useLanguage();
  const popularSearches = isTamil ? POPULAR_SEARCHES_TA : POPULAR_SEARCHES_EN;
  const initialQuery = route?.params?.query || route?.params?.searchQuery || route?.params?.formulation || '';
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();

    // Load products and recent searches
    api.getProducts().then(prods => {
      if (Array.isArray(prods)) setProducts(prods);
    });

    storage.getRecentSearches().then(searches => {
      if (Array.isArray(searches)) setRecentSearches(searches);
    });
  }, [fadeAnim]);

  useEffect(() => {
    const nextQuery = route?.params?.query || route?.params?.searchQuery || route?.params?.formulation;
    if (nextQuery && nextQuery !== query) {
      setQuery(nextQuery);
    }
  }, [route?.params]);

  const handleSearchSubmit = () => {
    if (query.trim()) {
      storage.addRecentSearch(query.trim());
      setRecentSearches(prev => [query.trim(), ...prev.filter(q => q !== query.trim())].slice(0, 8));
    }
  };

  const handleRecentClick = item => {
    setQuery(item);
    storage.addRecentSearch(item);
    setRecentSearches(prev => [item, ...prev.filter(q => q !== item)].slice(0, 8));
  };

  const handleClearRecent = async () => {
    await storage.clearRecentSearches();
    setRecentSearches([]);
  };

  const searchResults = useMemo(() => {
    return filterProductsByQuery(products, query);
  }, [products, query]);

  // Pre-warm native disk cache for top search results
  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      prefetchImages(searchResults.slice(0, 6).map(p => p.image));
    }
  }, [searchResults]);

  const columnWidthPercent = `${(100 / numColumns).toFixed(2)}%`;

  const renderProductItem = ({ item }) => (
    <View style={[styles.gridItem, { maxWidth: columnWidthPercent }]}>
      <ProductCard product={item} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title={isTamil ? 'தயாரிப்பு தேடல்' : 'Search Formulations'}
        showBack={false}
        showSearch={false}
        showLogo={false}
      />

      {/* Water Glacier Frosted Glass Search Bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputWrapper}>
          <View style={styles.glacierGlossHighlight} pointerEvents="none" />
          <View style={styles.searchIconBox}>
            <Icon name="search" size={13.5} color="#1B4D3E" />
          </View>
          <TextInput
            style={styles.input}
            placeholder={
              isTamil
                ? 'இயற்கை மூலிகை தைலம், பொடி, தேநீர் தேடுக...'
                : 'Search natural herbal oils, powders & teas...'
            }
            placeholderTextColor="#8A9E92"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            autoFocus={false}
          />
          {query ? (
            <TouchableOpacity
              onPress={() => setQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.clearBtn}
            >
              <Icon name="close" size={12} color="#5A6E62" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <Animated.View style={[styles.mainBody, { opacity: fadeAnim }]}>
        {query.trim().length > 0 ? (
          /* Results View */
          <View style={styles.resultsContainer}>
            <View style={styles.resultsMeta}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeIcon}>🌿</Text>
                <Text style={styles.resultsCount}>
                  {isTamil
                    ? `"${query}" - ${searchResults.length} தயாரிப்புகள் உள்ளன`
                    : `Found ${searchResults.length} ${searchResults.length === 1 ? 'formulation' : 'formulations'} for "${query}"`}
                </Text>
              </View>
            </View>

            <FlatList
              key={`search-grid-${numColumns}`}
              data={searchResults}
              keyExtractor={item => `search-${item.id}`}
              renderItem={renderProductItem}
              numColumns={numColumns}
              contentContainerStyle={styles.resultsList}
              showsVerticalScrollIndicator={false}
              initialNumToRender={6}
              maxToRenderPerBatch={6}
              windowSize={5}
              removeClippedSubviews={Platform.OS === 'android'}
              updateCellsBatchingPeriod={50}
              ListEmptyComponent={
                <EmptyState
                  icon="search"
                  title={isTamil ? 'பொருத்தமான தயாரிப்புகள் இல்லை' : 'No matching formulations'}
                  subtitle={
                    isTamil
                      ? `"${query}" என்ற பெயரில் தயாரிப்புகள் எதுவும் கிடைக்கவில்லை. தைலம், சோப் அல்லது ஷாம்பூ போன்ற பெயர்களைத் தேடவும்.`
                      : `We couldn't find any herbal remedies matching "${query}". Try searching for generic herbal names like soap, shampoo, or thailam.`
                  }
                  buttonText={isTamil ? 'தேடலை அழிக்க' : 'Clear Search'}
                  onButtonPress={() => setQuery('')}
                />
              }
            />
          </View>
        ) : (
          /* Suggestions & Recent Searches View */
          <View style={styles.suggestionsContainer}>
            {recentSearches.length > 0 ? (
              <View style={styles.recentSection}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionLabel}>{isTamil ? 'சமீபத்திய தேடல்கள்' : 'Recent Searches'}</Text>
                  <TouchableOpacity onPress={handleClearRecent} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.clearText}>{isTamil ? 'நீக்கு' : 'Clear'}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.chipsWrap}>
                  {recentSearches.map((s, idx) => (
                    <TouchableOpacity
                      key={`rec-${idx}`}
                      style={styles.chip}
                      onPress={() => handleRecentClick(s)}
                      activeOpacity={0.7}
                    >
                      <Icon name="clock" size={11} color={COLORS.textSecondary} />
                      <Text style={styles.chipText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Popular Searches */}
            <View style={styles.popularSection}>
              <Text style={styles.sectionLabel}>{isTamil ? 'பிரபலமான தயாரிப்புகள்' : 'Popular Formulations'}</Text>
              <Text style={styles.sectionSub}>
                {isTamil ? 'அடிக்கடி தேடப்படும் பாரம்பரிய தயாரிப்புகள்' : 'Frequently sought traditional wellness items'}
              </Text>
              <View style={styles.chipsWrap}>
                {popularSearches.map((item, idx) => (
                  <TouchableOpacity
                    key={`pop-${idx}`}
                    style={[styles.chip, styles.popularChip]}
                    onPress={() => handleRecentClick(item)}
                    activeOpacity={0.7}
                  >
                    <Icon name="sparkles" size={12} color={COLORS.accentGold} />
                    <Text style={[styles.chipText, styles.popularChipText]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Botanical Brand Guarantee Badge */}
            <View style={styles.botanicalBanner}>
              <Text style={styles.botanicalBannerIcon}>🌿</Text>
              <View style={styles.botanicalBannerText}>
                <Text style={styles.botanicalBannerTitle}>
                  {isTamil ? 'தூய சித்த & ஆயுர்வேத தயாரிப்புகள்' : 'Pure Siddha & Ayurvedic Formulations'}
                </Text>
                <Text style={styles.botanicalBannerDesc}>
                  {isTamil
                    ? 'புஞ்சை புளியம்பட்டி, தமிழ்நாட்டிலிருந்து பெறப்பட்ட தூய இயற்கை மூலிகைகள்.'
                    : 'Ethically harvested botanicals directly from Punjai Puliampatti, Tamil Nadu.'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  searchHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: RADIUS.full,
    paddingLeft: 5,
    paddingRight: SPACING.md,
    height: 40,
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
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12.5,
    color: '#14231A',
    paddingVertical: 0,
    fontWeight: '500',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EBF2ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainBody: {
    flex: 1,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsMeta: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF2ED',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  metaBadgeIcon: {
    fontSize: 12,
  },
  resultsCount: {
    fontSize: 12,
    color: '#1B4D3E',
    fontWeight: '700',
  },
  resultsList: {
    padding: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  gridItem: {
    flex: 1,
    maxWidth: '50%',
    padding: SPACING.xs,
  },
  suggestionsContainer: {
    padding: SPACING.lg,
  },
  recentSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1B4D3E',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionSub: {
    fontSize: 11.5,
    color: '#5A6E62',
    marginBottom: 8,
  },
  clearText: {
    fontSize: 12,
    color: '#8A9E92',
    fontWeight: '600',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.1)',
    gap: 6,
    ...SHADOWS.small,
  },
  chipText: {
    fontSize: 12.5,
    color: '#14231A',
    fontWeight: '600',
  },
  popularSection: {
    marginTop: SPACING.sm,
  },
  popularChip: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(200, 150, 62, 0.3)',
  },
  popularChipText: {
    color: '#1B4D3E',
    fontWeight: '700',
  },
  botanicalBanner: {
    marginTop: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF2ED',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.12)',
    gap: 12,
  },
  botanicalBannerIcon: {
    fontSize: 26,
  },
  botanicalBannerText: {
    flex: 1,
  },
  botanicalBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1B4D3E',
    marginBottom: 2,
  },
  botanicalBannerDesc: {
    fontSize: 11.5,
    color: '#5A6E62',
    lineHeight: 16,
  },
});

export default SearchScreen;

