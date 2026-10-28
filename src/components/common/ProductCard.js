/**
 * Product Card Component for Dharani Herbbals
 * Luxury botanical card with subtle scale animation and animated wishlist feedback
 */

import React, { useRef, useState, memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { Icon } from './Icons';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { formatProductSize, isArppuShampoo, isAloeVeraShampoo, isKadalaiMittai } from '../../utils/formatters';
import { getLocalizedProductName } from '../../utils/localization';
import { getOptimizedImageSource, getProductThumbnail } from '../../utils/imageOptimizer';

const ProductCardComponent = ({ product, style, width }) => {
  const navigation = useNavigation();
  const { addToCart, cartItems } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isTamil, t, language } = useLanguage();
  const { isAuthenticated, user, isGuest } = useAuth();

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const [imageError, setImageError] = useState(false);

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const cartItem = cartItems.find(item => item.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  // Price formatting & Offer rules
  const isArppu = isArppuShampoo(product);
  const isAloeVera = isAloeVeraShampoo(product);

  let price = typeof product.price === 'string'
    ? parseFloat(product.price.replace(/[^\d.]/g, ''))
    : parseFloat(product.price) || 0;

  let mrp = typeof product.mrp === 'string'
    ? parseFloat(product.mrp.replace(/[^\d.]/g, ''))
    : typeof product.originalPrice === 'string'
    ? parseFloat(product.originalPrice.replace(/[^\d.]/g, ''))
    : parseFloat(product.mrp || product.originalPrice) || 0;

  // Requirements 3 & 4:
  // Arppu Shampoo & Aloe Vera Shampoo: Sell at ₹65 only.
  // Remove 50% & 19% offer badges and crossed-out old prices.
  if (isArppu || isAloeVera) {
    price = 65;
    mrp = 65;
  }

  const hasDiscount = mrp > price;
  const discountPercent = hasDiscount
    ? Math.round(((mrp - price) / mrp) * 100)
    : 0;

  // Requirement 2 & 5: Format weight with 'G' (no 'GM'), exclude Kadalai Mittai, display beside price
  const formattedSize = isKadalaiMittai(product) ? '' : formatProductSize(product);

  const rating = parseFloat(product.rating) || 4.8;
  const reviews = parseInt(product.reviews, 10) || 16;

  const handlePress = () => {
    navigation.navigate('ProductDetailsScreen', { product });
  };

  const handleAddToCart = () => {
    if (!isAuthenticated || !user?.id || isGuest) {
      navigation.navigate('LoginScreen', {
        pendingAction: { type: 'ADD_TO_CART', product, quantity: 1 },
      });
      return;
    }
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

  const rawImage = getProductThumbnail(product);
  const imageSource = !imageError && rawImage
    ? getOptimizedImageSource(rawImage)
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
            source={imageSource}
            style={styles.image}
            resizeMode="contain"
            defaultSource={require('../../assets/logo.png')}
            onError={() => setImageError(true)}
          />

          {/* Discount / New Badge */}
          {hasDiscount && discountPercent > 0 ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPercent}% {isTamil ? 'தள்ளுபடி' : 'OFF'}</Text>
            </View>
          ) : product.is_new ? (
            <View style={[styles.discountBadge, styles.newBadge]}>
              <Text style={styles.discountText}>{isTamil ? 'புதியது' : 'HERBAL NEW'}</Text>
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
          {/* Localized Product Name */}
          <Text style={styles.name} numberOfLines={2}>
            {getLocalizedProductName(product, language)}
          </Text>

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
              {formattedSize ? (
                <Text style={styles.priceWeight}>({formattedSize})</Text>
              ) : null}
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
                <Text style={styles.addBtnTextActive}>
                  {isTamil ? `${quantityInCart} கூடையில்` : `${quantityInCart} in Cart`}
                </Text>
              ) : (
                <Text style={styles.addBtnText}>{isTamil ? '+ சேர்' : '+ Add'}</Text>
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
    width: '100%',
    marginBottom: SPACING.md,
  },
  card: {
    flex: 1,
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    ...SHADOWS.small,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1.05,
    maxHeight: 180,
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
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: '#14231A',
    lineHeight: 18,
    minHeight: 36,
    flexShrink: 1,
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
    flexWrap: 'wrap',
    gap: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#1B4D3E',
    letterSpacing: 0.2,
  },
  priceWeight: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#5A6E62',
  },
  mrp: {
    fontSize: 11,
    color: '#8F9F94',
    textDecorationLine: 'line-through',
  },
  addBtn: {
    backgroundColor: '#1B4D3E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 28,
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

export const ProductCard = memo(ProductCardComponent);
export default ProductCard;

