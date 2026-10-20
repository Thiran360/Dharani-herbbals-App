/**
 * Checkout Screen for Dharani Herbbals
 * Exact reproduction of official checkout journey with luxury botanical styling
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Linking,
  AppState,
  Modal,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { Icon } from '../../components/common/Icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

const STATES_LIST = [
  'Tamil Nadu',
  'Kerala',
  'Karnataka',
  'Andhra Pradesh',
  'Telangana',
  'Maharashtra',
  'Delhi',
  'Gujarat',
  'Puducherry',
  'Other States',
];

export const CheckoutScreen = ({ navigation }) => {
  const { cartItems, subtotal, deliveryCharge, deliveryInfo, grandTotal, selectedState, setSelectedState, clearCart } = useCart();
  const { user, isGuest } = useAuth();
  const { isTamil } = useLanguage();
  const insets = useSafeAreaInsets();

  // Contact Details
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || user?.phone_number || '');
  const [email, setEmail] = useState(user?.email || '');

  // Address Details
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState(selectedState || 'Tamil Nadu');
  const [pincode, setPincode] = useState('');

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Payment Method: 'cod' | 'paytm' | 'payglocal'
  const [paymentMethod, setPaymentMethod] = useState('payglocal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // PayGlocal State
  const [payglocalModalVisible, setPayglocalModalVisible] = useState(false);
  const [payglocalStatus, setPayglocalStatus] = useState('waiting');
  const [activeTxnId, setActiveTxnId] = useState(null);
  const [activeGid, setActiveGid] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Deep Linking & AppState listener for PayGlocal payment returns
  useEffect(() => {
    Linking.getInitialURL().then(url => {
      if (url && url.includes('payment-callback')) {
        handlePaymentDeepLink(url);
      }
    });

    const linkingSub = Linking.addEventListener('url', event => {
      if (event.url && event.url.includes('payment-callback')) {
        handlePaymentDeepLink(event.url);
      }
    });

    const appStateSub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active' && (activeTxnId || activeGid) && payglocalModalVisible) {
        verifyTransaction({ gid: activeGid, txnId: activeTxnId, orderId: activeOrderId });
      }
    });

    return () => {
      linkingSub.remove();
      appStateSub.remove();
    };
  }, [activeTxnId, activeGid, activeOrderId, payglocalModalVisible]);

  const handlePaymentDeepLink = async url => {
    try {
      const queryString = url.split('?')[1];
      if (!queryString) return;
      const params = {};
      queryString.split('&').forEach(part => {
        const [k, v] = part.split('=');
        if (k && v) params[decodeURIComponent(k)] = decodeURIComponent(v);
      });

      const txnId = params.merchantTxnId || params.merchant_txn_id || params.txnId || activeTxnId;
      const gid = params.gid || params.gateway_transaction_id || params.token || params.x_gl_token || activeGid;
      const orderId = params.order_id || params.orderId || activeOrderId;

      if (gid || txnId) {
        await verifyTransaction({ gid, txnId, orderId });
      }
    } catch (err) {
      console.warn('Deep link handling error:', err.message);
    }
  };

  const verifyTransaction = async queryParams => {
    let targetTxn = activeTxnId;
    let targetGid = activeGid;
    let targetOrderId = activeOrderId;

    if (typeof queryParams === 'string') {
      targetTxn = queryParams;
    } else if (queryParams && typeof queryParams === 'object') {
      if (queryParams.txnId) targetTxn = queryParams.txnId;
      if (queryParams.gid) targetGid = queryParams.gid;
      if (queryParams.orderId) targetOrderId = queryParams.orderId;
    }

    if (!targetTxn && !targetGid) return;

    setIsVerifying(true);
    setPayglocalStatus('verifying');

    try {
      const result = await api.verifyPayGlocalPayment({
        gid: targetGid,
        merchantTxnId: targetTxn,
        orderId: targetOrderId,
      });

      if (result && (result.status === 'COMPLETED' || result.isPaid)) {
        setPayglocalModalVisible(false);
        setActiveTxnId(null);
        setActiveGid(null);
        setIsVerifying(false);
        await clearCart();

        const fullShippingAddress = `${name}, ${streetAddress}, ${city}, ${state} - ${pincode}. Phone: ${mobile}`;

        navigation.replace('OrderSuccessScreen', {
          orderId: result.orderId || targetOrderId || `DH-${Date.now().toString().slice(-6)}`,
          totalAmount: result.totalAmount || grandTotal,
          paymentMethod: 'PayGlocal Gateway (Verified)',
          shippingAddress: fullShippingAddress,
          itemCount: cartItems.length,
          items: cartItems,
        });
      } else if (result && ['FAILED', 'CANCELLED', 'ISSUER_DECLINE'].includes(result.status)) {
        setIsVerifying(false);
        setPayglocalStatus('failed');
        Alert.alert(
          'Payment Incomplete',
          'The payment was not completed or was declined. Your items remain safely in your cart. You may retry or select another payment option.',
          [
            {
              text: 'OK',
              onPress: () => {
                setPayglocalModalVisible(false);
                setActiveTxnId(null);
                setActiveGid(null);
              },
            },
          ]
        );
      } else {
        setIsVerifying(false);
        setPayglocalStatus('waiting');
      }
    } catch (err) {
      console.warn('Verification request note:', err.message);
      setIsVerifying(false);
      setPayglocalStatus('waiting');
    }
  };

  useEffect(() => {
    if (user?.id && !isGuest) {
      api.getAddresses(user.id).then(addrs => {
        if (Array.isArray(addrs) && addrs.length > 0) {
          setSavedAddresses(addrs);
          applyAddress(addrs[0]);
        }
      });
    }
  }, [user, isGuest]);

  const applyAddress = addr => {
    setSelectedAddressId(addr.id || addr.address_id);
    setName(addr.full_name || name);
    setMobile(addr.phone || mobile);
    setStreetAddress(addr.address || '');
    setCity(addr.city || '');
    if (addr.state) {
      setState(addr.state);
      setSelectedState(addr.state);
    }
    setPincode(addr.pincode || '');
  };

  const handleStateChange = newState => {
    setState(newState);
    setSelectedState(newState);
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter your full name.');
      return false;
    }
    if (!mobile.trim() || mobile.trim().length < 10) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number.');
      return false;
    }
    if (!streetAddress.trim()) {
      Alert.alert('Required Field', 'Please enter your delivery street address.');
      return false;
    }
    if (!city.trim()) {
      Alert.alert('Required Field', 'Please enter your city / town.');
      return false;
    }
    if (!pincode.trim() || pincode.trim().length < 6) {
      Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit postal code.');
      return false;
    }

    // Check minimum order rule
    if (deliveryInfo.minOrder > 0 && subtotal < deliveryInfo.minOrder) {
      Alert.alert(
        'Minimum Order Required',
        `The minimum order amount for ${state} is ₹${deliveryInfo.minOrder}. Please add more items to proceed.`
      );
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const fullShippingAddress = `${name}, ${streetAddress}, ${city}, ${state} - ${pincode}. Phone: ${mobile}`;

    // Standard Order Payload for Django Checkout
    const orderPayload = {
      user_id: user?.id || 64036,
      address_id: selectedAddressId || 1,
      shipping_address: fullShippingAddress,
      city: city,
      state: state,
      pincode: pincode,
      phone: mobile,
      customer_type: user?.role || 'customer',
      category: user?.role || 'customer',
      role: user?.role || 'customer',
      total_amount: grandTotal,
      amount: grandTotal,
      payment_method: paymentMethod,
      name,
      email: email || 'customer@dharaniherbbals.in',
      items: cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        variation_id: item.variation_id || null,
      })),
    };

    // PayGlocal Payment Flow (Connected directly to Django backend)
    if (paymentMethod === 'payglocal') {
      try {
        // Step 1: Initialize order in Django database via /checkout/
        let createdOrder = null;
        try {
          createdOrder = await api.createCheckout(orderPayload);
        } catch (chkErr) {
          if (chkErr.message && chkErr.message.includes('Cart is empty')) {
            // Sync cart items to backend cart and retry
            for (const item of cartItems) {
              try {
                await api.addToCart({
                  userId: user?.id || 64036,
                  productId: item.id,
                  quantity: item.quantity,
                  variationId: item.variation_id,
                });
              } catch {}
            }
            createdOrder = await api.createCheckout(orderPayload);
          } else {
            throw chkErr;
          }
        }

        const numericOrderId = createdOrder?.order_id || createdOrder?.id;
        if (!numericOrderId) {
          throw new Error(createdOrder?.message || 'Failed to initialize order on server.');
        }

        const payableAmount = createdOrder?.amount_to_pay || createdOrder?.total_amount || grandTotal;

        // Step 2: Call existing Django PayGlocal create endpoint (/herbal/payglocal/create/)
        const res = await api.initiatePayGlocalPayment({
          orderId: numericOrderId,
          amount: payableAmount,
          userId: user?.id || 64036,
          mobile,
          email,
          returnUrl: 'dharani://payment-callback',
        });

        if (res && res.success && res.redirectUrl) {
          setActiveTxnId(res.merchantTxnId);
          setActiveGid(res.gid);
          setActiveOrderId(numericOrderId);
          setPayglocalStatus('waiting');
          setPayglocalModalVisible(true);

          try {
            await Linking.openURL(res.redirectUrl);
          } catch (linkErr) {
            console.warn('Linking openURL error:', linkErr.message);
          }
        } else {
          Alert.alert('Payment Initiation', res?.error || 'Unable to connect to PayGlocal gateway. Please retry.');
        }
      } catch (err) {
        Alert.alert('PayGlocal Payment', err.message || 'Payment initiation failed. Please check your connection.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      let createdOrder = null;
      try {
        const res = await api.createCheckout(orderPayload);
        createdOrder = res;
      } catch (apiErr) {
        console.warn('API checkout note:', apiErr.message);
      }

      const generatedOrderId = createdOrder?.order_id || createdOrder?.id || `DH-${Date.now().toString().slice(-6)}`;

      // Clear Cart
      await clearCart();

      // Navigate to Order Success
      navigation.replace('OrderSuccessScreen', {
        orderId: generatedOrderId,
        totalAmount: grandTotal,
        paymentMethod: paymentMethod,
        shippingAddress: fullShippingAddress,
        itemCount: cartItems.length,
        items: cartItems,
      });
    } catch (error) {
      Alert.alert('Order Placement', 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Checkout" showBack={true} showCart={false} showLogo={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Saved Addresses (if any) */}
        {savedAddresses.length > 0 ? (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.stepBadge}>
                <Icon name="map-pin" size={13} color="#1B4D3E" />
              </View>
              <Text style={styles.cardTitle}>Deliver to Saved Address</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.savedAddrsRow}>
              {savedAddresses.map(addr => {
                const isSelected = selectedAddressId === (addr.id || addr.address_id);
                return (
                  <TouchableOpacity
                    key={`saved-${addr.id || addr.address_id}`}
                    style={[styles.savedAddrCard, isSelected ? styles.savedAddrCardActive : null]}
                    onPress={() => applyAddress(addr)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.savedAddrHeader}>
                      <Text style={styles.savedAddrName}>{addr.full_name || 'Home'}</Text>
                      {isSelected ? (
                        <View style={styles.selectedDot} />
                      ) : null}
                    </View>
                    <Text style={styles.savedAddrText} numberOfLines={2}>
                      {addr.address}, {addr.city}
                    </Text>
                    <Text style={styles.savedAddrPhone}>{addr.phone}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {/* 1. Contact Information */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeNum}>1</Text>
            </View>
            <Text style={styles.cardTitle}>Customer Information</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#8A9E92"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Phone *</Text>
            <TextInput
              style={styles.input}
              placeholder="10-digit mobile number"
              placeholderTextColor="#8A9E92"
              keyboardType="phone-pad"
              value={mobile}
              onChangeText={setMobile}
              maxLength={10}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="For order tracking updates (Optional)"
              placeholderTextColor="#8A9E92"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* 2. Shipping Address */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeNum}>2</Text>
            </View>
            <Text style={styles.cardTitle}>Delivery Address</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Street / Door No / Landmark *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="House/Flat No., Street, Area, Landmark"
              placeholderTextColor="#8A9E92"
              value={streetAddress}
              onChangeText={setStreetAddress}
              multiline
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>City / Town *</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor="#8A9E92"
                value={city}
                onChangeText={setCity}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Pincode *</Text>
              <TextInput
                style={styles.input}
                placeholder="6-digit PIN"
                placeholderTextColor="#8A9E92"
                keyboardType="numeric"
                value={pincode}
                onChangeText={setPincode}
                maxLength={6}
              />
            </View>
          </View>

          {/* State Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Delivery State *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stateScroll}>
              {STATES_LIST.map(st => (
                <TouchableOpacity
                  key={`chk-st-${st}`}
                  style={[styles.stateChip, state === st ? styles.stateChipActive : null]}
                  onPress={() => handleStateChange(st)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.stateChipText, state === st ? styles.stateChipTextActive : null]}>
                    {st}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.shippingNotice}>
            <Icon name="truck" size={16} color="#1B4D3E" />
            <Text style={styles.shippingNoticeText}>
              Shipping to {state}: {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
              {deliveryInfo.isFree ? ' (Free delivery unlocked!)' : ` (Orders over ₹${deliveryInfo.threshold} get FREE delivery)`}
            </Text>
          </View>
        </View>

        {/* 3. Payment Method */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeNum}>3</Text>
            </View>
            <Text style={styles.cardTitle}>Payment Method</Text>
          </View>

          {/* PayGlocal Hosted Gateway */}
          <TouchableOpacity
            style={[styles.payOption, paymentMethod === 'payglocal' ? styles.payOptionActive : null]}
            onPress={() => setPaymentMethod('payglocal')}
            activeOpacity={0.8}
          >
            <View style={styles.radioCircle}>
              {paymentMethod === 'payglocal' ? <View style={styles.radioInner} /> : null}
            </View>
            <View style={styles.payDetails}>
              <View style={styles.payTitleRow}>
                <Text style={styles.payTitle}>PayGlocal Gateway (Cards, UPI, NetBanking)</Text>
                <View style={[styles.verifiedBadge, { backgroundColor: '#1B4D3E' }]}>
                  <Text style={styles.verifiedBadgeText}>Instant & Secure</Text>
                </View>
              </View>
              <Text style={styles.paySub}>Pay securely via GPay, PhonePe, Paytm, RuPay, Visa, Mastercard & Global Payments</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 4. Order Summary Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeNum}>4</Text>
            </View>
            <Text style={styles.cardTitle}>Order Summary</Text>
          </View>

          <View style={styles.summaryLine}>
            <Text style={styles.summaryLabel}>{cartItems.length} Formulation(s)</Text>
            <Text style={styles.summaryValue}>₹{subtotal.toFixed(0)}</Text>
          </View>

          <View style={styles.summaryLine}>
            <Text style={styles.summaryLabel}>Shipping to {state}</Text>
            <Text style={[styles.summaryValue, deliveryCharge === 0 ? styles.freeText : null]}>
              {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
            </Text>
          </View>

          <View style={styles.summaryLine}>
            <Text style={styles.summaryLabel}>Taxes & Quality Packaging</Text>
            <Text style={styles.includedValue}>Included</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalLine}>
            <View>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalSub}>Inclusive of all charges</Text>
            </View>
            <Text style={styles.totalValue}>₹{grandTotal.toFixed(0)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Fixed Bottom Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingTop: 16,
            paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 26 : 16) + 16,
          },
        ]}
      >
        <View>
          <Text style={styles.barTotalLabel}>Amount to Pay</Text>
          <Text style={styles.barTotalValue}>₹{grandTotal.toFixed(0)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderBtn, isSubmitting ? styles.btnDisabled : null]}
          onPress={handlePlaceOrder}
          disabled={isSubmitting}
          activeOpacity={0.88}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.placeOrderText}>Confirm & Place Order ›</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* PayGlocal Hosted Verification Modal */}
      <Modal
        visible={payglocalModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalBadge}>
              <Icon name="shield" size={26} color="#1B4D3E" />
            </View>
            <Text style={styles.modalTitle}>PayGlocal Payment</Text>
            <Text style={styles.modalSubtitle}>
              {isVerifying || payglocalStatus === 'verifying'
                ? 'Verifying bank transaction status...'
                : 'Please complete your payment in the browser window.'}
            </Text>

            <View style={styles.modalInfoBox}>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Order ID</Text>
                <Text style={styles.modalInfoValue}>{activeOrderId || 'DH-Pending'}</Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Total Payable</Text>
                <Text style={styles.modalInfoAmount}>₹{grandTotal.toFixed(0)}</Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Gateway Status</Text>
                <Text style={[styles.modalInfoStatus, { color: isVerifying ? '#C8963E' : '#1B4D3E' }]}>
                  {isVerifying || payglocalStatus === 'verifying' ? 'Verifying with Bank...' : 'Awaiting Payment'}
                </Text>
              </View>
            </View>

            {(isVerifying || payglocalStatus === 'verifying') && (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="small" color="#1B4D3E" />
                <Text style={styles.modalLoadingText}>Confirming authoritative settlement...</Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalVerifyBtn}
                onPress={() => verifyTransaction({ gid: activeGid, txnId: activeTxnId, orderId: activeOrderId })}
                disabled={isVerifying}
                activeOpacity={0.82}
              >
                <Text style={styles.modalVerifyBtnText}>Check Payment Status</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setPayglocalModalVisible(false);
                  setActiveTxnId(null);
                  setActiveGid(null);
                  setActiveOrderId(null);
                  setIsVerifying(false);
                }}
                disabled={isVerifying}
                activeOpacity={0.82}
              >
                <Text style={styles.modalCancelBtnText}>Cancel & Keep Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 160,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: 10,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EBF2ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.15)',
  },
  stepBadgeNum: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1B4D3E',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B4D3E',
    letterSpacing: -0.2,
  },
  savedAddrsRow: {
    flexDirection: 'row',
  },
  savedAddrCard: {
    width: 210,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.2,
    borderColor: 'rgba(27, 77, 62, 0.12)',
    backgroundColor: '#FAF8F5',
    marginRight: SPACING.sm,
  },
  savedAddrCardActive: {
    borderColor: '#1B4D3E',
    backgroundColor: '#EBF2ED',
  },
  savedAddrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1B4D3E',
  },
  savedAddrName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#14231A',
  },
  savedAddrText: {
    fontSize: 11,
    color: '#5A6E62',
    marginTop: 4,
    lineHeight: 15,
  },
  savedAddrPhone: {
    fontSize: 11,
    color: '#1B4D3E',
    fontWeight: '700',
    marginTop: 6,
  },
  inputGroup: {
    marginBottom: SPACING.sm + 4,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#5A6E62',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1.2,
    borderColor: 'rgba(27, 77, 62, 0.12)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 46,
    fontSize: 13.5,
    color: '#14231A',
    fontWeight: '500',
  },
  textArea: {
    height: 72,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
  },
  stateScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  stateChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: '#FAF8F5',
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
  },
  stateChipActive: {
    backgroundColor: '#1B4D3E',
    borderColor: '#1B4D3E',
  },
  stateChipText: {
    fontSize: 12,
    color: '#5A6E62',
    fontWeight: '600',
  },
  stateChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  shippingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF2ED',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: 8,
    marginTop: 6,
  },
  shippingNoticeText: {
    fontSize: 11.5,
    color: '#1B4D3E',
    flex: 1,
    lineHeight: 16,
    fontWeight: '600',
  },
  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(27, 77, 62, 0.12)',
    marginBottom: SPACING.sm + 2,
    backgroundColor: '#FAF8F5',
  },
  payOptionActive: {
    borderColor: '#1B4D3E',
    backgroundColor: '#EBF2ED',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1B4D3E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1B4D3E',
  },
  payDetails: {
    flex: 1,
  },
  payTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  payTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#14231A',
  },
  verifiedBadge: {
    backgroundColor: '#C8963E',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  paySub: {
    fontSize: 11,
    color: '#5A6E62',
    marginTop: 3,
    lineHeight: 15,
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#5A6E62',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#14231A',
  },
  includedValue: {
    fontSize: 12,
    color: '#5B8266',
    fontWeight: '600',
  },
  freeText: {
    color: '#1B4D3E',
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(27, 77, 62, 0.08)',
    marginVertical: SPACING.sm + 2,
  },
  totalLine: {
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
  totalSub: {
    fontSize: 10.5,
    color: '#8A9E92',
    marginTop: 1,
  },
  totalValue: {
    fontSize: 21,
    fontWeight: '900',
    color: '#1B4D3E',
  },
  bottomBar: {
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
  barTotalLabel: {
    fontSize: 11,
    color: '#5A6E62',
    fontWeight: '600',
  },
  barTotalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1B4D3E',
  },
  placeOrderBtn: {
    backgroundColor: '#1B4D3E',
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: RADIUS.full,
    minWidth: 180,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 35, 26, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.1)',
    ...SHADOWS.large,
  },
  modalBadge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#EBF2ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: 'rgba(27, 77, 62, 0.2)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B4D3E',
    marginBottom: 6,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12.5,
    color: '#5A6E62',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.lg,
  },
  modalInfoBox: {
    width: '100%',
    backgroundColor: '#FAF8F5',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.08)',
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  modalInfoLabel: {
    fontSize: 12,
    color: '#7A8E82',
    fontWeight: '600',
  },
  modalInfoValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#14231A',
  },
  modalInfoAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1B4D3E',
  },
  modalInfoStatus: {
    fontSize: 12,
    fontWeight: '800',
  },
  modalLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  modalLoadingText: {
    fontSize: 12,
    color: '#1B4D3E',
    fontWeight: '600',
  },
  modalActions: {
    width: '100%',
    gap: 10,
  },
  modalVerifyBtn: {
    backgroundColor: '#1B4D3E',
    paddingVertical: 13,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  modalVerifyBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  modalCancelBtn: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: '#7A8E82',
    fontSize: 12.5,
    fontWeight: '700',
  },
});

export default CheckoutScreen;

