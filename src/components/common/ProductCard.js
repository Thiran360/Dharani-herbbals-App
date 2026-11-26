/**
 * Product Card Component for Dharani Herbbals
 * 100% Website Mockup Match:
 * - 1:1 Aspect Ratio Studio Image Backdrop (#F9F8F3)
 * - Complete Product Image Visibility (No clipping/stretching)
 * - 100% Herbal Badge & Wishlist Heart Button
 * - Side-by-Side Weight Pill & Bold Price with Vertical Separator
 * - Full-Width Botanical Add to Cart Button
 */

import React, { useRef, useState, memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Share,
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

  // Arppu Shampoo & Aloe Vera Shampoo: Sell at ₹65 only
  if (isArppu || isAloeVera) {
    price = 65;
    mrp = 65;
  }

  const hasDiscount = mrp > price;
  const discountPercent = hasDiscount
    ? Math.round(((mrp - price) / mrp) * 100)
    : 0;

  // Format weight with 'G' (no 'GM'), exclude Kadalai Mittai
  const formattedSize = isKadalaiMittai(product) ? '' : formatProductSize(product);

  const handlePress = () => {
    navigation.navigate('ProductDetailsScreen', { product });
  };

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const handleSharePress = async () => {
    try {
      const shareUrl = `https://dharaniherbals.com/product/${product.id}`;
      const title = getLocalizedProductName(product, language);
      await Share.share({
        title,
        message: `${title} - ₹${price.toFixed(0)}\nShop authentic traditional Siddha & Ayurvedic care on Dharani Herbbals:\n${shareUrl}`,
        url: shareUrl,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  const handleWishlistPress = () => {
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.35,
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
      <View style={styles.card}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={0.92}
        >
          {/* 1:1 Aspect Ratio Image Container with Studio Herbal Backdrop */}
          <View style={styles.imageContainer}>
            <Image
              source={imageSource}
              style={styles.image}
              resizeMode="contain"
              defaultSource={require('../../assets/logo.png')}
              onError={() => setImageError(true)}
            />

            {/* Top-Left Discount Badge */}
            {hasDiscount && discountPercent > 0 ? (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>
                  {discountPercent}% {isTamil ? 'தள்ளுபடி' : 'OFF'}
                </Text>
              </View>
            ) : null}

            {/* Top-Right Action Buttons: Share & Wishlist */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.actionCircleBtn}
                onPress={handleSharePress}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="share" size={13.5} color="#475569" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionCircleBtn,
                  inWishlist && styles.wishlistBtnActive,
                ]}
                onPress={handleWishlistPress}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                  <Icon
                    name={inWishlist ? 'heart-filled' : 'heart'}
                    size={14}
                    color={inWishlist ? '#E11D48' : '#64748B'}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content Body Section */}
          <View style={styles.infoContainer}>
            {/* Localized Product Name */}
            <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
              {getLocalizedProductName(product, language)}
            </Text>

            {/* Weight & Price Row (Side-by-Side with Vertical Separator) */}
            <View style={styles.weightPriceRow}>
              {formattedSize ? (
                <>
                  <View style={styles.weightPill}>
                    <Text style={styles.weightPillText}>⚖ {formattedSize}</Text>
                  </View>
                  <View style={styles.rowDivider} />
                </>
              ) : null}

              <View style={styles.priceContainer}>
                <Text style={styles.currency}>₹</Text>
                <Text style={styles.priceNum}>{price.toFixed(0)}</Text>
                {hasDiscount ? (
                  <Text style={styles.mrp}>₹{mrp.toFixed(0)}</Text>
                ) : null}
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Full-Width Botanical Add to Cart Button (Separate Click Target) */}
        <View style={styles.addBtnWrapper}>
          <TouchableOpacity
            style={[
              styles.addBtn,
              quantityInCart > 0 ? styles.addBtnActive : null,
            ]}
            onPress={handleAddToCart}
            activeOpacity={0.85}
          >
            <Icon
              name="cart"
              size={14}
              color="#FFFFFF"
            />
            <Text style={styles.addBtnText} numberOfLines={1}>
              {quantityInCart > 0
                ? isTamil
                  ? `${quantityInCart} கூடையில் ✓`
                  : `${quantityInCart} in Cart ✓`
                : isTamil
                ? '+ கூடையில் சேர்'
                : '+ Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(23, 61, 43, 0.14)',
    ...Platform.select({
      ios: {
        shadowColor: '#173d2b',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.10,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1, // Exact 1:1 Aspect Ratio matching the official website
    backgroundColor: '#F9F8F3', // Light herbal studio cream backdrop
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(45, 106, 79, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 10, // Generous padding so 100% of the image is shown without cutting
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  herbalBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#1B4D2E',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: RADIUS.full,
    zIndex: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.16,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  herbalBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#B91C1C',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: RADIUS.full,
    zIndex: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.16,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  actionButtonsRow: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  actionCircleBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    zIndex: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  wishlistBtnActive: {
    backgroundColor: '#FFF1F2',
    borderColor: 'rgba(225, 29, 72, 0.3)',
  },
  infoContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  addBtnWrapper: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D2818',
    lineHeight: 17,
    textAlign: 'center',
    minHeight: 34,
    marginBottom: 8,
    width: '100%',
  },
  weightPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
    width: '100%',
  },
  weightPill: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: 'rgba(45, 106, 79, 0.25)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  weightPillText: {
    color: '#1B4332',
    fontSize: 10.5,
    fontWeight: '700',
  },
  rowDivider: {
    width: 1.2,
    height: 16,
    backgroundColor: '#CBD5E1',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  currency: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D2818',
  },
  priceNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0D2818',
    letterSpacing: -0.3,
  },
  mrp: {
    fontSize: 10.5,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginLeft: 3,
  },
  addBtn: {
    width: '100%',
    height: 36,
    backgroundColor: '#1B4332',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#1B4332',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  addBtnActive: {
    backgroundColor: '#16A34A',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export const ProductCard = memo(ProductCardComponent);
export default ProductCard;
