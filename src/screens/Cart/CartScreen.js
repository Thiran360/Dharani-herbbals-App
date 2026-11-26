/**
 * Shopping Cart Screen for Dharani Herbbals
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon } from '../../components/common/Icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { formatProductSize } from '../../utils/formatters';
import { getLocalizedProductName } from '../../utils/localization';
import { getOptimizedImageSource } from '../../utils/imageOptimizer';
import storage from '../../services/storage';

const CartItemThumbnail = ({ item, cachedProducts }) => {
  const [imageError, setImageError] = useState(false);

  // Look up matched product from cached products if item.image is missing or relative
  const matchedProd = cachedProducts?.find?.(p => String(p.id) === String(item.id || item.product_id));
  const rawImage =
    item.image ||
    item.product_image ||
    item.image_url ||
    item.thumbnail ||
    matchedProd?.image ||
    matchedProd?.product_image ||
    matchedProd?.thumbnail ||
    '';

  const source = (!imageError && rawImage)
    ? getOptimizedImageSource(rawImage)
    : require('../../assets/logo.png');

  return (
    <View style={styles.itemImageContainer}>
      <Image
        source={source}
        style={styles.itemImage}
        resizeMode="contain"
        onError={() => setImageError(true)}
      />
    </View>
  );
};

const STATE_OPTIONS = [
  'Tamil Nadu',
  'Kerala',
  'Karnataka',
  'Andhra Pradesh',
  'Telangana',
  'Maharashtra',
  'Delhi',
  'Other States',
];

export const CartScreen = ({ navigation }) => {
  const {
    cartItems,
    subtotal,
    deliveryCharge,
    deliveryInfo,
    grandTotal,
    selectedState,
    setSelectedState,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const {
    user,
    isAuthenticated,
    isGuest,
    isDistributorOrReseller,
    creditsEnabled,
    availableCredit,
    refreshUserProfile,
  } = useAuth();
  const { isTamil, t, language } = useLanguage();
  const insets = useSafeAreaInsets();
  const [cachedProducts, setCachedProducts] = useState([]);

  useEffect(() => {
    storage.getCachedProducts().then(prods => {
      if (Array.isArray(prods) && prods.length > 0) {
        setCachedProducts(prods);
      }
    });
    if (isAuthenticated && !isGuest && user?.id) {
      refreshUserProfile?.(user.id);
    }
  }, []);

  const handleClearCart = () => {
    Alert.alert(
      isTamil ? 'கூடையை காலி செய்' : 'Clear Shopping Bag',
      isTamil ? 'கூடையில் உள்ள அனைத்து பொருட்களையும் நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to remove all formulations from your bag?',
      [
        { text: t('cancel'), style: 'cancel' },
        { text: isTamil ? 'நீக்கு' : 'Clear All', style: 'destructive', onPress: clearCart },
      ]
    );
  };

  const handleCheckout = () => {
    if (!isAuthenticated || isGuest || !user?.id) {
      navigation.navigate('LoginScreen', {
        returnToCheckout: true,
        pendingAction: { type: 'CHECKOUT' },
      });
      return;
    }

    // Role-Based Validation for Distributor & Reseller
    if (isDistributorOrReseller) {
      if (!creditsEnabled) {
        Alert.alert(
          isTamil ? 'கிரெடிட் வசதி முடக்கப்பட்டுள்ளது' : 'Credit Facility Disabled',
          isTamil
            ? 'உங்கள் கணக்கில் கிரெடிட் கட்டண வசதி செயல்படுத்தப்படவில்லை. ஆர்டர் செய்ய தர்ணி ஹெர்பல்ஸ் நிர்வாகியைத் தொடர்பு கொள்ளவும்.'
            : 'Credit payment is disabled for your distributor/reseller account. Please contact admin.'
        );
        return;
      }

      if (subtotal > availableCredit) {
        Alert.alert(
          isTamil ? 'கிரெடிட் வரம்பு தாண்டியது' : 'Credit Limit Exceeded',
          isTamil
            ? `கார்ட் தொகை (₹${subtotal.toFixed(0)}) உங்கள் அனுமதிக்கப்பட்ட கிரெடிட் வரம்பை (₹${availableCredit.toFixed(0)}) விட அதிகமாக உள்ளது!\n\nதயவுசெய்து கார்ட்டில் எண்ணிக்கையைக் குறைக்கவும் அல்லது நிர்வாகியிடம் கிரெடிட் வரம்பை அதிகரிக்கவும்.`
            : `Your cart total (₹${subtotal.toFixed(0)}) exceeds your available credit limit (₹${availableCredit.toFixed(0)}).\n\nPlease reduce cart quantity or contact admin.`
        );
        return;
      }
    }

    navigation.navigate('CheckoutScreen');
  };

  const renderCartItem = ({ item }) => {
    return (
      <View style={styles.cartItemCard}>
        {/* Product Image with robust thumbnail fallback */}
        <CartItemThumbnail item={item} cachedProducts={cachedProducts} />

        {/* Item Info */}
        <View style={styles.itemDetails}>
          <View style={styles.itemTitleRow}>
            <Text style={styles.itemName} numberOfLines={2}>
              {getLocalizedProductName(item, language)}
            </Text>
            <TouchableOpacity
              onPress={() => removeFromCart(item.id, item.variation_id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.deleteBtn}
            >
              <Icon name="close" size={13} color="#8A9E92" />
            </TouchableOpacity>
          </View>

          {(() => {
            const formattedSize = formatProductSize(item);
            const variantText = item.variation_name || formattedSize;
            return variantText ? (
              <View style={styles.variantBadge}>
                <Text style={styles.itemVariant}>{variantText}</Text>
              </View>
            ) : null;
          })()}

          <View style={styles.itemBottomRow}>
            <View>
              <Text style={styles.itemPrice}>
                ₹{(item.price * item.quantity).toFixed(0)}
              </Text>
              {item.quantity > 1 ? (
                <Text style={styles.unitPriceText}>
                  {isTamil ? `₹${item.price.toFixed(0)} ஒவ்வொன்றும்` : `₹${item.price.toFixed(0)} each`}
                </Text>
              ) : null}
            </View>

            {/* Luxury Stepper */}
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => {
                  if (item.quantity === 1) {
                    removeFromCart(item.id, item.variation_id);
                  } else {
                    updateQuantity(item.id, -1, item.variation_id);
                  }
                }}
                activeOpacity={0.7}
              >
                <Icon
                  name={item.quantity === 1 ? 'trash' : 'minus'}
                  size={item.quantity === 1 ? 14 : 12}
                  color={item.quantity === 1 ? '#D9534F' : '#1B4D3E'}
                />
              </TouchableOpacity>

              <Text style={styles.stepQty}>{item.quantity}</Text>

              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => updateQuantity(item.id, 1, item.variation_id)}
                activeOpacity={0.7}
              >
                <Icon name="plus" size={12} color="#1B4D3E" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <Header title={isTamil ? 'கூடை' : 'Your Shopping Bag'} showBack={false} showCart={false} showLogo={false} />
        <EmptyState
          icon="cart"
          title={t('emptyCart')}
          subtitle={t('emptyCartSubtitle')}
          buttonText={isTamil ? 'பிரிவுகளை காண்க' : 'Explore Collections'}
          onButtonPress={() => navigation.navigate('MainTabs', { screen: 'CategoriesTab' })}
        />
      </View>
    );
  }

  // Calculate free delivery progress
  const progressPercent = deliveryInfo.threshold > 0
    ? Math.min(100, (subtotal / deliveryInfo.threshold) * 100)
    : 100;

  return (
    <View style={styles.container}>
      <Header
        title={isTamil ? `கூடை (${cartItems.length})` : `Shopping Bag (${cartItems.length})`}
        showBack={false}
        showCart={false}
        showLogo={false}
      />

      <FlatList
        data={cartItems}
        keyExtractor={(item, idx) => `cart-${item.id}-${item.variation_id || idx}`}
        renderItem={renderCartItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {isDistributorOrReseller ? (
              <View style={styles.creditCard}>
                <View style={styles.creditHeaderRow}>
                  <View style={styles.creditBadge}>
                    <Text style={styles.creditBadgeText}>
                      {user?.userType === 'reseller' || user?.role === 'reseller'
                        ? (isTamil ? 'ரீசெல்லர் கணக்கு' : 'Reseller Account')
                        : (isTamil ? 'டிஸ்ட்ரிபியூட்டர் கணக்கு' : 'Distributor Account')}
                    </Text>
                  </View>
                  <View style={[styles.statusPill, creditsEnabled ? styles.statusPillActive : styles.statusPillDisabled]}>
                    <Text style={[styles.statusPillText, creditsEnabled ? styles.statusPillTextActive : styles.statusPillTextDisabled]}>
                      {creditsEnabled
                        ? (isTamil ? '✓ கிரெடிட் வசதி உள்ளது' : '✓ Credit Enabled')
                        : (isTamil ? '✕ கிரெடிட் முடக்கம்' : '✕ Credit Disabled')}
                    </Text>
                  </View>
                </View>

                <View style={styles.creditDetailsGrid}>
                  <View style={styles.creditItem}>
                    <Text style={styles.creditLabel}>{isTamil ? 'அனுமதிக்கப்பட்ட வரம்பு' : 'Credit Limit'}</Text>
                    <Text style={styles.creditValue}>₹{(user?.creditLimit || 0).toFixed(0)}</Text>
                  </View>
                  <View style={styles.creditDivider} />
                  <View style={styles.creditItem}>
                    <Text style={styles.creditLabel}>{isTamil ? 'கிடைக்கக்கூடிய இருப்பு' : 'Available Credit'}</Text>
                    <Text style={[styles.creditValue, { color: availableCredit >= subtotal ? '#1B4D3E' : '#DC2626' }]}>
                      ₹{availableCredit.toFixed(0)}
                    </Text>
                  </View>
                  <View style={styles.creditDivider} />
                  <View style={styles.creditItem}>
                    <Text style={styles.creditLabel}>{isTamil ? 'பயன்படுத்திய தொகை' : 'Used Balance'}</Text>
                    <Text style={styles.creditValue}>₹{(user?.balance || 0).toFixed(0)}</Text>
                  </View>
                </View>

                {!creditsEnabled ? (
                  <View style={styles.creditWarningBox}>
                    <Icon name="alert-circle" size={14} color="#DC2626" />
                    <Text style={styles.creditWarningText}>
                      {isTamil
                        ? 'உங்கள் கணக்கில் கிரெடிட் கட்டணம் முடக்கப்பட்டுள்ளது. நிர்வாகியைத் தொடர்பு கொள்ளவும்.'
                        : 'Credit facility is disabled. Please contact admin to activate.'}
                    </Text>
                  </View>
                ) : subtotal > availableCredit ? (
                  <View style={styles.creditWarningBox}>
                    <Icon name="alert-circle" size={14} color="#DC2626" />
                    <Text style={styles.creditWarningText}>
                      {isTamil
                        ? `கார்ட் தொகை (₹${subtotal.toFixed(0)}) உங்கள் கிரெடிட் வரம்பை (₹${availableCredit.toFixed(0)}) விட அதிகம். ஆர்டரை தொடர எண்ணிக்கையைக் குறைக்கவும்.`
                        : `Cart total (₹${subtotal.toFixed(0)}) exceeds your available credit (₹${availableCredit.toFixed(0)}).`}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            <View style={styles.itemsHeader}>
              <Text style={styles.itemsLabel}>
                {isTamil ? `தேர்ந்தெடுக்கப்பட்ட பொருட்கள் (${cartItems.length})` : `Selected Formulations (${cartItems.length})`}
              </Text>
              <TouchableOpacity onPress={handleClearCart} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.clearCartText}>{isTamil ? 'அனைத்தையும் நீக்கு' : 'Clear All'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={styles.summarySection}>
            <Text style={styles.summaryHeading}>{t('priceDetails')}</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{isTamil ? 'பொருட்களின் மொத்த விலை' : 'Items Subtotal'}</Text>
              <Text style={styles.summaryVal}>₹{subtotal.toFixed(0)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{isTamil ? 'பொருந்தும் வரிகள்' : 'Applicable Taxes'}</Text>
              <Text style={styles.includedText}>{isTamil ? 'அனைத்தும் அடங்கும்' : 'All Inclusive'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>{t('total')}</Text>
                <Text style={styles.totalSubtext}>
                  {isTamil ? 'டெலிவரி கட்டணம் செக்-அவுட்டில் கணக்கிடப்படும்' : 'Shipping calculated at Checkout'}
                </Text>
              </View>
              <Text style={styles.totalVal}>₹{subtotal.toFixed(0)}</Text>
            </View>

            {/* Botanical Trust Note */}
            <View style={styles.safeDeliveryBadge}>
              <Icon name="shield" size={14} color="#1B4D3E" />
              <Text style={styles.safeDeliveryText}>
                {isTamil
                  ? 'தமிழ்நாட்டிலிருந்து நேரடியாக தூய்மையான பேக்கிங்குடன் அனுப்பப்படுகிறது'
                  : 'Handcrafted & shipped with tamper-evident seal directly from Tamil Nadu'}
              </Text>
            </View>
          </View>
        }
      />

      {/* Clean White Checkout Bottom Bar with subtle outline */}
      <View
        style={[
          styles.checkoutBar,
          {
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <View style={styles.totalContainer}>
          <Text style={styles.bottomTotalLabel}>{t('total')}</Text>
          <Text style={styles.bottomTotalVal}>₹{subtotal.toFixed(0)}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={handleCheckout}
          activeOpacity={0.88}
        >
          <Text style={styles.checkoutBtnText}>{t('proceedToCheckout')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 110,
  },
  freeShippingCard: {
    backgroundColor: '#EBF2ED',
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.14)',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  freeShipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  freeShipIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  freeShipTextContainer: {
    flex: 1,
  },
  freeShipSuccessText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1B4D3E',
  },
  freeShipSubText: {
    fontSize: 11.5,
    color: '#5A6E62',
    marginTop: 1,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  freeShipNotice: {
    fontSize: 12.5,
    color: '#14231A',
  },
  thresholdText: {
    fontSize: 11,
    color: '#5A6E62',
    fontWeight: '700',
  },
  boldText: {
    fontWeight: '800',
    color: '#1B4D3E',
  },
  greenText: {
    color: '#1B4D3E',
    fontWeight: '800',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(27, 77, 62, 0.1)',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1B4D3E',
    borderRadius: RADIUS.full,
  },
  stateSelectorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  stateLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5A6E62',
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  statesScroll: {
    flexDirection: 'row',
  },
  statePill: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: '#FAF8F5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
  },
  statePillActive: {
    backgroundColor: '#1B4D3E',
    borderColor: '#1B4D3E',
  },
  statePillText: {
    fontSize: 12,
    color: '#5A6E62',
    fontWeight: '600',
  },
  statePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingHorizontal: 4,
  },
  itemsLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1B4D3E',
    letterSpacing: -0.2,
  },
  clearCartText: {
    fontSize: 12,
    color: '#C25E3E',
    fontWeight: '700',
  },
  cartItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  itemImageContainer: {
    width: 82,
    height: 82,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  itemImage: {
    width: 74,
    height: 74,
  },
  creditCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...SHADOWS.small,
  },
  creditHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  creditBadge: {
    backgroundColor: '#EBF2ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  creditBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillActive: {
    backgroundColor: 'rgba(27, 77, 62, 0.12)',
  },
  statusPillDisabled: {
    backgroundColor: '#FEE2E2',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusPillTextActive: {
    color: '#1B4D3E',
  },
  statusPillTextDisabled: {
    color: '#DC2626',
  },
  creditDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
  },
  creditItem: {
    flex: 1,
    alignItems: 'center',
  },
  creditDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  creditLabel: {
    fontSize: 10.5,
    color: '#64748B',
    marginBottom: 3,
    textAlign: 'center',
  },
  creditValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  creditWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    gap: 6,
  },
  creditWarningText: {
    flex: 1,
    fontSize: 11.5,
    color: '#B91C1C',
    fontWeight: '600',
    lineHeight: 16,
  },
  itemDetails: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'space-between',
  },
  itemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#14231A',
    flex: 1,
    lineHeight: 18,
  },
  deleteBtn: {
    padding: 2,
    marginLeft: 6,
  },
  itemTamilName: {
    fontSize: 11.5,
    color: '#5B8266',
    marginTop: 2,
  },
  variantBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    marginTop: 3,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
  },
  itemVariant: {
    fontSize: 10.5,
    color: '#5A6E62',
    fontWeight: '600',
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B4D3E',
  },
  unitPriceText: {
    fontSize: 11,
    color: '#8A9E92',
    fontWeight: '500',
    marginTop: 1,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.15)',
    borderRadius: RADIUS.full,
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  stepQty: {
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: '800',
    color: '#1B4D3E',
  },
  summarySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  summaryHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B4D3E',
    marginBottom: SPACING.md,
    letterSpacing: -0.2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#5A6E62',
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#14231A',
  },
  freeDeliveryText: {
    color: '#1B4D3E',
    fontWeight: '800',
  },
  includedText: {
    fontSize: 12,
    color: '#5B8266',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(27, 77, 62, 0.08)',
    marginVertical: SPACING.sm + 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#14231A',
  },
  totalSubtext: {
    fontSize: 10.5,
    color: '#8A9E92',
    marginTop: 1,
  },
  totalVal: {
    fontSize: 21,
    fontWeight: '900',
    color: '#1B4D3E',
  },
  safeDeliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF2ED',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    gap: 8,
    marginTop: SPACING.md,
  },
  safeDeliveryText: {
    fontSize: 11,
    color: '#1B4D3E',
    flex: 1,
    lineHeight: 15,
    fontWeight: '600',
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1.5,
    borderTopColor: '#E2E8F0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  totalContainer: {
    marginRight: SPACING.sm,
  },
  bottomTotalLabel: {
    fontSize: 11,
    color: '#5A6E62',
    fontWeight: '600',
  },
  bottomTotalVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1B4D3E',
  },
  checkoutBtn: {
    backgroundColor: '#1B4D3E',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: RADIUS.full,
    flex: 1,
    maxWidth: 240,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});

export default CartScreen;

