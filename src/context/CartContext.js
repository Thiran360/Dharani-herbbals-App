/**
 * Cart Context for Dharani Herbbals
 * Exact business logic matching dharaniherbbals.in
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Alert } from 'react-native';
import storage from '../services/storage';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { SHIPPING_RULES } from '../constants/config';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [selectedState, setSelectedState] = useState('Tamil Nadu');
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [shippingRates, setShippingRates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastInfo, setToastInfo] = useState(null);
  const toastAnim = useRef(new Animated.Value(-80)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef(null);

  // Load Dynamic Shipping Rates (Cache first, then API)
  const loadShippingRates = async () => {
    try {
      const cached = await storage.getCachedShippingRates();
      if (Array.isArray(cached) && cached.length > 0) {
        setShippingRates(cached);
      }
      const fresh = await api.getShippingCharges();
      if (Array.isArray(fresh) && fresh.length > 0) {
        setShippingRates(fresh);
      }
    } catch (e) {
      console.log('loadShippingRates error:', e.message);
    }
  };

  const triggerCartNotification = (productName = '') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastInfo({ productName });
    Animated.parallel([
      Animated.spring(toastAnim, {
        toValue: 0,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    toastTimer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastAnim, {
          toValue: -80,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setToastInfo(null);
      });
    }, 2800);
  };

  // Initialize cart from storage & load dynamic shipping rates
  useEffect(() => {
    loadLocalCart();
    loadShippingRates();
  }, []);

  // When user signs in, sync remote cart
  useEffect(() => {
    if (user && !user.isGuest && user.id) {
      syncRemoteCart();
    }
  }, [user, selectedState, selectedAddressId]);

  const loadLocalCart = async () => {
    try {
      const items = await storage.getCart();
      if (Array.isArray(items)) {
        setCartItems(items);
      }
    } catch (e) {
      console.error('Error loading local cart:', e);
    }
  };

  const syncRemoteCart = async () => {
    if (!user || user.isGuest || !user.id) return;
    setIsLoading(true);
    try {
      const res = await api.getCart(user.id, {
        addressId: selectedAddressId,
        state: selectedState,
      });

      let items = [];
      if (Array.isArray(res)) {
        items = res;
      } else if (res && Array.isArray(res.cart)) {
        items = res.cart;
      } else if (res && Array.isArray(res.data)) {
        items = res.data;
      }

      if (items.length > 0) {
        const cachedProducts = (await storage.getCachedProducts()) || [];
        const formatted = items.map(item => {
          const prodId = item.product_id || item.id;
          const matchedProd = cachedProducts.find(p => String(p.id) === String(prodId));
          const prodImage =
            item.product_image ||
            item.image ||
            item.image_url ||
            item.thumbnail ||
            item.product?.image ||
            item.product?.product_image ||
            item.product?.image_url ||
            item.product?.thumbnail ||
            matchedProd?.image ||
            matchedProd?.image_url ||
            matchedProd?.thumbnail ||
            matchedProd?.product_image ||
            '';
          return {
            id: prodId,
            cartItemId: item.id || item.cartItemId,
            name: item.product_name || item.name || matchedProd?.name || '',
            tamil_name: item.tamil_name || matchedProd?.tamil_name || '',
            image: prodImage,
            price: parseFloat(item.price) || (matchedProd ? parseFloat(matchedProd.price) : 0),
            quantity: item.quantity || 1,
            variation_id: item.variation_id || null,
            variation_name: item.variation_name || '',
            gst_percentage: parseFloat(item.gst_percentage) || 5,
          };
        });
        setCartItems(formatted);
        await storage.setCart(formatted);
      }
    } catch (e) {
      console.log('Sync remote cart non-blocking fail:', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Add product to cart
  const addToCart = async (product, quantity = 1, variation = null) => {
    const numericPrice = typeof product.price === 'string'
      ? parseFloat(product.price.replace(/[^\d.]/g, ''))
      : parseFloat(product.price) || 0;

    // 1. Distributor / Reseller Credit Rule Validation
    const roleOrType = String(user?.userType || user?.role || user?.user_type || '').toLowerCase();
    const isDistributorOrReseller = roleOrType === 'distributor' || roleOrType === 'reseller' || user?.is_distributor === true || user?.is_reseller === true;

    if (isDistributorOrReseller) {
      const creditEnabled = Boolean(
        user?.creditPaymentEnabled === true ||
        user?.credit_enabled === true ||
        user?.credits_enabled === true
      );
      const availableCredit = parseFloat(
        user?.available_credit ??
        user?.availableCredit ??
        user?.creditLimit ??
        user?.credit_balance ??
        0
      );

      if (!creditEnabled) {
        Alert.alert(
          'கிரெடிட் வசதி முடக்கப்பட்டுள்ளது',
          'உங்கள் கணக்கில் கிரெடிட் கட்டண வசதி செயல்படுத்தப்படவில்லை. ஆர்டர் செய்ய தர்ணி ஹெர்பல்ஸ் நிர்வாகியைத் தொடர்பு கொள்ளவும்.\n\n(Credit facility is disabled for your distributor/reseller account. Please contact admin.)'
        );
        return { success: false, reason: 'CREDIT_DISABLED' };
      }

      const currentTotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (item.quantity || 1), 0);
      const projectedTotal = currentTotal + (numericPrice * quantity);

      if (projectedTotal > availableCredit) {
        Alert.alert(
          'கிரெடிட் வரம்பு தாண்டியது (Credit Limit Exceeded)',
          `கார்ட் தொகை உங்கள் அனுமதிக்கப்பட்ட கிரெடிட் வரம்பை விட அதிகமாக உள்ளது!\n\n• அனுமதிக்கப்பட்ட கிரெடிட்: ₹${availableCredit.toFixed(0)}\n• தற்போதைய கார்ட் தொகை: ₹${currentTotal.toFixed(0)}\n• புதிய தேவை: ₹${projectedTotal.toFixed(0)}\n\nதயவுசெய்து குறைவான எண்ணிக்கையைச் சேர்க்கவும் அல்லது நிர்வாகியிடம் கிரெடிட் வரம்பை அதிகரிக்கவும்.`
        );
        return { success: false, reason: 'EXCEEDS_CREDIT' };
      }
    }

    const numericMrp = typeof product.mrp === 'string'
      ? parseFloat(product.mrp.replace(/[^\d.]/g, ''))
      : typeof product.originalPrice === 'string'
      ? parseFloat(product.originalPrice.replace(/[^\d.]/g, ''))
      : parseFloat(product.mrp || product.originalPrice) || numericPrice;

    const variationId = variation ? (variation.id || variation.variation_id) : null;
    const variationName = variation ? (variation.name || variation.size || variation.weight) : '';
    const resolvedImage =
      product.image ||
      product.image_url ||
      product.product_image ||
      product.thumbnail ||
      product.thumb ||
      product.image_thumb ||
      (Array.isArray(product.images) && product.images[0]) ||
      '';

    setCartItems(prev => {
      const existingIdx = prev.findIndex(
        i => String(i.id) === String(product.id) &&
             (variationId ? String(i.variation_id) === String(variationId) : !i.variation_id)
      );

      let updated;
      if (existingIdx > -1) {
        updated = prev.map((item, idx) =>
          idx === existingIdx
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem = {
          id: product.id,
          name: product.name,
          tamil_name: product.tamil_name || product.name,
          image: resolvedImage,
          price: numericPrice,
          originalPrice: numericMrp,
          quantity: quantity,
          variation_id: variationId,
          variation_name: variationName,
          gst_percentage: parseFloat(product.gst_percentage) || 5,
        };
        updated = [...prev, newItem];
      }

      storage.setCart(updated);
      return updated;
    });

    // Trigger visual notification
    triggerCartNotification(product?.tamil_name || product?.name || '');

    // Remote sync if logged in
    if (user && !user.isGuest && user.id) {
      try {
        await api.addToCart({
          userId: user.id,
          productId: product.id,
          quantity: quantity,
          variationId: variationId,
        });
      } catch (e) {
        console.warn('Backend addToCart non-blocking error:', e.message);
      }
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, delta, variationId = null) => {
    let targetCartItemId = null;
    let newQty = 1;

    // Distributor / Reseller Credit Rule on quantity increment
    if (delta > 0) {
      const roleOrType = String(user?.userType || user?.role || user?.user_type || '').toLowerCase();
      const isDistributorOrReseller = roleOrType === 'distributor' || roleOrType === 'reseller' || user?.is_distributor === true || user?.is_reseller === true;

      if (isDistributorOrReseller) {
        const creditEnabled = Boolean(
          user?.creditPaymentEnabled === true ||
          user?.credit_enabled === true ||
          user?.credits_enabled === true
        );
        const availableCredit = parseFloat(
          user?.available_credit ??
          user?.availableCredit ??
          user?.creditLimit ??
          user?.credit_balance ??
          0
        );

        if (!creditEnabled) {
          Alert.alert(
            'கிரெடிட் வசதி முடக்கப்பட்டுள்ளது',
            'உங்கள் கணக்கில் கிரெடிட் வசதி செயல்படுத்தப்படவில்லை. தயவுசெய்து நிர்வாகியைத் தொடர்பு கொள்ளவும்.'
          );
          return;
        }

        const currentTotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (item.quantity || 1), 0);
        const targetItem = cartItems.find(item => item.id === productId && (!variationId || item.variation_id === variationId));
        const itemPrice = targetItem ? (parseFloat(targetItem.price) || 0) : 0;
        const projectedTotal = currentTotal + (itemPrice * delta);

        if (projectedTotal > availableCredit) {
          Alert.alert(
            'கிரெடிட் வரம்பு தாண்டியது',
            `அளவை அதிகரித்தால் மொத்த கார்ட் தொகை உங்கள் அனுமதிக்கப்பட்ட கிரெடிட் வரம்பை (₹${availableCredit.toFixed(0)}) விட அதிகமாகும்.`
          );
          return;
        }
      }
    }

    setCartItems(prev => {
      const updated = prev
        .map(item => {
          const isMatch = item.id === productId && (!variationId || item.variation_id === variationId);
          if (isMatch) {
            newQty = Math.max(1, item.quantity + delta);
            targetCartItemId = item.cartItemId;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(item => item.quantity > 0);

      storage.setCart(updated);
      return updated;
    });

    // Remote sync
    if (user && !user.isGuest && targetCartItemId) {
      try {
        await api.updateCartItem(targetCartItemId, newQty);
      } catch (e) {
        console.warn('Backend update quantity error:', e.message);
      }
    }
  };

  // Remove item
  const removeFromCart = async (productId, variationId = null) => {
    let targetCartItemId = null;

    setCartItems(prev => {
      const itemToRemove = prev.find(
        i => i.id === productId && (!variationId || i.variation_id === variationId)
      );
      if (itemToRemove) targetCartItemId = itemToRemove.cartItemId;

      const updated = prev.filter(
        i => !(i.id === productId && (!variationId || i.variation_id === variationId))
      );
      storage.setCart(updated);
      return updated;
    });

    if (user && !user.isGuest && targetCartItemId) {
      try {
        await api.deleteCartItem(targetCartItemId);
      } catch (e) {
        console.warn('Backend remove from cart error:', e.message);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    await storage.setCart([]);
  };

  // Pricing & Delivery Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  const deliveryInfo = useMemo(() => {
    if (subtotal === 0) {
      return { charge: 0, isFree: true, threshold: 0, remaining: 0, minOrder: 0, stateName: selectedState || 'Tamil Nadu' };
    }

    const stateClean = (selectedState || 'Tamil Nadu').trim().toLowerCase();

    // 1. Tamil Nadu & all TN Districts
    const tnDistricts = [
      'tamil nadu', 'tamilnadu', 'tn', 'chennai', 'erode', 'coimbatore', 'madurai',
      'salem', 'tiruppur', 'trichy', 'tiruchirappalli', 'tirunelveli', 'vellore',
      'thanjavur', 'dindigul', 'kanchipuram', 'cuddalore', 'thoothukudi', 'namakkal',
      'dharmapuri', 'krishnagiri', 'karur', 'pudukkottai', 'sivaganga', 'ramanathapuram',
      'virudhunagar', 'theni', 'nilgiris', 'ooty', 'kanyakumari', 'tiruvallur',
      'tiruvannamalai', 'viluppuram', 'kallakurichi', 'ranipet', 'tirupathur', 'chengalpattu',
      'tenkasi', 'mayiladuthurai', 'nagapattinam', 'ariyalur', 'perambalur',
      'sathyamangalam', 'puliampatti', 'gobichettipalayam', 'pollachi', 'mettupalayam',
      'தமிழ்நாடு', 'சென்னை', 'ஈரோடு', 'கோவை', 'மதுரை', 'சேலம்', 'திருச்சி'
    ];
    const isTN = tnDistricts.some(k => stateClean.includes(k));

    // Dynamic Shipping from backend /shipping-charge/ API
    if (Array.isArray(shippingRates) && shippingRates.length > 0) {
      const matched = shippingRates.find(r => {
        const sName = (r.state_name || '').toLowerCase();
        const sCode = (r.state_code || '').toLowerCase();
        if (isTN && (sCode === 'tn' || sName.includes('tamil nadu'))) return true;
        return (
          sName === stateClean ||
          sCode === stateClean ||
          stateClean.includes(sName) ||
          sName.includes(stateClean)
        );
      });

      if (matched) {
        const rateAmount = parseFloat(matched.shipping_amount) || 0;
        const freeThreshold = parseFloat(matched.free_above) || 0;
        const isFree = freeThreshold > 0 && subtotal >= freeThreshold;
        return {
          charge: isFree ? 0 : rateAmount,
          isFree,
          threshold: freeThreshold,
          remaining: isFree ? 0 : Math.max(0, freeThreshold - subtotal),
          minOrder: 0,
          stateName: matched.state_name,
          stateCode: matched.state_code,
        };
      }
    }

    // Default Fallback
    if (isTN || !selectedState) {
      const isFree = subtotal >= 750;
      return {
        charge: isFree ? 0 : 50,
        isFree,
        threshold: 750,
        remaining: isFree ? 0 : Math.max(0, 750 - subtotal),
        minOrder: 0,
        stateName: 'Tamil Nadu',
      };
    }

    return {
      charge: 200,
      isFree: subtotal >= 1000,
      threshold: 1000,
      remaining: Math.max(0, 1000 - subtotal),
      minOrder: 0,
      stateName: selectedState,
    };
  }, [subtotal, selectedState, shippingRates]);

  const deliveryCharge = deliveryInfo.charge;
  const grandTotal = subtotal + deliveryCharge;
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemCount,
        subtotal,
        deliveryCharge,
        deliveryInfo,
        grandTotal,
        selectedState,
        setSelectedState,
        shippingRates,
        loadShippingRates,
        selectedAddressId,
        setSelectedAddressId,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        syncRemoteCart,
        isLoading,
        showNotification: triggerCartNotification,
      }}
    >
      {children}
      {toastInfo && (
        <Animated.View
          pointerEvents="none"
          style={[
            toastStyles.container,
            {
              transform: [{ translateY: toastAnim }],
              opacity: toastOpacity,
            },
          ]}
        >
          <View style={toastStyles.iconBadge}>
            <Text style={toastStyles.checkmark}>✓</Text>
          </View>
          <View style={toastStyles.textCol}>
            <Text style={toastStyles.title}>Added to cart successfully!</Text>
            {toastInfo.productName ? (
              <Text style={toastStyles.subtitle} numberOfLines={1}>
                {toastInfo.productName}
              </Text>
            ) : null}
          </View>
        </Animated.View>
      )}
    </CartContext.Provider>
  );
};

const toastStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 54,
    left: 16,
    right: 16,
    zIndex: 999999,
    backgroundColor: '#0F382C',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  textCol: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subtitle: {
    color: '#C2E5D4',
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 1,
  },
});

export const useCart = () => useContext(CartContext);

export default CartContext;
