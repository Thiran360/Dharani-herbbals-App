/**
 * Cart Context for Dharani Herbbals
 * Exact business logic matching dharaniherbbals.in
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);

  // Initialize cart from storage
  useEffect(() => {
    loadLocalCart();
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
        const formatted = items.map(item => ({
          id: item.product_id || item.id,
          cartItemId: item.id || item.cartItemId,
          name: item.product_name || item.name,
          tamil_name: item.tamil_name || item.product_name || item.name,
          image: item.product_image || item.image,
          price: parseFloat(item.price) || 0,
          quantity: item.quantity || 1,
          variation_id: item.variation_id || null,
          variation_name: item.variation_name || '',
          gst_percentage: parseFloat(item.gst_percentage) || 5,
        }));
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

    const numericMrp = typeof product.mrp === 'string'
      ? parseFloat(product.mrp.replace(/[^\d.]/g, ''))
      : typeof product.originalPrice === 'string'
      ? parseFloat(product.originalPrice.replace(/[^\d.]/g, ''))
      : parseFloat(product.mrp || product.originalPrice) || numericPrice;

    const variationId = variation ? (variation.id || variation.variation_id) : null;
    const variationName = variation ? (variation.name || variation.size || variation.weight) : '';

    setCartItems(prev => {
      const existingIdx = prev.findIndex(
        i => i.id === product.id && i.variation_id === variationId
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
          image: product.image,
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
      return { charge: 0, isFree: true, threshold: 0, remaining: 0, minOrder: 0 };
    }

    const stateClean = (selectedState || 'Tamil Nadu').trim().toLowerCase();

    // 1. Tamil Nadu
    if (stateClean === 'tamil nadu' || stateClean === 'tn' || stateClean === 'chennai') {
      const rule = SHIPPING_RULES.TAMIL_NADU;
      const isFree = subtotal >= rule.freeThreshold;
      return {
        charge: isFree ? 0 : rule.rate,
        isFree,
        threshold: rule.freeThreshold,
        remaining: isFree ? 0 : Math.max(0, rule.freeThreshold - subtotal),
        minOrder: rule.minOrder,
      };
    }

    // 2. South States (Kerala, Karnataka, Andhra Pradesh)
    const isSouth = SHIPPING_RULES.SOUTH_STATES.states.some(s =>
      stateClean.includes(s.toLowerCase())
    );
    if (isSouth) {
      const rule = SHIPPING_RULES.SOUTH_STATES;
      const isFree = subtotal >= rule.freeThreshold;
      return {
        charge: isFree ? 0 : rule.rate,
        isFree,
        threshold: rule.freeThreshold,
        remaining: isFree ? 0 : Math.max(0, rule.freeThreshold - subtotal),
        minOrder: rule.minOrder,
      };
    }

    // 3. Rest of India
    const rule = SHIPPING_RULES.REST_OF_INDIA;
    const isFree = subtotal >= rule.freeThreshold;
    return {
      charge: isFree ? 0 : rule.rate,
      isFree,
      threshold: rule.freeThreshold,
      remaining: isFree ? 0 : Math.max(0, rule.freeThreshold - subtotal),
      minOrder: rule.minOrder,
    };
  }, [subtotal, selectedState]);

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
        selectedAddressId,
        setSelectedAddressId,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        syncRemoteCart,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

export default CartContext;
