/**
 * Product Card Component for Dharani Herbbals
 * Luxury botanical card with subtle scale animation and animated wishlist feedback
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { Icon } from './Icons';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';

export const ProductCard = ({ product, style, width }) => {
  const navigation = useNavigation();
  const { addToCart, cartItems } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isTamil } = useLanguage();

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const cartItem = cartItems.find(item => item.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  // Price formatting
  const price = typeof product.price === 'string'
    ? parseFloat(product.price.replace(/[^\d.]/g, ''))
    : parseFloat(product.price) || 0;

  const mrp = typeof product.mrp === 'string'
    ? parseFloat(product.mrp.replace(/[^\d.]/g, ''))
    : typeof product.originalPrice === 'string'
    ? parseFloat(product.originalPrice.replace(/[^\d.]/g, ''))
    : parseFloat(product.mrp || product.originalPrice) || 0;

  const hasDiscount = mrp > price;
  const discountPercent = hasDiscount
    ? Math.round(((mrp - price) / mrp) * 100)
    : 0;

  const rating = parseFloat(product.rating) || 4.8;
  const reviews = parseInt(product.reviews, 10) || 16;

  const handlePress = () => {
    navigation.navigate('ProductDetailsScreen', { product });
  };

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const handleWishlistPress = () => {
    // Gentle bounce animation on heart
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.3,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
    toggleWishlist(product);
  };

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const imageUri = product.image && product.image.startsWith('http')
    ? { uri: product.image }
    : require('../../assets/logo.png');

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        width ? { width } : null,
        style,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.92}
      >
        {/* Image Container with Studio Herbal Backdrop */}
        <View style={styles.imageContainer}>
          <Image
            source={imageUri}
            style={styles.image}
            resizeMode="contain"
            defaultSource={require('../../assets/logo.png')}
          />

          {/* Discount / New Badge */}
          {hasDiscount && discountPercent > 0 ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPercent}% OFF</Text>
            </View>
          ) : product.is_new ? (
            <View style={[styles.discountBadge, styles.newBadge]}>
              <Text style={styles.discountText}>HERBAL NEW</Text>
            </View>
          ) : null}

          {/* Animated Wishlist Button */}
          <TouchableOpacity
            style={styles.wishlistBtn}
            onPress={handleWishlistPress}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Icon
                name={inWishlist ? 'heart-filled' : 'heart'}
                size={16}
                color={inWishlist ? '#D9534F' : COLORS.textSecondary}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Info Container */}
        <View style={styles.infoContainer}>
          {/* Unit / Weight Pill */}
          {product.weight_volume || product.unit ? (
            <View style={styles.unitPill}>
              <Text style={styles.unitText}>
                {product.weight_volume} {product.unit}
              </Text>
            </View>
          ) : (
            <View style={styles.unitPillPlaceholder} />
          )}

          {/* Product Name */}
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>

          {/* Tamil Name */}
          {product.tamil_name && product.tamil_name !== product.name ? (
            <Text style={styles.tamilName} numberOfLines={1}>
              {product.tamil_name}
            </Text>
          ) : null}

          {/* Rating Row */}
          <View style={styles.ratingRow}>
            <Icon name="star" size={12} color={COLORS.gold} />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            <Text style={styles.reviewsText}>({reviews})</Text>
          </View>

          {/* Price & Add to Cart Row */}
          <View style={styles.bottomRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>₹{price.toFixed(0)}</Text>
              {hasDiscount ? (
                <Text style={styles.mrp}>₹{mrp.toFixed(0)}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[
                styles.addBtn,
                quantityInCart > 0 ? styles.addBtnActive : null,
              ]}
              onPress={handleAddToCart}
              activeOpacity={0.8}
            >
              {quantityInCart > 0 ? (
                <Text style={styles.addBtnTextActive}>{quantityInCart} in Cart</Text>
              ) : (
                <Text style={styles.addBtnText}>+ Add</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    ...SHADOWS.small,
  },
  imageContainer: {
    width: '100%',
    height: 155,
    backgroundColor: '#F9F7F4', // Warm ivory studio backdrop
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: SPACING.sm,
  },
  image: {
    width: '92%',
    height: '92%',
  },
  discountBadge: {
    position: 'absolute',
    top: 9,
    left: 9,
    backgroundColor: '#D9534F',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  newBadge: {
    backgroundColor: '#1B4D3E',
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    ...SHADOWS.small,
  },
  infoContainer: {
    padding: SPACING.md,
    backgroundColor: '#FFFFFF',
  },
  unitPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    marginBottom: 4,
  },
  unitPillPlaceholder: {
    height: 16,
  },
  unitText: {
    fontSize: 9.5,
    color: '#666666',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: '#14231A',
    lineHeight: 18,
    height: 36,
  },
  tamilName: {
    fontSize: 11,
    color: '#1B4D3E',
    fontWeight: '600',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#14231A',
  },
  reviewsText: {
    fontSize: 10,
    color: '#8F9F94',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm + 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B4D3E',
    letterSpacing: 0.2,
  },
  mrp: {
    fontSize: 11,
    color: '#8F9F94',
    textDecorationLine: 'line-through',
  },
  addBtn: {
    backgroundColor: '#1B4D3E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnActive: {
    backgroundColor: '#0D2818',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  addBtnTextActive: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default ProductCard;

