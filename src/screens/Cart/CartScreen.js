/**
 * Shopping Cart Screen for Dharani Herbbals
 */

import React from 'react';
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
  const { user, isAuthenticated, isGuest } = useAuth();
  const { isTamil, t, language } = useLanguage();
  const insets = useSafeAreaInsets();

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
    navigation.navigate('CheckoutScreen');
  };

  const renderCartItem = ({ item }) => {
    return (
      <View style={styles.cartItemCard}>
        {/* Product Image in warm studio frame */}
        <View style={styles.itemImageContainer}>
          <Image
            source={getOptimizedImageSource(item.image)}
            style={styles.itemImage}
            resizeMode="contain"
            defaultSource={require('../../assets/logo.png')}
          />
        </View>

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
          <View>
            {/* Luxury Free Shipping Progress Indicator */}
            <View style={styles.freeShippingCard}>
              {deliveryInfo.isFree ? (
                <View style={styles.freeShipHeader}>
                  <View style={styles.freeShipIconBadge}>
                    <Icon name="check" size={14} color="#1B4D3E" />
                  </View>
                  <View style={styles.freeShipTextContainer}>
                    <Text style={styles.freeShipSuccessText}>
                      {isTamil ? 'இலவச டெலிவரி கிடைத்துள்ளது!' : 'Complimentary Delivery Unlocked!'}
                    </Text>
                    <Text style={styles.freeShipSubText}>
                      {isTamil
                        ? `${selectedState} மாநிலத்திற்கு இலவச டெலிவரிக்கு தகுதி பெற்றுள்ளது.`
                        : `Your order qualifies for free delivery to ${selectedState}.`}
                    </Text>
                  </View>
                </View>
              ) : (
                <View>
                  <View style={styles.progressHeaderRow}>
                    <Text style={styles.freeShipNotice}>
                      {isTamil ? (
                        <>இலவச டெலிவரிக்கு மேலும் <Text style={styles.boldText}>₹{deliveryInfo.remaining.toFixed(0)}</Text> சேர்க்கவும்</>
                      ) : (
                        <>Add <Text style={styles.boldText}>₹{deliveryInfo.remaining.toFixed(0)}</Text> more for <Text style={styles.greenText}>FREE Delivery</Text></>
                      )}
                    </Text>
                    <Text style={styles.thresholdText}>{isTamil ? `இலக்கு: ₹${deliveryInfo.threshold}` : `Goal: ₹${deliveryInfo.threshold}`}</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                  </View>
                </View>
              )}
            </View>

            {/* Destination State Selector */}
            <View style={styles.stateSelectorCard}>
              <Text style={styles.stateLabel}>{isTamil ? 'டெலிவரி சேருமிடம் மாநிலம்' : 'Delivery Destination State'}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statesScroll}>
                {STATE_OPTIONS.map(st => (
                  <TouchableOpacity
                    key={`st-${st}`}
                    style={[styles.statePill, selectedState === st ? styles.statePillActive : null]}
                    onPress={() => setSelectedState(st)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.statePillText, selectedState === st ? styles.statePillTextActive : null]}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

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
              <Text style={styles.summaryLabel}>{t('subtotal')}</Text>
              <Text style={styles.summaryVal}>₹{subtotal.toFixed(0)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{isTamil ? `டெலிவரி கட்டணம் (${selectedState})` : `Delivery Fee (${selectedState})`}</Text>
              <Text style={[styles.summaryVal, deliveryCharge === 0 ? styles.freeDeliveryText : null]}>
                {deliveryCharge === 0 ? (isTamil ? 'இலவசம்' : 'FREE') : `₹${deliveryCharge}`}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{isTamil ? 'பொருந்தும் வரிகள்' : 'Applicable Taxes'}</Text>
              <Text style={styles.includedText}>{isTamil ? 'அனைத்தும் அடங்கும்' : 'All Inclusive'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>{t('total')}</Text>
                <Text style={styles.totalSubtext}>{isTamil ? 'அனைத்து வரிகளும் அடங்கும்' : 'Inclusive of all taxes'}</Text>
              </View>
              <Text style={styles.totalVal}>₹{grandTotal.toFixed(0)}</Text>
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

      {/* Luxury Checkout Bottom Bar */}
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
          <Text style={styles.bottomTotalVal}>₹{grandTotal.toFixed(0)}</Text>
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
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm + 2,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  itemImageContainer: {
    width: 76,
    height: 76,
    borderRadius: RADIUS.lg,
    backgroundColor: '#FAF8F5',
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.06)',
  },
  itemImage: {
    width: '100%',
    height: '100%',
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
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.large,
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

