/**
 * Authentication Context for Dharani Herbbals
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../services/storage';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserSession();
  }, []);

  const loadUserSession = async () => {
    try {
      const storedUser = await storage.getUser();
      const storedToken = await storage.getToken();

      if (storedUser) {
        // Validate user format
        const cleanUser = storedUser.user || storedUser;
        if (typeof cleanUser.id === 'string' && cleanUser.id.startsWith('user-')) {
          // Stale mock user, clean up
          await storage.clearAuth();
          setUser(null);
        } else {
          setUser(cleanUser);
          setToken(storedToken);
        }
      }
    } catch (e) {
      console.error('Failed to restore user session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithMobile = async mobile => {
    return await api.loginWithMobile(mobile);
  };

  const verifyOtp = async ({ mobile, otp, pendingUserId }) => {
    const res = await api.verifyOtp({ mobile, otp, userId: pendingUserId });

    // Handle API responses
    let cleanUser = null;
    let authToken = null;

    if (res.user) {
      cleanUser = res.user;
      authToken = res.token || res.access || null;
    } else if (res.id || res.user_id) {
      cleanUser = {
        id: res.id || res.user_id,
        mobile: mobile,
        phone_number: mobile,
        name: res.name || 'Dharani Customer',
        email: res.email || `${mobile}@dharaniherbbals.in`,
        role: res.role || 'customer',
      };
      authToken = res.token || null;
    } else if (res.success && res.data) {
      cleanUser = res.data.user || res.data;
      authToken = res.data.token || null;
    }

    if (cleanUser) {
      setUser(cleanUser);
      setToken(authToken);
      await storage.setUser(cleanUser);
      if (authToken) await storage.setToken(authToken);
    }

    return res;
  };

  const guestLogin = async (mobile, name = 'Guest Customer') => {
    const guestUser = {
      id: Date.now(), // Numeric guest ID
      name: name,
      mobile: mobile || '9999999999',
      phone_number: mobile || '9999999999',
      email: `${mobile || 'guest'}@guest.com`,
      role: 'customer',
      isGuest: true,
    };
    setUser(guestUser);
    await storage.setUser(guestUser);
    return guestUser;
  };

  const updateProfile = async (name, email) => {
    if (!user) return;
    const updated = { ...user, name, email };
    setUser(updated);
    await storage.setUser(updated);

    try {
      if (user.id && !user.isGuest) {
        await api.updateCustomer(user.id, { name, email });
      }
    } catch (e) {
      console.warn('Failed to update remote profile:', e.message);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await storage.clearAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !user.isGuest,
        isGuest: !!user?.isGuest,
        loginWithMobile,
        verifyOtp,
        guestLogin,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
