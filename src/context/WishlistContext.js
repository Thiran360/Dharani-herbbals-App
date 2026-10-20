/**
 * Wishlist Context for Dharani Herbbals
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../services/storage';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const items = await storage.getWishlist();
      if (Array.isArray(items)) {
        setWishlist(items);
      }
    } catch (e) {
      console.error('Failed to load wishlist:', e);
    }
  };

  const isInWishlist = productId => {
    return wishlist.some(item => item.id === productId);
  };

  const toggleWishlist = async product => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      let updated;
      if (exists) {
        updated = prev.filter(item => item.id !== product.id);
      } else {
        updated = [...prev, product];
      }
      storage.setWishlist(updated);
      return updated;
    });
  };

  const removeFromWishlist = async productId => {
    setWishlist(prev => {
      const updated = prev.filter(item => item.id !== productId);
      storage.setWishlist(updated);
      return updated;
    });
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);

export default WishlistContext;
