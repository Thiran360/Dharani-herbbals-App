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
import { Header } from '../../components/common/Header';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon } from '../../components/common/Icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

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
  const { isTamil } = useLanguage();

  const handleClearCart = () => {
    Alert.alert(
      'Clear Shopping Bag',
      'Are you sure you want to remove all formulations from your bag?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearCart },
      ]
    );
  };

  const handleCheckout = () => {
    navigation.navigate('CheckoutScreen');
  };

  const renderCartItem = ({ item }) => {
    return (
      <View style={styles.cartItemCard}>
        {/* Product Image in warm studio frame */}
        <View style={styles.itemImageContainer}>
          <Image
            source={
              item.image && item.image.startsWith('http')
                ? { uri: item.image }
                : require('../../assets/logo.png')
            }
            style={styles.itemImage}
            resizeMode="contain"
          />
        </View>

        {/* Item Info */}
        <View style={styles.itemDetails}>
          <View style={styles.itemTitleRow}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.name}
            </Text>
            <TouchableOpacity
              onPress={() => removeFromCart(item.id, item.variation_id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.deleteBtn}
            >
              <Icon name="close" size={13} color="#8A9E92" />
            </TouchableOpacity>
          </View>

          {item.tamil_name && item.tamil_name !== item.name ? (
            <Text style={styles.itemTamilName} numberOfLines={1}>
              {item.tamil_name}
            </Text>
          ) : null}

          {item.variation_name ? (
            <View style={styles.variantBadge}>
              <Text style={styles.itemVariant}>{item.variation_name}</Text>
            </View>
          ) : null}

          <View style={styles.itemBottomRow}>
            <View>
              <Text style={styles.itemPrice}>
                ₹{(item.price * item.quantity).toFixed(0)}
              </Text>
              {item.quantity > 1 ? (
                <Text style={styles.unitPriceText}>₹{item.price.toFixed(0)} each</Text>
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
                <Icon name={item.quantity === 1 ? 'trash' : 'minus'} size={12} color="#1B4D3E" />
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
          title="Your Shopping Bag is Empty"
          subtitle="Explore our pure herbal formulations, traditional shampoos, and cold-pressed thailams to replenish your wellness ritual."
          buttonText="Explore Collections"
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
                      Complimentary Delivery Unlocked!
                    </Text>
                    <Text style={styles.freeShipSubText}>
                      Your order qualifies for free delivery to {selectedState}.
                    </Text>
                  </View>
                </View>
              ) : (
                <View>
                  <View style={styles.progressHeaderRow}>
                    <Text style={styles.freeShipNotice}>
                      Add <Text style={styles.boldText}>₹{deliveryInfo.remaining.toFixed(0)}</Text> more for <Text style={styles.greenText}>FREE Delivery</Text>
                    </Text>
                    <Text style={styles.thresholdText}>Goal: ₹{deliveryInfo.threshold}</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                  </View>
                </View>
              )}
            </View>

            {/* Destination State Selector */}
            <View style={styles.stateSelectorCard}>
              <Text style={styles.stateLabel}>Delivery Destination State</Text>
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
              <Text style={styles.itemsLabel}>Selected Formulations ({cartItems.length})</Text>
              <TouchableOpacity onPress={handleClearCart} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.clearCartText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={styles.summarySection}>
            <Text style={styles.summaryHeading}>Bill Details</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Item Subtotal</Text>
              <Text style={styles.summaryVal}>₹{subtotal.toFixed(0)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee ({selectedState})</Text>
              <Text style={[styles.summaryVal, deliveryCharge === 0 ? styles.freeDeliveryText : null]}>
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Applicable Taxes</Text>
              <Text style={styles.includedText}>All Inclusive</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>Total Payable</Text>
                <Text style={styles.totalSubtext}>Inclusive of all taxes</Text>
              </View>
              <Text style={styles.totalVal}>₹{grandTotal.toFixed(0)}</Text>
            </View>

            {/* Botanical Trust Note */}
            <View style={styles.safeDeliveryBadge}>
              <Icon name="shield" size={14} color="#1B4D3E" />
              <Text style={styles.safeDeliveryText}>
                Handcrafted & shipped with tamper-evident seal directly from Tamil Nadu
              </Text>
            </View>
          </View>
        }
      />

      {/* Luxury Checkout Bottom Bar */}
      <View style={styles.checkoutBar}>
        <View>
          <Text style={styles.bottomTotalLabel}>Total Amount</Text>
          <Text style={styles.bottomTotalVal}>₹{grandTotal.toFixed(0)}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={handleCheckout}
          activeOpacity={0.88}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout ›</Text>
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.large,
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
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: RADIUS.full,
    ...SHADOWS.medium,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default CartScreen;

