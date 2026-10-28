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
        if (!cleanUser?.id || (typeof cleanUser.id === 'string' && cleanUser.id.startsWith('user-'))) {
          // Stale mock user or missing ID, clean up
          await logout();
        } else {
          // Validate existing session with backend before restoring
          try {
            const isValid = await api.validateSession(cleanUser.id);
            if (isValid) {
              setUser(cleanUser);
              setToken(storedToken);
            } else {
              console.log('Session invalid on backend. Requiring fresh login.');
              await logout();
            }
          } catch (valErr) {
            if (valErr.isAuthInvalid) {
              console.log('Session expired or user deleted on backend. Requiring fresh login.');
              await logout();
            } else {
              // Non-auth error (e.g. temporary network offline)
              setUser(cleanUser);
              setToken(storedToken);
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to restore user session:', e);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithMobile = async mobile => {
    return await api.loginWithMobile(mobile);
  };

  const verifyOtp = async ({ mobile, otp, pendingUserId }) => {
    if (!otp || String(otp).trim().length < 4) {
      throw new Error('Please enter a valid OTP code.');
    }

    const res = await api.verifyOtp({ mobile, otp: String(otp).trim(), userId: pendingUserId });

    if (!res || res.success === false) {
      throw new Error(res?.message || 'Invalid OTP code. Please enter the valid code received.');
    }

    // Handle authenticated user payload strictly from backend response
    let cleanUser = null;
    let authToken = null;

    if (res.user && typeof res.user === 'object') {
      const u = Array.isArray(res.user) ? res.user[0] : res.user;
      cleanUser = {
        id: u.id || res.user_id || pendingUserId,
        name: u.name || 'Dharani Customer',
        mobile: u.mobile || u.phone_number || res.mobile || mobile,
        phone_number: u.mobile || u.phone_number || res.mobile || mobile,
        email: u.email || null,
        role: u.role || 'customer',
        is_store_member: !!u.is_store_member,
      };
      authToken = res.token || res.access || null;
    } else if (res.id || res.user_id) {
      cleanUser = {
        id: res.id || res.user_id,
        mobile: res.mobile || mobile,
        phone_number: res.mobile || mobile,
        name: res.name || 'Dharani Customer',
        email: res.email || null,
        role: res.role || 'customer',
      };
      authToken = res.token || null;
    } else if (res.data) {
      const u = res.data.user || res.data;
      cleanUser = {
        id: u.id || res.user_id || pendingUserId,
        mobile: u.mobile || u.phone_number || mobile,
        phone_number: u.mobile || u.phone_number || mobile,
        name: u.name || 'Dharani Customer',
        email: u.email || null,
        role: u.role || 'customer',
      };
      authToken = res.data.token || null;
    }

    if (!cleanUser || !cleanUser.id) {
      throw new Error(res?.message || 'Could not complete OTP verification.');
    }

    // Clear any prior user artifacts before establishing new authenticated session
    await storage.clearAuth();
    await storage.setAddresses([]);

    setUser(cleanUser);
    setToken(authToken);
    await storage.setUser(cleanUser);
    if (authToken) await storage.setToken(authToken);

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
    await storage.setAddresses([]);
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
