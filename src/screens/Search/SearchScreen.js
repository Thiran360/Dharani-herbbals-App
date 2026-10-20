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
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { ProductCard } from '../../components/common/ProductCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon } from '../../components/common/Icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import storage from '../../services/storage';
import api from '../../services/api';

const POPULAR_SEARCHES = [
  'Chemparuthi Shampoo',
  'Kuppaimeni Soap',
  'Nalangu Powder',
  'Pirandai Pickle',
  'Sathu Maavu',
  'Wild Turmeric',
  'Deepa Oil',
  'Aloe Vera Facepack',
];

export const SearchScreen = ({ navigation }) => {
  const { isTamil } = useLanguage();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(false);
    });

    storage.getRecentSearches().then(searches => {
      if (Array.isArray(searches)) setRecentSearches(searches);
    });
  }, []);

  const handleSearchSubmit = () => {
    if (query.trim()) {
      storage.addRecentSearch(query.trim());
      setRecentSearches(prev => [query.trim(), ...prev.filter(q => q !== query.trim())].slice(0, 8));
    }
  };

  const handleRecentClick = item => {
    setQuery(item);
  };

  const handleClearRecent = async () => {
    await storage.clearRecentSearches();
    setRecentSearches([]);
  };

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return products.filter(p => {
      const name = (p.name || '').toLowerCase();
      const tamilName = (p.tamil_name || '').toLowerCase();
      const cat = (p.category_name || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return name.includes(q) || tamilMatch(tamilName, q) || cat.includes(q) || desc.includes(q);
    });
  }, [products, query]);

  function tamilMatch(tamilName, q) {
    return tamilName.includes(q);
  }

  const renderProductItem = ({ item }) => (
    <View style={styles.gridItem}>
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

      {/* Luxury Search Input Bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputWrapper}>
          <Icon name="search" size={18} color={COLORS.primary} />
          <TextInput
            style={styles.input}
            placeholder={
              isTamil
                ? 'தயாரிப்புகள் அல்லது மூலிகைகளைத் தேடுங்கள்...'
                : 'Search shampoos, soaps, oils, health mixes...'
            }
            placeholderTextColor={COLORS.textLight}
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
              <Icon name="close" size={14} color={COLORS.textSecondary} />
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
                  Found {searchResults.length} {searchResults.length === 1 ? 'formulation' : 'formulations'} for "{query}"
                </Text>
              </View>
            </View>

            <FlatList
              data={searchResults}
              keyExtractor={item => `search-${item.id}`}
              renderItem={renderProductItem}
              numColumns={2}
              contentContainerStyle={styles.resultsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <EmptyState
                  icon="search"
                  title="No matching formulations"
                  subtitle={`We couldn't find any herbal remedies matching "${query}". Try searching for generic herbal names like soap, shampoo, or thailam.`}
                  buttonText="Clear Search"
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
                  <Text style={styles.sectionLabel}>Recent Searches</Text>
                  <TouchableOpacity onPress={handleClearRecent} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.clearText}>Clear</Text>
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
              <Text style={styles.sectionLabel}>Popular Formulations</Text>
              <Text style={styles.sectionSub}>Frequently sought traditional wellness items</Text>
              <View style={styles.chipsWrap}>
                {POPULAR_SEARCHES.map((item, idx) => (
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
                <Text style={styles.botanicalBannerTitle}>Pure Siddha & Ayurvedic Formulations</Text>
                <Text style={styles.botanicalBannerDesc}>
                  Ethically harvested botanicals directly from Punjai Puliampatti, Tamil Nadu.
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
    backgroundColor: '#FAF8F5',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    height: 46,
    borderWidth: 1.2,
    borderColor: 'rgba(27, 77, 62, 0.14)',
  },
  input: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 13.5,
    color: '#14231A',
    paddingVertical: 0,
    fontWeight: '500',
  },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(27, 77, 62, 0.08)',
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
    flex: 1 / 2,
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

