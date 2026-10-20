/**
 * Product List / Catalogue Screen for Dharani Herbbals
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { ProductCard } from '../../components/common/ProductCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon } from '../../components/common/Icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { STATIC_CATEGORIES } from '../../constants/categories';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

export const ProductListScreen = ({ route, navigation }) => {
  const { isTamil } = useLanguage();
  const initialCategoryName = route?.params?.categoryName || null;
  const initialCategoryId = route?.params?.categoryId || null;
  const pageTitle = route?.params?.title || initialCategoryName || 'All Products';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(STATIC_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryName || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'price_low', 'price_high', 'discount'
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [prods, cats] = await Promise.allSettled([
        api.getProducts(),
        api.getCategories(),
      ]);

      if (prods.status === 'fulfilled' && Array.isArray(prods.value)) {
        setProducts(prods.value);
      }
      if (cats.status === 'fulfilled' && Array.isArray(cats.value)) {
        setCategories(cats.value);
      }
    } catch (e) {
      console.warn('Failed to load products list:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchProducts();
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Category filter
        if (selectedCategory !== 'All') {
          const catMatch =
            (p.category_name && p.category_name.toLowerCase() === selectedCategory.toLowerCase()) ||
            (p.category && initialCategoryId && String(p.category) === String(initialCategoryId));
          if (!catMatch) return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const nameMatch = p.name && p.name.toLowerCase().includes(q);
          const tamilMatch = p.tamil_name && p.tamil_name.toLowerCase().includes(q);
          const descMatch = p.description && p.description.toLowerCase().includes(q);
          const brandMatch = p.brand && p.brand.toLowerCase().includes(q);
          return nameMatch || tamilMatch || descMatch || brandMatch;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = typeof a.price === 'string' ? parseFloat(a.price.replace(/[^\d.]/g, '')) || 0 : parseFloat(a.price) || 0;
        const priceB = typeof b.price === 'string' ? parseFloat(b.price.replace(/[^\d.]/g, '')) || 0 : parseFloat(b.price) || 0;

        if (sortBy === 'price_low') return priceA - priceB;
        if (sortBy === 'price_high') return priceB - priceA;
        if (sortBy === 'discount') {
          const mrpA = parseFloat(a.mrp) || priceA;
          const mrpB = parseFloat(b.mrp) || priceB;
          const discA = mrpA > priceA ? (mrpA - priceA) / mrpA : 0;
          const discB = mrpB > priceB ? (mrpB - priceB) / mrpB : 0;
          return discB - discA;
        }
        return 0; // Default popularity
      });
  }, [products, selectedCategory, searchQuery, sortBy, initialCategoryId]);

  const allCategoryPills = useMemo(() => {
    return [{ id: 'all', name: 'All', nameTa: 'அனைத்தும்' }, ...categories];
  }, [categories]);

  const renderProductItem = ({ item }) => (
    <View style={styles.gridItem}>
      <ProductCard product={item} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title={pageTitle} showBack={true} showLogo={false} />

      {/* Inline Search & Filter Bar */}
      <View style={styles.topControlSection}>
        <View style={styles.searchRow}>
          <Icon name="search" size={16} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={isTamil ? 'தயாரிப்புகளைத் தேடுங்கள்...' : 'Search within catalogue...'}
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="close" size={14} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Sort Chips */}
        <View style={styles.sortRow}>
          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'popular' ? styles.sortChipActive : null]}
            onPress={() => setSortBy('popular')}
          >
            <Text style={[styles.sortText, sortBy === 'popular' ? styles.sortTextActive : null]}>
              Popular
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'price_low' ? styles.sortChipActive : null]}
            onPress={() => setSortBy('price_low')}
          >
            <Text style={[styles.sortText, sortBy === 'price_low' ? styles.sortTextActive : null]}>
              Price: Low to High
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'price_high' ? styles.sortChipActive : null]}
            onPress={() => setSortBy('price_high')}
          >
            <Text style={[styles.sortText, sortBy === 'price_high' ? styles.sortTextActive : null]}>
              Price: High to Low
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Pills Scroll */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={allCategoryPills}
          keyExtractor={item => `pill-${item.id}`}
          contentContainerStyle={styles.pillsList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.name || (item.id === 'all' && selectedCategory === 'All');
            return (
              <TouchableOpacity
                style={[styles.categoryPill, isSelected ? styles.categoryPillActive : null]}
                onPress={() => setSelectedCategory(item.name)}
                activeOpacity={0.75}
              >
                <Text style={[styles.pillText, isSelected ? styles.pillTextActive : null]}>
                  {isTamil && item.nameTa ? item.nameTa : item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* Count banner */}
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            🌿 Showing {filteredProducts.length} authentic herbal formulations
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color="#1B4D3E" />
          <Text style={styles.loadingText}>Loading pure herbal formulations...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={item => `prod-${item.id}`}
          renderItem={renderProductItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="search"
              title="No formulations found"
              subtitle="We couldn't find any products matching your criteria. Try adjusting your search query or category filters."
              buttonText="Reset Filters"
              onButtonPress={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setSortBy('popular');
              }}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  topControlSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27, 77, 62, 0.08)',
    paddingTop: SPACING.sm + 2,
    ...SHADOWS.small,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    marginHorizontal: SPACING.md,
    paddingHorizontal: SPACING.md,
    height: 44,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.1)',
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 13,
    color: '#14231A',
    paddingVertical: 0,
  },
  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm + 2,
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: '#F3F7F4',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sortChipActive: {
    backgroundColor: '#EBF2ED',
    borderWidth: 1,
    borderColor: '#1B4D3E',
  },
  sortText: {
    fontSize: 11,
    color: '#5A6E62',
    fontWeight: '700',
  },
  sortTextActive: {
    color: '#1B4D3E',
    fontWeight: '800',
  },
  pillsList: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.1)',
  },
  categoryPillActive: {
    backgroundColor: '#1B4D3E',
    borderColor: '#1B4D3E',
    ...SHADOWS.small,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A6E62',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  countRow: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 8,
  },
  countText: {
    fontSize: 11.5,
    color: '#5B8266',
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  gridItem: {
    flex: 1 / 2,
    padding: SPACING.xs,
  },
  loaderCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: 13,
    color: '#5A6E62',
    fontWeight: '600',
  },
});

export default ProductListScreen;
