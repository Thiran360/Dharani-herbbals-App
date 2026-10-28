/**
 * Product Details Screen for Dharani Herbbals
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Share,
  StyleSheet,
  Animated,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { Icon } from '../../components/common/Icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatProductSize, isArppuShampoo, isAloeVeraShampoo, isKadalaiMittai } from '../../utils/formatters';
import {
  getLocalizedProductName,
  getLocalizedProductDescription,
  getLocalizedCategoryName,
} from '../../utils/localization';
import { getOptimizedImageSource, prefetchImages } from '../../utils/imageOptimizer';

export const ProductDetailsScreen = ({ route, navigation }) => {
  const { product } = route?.params || {};
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isTamil, t, language } = useLanguage();
  const { isAuthenticated, user, isGuest } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [variations, setVariations] = useState([]);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [keyPoints, setKeyPoints] = useState([]);
  const [extraImages, setExtraImages] = useState([]);
  const [addedToast, setAddedToast] = useState(false);

  // Accordion section states
  const [isDescOpen, setIsDescOpen] = useState(true);
  const [isHighlightsOpen, setIsHighlightsOpen] = useState(true);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  // Image fade animation
  const imageOpacity = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fetch product variations, extra images, keypoints and reviews
    if (product?.id) {
      api.getProductVariations(product.id).then(vars => {
        if (Array.isArray(vars) && vars.length > 0) {
          setVariations(vars);
          setSelectedVariation(vars[0]);
        }
      });

      api.getProductImages(product.id).then(imgs => {
        if (Array.isArray(imgs)) {
          const urls = imgs.map(i => i.image || i.image_url).filter(Boolean);
          setExtraImages(urls);
        }
      });

      api.getProductKeyPoints(product.id).then(pts => {
        if (Array.isArray(pts)) setKeyPoints(pts);
      });

      api.getProductReviews(product.id).then(revs => {
        if (Array.isArray(revs)) setReviews(revs);
      });
    }
  }, [product?.id]);

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Header showBack={true} />
        <Text style={styles.errorText}>Product not found.</Text>
      </View>
    );
  }

  const inWishlist = isInWishlist(product.id);

  // Extract all gallery images
  const allImages = [
    product.image,
    ...(product.extra_images || []),
    ...extraImages,
  ].filter(img => typeof img === 'string' && img.length > 5);

  const galleryImages = [...new Set(allImages)];

  // Prefetch extra gallery images in background for instant thumbnail switching
  useEffect(() => {
    if (galleryImages && galleryImages.length > 0) {
      prefetchImages(galleryImages);
    }
  }, [galleryImages]);

  const isArppu = isArppuShampoo(product);
  const isAloeVera = isAloeVeraShampoo(product);

  const rawPrice = selectedVariation?.price || selectedVariation?.customer_price || product.price;
  let price = typeof rawPrice === 'string'
    ? parseFloat(rawPrice.replace(/[^\d.]/g, ''))
    : parseFloat(rawPrice) || 0;

  const rawMrp = selectedVariation?.mrp || product.mrp || product.originalPrice || price;
  let mrp = typeof rawMrp === 'string'
    ? parseFloat(rawMrp.replace(/[^\d.]/g, ''))
    : parseFloat(rawMrp) || price;

  // Requirements 3 & 4: Sell at ₹65 only, no discount badge or crossed-out old price
  if (isArppu || isAloeVera) {
    price = 65;
    mrp = 65;
  }

  const hasDiscount = mrp > price;
  const discountPercent = hasDiscount
    ? Math.round(((mrp - price) / mrp) * 100)
    : 0;

  const handleSelectImage = idx => {
    Animated.sequence([
      Animated.timing(imageOpacity, {
        toValue: 0.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    setSelectedImageIndex(idx);
  };

  const handleWishlistToggle = () => {
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
        useNativeDriver: true,
      }),
    ]).start();
    toggleWishlist(product);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated || !user?.id || isGuest) {
      navigation.navigate('LoginScreen', {
        pendingAction: {
          type: 'ADD_TO_CART',
          product,
          quantity,
          variation: selectedVariation,
        },
      });
      return;
    }
    addToCart(product, quantity, selectedVariation);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2400);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated || !user?.id || isGuest) {
      navigation.navigate('LoginScreen', {
        pendingAction: {
          type: 'BUY_NOW',
          product,
          quantity,
          variation: selectedVariation,
        },
      });
      return;
    }
    addToCart(product, quantity, selectedVariation);
    navigation.navigate('CheckoutScreen');
  };

  const handleShare = async () => {
    try {
      const localizedName = getLocalizedProductName(product, language) || product.name || 'Dharani Herbbals';
      const productUrl = `https://dharaniherbbals.in/product/${product.id}`;
      const shareMessage = isTamil
        ? `தரணி ஹெர்பல்ஸில் ${localizedName} வாங்க: ${productUrl}`
        : `Discover authentic ${localizedName} on Dharani Herbbals: ${productUrl}`;

      await Share.share(
        {
          message: shareMessage,
          title: localizedName,
          url: productUrl,
        },
        {
          dialogTitle: isTamil ? 'பகிரவும்' : 'Share Product',
        }
      );
    } catch {}
  };

  const currentImageUri = galleryImages[selectedImageIndex] || product.image;

  return (
    <View style={styles.container}>
      <Header
        title={getLocalizedCategoryName(product.category_name, language) || (isTamil ? 'தயாரிப்பு விவரங்கள்' : 'Product Details')}
        showBack={true}
        showLogo={false}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Image Gallery Container */}
        <View style={styles.imageGalleryWrapper}>
          <View style={styles.mainImageContainer}>
            <Animated.Image
              source={getOptimizedImageSource(currentImageUri)}
              style={[styles.mainImage, { opacity: imageOpacity }]}
              resizeMode="contain"
              defaultSource={require('../../assets/logo.png')}
            />

            {/* Discount Badge */}
            {hasDiscount && discountPercent > 0 ? (
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>{discountPercent}% OFF</Text>
              </View>
            ) : null}

            {/* Share & Wishlist Floating Buttons */}
            <View style={styles.floatingActions}>
              <TouchableOpacity
                style={styles.actionRoundBtn}
                onPress={handleShare}
                activeOpacity={0.8}
              >
                <Icon name="share-2" size={17} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionRoundBtn}
                onPress={handleWishlistToggle}
                activeOpacity={0.8}
              >
                <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                  <Icon
                    name={inWishlist ? 'heart-filled' : 'heart'}
                    size={18}
                    color={inWishlist ? '#D9534F' : COLORS.textSecondary}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Thumbnails row */}
          {galleryImages.length > 1 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailsRow}
            >
              {galleryImages.map((img, idx) => (
                <TouchableOpacity
                  key={`thumb-${idx}`}
                  style={[
                    styles.thumbBox,
                    selectedImageIndex === idx ? styles.thumbBoxActive : null,
                  ]}
                  onPress={() => handleSelectImage(idx)}
                  activeOpacity={0.85}
                >
                  <Image
                    source={getOptimizedImageSource(img)}
                    style={styles.thumbImage}
                    resizeMode="contain"
                    defaultSource={require('../../assets/logo.png')}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : null}
        </View>

        {/* Product Info Section */}
        <View style={styles.infoCard}>
          {/* Brand & Stock */}
          <View style={styles.brandRow}>
            <Text style={styles.brandText}>{product.brand || 'Dharani Herbbals'}</Text>
            <View style={styles.stockBadge}>
              <Text style={styles.stockBadgeText}>
                {(selectedVariation?.stock !== undefined ? selectedVariation.stock : product.stock) === 0
                  ? (isTamil ? 'தற்போது இல்லை' : 'Out of Stock')
                  : (isTamil ? '🌿 இருப்பில் உள்ளது • சித்த தரம்' : '🌿 In Stock • Pure Siddha')}
              </Text>
            </View>
          </View>

          {/* Localized Product Title */}
          <Text style={styles.title}>
            {getLocalizedProductName(product, language)}
          </Text>

          {/* Pricing Row with Weight in Brackets */}
          {(() => {
            const currentItem = selectedVariation || product;
            const formattedSize = isKadalaiMittai(currentItem) ? '' : formatProductSize(currentItem);
            return (
              <View style={styles.priceRow}>
                <Text style={styles.price}>₹{price.toFixed(0)}</Text>
                {formattedSize ? (
                  <Text style={styles.priceWeight}>({formattedSize})</Text>
                ) : null}
                {hasDiscount ? (
                  <Text style={styles.mrp}>₹{mrp.toFixed(0)}</Text>
                ) : null}
                {hasDiscount ? (
                  <View style={styles.savingsPill}>
                    <Text style={styles.savingsText}>
                      {isTamil ? 'சேமிப்பு' : 'Save'} ₹{(mrp - price).toFixed(0)}
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })()}
          <Text style={styles.taxInclusive}>
            {isTamil
              ? `அனைத்து வரிகளும் அடங்கும் (${product.gst_percentage || 5}% GST)`
              : `Inclusive of all taxes (${product.gst_percentage || 5}% GST)`}
          </Text>

          {/* Variations Selector if available */}
          {variations.length > 0 ? (
            <View style={styles.variationSection}>
              <Text style={styles.sectionHeading}>{isTamil ? 'அளவு / வகை தேர்ந்தெடுக்கவும்:' : 'Select Variant / Size:'}</Text>
              <View style={styles.variationPills}>
                {variations.map((v, i) => {
                  const isSelected = selectedVariation?.id === v.id;
                  const formattedVarSize = formatProductSize(v);
                  const label = formattedVarSize ||
                    v.variation_name?.trim() ||
                    v.name?.trim() ||
                    v.size?.trim() ||
                    (v.price ? `₹${parseFloat(v.price).toFixed(0)}` : `Variant ${i + 1}`);

                  return (
                    <TouchableOpacity
                      key={`var-${v.id || i}`}
                      style={[styles.varPill, isSelected ? styles.varPillActive : null]}
                      onPress={() => setSelectedVariation(v)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.varPillText, isSelected ? styles.varPillTextActive : null]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionHeading}>{t('quantity')}:</Text>
            <View style={styles.quantityStepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                activeOpacity={0.7}
              >
                <Icon name="minus" size={13} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setQuantity(quantity + 1)}
                activeOpacity={0.7}
              >
                <Icon name="plus" size={13} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.addToCartBtn}
              onPress={handleAddToCart}
              activeOpacity={0.88}
            >
              <Icon name="cart" size={18} color="#1B4D3E" />
              <Text style={styles.addToCartText}>{t('addToCart')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buyNowBtn}
              onPress={handleBuyNow}
              activeOpacity={0.88}
            >
              <Text style={styles.buyNowText}>{isTamil ? 'உடனே வாங்கு ›' : 'Buy Now ›'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Authentic Trust Promises Bento */}
        <View style={styles.trustGrid}>
          <View style={styles.trustItem}>
            <View style={styles.trustIconCircle}>
              <Icon name="leaf" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.trustItemTitle}>{isTamil ? '100% மூலிகை' : '100% Herbal'}</Text>
            <Text style={styles.trustItemSub}>{isTamil ? 'ரசாயனமற்றது' : 'Zero chemicals'}</Text>
          </View>
          <View style={styles.trustItem}>
            <View style={styles.trustIconCircle}>
              <Icon name="shield" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.trustItemTitle}>{isTamil ? 'சித்த பாரம்பரியம்' : 'Siddha Heritage'}</Text>
            <Text style={styles.trustItemSub}>{isTamil ? '2004 முதல்' : 'Since 2004'}</Text>
          </View>
          <View style={styles.trustItem}>
            <View style={styles.trustIconCircle}>
              <Icon name="truck" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.trustItemTitle}>{isTamil ? 'விரைவு டெலிவரி' : 'Fast Delivery'}</Text>
            <Text style={styles.trustItemSub}>{isTamil ? 'TN இலவசம் >₹750' : 'TN Free >₹750'}</Text>
          </View>
        </View>

        {/* Description Accordion Section */}
        {(() => {
          const localizedDesc = getLocalizedProductDescription(product, language);
          return localizedDesc ? (
            <View style={styles.detailSection}>
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setIsDescOpen(!isDescOpen)}
                activeOpacity={0.7}
              >
                <Text style={styles.detailSectionTitle}>{t('description')}</Text>
                <Icon name={isDescOpen ? 'minus' : 'plus'} size={14} color={COLORS.primary} />
              </TouchableOpacity>
              {isDescOpen ? (
                <Text style={styles.descriptionText}>{localizedDesc}</Text>
              ) : null}
            </View>
          ) : null;
        })()}

        {/* Key Points Accordion */}
        {keyPoints.length > 0 ? (
          <View style={styles.detailSection}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setIsHighlightsOpen(!isHighlightsOpen)}
              activeOpacity={0.7}
            >
              <Text style={styles.detailSectionTitle}>{t('keyHighlights')}</Text>
              <Icon name={isHighlightsOpen ? 'minus' : 'plus'} size={14} color={COLORS.primary} />
            </TouchableOpacity>
            {isHighlightsOpen ? (
              <View style={{ marginTop: 8 }}>
                {keyPoints.map((kp, idx) => {
                  const text = kp.title || kp.point || kp.text || (typeof kp === 'string' ? kp : '');
                  if (!text) return null;
                  return (
                    <View key={`kp-${idx}`} style={styles.bulletRow}>
                      <Text style={styles.bulletDot}>🌿</Text>
                      <Text style={styles.bulletText}>{text}</Text>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Delivery Information Accordion */}
        <View style={styles.detailSection}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setIsDeliveryOpen(!isDeliveryOpen)}
            activeOpacity={0.7}
          >
            <Text style={styles.detailSectionTitle}>{isTamil ? 'ஷிப்பிங் & டெலிவரி விதிகள்' : 'Shipping & Delivery Rules'}</Text>
            <Icon name={isDeliveryOpen ? 'minus' : 'plus'} size={14} color={COLORS.primary} />
          </TouchableOpacity>
          {isDeliveryOpen ? (
            <View style={styles.deliveryInfoCard}>
              <Text style={styles.deliveryRuleText}>
                • <Text style={styles.boldText}>{isTamil ? 'தமிழ்நாடு:' : 'Tamil Nadu:'}</Text> {isTamil ? '₹50 கட்டணம். ₹750க்கு மேல் இலவச டெலிவரி! (குறைந்தபட்ச ஆர்டர் ₹110)' : '₹50 flat rate. FREE delivery on orders above ₹750! (Min. order ₹110)'}
              </Text>
              <Text style={styles.deliveryRuleText}>
                • <Text style={styles.boldText}>{isTamil ? 'தென் மாநிலங்கள் (KL, KA, AP):' : 'South States (KL, KA, AP):'}</Text> {isTamil ? '₹150 கட்டணம். ₹1000க்கு மேல் இலவச டெலிவரி! (குறைந்தபட்ச ஆர்டர் ₹400)' : '₹150 flat rate. FREE delivery above ₹1000! (Min. order ₹400)'}
              </Text>
              <Text style={styles.deliveryRuleText}>
                • <Text style={styles.boldText}>{isTamil ? 'மற்ற இந்திய மாநிலங்கள்:' : 'Rest of India:'}</Text> {isTamil ? '₹200 கட்டணம். ₹1000க்கு மேல் இலவச டெலிவரி!' : '₹200 flat rate. FREE delivery above ₹1000!'}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Verified Reviews Section */}
        <View style={styles.detailSection}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setIsReviewsOpen(!isReviewsOpen)}
            activeOpacity={0.7}
          >
            <View style={styles.reviewHeaderRow}>
              <Text style={styles.detailSectionTitle}>{t('reviews')}</Text>
              <View style={styles.ratingBadgeRow}>
                <Icon name="star" size={13} color={COLORS.gold} />
                <Text style={styles.ratingScore}>{product.rating || '4.8'} / 5.0</Text>
              </View>
            </View>
            <Icon name={isReviewsOpen ? 'minus' : 'plus'} size={14} color={COLORS.primary} />
          </TouchableOpacity>

          {isReviewsOpen ? (
            <View style={{ marginTop: 10 }}>
              {reviews.length > 0 ? (
                reviews.map((r, i) => (
                  <View key={`rev-${i}`} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewerName}>{r.user_name || r.name || 'Verified Customer'}</Text>
                      <Text style={styles.reviewDate}>{r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent'}</Text>
                    </View>
                    <Text style={styles.reviewComment}>{r.comment || r.review || r.feedback || ''}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.sampleReviewBox}>
                  <Text style={styles.sampleReviewText}>
                    "Authentic herbal formulation. Highly effective and completely gentle on the skin. We have been purchasing Dharani products for our family regularly!"
                  </Text>
                  <Text style={styles.sampleReviewAuthor}>— Sundar Rajan, Verified Buyer</Text>
                </View>
              )}
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Floating Added to Cart Toast */}
      {addedToast ? (
        <View style={styles.toast}>
          <Icon name="check" size={16} color="#FFFFFF" />
          <Text style={styles.toastText}>{t('addedToCartToast')}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  scrollContent: {
    paddingBottom: SPACING.hero + 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#5A6E62',
    marginTop: 20,
  },
  imageGalleryWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27, 77, 62, 0.08)',
    paddingBottom: SPACING.md,
  },
  mainImageContainer: {
    width: '100%',
    aspectRatio: 1.15,
    maxHeight: 380,
    backgroundColor: '#F9F7F4', // Warm ivory studio backdrop
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: SPACING.md,
  },
  mainImage: {
    width: '90%',
    height: '90%',
  },
  discountBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#D9534F',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  floatingActions: {
    position: 'absolute',
    top: 14,
    right: 14,
    gap: 10,
  },
  actionRoundBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  thumbnailsRow: {
    paddingHorizontal: SPACING.lg,
    gap: 10,
    marginTop: SPACING.md,
  },
  thumbBox: {
    width: 58,
    height: 58,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: 'rgba(27, 77, 62, 0.1)',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    padding: 3,
  },
  thumbBoxActive: {
    borderColor: '#1B4D3E',
    backgroundColor: '#EBF2ED',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    margin: SPACING.md,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  brandText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5B8266',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  stockBadge: {
    backgroundColor: '#EBF2ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#133E2B',
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  tamilTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1B4D3E',
    marginTop: 4,
  },
  weightText: {
    fontSize: 12,
    color: '#5A6E62',
    fontWeight: '600',
    marginTop: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: SPACING.md,
    gap: 8,
  },
  price: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1B4D3E',
    letterSpacing: 0.3,
  },
  priceWeight: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5A6E62',
  },
  mrp: {
    fontSize: 15,
    color: '#8F9F94',
    textDecorationLine: 'line-through',
  },
  savingsPill: {
    backgroundColor: '#FDF2F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  savingsText: {
    fontSize: 11.5,
    color: '#D9534F',
    fontWeight: '800',
  },
  taxInclusive: {
    fontSize: 11,
    color: '#8F9F94',
    marginTop: 2,
  },
  variationSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(27, 77, 62, 0.06)',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#14231A',
    marginBottom: SPACING.sm,
  },
  variationPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  varPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.12)',
    backgroundColor: '#FAF8F5',
  },
  varPillActive: {
    backgroundColor: '#EBF2ED',
    borderColor: '#1B4D3E',
  },
  varPillText: {
    fontSize: 12,
    color: '#5A6E62',
    fontWeight: '600',
  },
  varPillTextActive: {
    color: '#1B4D3E',
    fontWeight: '800',
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(27, 77, 62, 0.06)',
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.15)',
    borderRadius: RADIUS.full,
    backgroundColor: '#FAF8F5',
  },
  stepBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#14231A',
    paddingHorizontal: 14,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: SPACING.lg,
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    backgroundColor: '#EBF2ED',
    borderWidth: 1.5,
    borderColor: '#1B4D3E',
    borderRadius: RADIUS.full,
    paddingVertical: 12,
    paddingHorizontal: 8,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    color: '#1B4D3E',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  buyNowBtn: {
    flex: 1,
    backgroundColor: '#1B4D3E',
    borderRadius: RADIUS.full,
    paddingVertical: 12,
    paddingHorizontal: 8,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  buyNowText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  trustGrid: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
  },
  trustItem: {
    alignItems: 'center',
  },
  trustIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EBF2ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  trustItemTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#14231A',
  },
  trustItemSub: {
    fontSize: 10,
    color: '#5A6E62',
    marginTop: 1,
  },
  detailSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.md + 2,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#133E2B',
  },
  descriptionText: {
    fontSize: 13,
    color: '#5A6E62',
    lineHeight: 20,
    marginTop: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bulletDot: {
    fontSize: 12,
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    fontSize: 13,
    color: '#5A6E62',
    flex: 1,
    lineHeight: 18,
  },
  deliveryInfoCard: {
    backgroundColor: '#FAF8F5',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: 6,
    marginTop: 8,
  },
  deliveryRuleText: {
    fontSize: 12,
    color: '#5A6E62',
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: '#14231A',
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: RADIUS.full,
    gap: 3,
  },
  ratingScore: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#B45309',
  },
  reviewItem: {
    backgroundColor: '#FAF8F5',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#14231A',
  },
  reviewDate: {
    fontSize: 11,
    color: '#8F9F94',
  },
  reviewComment: {
    fontSize: 12,
    color: '#5A6E62',
    lineHeight: 16,
  },
  sampleReviewBox: {
    backgroundColor: '#FAF8F5',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  sampleReviewText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#5A6E62',
    lineHeight: 17,
  },
  sampleReviewAuthor: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B4D3E',
    marginTop: 6,
  },
  toast: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#1B4D3E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    gap: 8,
    ...SHADOWS.large,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.4)',
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

export default ProductDetailsScreen;

