/**
 * Wishlist Screen for Dharani Herbbals
 */

import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Header } from '../../components/common/Header';
import { ProductCard } from '../../components/common/ProductCard';
import { EmptyState } from '../../components/common/EmptyState';
import { COLORS, SPACING } from '../../constants/theme';
import { useWishlist } from '../../context/WishlistContext';

export const WishlistScreen = ({ navigation }) => {
  const { wishlist } = useWishlist();

  const renderProductItem = ({ item }) => (
    <View style={styles.gridItem}>
      <ProductCard product={item} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title={`My Wishlist (${wishlist.length})`}
        showBack={true}
        showWishlist={false}
        showLogo={false}
      />

      <FlatList
        data={wishlist}
        keyExtractor={item => `wish-${item.id}`}
        renderItem={renderProductItem}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="heart"
            title="Your Wishlist is Empty"
            subtitle="Save your favorite herbal shampoos, soaps, and health mixes here for easy access."
            buttonText="Explore Catalogue"
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
    flex: 1 / 2,
    padding: SPACING.xs,
  },
});

export default WishlistScreen;

