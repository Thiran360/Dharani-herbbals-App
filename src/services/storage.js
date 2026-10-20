/**
 * AsyncStorage Service for Dharani Herbbals
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER: '@dharani_user',
  TOKEN: '@dharani_token',
  CART: '@dharani_cart',
  WISHLIST: '@dharani_wishlist',
  ADDRESSES: '@dharani_addresses',
  RECENT_SEARCHES: '@dharani_recent_searches',
  LANGUAGE: '@dharani_language',
  PRODUCTS_CACHE: '@dharani_products_cache',
};

export const storage = {
  // User & Auth
  async getUser() {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async setUser(user) {
    try {
      if (user) {
        await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(KEYS.USER);
      }
    } catch (e) {
      console.error('Storage error setUser:', e);
    }
  },

  async getToken() {
    try {
      return await AsyncStorage.getItem(KEYS.TOKEN);
    } catch {
      return null;
    }
  },

  async setToken(token) {
    try {
      if (token) {
        await AsyncStorage.setItem(KEYS.TOKEN, token);
      } else {
        await AsyncStorage.removeItem(KEYS.TOKEN);
      }
    } catch (e) {
      console.error('Storage error setToken:', e);
    }
  },

  async clearAuth() {
    try {
      if (typeof AsyncStorage?.multiRemove === 'function') {
        await AsyncStorage.multiRemove([KEYS.USER, KEYS.TOKEN]);
      } else if (typeof AsyncStorage?.removeMany === 'function') {
        await AsyncStorage.removeMany([KEYS.USER, KEYS.TOKEN]);
      } else {
        await Promise.all([
          AsyncStorage.removeItem(KEYS.USER),
          AsyncStorage.removeItem(KEYS.TOKEN),
        ]);
      }
    } catch (e) {
      console.error('Storage error clearAuth:', e);
    }
  },

  // Cart
  async getCart() {
    try {
      const data = await AsyncStorage.getItem(KEYS.CART);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async setCart(cartItems) {
    try {
      await AsyncStorage.setItem(KEYS.CART, JSON.stringify(cartItems || []));
    } catch (e) {
      console.error('Storage error setCart:', e);
    }
  },

  // Wishlist
  async getWishlist() {
    try {
      const data = await AsyncStorage.getItem(KEYS.WISHLIST);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async setWishlist(items) {
    try {
      await AsyncStorage.setItem(KEYS.WISHLIST, JSON.stringify(items || []));
    } catch (e) {
      console.error('Storage error setWishlist:', e);
    }
  },

  // Addresses
  async getAddresses() {
    try {
      const data = await AsyncStorage.getItem(KEYS.ADDRESSES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async setAddresses(addresses) {
    try {
      await AsyncStorage.setItem(KEYS.ADDRESSES, JSON.stringify(addresses || []));
    } catch (e) {
      console.error('Storage error setAddresses:', e);
    }
  },

  // Recent Searches
  async getRecentSearches() {
    try {
      const data = await AsyncStorage.getItem(KEYS.RECENT_SEARCHES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async addRecentSearch(query) {
    if (!query || !query.trim()) return;
    try {
      const current = await storage.getRecentSearches();
      const filtered = current.filter(q => q.toLowerCase() !== query.toLowerCase().trim());
      const updated = [query.trim(), ...filtered].slice(0, 10);
      await AsyncStorage.setItem(KEYS.RECENT_SEARCHES, JSON.stringify(updated));
    } catch (e) {
      console.error('Storage error addRecentSearch:', e);
    }
  },

  async clearRecentSearches() {
    try {
      await AsyncStorage.removeItem(KEYS.RECENT_SEARCHES);
    } catch (e) {
      console.error('Storage error clearRecentSearches:', e);
    }
  },

  // Language
  async getLanguage() {
    try {
      return (await AsyncStorage.getItem(KEYS.LANGUAGE)) || 'en';
    } catch {
      return 'en';
    }
  },

  async setLanguage(lang) {
    try {
      await AsyncStorage.setItem(KEYS.LANGUAGE, lang);
    } catch (e) {
      console.error('Storage error setLanguage:', e);
    }
  },

  // Cached Products
  async getCachedProducts() {
    try {
      const data = await AsyncStorage.getItem(KEYS.PRODUCTS_CACHE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async setCachedProducts(products) {
    try {
      await AsyncStorage.setItem(KEYS.PRODUCTS_CACHE, JSON.stringify(products || []));
    } catch (e) {
      console.error('Storage error setCachedProducts:', e);
    }
  },
};

export default storage;
