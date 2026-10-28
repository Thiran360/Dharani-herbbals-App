/**
 * Wishlist Screen for Dharani Herbbals
 */

import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { Header } from '../../components/common/Header';
import { ProductCard } from '../../components/common/ProductCard';
import { EmptyState } from '../../components/common/EmptyState';
import { COLORS, SPACING } from '../../constants/theme';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import { prefetchImages } from '../../utils/imageOptimizer';

export const WishlistScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const numColumns = width >= 640 ? 3 : 2;
  const { wishlist } = useWishlist();
  const { t } = useLanguage();

  useEffect(() => {
    if (wishlist && wishlist.length > 0) {
      prefetchImages(wishlist.slice(0, 6).map(p => p.image));
    }
  }, [wishlist]);

  const columnWidthPercent = `${(100 / numColumns).toFixed(2)}%`;

  const renderProductItem = ({ item }) => (
    <View style={[styles.gridItem, { maxWidth: columnWidthPercent }]}>
      <ProductCard product={item} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title={`${t('myWishlist')} (${wishlist.length})`}
        showBack={true}
        showWishlist={false}
        showLogo={false}
      />

      <FlatList
        key={`wish-grid-${numColumns}`}
        data={wishlist}
        keyExtractor={item => `wish-${item.id}`}
        renderItem={renderProductItem}
        numColumns={numColumns}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        ListEmptyComponent={
          <EmptyState
            icon="heart"
            title={t('emptyWishlistTitle')}
            subtitle={t('emptyWishlistSub')}
            buttonText={t('exploreCatalogue')}
            onButtonPress={() => navigation.navigate('MainTabs', { screen: 'CategoriesTab' })}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  listContent: {
    padding: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  gridItem: {
    flex: 1,
    maxWidth: '50%',
    padding: SPACING.xs,
  },
});

export default WishlistScreen;

