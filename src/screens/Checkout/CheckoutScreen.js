/**
 * Checkout Screen for Dharani Herbbals
 * Luxury botanical checkout journey with dynamic API shipping calculation
 */

import React, { useState, useEffect, useMemo } from 'react';
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
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { Icon } from '../../components/common/Icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

const DEFAULT_INDIAN_STATES = [
  'Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana',
  'Maharashtra', 'Delhi', 'West Bengal', 'Gujarat', 'Rajasthan',
  'Uttar Pradesh', 'Madhya Pradesh', 'Bihar', 'Punjab', 'Haryana',
  'Odisha', 'Assam', 'Jharkhand', 'Chhattisgarh', 'Uttarakhand',
  'Goa', 'Himachal Pradesh', 'Jammu and Kashmir', 'Puducherry',
  'Chandigarh', 'Tripura', 'Manipur', 'Meghalaya', 'Nagaland',
  'Mizoram', 'Sikkim', 'Arunachal Pradesh', 'Ladakh',
  'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep'
];

export const CheckoutScreen = ({ navigation }) => {
  const {
    cartItems,
    subtotal,
    deliveryCharge,
    deliveryInfo,
    grandTotal,
    selectedState,
    setSelectedState,
    shippingRates,
    loadShippingRates,
    clearCart,
  } = useCart();
  const {
    user,
    isAuthenticated,
    isGuest,
    isDistributor,
    isReseller,
    isDistributorOrReseller,
    creditsEnabled,
    availableCredit,
    refreshUserProfile,
  } = useAuth();
  const { isTamil, t } = useLanguage();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!isAuthenticated || isGuest || !user?.id) {
      Alert.alert(
        isTamil ? 'உள்நுழைக' : 'Login Required',
        isTamil
          ? 'ஆர்டர் செய்ய தயவுசெய்து உங்கள் மொபைல் எண்ணை உள்ளிட்டு உள்நுழையவும்.'
          : 'Please login with your mobile number to complete the purchase.',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('LoginScreen', { returnToCheckout: true }),
          },
        ]
      );
    }
  }, [isAuthenticated, isGuest, user]);

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

  // 2-Step Location & Address Confirmation state
  const [isAddressSaved, setIsAddressSaved] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [addressMode, setAddressMode] = useState('saved');

  // State Picker Modal
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [stateSearchQuery, setStateSearchQuery] = useState('');

  // Payment Method: 'payglocal'
  const [paymentMethod, setPaymentMethod] = useState('payglocal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // PayGlocal State
  const [payglocalModalVisible, setPayglocalModalVisible] = useState(false);
  const [payglocalStatus, setPayglocalStatus] = useState('waiting');
  const [activeTxnId, setActiveTxnId] = useState(null);
  const [activeGid, setActiveGid] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Refresh dynamic shipping rates on mount
  useEffect(() => {
    if (loadShippingRates) {
      loadShippingRates();
    }
  }, []);

  // Deep Linking & AppState listener for PayGlocal returns
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

  // Auto-poll payment checkin while modal is open
  useEffect(() => {
    let timer = null;
    if (payglocalModalVisible && (activeGid || activeTxnId) && !isVerifying) {
      timer = setTimeout(() => {
        verifyTransaction({ gid: activeGid, txnId: activeTxnId, orderId: activeOrderId });
      }, 4000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [payglocalModalVisible, activeGid, activeTxnId, activeOrderId, isVerifying]);

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
      targetGid = queryParams;
    } else if (queryParams && typeof queryParams === 'object') {
      if (queryParams.txnId || queryParams.merchantTxnId) {
        targetTxn = queryParams.txnId || queryParams.merchantTxnId;
      }
      if (
        queryParams.gid ||
        queryParams.gateway_transaction_id ||
        queryParams.gatewayTransactionId
      ) {
        targetGid =
          queryParams.gid ||
          queryParams.gateway_transaction_id ||
          queryParams.gatewayTransactionId;
      }
      if (queryParams.orderId) targetOrderId = queryParams.orderId;
    }

    if (!targetTxn && !targetGid) return;

    setIsVerifying(true);
    setPayglocalStatus('verifying');

    try {
      const result = await api.verifyPayGlocalPayment({
        gateway_transaction_id: targetGid,
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
    setIsAddressSaved(true);
  };

  const handleDetectLiveLocation = async () => {
    setIsLocating(true);
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data && (data.city || data.region)) {
        if (data.city) setCity(data.city);
        if (data.region) {
          setState(data.region);
          setSelectedState(data.region);
        }
        if (data.postal) setPincode(data.postal);
        setIsAddressSaved(false);
        Alert.alert(
          isTamil ? 'இருப்பிடம் கண்டறியப்பட்டது' : 'Location Detected',
          isTamil
            ? `${data.city || ''}, ${data.region || ''} - ${data.postal || ''} கண்டறியப்பட்டது.`
            : `Detected: ${data.city || ''}, ${data.region || ''} - ${data.postal || ''}.`
        );
      } else {
        throw new Error('Location detection failed');
      }
    } catch (err) {
      Alert.alert(
        isTamil ? 'இருப்பிட தகவல்' : 'Location Information',
        isTamil
          ? 'இருப்பிடத்தை கண்டறிய முடியவில்லை. தயவுசெய்து ஊர் மற்றும் அஞ்சல் குறியீட்டை உள்ளிடவும்.'
          : 'Could not auto-detect location. Please enter manually.'
      );
    } finally {
      setIsLocating(false);
    }
  };

  const handleConfirmAndSaveAddress = async () => {
    if (!validateForm()) return;
    try {
      if (user?.id && !isGuest) {
        const savedRes = await api.addAddress({
          userId: user.id,
          user_id: user.id,
          fullName: name,
          full_name: name,
          phone: mobile,
          mobile,
          address: streetAddress,
          city,
          state,
          pincode,
        });
        if (savedRes?.id || savedRes?.address_id) {
          setSelectedAddressId(savedRes.id || savedRes.address_id);
        }
      }
      setSelectedState(state);
      setIsAddressSaved(true);
      Alert.alert(
        isTamil ? 'முகவரி உறுதி செய்யப்பட்டது' : 'Address Confirmed & Saved',
        isTamil
          ? 'உங்கள் டெலிவரி முகவரி வெற்றிகரமாக சேமிக்கப்பட்டது. இப்போது பேமெண்ட் செய்யலாம்.'
          : 'Your delivery address has been verified. You can now proceed to payment.'
      );
    } catch (e) {
      setIsAddressSaved(true);
    }
  };

  const handlePincodeChange = val => {
    setIsAddressSaved(false);
    setPincode(val);
    const cleanPin = val.replace(/\D/g, '');
    if (cleanPin.length >= 2) {
      if (/^(60|61|62|63|64)/.test(cleanPin)) {
        selectState('Tamil Nadu');
      } else if (/^(67|68|69)/.test(cleanPin)) {
        selectState('Kerala');
      } else if (/^(56|57|58|59)/.test(cleanPin)) {
        selectState('Karnataka');
      } else if (/^(50|51|52|53)/.test(cleanPin)) {
        selectState('Andhra Pradesh');
      } else if (/^(70|71|72|73|74)/.test(cleanPin)) {
        selectState('West Bengal');
      } else if (/^(40|41|42|43|44)/.test(cleanPin)) {
        selectState('Maharashtra');
      } else if (/^11/.test(cleanPin)) {
        selectState('Delhi');
      }
    }
  };

  const selectState = newState => {
    setIsAddressSaved(false);
    setState(newState);
    setSelectedState(newState);
    setStateModalVisible(false);
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert(isTamil ? 'தேவையான விவரம்' : 'Required Field', isTamil ? 'உங்கள் முழு பெயரை உள்ளிடவும்.' : 'Please enter your full name.');
      return false;
    }
    if (!mobile.trim() || mobile.trim().length < 10) {
      Alert.alert(isTamil ? 'தவறான மொபைல் எண்' : 'Invalid Mobile', t('invalidMobile'));
      return false;
    }
    if (!streetAddress.trim()) {
      Alert.alert(isTamil ? 'தேவையான விவரம்' : 'Required Field', isTamil ? 'உங்கள் தெரு முகவரியை உள்ளிடவும்.' : 'Please enter your delivery street address.');
      return false;
    }
    if (!city.trim()) {
      Alert.alert(isTamil ? 'தேவையான விவரம்' : 'Required Field', isTamil ? 'நகரம் / ஊரை உள்ளிடவும்.' : 'Please enter your city / town.');
      return false;
    }
    if (!state.trim()) {
      Alert.alert(isTamil ? 'தேவையான விவரம்' : 'Required Field', isTamil ? 'உங்கள் மாநிலத்தை தேர்ந்தெடுக்கவும்.' : 'Please select your state.');
      return false;
    }
    if (!pincode.trim() || pincode.trim().length < 6) {
      Alert.alert(isTamil ? 'தவறான அஞ்சல் குறியீடு' : 'Invalid Pincode', isTamil ? 'சரியான 6 இலக்க அஞ்சல் குறியீட்டை உள்ளிடவும்.' : 'Please enter a valid 6-digit postal code.');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated || isGuest || !user?.id) {
      Alert.alert(
        isTamil ? 'உள்நுழைக' : 'Login Required',
        t('loginRequiredPrompt'),
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('LoginScreen', { returnToCheckout: true }),
          },
        ]
      );
      return;
    }

    if (!isAddressSaved) {
      Alert.alert(
        isTamil ? 'முகவரியை சேமிக்கவும்' : 'Save Address First',
        isTamil
          ? 'பேமெண்ட் செய்வதற்கு முன், தயவுசெய்து "முகவரியை சேமித்து உறுதி செய்க" என்பதை அழுத்தவும்.'
          : 'Please confirm and save your delivery address before proceeding to payment.'
      );
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    const fullShippingAddress = `${name}, ${streetAddress}, ${city}, ${state} - ${pincode}. Phone: ${mobile}`;

    let finalAddressId = selectedAddressId;
    try {
      const savedAddrRes = await api.addAddress({
        userId: user.id,
        user_id: user.id,
        fullName: name,
        full_name: name,
        phone: mobile,
        mobile,
        address: streetAddress,
        city,
        state,
        pincode,
      });
      if (savedAddrRes?.id || savedAddrRes?.address_id) {
        finalAddressId = savedAddrRes.id || savedAddrRes.address_id;
        setSelectedAddressId(finalAddressId);
      }
    } catch (addrErr) {
      console.warn('Address sync notice:', addrErr.message);
    }

    const orderPayload = {
      user_id: user.id,
      address_id: finalAddressId || selectedAddressId || 1,
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
      delivery_charge: deliveryCharge,
      shipping_charge: deliveryCharge,
      payment_method: paymentMethod,
      name,
      email: email || 'customer@dharaniherbbals.in',
      items: cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        variation_id: item.variation_id || null,
      })),
      cart_items: cartItems.map(item => ({
        id: item.id,
        product_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        variation_id: item.variation_id || null,
      })),
    };

    // Distributor & Reseller Credit Check (Exclusive flow - no payment gateway)
    if (isDistributorOrReseller) {
      if (!creditsEnabled) {
        Alert.alert(
          isTamil ? 'கிரெடிட் வசதி முடக்கப்பட்டுள்ளது' : 'Credit Facility Disabled',
          isTamil
            ? 'உங்கள் கணக்கில் கிரெடிட் வசதி செயல்படுத்தப்படவில்லை. தயவுசெய்து தர்ணி ஹெர்பல்ஸ் நிர்வாகியைத் தொடர்பு கொள்ளவும்.'
            : 'Credit payment is disabled for your distributor/reseller account. Please contact admin to activate.'
        );
        setIsSubmitting(false);
        return;
      }

      if (availableCredit < grandTotal) {
        Alert.alert(
          isTamil ? 'போதிய கிரெடிட் இருப்பு இல்லை' : 'Insufficient Credit',
          isTamil
            ? `ஆர்டர் தொகை உங்கள் கிரெடிட் வரம்பை விட அதிகமாக உள்ளது!\n\n• அனுமதிக்கப்பட்ட கிரெடிட்: ₹${availableCredit.toFixed(0)}\n• ஆர்டர் தொகை: ₹${grandTotal.toFixed(0)}\n\nதயவுசெய்து பொருட்களைக் குறைக்கவும் அல்லது நிர்வாகியிடம் கிரெடிட் வரம்பை அதிகரிக்கவும்.`
            : `Order total exceeds your available credit!\n\n• Available Credit: ₹${availableCredit.toFixed(0)}\n• Order Total: ₹${grandTotal.toFixed(0)}\n\nPlease reduce items or contact admin.`
        );
        setIsSubmitting(false);
        return;
      }

      try {
        const creditPayload = {
          ...orderPayload,
          payment_method: 'credit',
          payment_status: 'paid',
          use_credit: true,
        };
        let createdOrder = null;
        try {
          createdOrder = await api.createCheckout(creditPayload);
        } catch (chkErr) {
          if (chkErr.message && chkErr.message.includes('Cart is empty')) {
            await Promise.all(
              cartItems.map(item =>
                api.addToCart({
                  userId: user.id,
                  productId: item.id,
                  quantity: item.quantity,
                  variationId: item.variation_id,
                }).catch(() => {})
              )
            );
            createdOrder = await api.createCheckout(creditPayload);
          } else {
            throw chkErr;
          }
        }
        await clearCart();
        refreshUserProfile?.(user.id);
        setIsSubmitting(false);
        navigation.replace('OrderSuccessScreen', {
          orderId: createdOrder?.order_id || createdOrder?.id || `DH-CR-${Date.now().toString().slice(-6)}`,
          totalAmount: grandTotal,
          paymentMethod: isTamil
            ? (isReseller ? 'ரீசெல்லர் கிரெடிட்' : 'டிஸ்ட்ரிபியூட்டர் கிரெடிட்')
            : (isReseller ? 'Reseller Credit' : 'Distributor Credit'),
          shippingAddress: fullShippingAddress,
          itemCount: cartItems.length,
          items: cartItems,
        });
        return;
      } catch (err) {
        Alert.alert(
          isTamil ? 'கிரெடிட் ஆர்டர் தோல்வி' : 'Credit Order Error',
          err.message || 'Credit deduction failed. Please contact admin.'
        );
        setIsSubmitting(false);
        return;
      }
    }

    // PayGlocal Online Checkout
    try {
      let createdOrder = null;
      try {
        createdOrder = await api.createCheckout(orderPayload);
      } catch (chkErr) {
        if (chkErr.message && chkErr.message.includes('Cart is empty')) {
          await Promise.all(
            cartItems.map(item =>
              api.addToCart({
                userId: user?.id || 64036,
                productId: item.id,
                quantity: item.quantity,
                variationId: item.variation_id,
              }).catch(() => {})
            )
          );
          createdOrder = await api.createCheckout(orderPayload);
        }
      }

      const numericOrderId =
        createdOrder?.order_id ||
        createdOrder?.id ||
        Math.floor(100000 + Math.random() * 900000);

      const payableAmount = createdOrder?.amount_to_pay || createdOrder?.total_amount || grandTotal;

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
  };

  // Filtered States list for Modal
  const availableStates = useMemo(() => {
    let list = [];
    if (Array.isArray(shippingRates) && shippingRates.length > 0) {
      list = shippingRates.map(r => ({
        name: r.state_name,
        code: r.state_code,
        amount: parseFloat(r.shipping_amount) || 0,
        freeAbove: parseFloat(r.free_above) || 0,
      }));
    } else {
      list = DEFAULT_INDIAN_STATES.map(s => ({
        name: s,
        code: '',
        amount: s === 'Tamil Nadu' ? 50 : 200,
        freeAbove: s === 'Tamil Nadu' ? 750 : 1000,
      }));
    }

    if (!stateSearchQuery.trim()) return list;
    const q = stateSearchQuery.trim().toLowerCase();
    return list.filter(item =>
      item.name.toLowerCase().includes(q) ||
      (item.code && item.code.toLowerCase().includes(q))
    );
  }, [shippingRates, stateSearchQuery]);

  return (
    <View style={styles.container}>
      <Header
        title={isTamil ? 'செக்அவுட்' : 'Checkout'}
        showBack={true}
        showCart={false}
        showLogo={false}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step Indicator Header */}
        <View style={styles.progressStepper}>
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Text style={styles.stepCircleText}>1</Text>
            </View>
            <Text style={[styles.stepLabel, styles.stepLabelActive]}>
              {isTamil ? 'முகவரி' : 'Address'}
            </Text>
          </View>
          <View style={[styles.stepConnector, isAddressSaved && styles.stepConnectorActive]} />
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, isAddressSaved ? styles.stepCircleActive : styles.stepCircleInactive]}>
              <Text style={[styles.stepCircleText, !isAddressSaved && styles.stepCircleTextInactive]}>2</Text>
            </View>
            <Text style={[styles.stepLabel, isAddressSaved && styles.stepLabelActive]}>
              {isTamil ? 'பேமெண்ட்' : 'Payment'}
            </Text>
          </View>
        </View>

        {/* Address Mode Switcher */}
        <View style={styles.addressModeContainer}>
          {savedAddresses.length > 0 ? (
            <TouchableOpacity
              style={[
                styles.modeTab,
                addressMode === 'saved' && styles.modeTabActive,
              ]}
              onPress={() => setAddressMode('saved')}
              activeOpacity={0.8}
            >
              <Text style={[styles.modeTabText, addressMode === 'saved' && styles.modeTabTextActive]}>
                📍 {isTamil ? 'சேமிக்கப்பட்டவை' : 'Saved'}
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[
              styles.modeTab,
              addressMode === 'manual' && styles.modeTabActive,
            ]}
            onPress={() => setAddressMode('manual')}
            activeOpacity={0.8}
          >
            <Text style={[styles.modeTabText, addressMode === 'manual' && styles.modeTabTextActive]}>
              ✍️ {isTamil ? 'முகவரி உள்ளிடவும்' : 'Enter Address'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeTab,
              addressMode === 'live' && styles.modeTabActive,
            ]}
            onPress={() => {
              setAddressMode('live');
              handleDetectLiveLocation();
            }}
            activeOpacity={0.8}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color="#1B4D3E" style={{ marginRight: 4 }} />
            ) : null}
            <Text style={[styles.modeTabText, addressMode === 'live' && styles.modeTabTextActive]}>
              🎯 {isTamil ? 'லைவ் லொகேஷன்' : 'Live GPS'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Saved Addresses List (if mode is saved) */}
        {savedAddresses.length > 0 && addressMode === 'saved' ? (
          <View style={styles.whiteCard}>
            <Text style={styles.sectionTitle}>
              {isTamil ? 'சேமிக்கப்பட்ட முகவரிகள்' : 'Your Saved Addresses'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.savedAddrsScroll}>
              {savedAddresses.map(addr => {
                const isSelected = selectedAddressId === (addr.id || addr.address_id);
                return (
                  <TouchableOpacity
                    key={`saved-${addr.id || addr.address_id}`}
                    style={[styles.savedAddrCard, isSelected && styles.savedAddrCardSelected]}
                    onPress={() => applyAddress(addr)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.savedAddrHeader}>
                      <Text style={styles.savedAddrName}>{addr.full_name || 'Home'}</Text>
                      {isSelected ? <View style={styles.greenCheckDot} /> : null}
                    </View>
                    <Text style={styles.savedAddrText} numberOfLines={2}>
                      {addr.address}, {addr.city}
                    </Text>
                    <Text style={styles.savedAddrState}>{addr.state} - {addr.pincode}</Text>
                    <Text style={styles.savedAddrPhone}>{addr.phone}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {/* 1. Delivery Details Form Card */}
        <View style={styles.whiteCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Icon name="truck" size={16} color="#0D382B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitleText}>
                {isTamil ? '1. டெலிவரி முகவரி விவரங்கள்' : '1. Delivery Address & Contact'}
              </Text>
              <Text style={styles.cardSubtitleText}>
                {isTamil ? 'பொருட்கள் வந்து சேர வேண்டிய சரியான முகவரி' : 'Where should we deliver your botanical order?'}
              </Text>
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>{t('fullName')} *</Text>
              <TextInput
                style={styles.textInput}
                placeholder={isTamil ? 'உங்கள் முழு பெயர்' : 'Full Name'}
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={t => { setName(t); setIsAddressSaved(false); }}
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.inputLabel}>{t('mobileNumber')} *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="10-digit mobile"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={t => { setMobile(t); setIsAddressSaved(false); }}
                maxLength={10}
              />
            </View>
            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <Text style={styles.inputLabel}>{t('pincode')} *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="6-digit PIN"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={pincode}
                onChangeText={handlePincodeChange}
                maxLength={6}
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>{t('streetAddress')} *</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              placeholder={isTamil ? 'கதவு எண் / தெரு பெயர் / பகுதி' : 'Flat/Door No., Building, Street Name, Area'}
              placeholderTextColor="#94A3B8"
              value={streetAddress}
              onChangeText={t => { setStreetAddress(t); setIsAddressSaved(false); }}
              multiline
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.inputLabel}>{t('city')} *</Text>
              <TextInput
                style={styles.textInput}
                placeholder={isTamil ? 'ஊர் / நகரம்' : 'Town / City'}
                placeholderTextColor="#94A3B8"
                value={city}
                onChangeText={t => { setCity(t); setIsAddressSaved(false); }}
              />
            </View>

            {/* Interactive Dynamic State Selector */}
            <View style={[styles.inputWrapper, { flex: 1.2 }]}>
              <Text style={styles.inputLabel}>
                {isTamil ? 'மாநிலம் (State) *' : 'State / UT *'}
              </Text>
              <TouchableOpacity
                style={styles.stateSelectButton}
                onPress={() => setStateModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.stateSelectText} numberOfLines={1}>
                  {state || 'Select State'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Dynamic Shipping Fee Banner for Selected State */}
          <View style={styles.dynamicShippingCard}>
            <View style={styles.shippingIconBadge}>
              <Icon name="truck" size={16} color="#0D382B" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.shippingRow}>
                <Text style={styles.shippingStateName}>
                  {state ? `${state} ${isTamil ? 'டெலிவரி' : 'Delivery'}` : 'Delivery'}
                </Text>
                <Text style={[styles.shippingCost, deliveryCharge === 0 && styles.freeShippingCost]}>
                  {deliveryCharge === 0 ? (isTamil ? 'இலவசம் (FREE)' : 'FREE') : `₹${deliveryCharge}`}
                </Text>
              </View>
              {deliveryInfo.isFree ? (
                <Text style={styles.freeNoticeText}>
                  ✓ {isTamil ? 'இலவச டெலிவரி சலுகை கிடைத்துள்ளது!' : 'Complimentary shipping applied!'}
                </Text>
              ) : (
                <Text style={styles.thresholdNoticeText}>
                  {isTamil
                    ? `₹${deliveryInfo.threshold}க்கு மேல் ஆர்டர் செய்தால் இலவச டெலிவரி (இன்னும் ₹${deliveryInfo.remaining.toFixed(0)})`
                    : `Free shipping on orders above ₹${deliveryInfo.threshold} (add ₹${deliveryInfo.remaining.toFixed(0)} more)`}
                </Text>
              )}
            </View>
          </View>

          {/* Confirm & Save Address Button */}
          {!isAddressSaved ? (
            <TouchableOpacity
              style={styles.saveAddressBtn}
              onPress={handleConfirmAndSaveAddress}
              activeOpacity={0.88}
            >
              <Icon name="check" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.saveAddressBtnText}>
                {isTamil ? 'முகவரியை உறுதி செய்து சேமிக்கவும் ✓' : 'Save & Confirm Address ✓'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.addressConfirmedCard}>
              <View style={styles.confirmedHeaderRow}>
                <View style={styles.greenCheckBadge}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
                <Text style={styles.confirmedTitleText}>
                  {isTamil ? 'முகவரி உறுதி செய்யப்பட்டு சேமிக்கப்பட்டது' : 'Address Verified & Saved'}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsAddressSaved(false)}
                  style={styles.editButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.editButtonText}>
                    {isTamil ? 'மாற்று' : 'Edit'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.confirmedDetailsText} numberOfLines={2}>
                {name} • {mobile} • {streetAddress}, {city}, {state} - {pincode}
              </Text>
            </View>
          )}
        </View>

        {/* 2. Payment Section */}
        <View style={styles.whiteCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Icon name={isDistributorOrReseller ? 'wallet' : 'shield'} size={16} color="#0D382B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitleText}>
                {isDistributorOrReseller
                  ? (isTamil ? '2. கிரெடிட் பேமெண்ட் விவரங்கள்' : '2. Credit Payment Details')
                  : (isTamil ? '2. பேமெண்ட் விவரங்கள்' : '2. Payment Method')}
              </Text>
              <Text style={styles.cardSubtitleText}>
                {isDistributorOrReseller
                  ? (isTamil ? 'டிஸ்ட்ரிபியூட்டர் / ரீசெல்லர் கிரெடிட் மூலம் நேரடி ஆர்டர்' : 'Direct order using approved credit facility')
                  : (isTamil ? '100% பாதுகாப்பான பேமெண்ட் கேட்வே' : '100% Encrypted & Safe Payment')}
              </Text>
            </View>
          </View>

          {!isAddressSaved ? (
            <View style={styles.paymentLockedCard}>
              <Icon name="shield" size={18} color="#94A3B8" />
              <Text style={styles.paymentLockedText}>
                {isTamil
                  ? '🔒 பேமெண்ட் செய்வதற்கு முன், மேலே உள்ள "முகவரியை உறுதி செய்து சேமிக்கவும்" என்பதை அழுத்தவும்.'
                  : '🔒 Please confirm & save your delivery address above to unlock payment.'}
              </Text>
            </View>
          ) : isDistributorOrReseller ? (
            <View style={styles.creditPaymentCard}>
              <View style={styles.creditPaymentHeader}>
                <View style={styles.creditAccountBadge}>
                  <Text style={styles.creditAccountBadgeText}>
                    {isReseller
                      ? (isTamil ? 'ரீசெல்லர் கிரெடிட்' : 'Reseller Credit')
                      : (isTamil ? 'டிஸ்ட்ரிபியூட்டர் கிரெடிட்' : 'Distributor Credit')}
                  </Text>
                </View>
                <View style={[styles.statusPill, creditsEnabled ? styles.statusPillActive : styles.statusPillDisabled]}>
                  <Text style={[styles.statusPillText, creditsEnabled ? styles.statusPillTextActive : styles.statusPillTextDisabled]}>
                    {creditsEnabled
                      ? (isTamil ? '✓ அனுமதிக்கப்பட்டது' : '✓ Credit Active')
                      : (isTamil ? '✕ முடக்கப்பட்டது' : '✕ Disabled')}
                  </Text>
                </View>
              </View>

              <View style={styles.creditPaymentGrid}>
                <View style={styles.creditPaymentItem}>
                  <Text style={styles.creditPaymentItemLabel}>{isTamil ? 'கிரெடிட் வரம்பு' : 'Credit Limit'}</Text>
                  <Text style={styles.creditPaymentItemVal}>₹{(user?.creditLimit || 0).toFixed(0)}</Text>
                </View>
                <View style={styles.creditPaymentDivider} />
                <View style={styles.creditPaymentItem}>
                  <Text style={styles.creditPaymentItemLabel}>{isTamil ? 'கிடைக்கக்கூடிய இருப்பு' : 'Available Credit'}</Text>
                  <Text style={[styles.creditPaymentItemVal, { color: availableCredit >= grandTotal ? '#1B4D3E' : '#DC2626' }]}>
                    ₹{availableCredit.toFixed(0)}
                  </Text>
                </View>
                <View style={styles.creditPaymentDivider} />
                <View style={styles.creditPaymentItem}>
                  <Text style={styles.creditPaymentItemLabel}>{isTamil ? 'ஆர்டருக்குப் பின்' : 'Remaining After'}</Text>
                  <Text style={[styles.creditPaymentItemVal, { color: (availableCredit - grandTotal) >= 0 ? '#1B4D3E' : '#DC2626' }]}>
                    ₹{Math.max(0, availableCredit - grandTotal).toFixed(0)}
                  </Text>
                </View>
              </View>

              {!creditsEnabled ? (
                <View style={styles.creditWarningCard}>
                  <Icon name="alert-circle" size={16} color="#DC2626" />
                  <Text style={styles.creditWarningCardText}>
                    {isTamil
                      ? '⚠️ உங்கள் கணக்கில் கிரெடிட் வசதி செயல்படுத்தப்படவில்லை. ஆர்டர் செய்ய நிர்வாகியைத் தொடர்பு கொள்ளவும்.'
                      : '⚠️ Credit payment is disabled. Please contact admin to enable.'}
                  </Text>
                </View>
              ) : availableCredit < grandTotal ? (
                <View style={styles.creditWarningCard}>
                  <Icon name="alert-circle" size={16} color="#DC2626" />
                  <Text style={styles.creditWarningCardText}>
                    {isTamil
                      ? `⚠️ போதிய கிரெடிட் இருப்பு இல்லை. தேவை: ₹${grandTotal.toFixed(0)}, இருப்பு: ₹${availableCredit.toFixed(0)}. குறைவான பொருட்களைத் தேர்ந்தெடுக்கவும்.`
                      : `⚠️ Insufficient credit. Required: ₹${grandTotal.toFixed(0)}, Available: ₹${availableCredit.toFixed(0)}.`}
                  </Text>
                </View>
              ) : (
                <View style={styles.creditSuccessCard}>
                  <Icon name="checkmark-circle" size={16} color="#1B4D3E" />
                  <Text style={styles.creditSuccessCardText}>
                    {isTamil
                      ? '✓ போதுமான கிரெடிட் உள்ளது. இந்த ஆர்டர் உங்கள் கிரெடிட் இருப்பிலிருந்து கழிக்கப்பட்டு உடனடியாக உறுதி செய்யப்படும்.'
                      : '✓ Sufficient credit available. Order will be placed directly using your credit.'}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.payOptionCard, paymentMethod === 'payglocal' && styles.payOptionCardActive]}
              onPress={() => setPaymentMethod('payglocal')}
              activeOpacity={0.85}
            >
              <View style={styles.radioOuter}>
                {paymentMethod === 'payglocal' ? <View style={styles.radioInner} /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.payOptionTitleRow}>
                  <Text style={styles.payOptionTitle}>
                    {isTamil ? 'PayGlocal ஆன்லைன் பேமெண்ட்' : 'PayGlocal Secure Gateway'}
                  </Text>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedBadgeText}>VERIFIED</Text>
                  </View>
                </View>
                <Text style={styles.payOptionDesc}>
                  {isTamil
                    ? 'UPI (GPay, PhonePe, Paytm), கிரெடிட் / டெபிட் கார்டுகள், நெட்பேங்கிங்'
                    : 'UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* 3. Order Summary Card */}
        <View style={styles.whiteCard}>
          <Text style={styles.summaryTitle}>
            {isTamil ? 'ஆர்டர் கட்டண விவரம்' : 'Order Summary'}
          </Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {isTamil ? `பொருட்கள் (${cartItems.length})` : `Formulations (${cartItems.length} items)`}
            </Text>
            <Text style={styles.summaryValue}>₹{subtotal.toFixed(0)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {isTamil ? `டெலிவரி (${state || 'இந்தியா'})` : `Shipping (${state || 'India'})`}
            </Text>
            <Text style={[styles.summaryValue, deliveryCharge === 0 && styles.freeShippingCost]}>
              {deliveryCharge === 0 ? (isTamil ? 'இலவசம் (FREE)' : 'FREE') : `₹${deliveryCharge}`}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {isTamil ? 'தரமான பேக்கிங் & ஜிஎஸ்டி' : 'Botanical Packaging & GST'}
            </Text>
            <Text style={styles.includedValue}>{isTamil ? 'அடங்கும்' : 'Included'}</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>{isTamil ? 'மொத்த கட்டணம்' : 'Total Payable'}</Text>
              <Text style={styles.totalSub}>
                {isTamil ? 'அனைத்து வரிகளும் அடங்கும்' : 'Inclusive of all taxes'}
              </Text>
            </View>
            <Text style={styles.totalAmount}>₹{grandTotal.toFixed(0)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Modern White Bottom Bar sitting cleanly above nav */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <View style={styles.bottomBarTotalBox}>
          <Text style={styles.bottomBarTotalLabel}>{isTamil ? 'மொத்தம்' : 'Total'}</Text>
          <Text style={styles.bottomBarTotalValue}>₹{grandTotal.toFixed(0)}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.payButton,
            (isSubmitting || (isAddressSaved && isDistributorOrReseller && (!creditsEnabled || availableCredit < grandTotal))) && styles.btnDisabled,
          ]}
          onPress={!isAddressSaved ? handleConfirmAndSaveAddress : handlePlaceOrder}
          disabled={isSubmitting}
          activeOpacity={0.88}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.payButtonText}>
              {!isAddressSaved
                ? isTamil
                  ? 'முகவரி சேமித்து தொடரவும் ›'
                  : 'Save Address to Pay ›'
                : isDistributorOrReseller
                ? !creditsEnabled
                  ? (isTamil ? 'கிரெடிட் முடக்கப்பட்டுள்ளது' : 'Credit Disabled')
                  : availableCredit < grandTotal
                  ? (isTamil ? 'போதிய கிரெடிட் இல்லை' : 'Insufficient Credit')
                  : (isTamil ? `கிரெடிட் மூலம் ஆர்டர் செய் (₹${grandTotal.toFixed(0)}) ›` : `Place Order via Credit (₹${grandTotal.toFixed(0)}) ›`)
                : isTamil
                ? `செலுத்துக ₹${grandTotal.toFixed(0)} ›`
                : `Pay ₹${grandTotal.toFixed(0)} ›`}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* State Selector Modal */}
      <Modal
        visible={stateModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setStateModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.stateModalContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeaderText}>
                {isTamil ? 'மாநிலத்தை தேர்ந்தெடுக்கவும்' : 'Select Delivery State'}
              </Text>
              <TouchableOpacity
                onPress={() => setStateModalVisible(false)}
                style={styles.closeModalBtn}
              >
                <Text style={styles.closeModalBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.stateSearchInput}
              placeholder={isTamil ? 'மாநிலத்தை தேட...' : 'Search state or UT...'}
              placeholderTextColor="#94A3B8"
              value={stateSearchQuery}
              onChangeText={setStateSearchQuery}
              autoFocus={false}
            />

            <FlatList
              data={availableStates}
              keyExtractor={item => item.name}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isCurrent = state === item.name;
                return (
                  <TouchableOpacity
                    style={[styles.stateItemRow, isCurrent && styles.stateItemRowActive]}
                    onPress={() => selectState(item.name)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.stateItemName, isCurrent && styles.stateItemNameActive]}>
                        {item.name}
                      </Text>
                      <Text style={styles.stateItemSub}>
                        {item.freeAbove > 0
                          ? `₹${item.amount} shipping • Free above ₹${item.freeAbove}`
                          : `₹${item.amount} shipping`}
                      </Text>
                    </View>
                    {isCurrent ? (
                      <View style={styles.stateSelectedTick}>
                        <Text style={styles.tickText}>✓</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* PayGlocal Verification Modal */}
      <Modal
        visible={payglocalModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.paymentModalOverlay}>
          <View style={styles.paymentModalCard}>
            <View style={styles.paymentModalBadge}>
              <Icon name="shield" size={26} color="#0D382B" />
            </View>
            <Text style={styles.paymentModalTitle}>PayGlocal Payment</Text>
            <Text style={styles.paymentModalSubtitle}>
              {isVerifying || payglocalStatus === 'verifying'
                ? 'Verifying bank transaction status...'
                : 'Please complete your payment in the browser window.'}
            </Text>

            <View style={styles.paymentModalBox}>
              <View style={styles.paymentModalRow}>
                <Text style={styles.modalInfoLabel}>Order ID</Text>
                <Text style={styles.modalInfoValue}>{activeOrderId || 'DH-Pending'}</Text>
              </View>
              <View style={styles.paymentModalRow}>
                <Text style={styles.modalInfoLabel}>Total Payable</Text>
                <Text style={styles.modalInfoAmount}>₹{grandTotal.toFixed(0)}</Text>
              </View>
              <View style={styles.paymentModalRow}>
                <Text style={styles.modalInfoLabel}>Gateway Status</Text>
                <Text style={[styles.modalInfoStatus, { color: isVerifying ? '#C8963E' : '#0D382B' }]}>
                  {isVerifying || payglocalStatus === 'verifying' ? 'Verifying with Bank...' : 'Awaiting Payment'}
                </Text>
              </View>
            </View>

            {(isVerifying || payglocalStatus === 'verifying') && (
              <View style={styles.verifyingLoaderBox}>
                <ActivityIndicator size="small" color="#0D382B" />
                <Text style={styles.verifyingText}>Confirming bank settlement...</Text>
              </View>
            )}

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.checkStatusBtn}
                onPress={() => verifyTransaction({ gid: activeGid, txnId: activeTxnId, orderId: activeOrderId })}
                disabled={isVerifying}
                activeOpacity={0.82}
              >
                <Text style={styles.checkStatusBtnText}>Check Payment Status</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelPaymentBtn}
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
                <Text style={styles.cancelPaymentBtnText}>Cancel & Keep Cart</Text>
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
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 150,
  },
  progressStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: '#0D382B',
  },
  stepCircleInactive: {
    backgroundColor: '#E2E8F0',
  },
  stepCircleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  stepCircleTextInactive: {
    color: '#64748B',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  stepLabelActive: {
    color: '#0D382B',
    fontWeight: '800',
  },
  stepConnector: {
    flex: 1,
    height: 2.5,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
    marginBottom: 16,
  },
  stepConnectorActive: {
    backgroundColor: '#0D382B',
  },
  addressModeContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    gap: 8,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
      android: { elevation: 2 },
    }),
  },
  modeTabActive: {
    backgroundColor: '#0D382B',
    borderColor: '#0D382B',
  },
  modeTabText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },
  whiteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  savedAddrsScroll: {
    flexDirection: 'row',
  },
  savedAddrCard: {
    width: 220,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginRight: 10,
  },
  savedAddrCardSelected: {
    borderColor: '#0D382B',
    backgroundColor: '#F0FDF4',
  },
  savedAddrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  savedAddrName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  greenCheckDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A',
  },
  savedAddrText: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
  },
  savedAddrState: {
    fontSize: 11,
    color: '#0D382B',
    fontWeight: '700',
    marginTop: 4,
  },
  savedAddrPhone: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: 12,
  },
  cardHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSubtitleText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  formRow: {
    flexDirection: 'row',
  },
  inputWrapper: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '500',
  },
  textAreaInput: {
    height: 72,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  stateSelectButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stateSelectText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D382B',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#64748B',
    marginLeft: 6,
  },
  dynamicShippingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    padding: 12,
    borderRadius: 14,
    gap: 10,
    marginTop: 4,
    marginBottom: 12,
  },
  shippingIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shippingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shippingStateName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
  },
  shippingCost: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  freeShippingCost: {
    color: '#16A34A',
  },
  freeNoticeText: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '700',
    marginTop: 2,
  },
  thresholdNoticeText: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 2,
  },
  saveAddressBtn: {
    backgroundColor: '#0D382B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: RADIUS.full,
    marginTop: 4,
    ...Platform.select({
      ios: { shadowColor: '#0D382B', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5 },
      android: { elevation: 3 },
    }),
  },
  saveAddressBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  addressConfirmedCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 14,
    padding: 12,
    marginTop: 4,
  },
  confirmedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  greenCheckBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  confirmedTitleText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '800',
    color: '#166534',
  },
  editButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  editButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  confirmedDetailsText: {
    fontSize: 11.5,
    color: '#1E3A2F',
    lineHeight: 16,
  },
  paymentLockedCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paymentLockedText: {
    flex: 1,
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 17,
    fontWeight: '600',
  },
  payOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  creditPaymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  creditPaymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  creditAccountBadge: {
    backgroundColor: '#EBF2ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  creditAccountBadgeText: {
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
  creditPaymentGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  creditPaymentItem: {
    flex: 1,
    alignItems: 'center',
  },
  creditPaymentDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  creditPaymentItemLabel: {
    fontSize: 10.5,
    color: '#64748B',
    marginBottom: 3,
    textAlign: 'center',
  },
  creditPaymentItemVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  creditWarningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  creditWarningCardText: {
    flex: 1,
    fontSize: 12,
    color: '#B91C1C',
    fontWeight: '600',
    lineHeight: 16,
  },
  creditSuccessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  creditSuccessCardText: {
    flex: 1,
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
    lineHeight: 16,
  },
  payOptionCardActive: {
    borderColor: '#0D382B',
    backgroundColor: '#F0FDF4',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#0D382B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0D382B',
  },
  payOptionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payOptionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  verifiedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#166534',
  },
  payOptionDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12.5,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  includedValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalSub: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0D382B',
  },
  bottomBar: {
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
    ...Platform.select({
      ios: { shadowColor: '#000000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 10 },
      android: { elevation: 10 },
    }),
  },
  bottomBarTotalBox: {
    marginRight: 12,
  },
  bottomBarTotalLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  bottomBarTotalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0D382B',
  },
  payButton: {
    backgroundColor: '#0D382B',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: RADIUS.full,
    flex: 1,
    maxWidth: 240,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#0D382B', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },
  btnDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  stateModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    maxHeight: '80%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalHeaderText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalBtnText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '700',
  },
  stateSearchInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 13.5,
    color: '#0F172A',
    marginBottom: 12,
  },
  stateItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stateItemRowActive: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  stateItemName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  stateItemNameActive: {
    color: '#0D382B',
  },
  stateItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  stateSelectedTick: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tickText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  paymentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  paymentModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  paymentModalBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentModalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0D382B',
    marginBottom: 4,
  },
  paymentModalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 17,
  },
  paymentModalBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentModalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  modalInfoLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  modalInfoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalInfoAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0D382B',
  },
  modalInfoStatus: {
    fontSize: 12,
    fontWeight: '800',
  },
  verifyingLoaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  verifyingText: {
    fontSize: 11.5,
    color: '#0D382B',
    fontWeight: '700',
  },
  modalButtonsRow: {
    width: '100%',
    gap: 8,
  },
  checkStatusBtn: {
    backgroundColor: '#0D382B',
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  checkStatusBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  cancelPaymentBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 11,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  cancelPaymentBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default CheckoutScreen;
