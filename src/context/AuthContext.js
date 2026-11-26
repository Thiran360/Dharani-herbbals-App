/**
 * Authentication Context for Dharani Herbbals
 * Handles User Profiles, Roles (Customer, Distributor, Reseller),
 * and Dynamic Credit Verification & Management
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
              // Fetch latest customer credits & role silently
              refreshUserProfile(cleanUser.id).catch(() => {});
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

  const refreshUserProfile = async (targetUserId = null) => {
    const uid = targetUserId || user?.id;
    if (!uid || user?.isGuest) return null;

    try {
      const cust = await api.getCustomer(uid);
      if (cust && (cust.id || cust.name)) {
        const userType = cust.userType || cust.role || cust.user_type || user?.userType || user?.role || 'customer';
        const updated = {
          ...(user || {}),
          ...cust,
          id: cust.id || uid,
          name: cust.name || user?.name || 'Dharani Customer',
          mobile: cust.phone || cust.mobile || user?.mobile,
          phone_number: cust.phone || cust.mobile || user?.phone_number,
          email: cust.email || user?.email,
          userType: userType,
          role: userType,
          creditPaymentEnabled: Boolean(cust.creditPaymentEnabled ?? cust.credit_payment_enabled ?? false),
          creditLimit: parseFloat(cust.creditLimit ?? cust.credit_limit ?? 0),
          balance: parseFloat(cust.balance ?? 0),
          available_credit: parseFloat(cust.available_credit ?? cust.availableCredit ?? cust.creditLimit ?? 0),
        };
        setUser(updated);
        await storage.setUser(updated);
        return updated;
      }
    } catch (err) {
      console.log('refreshUserProfile non-blocking err:', err.message);
    }
    return null;
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
      const userType = u.userType || u.user_type || u.role || 'customer';
      cleanUser = {
        id: u.id || res.user_id || pendingUserId,
        name: u.name || 'Dharani Customer',
        mobile: u.mobile || u.phone_number || res.mobile || mobile,
        phone_number: u.mobile || u.phone_number || res.mobile || mobile,
        email: u.email || null,
        userType: userType,
        role: userType,
        creditPaymentEnabled: Boolean(u.creditPaymentEnabled ?? u.credit_payment_enabled ?? false),
        creditLimit: parseFloat(u.creditLimit ?? u.credit_limit ?? 0),
        balance: parseFloat(u.balance ?? 0),
        available_credit: parseFloat(u.available_credit ?? u.availableCredit ?? u.creditLimit ?? 0),
        is_store_member: !!u.is_store_member,
      };
      authToken = res.token || res.access || null;
    } else if (res.id || res.user_id) {
      const userType = res.userType || res.role || res.user_type || 'customer';
      cleanUser = {
        id: res.id || res.user_id,
        mobile: res.mobile || mobile,
        phone_number: res.mobile || mobile,
        name: res.name || 'Dharani Customer',
        email: res.email || null,
        userType: userType,
        role: userType,
        creditPaymentEnabled: Boolean(res.creditPaymentEnabled ?? res.credit_payment_enabled ?? false),
        creditLimit: parseFloat(res.creditLimit ?? res.credit_limit ?? 0),
        balance: parseFloat(res.balance ?? 0),
        available_credit: parseFloat(res.available_credit ?? res.availableCredit ?? res.creditLimit ?? 0),
      };
      authToken = res.token || null;
    } else if (res.data) {
      const u = res.data.user || res.data;
      const userType = u.userType || u.user_type || u.role || 'customer';
      cleanUser = {
        id: u.id || res.user_id || pendingUserId,
        mobile: u.mobile || u.phone_number || mobile,
        phone_number: u.mobile || u.phone_number || mobile,
        name: u.name || 'Dharani Customer',
        email: u.email || null,
        userType: userType,
        role: userType,
        creditPaymentEnabled: Boolean(u.creditPaymentEnabled ?? u.credit_payment_enabled ?? false),
        creditLimit: parseFloat(u.creditLimit ?? u.credit_limit ?? 0),
        balance: parseFloat(u.balance ?? 0),
        available_credit: parseFloat(u.available_credit ?? u.availableCredit ?? u.creditLimit ?? 0),
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

    // Refresh live profile details from /customers/{id}/
    refreshUserProfile(cleanUser.id).catch(() => {});

    return res;
  };

  const guestLogin = async (mobile, name = 'Guest Customer') => {
    const guestUser = {
      id: Date.now(), // Numeric guest ID
      name: name,
      mobile: mobile || '9999999999',
      phone_number: mobile || '9999999999',
      email: `${mobile || 'guest'}@guest.com`,
      userType: 'customer',
      role: 'customer',
      creditPaymentEnabled: false,
      creditLimit: 0,
      balance: 0,
      available_credit: 0,
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

  const userTypeStr = String(user?.userType || user?.role || user?.user_type || '').toLowerCase();
  const isDistributor = userTypeStr === 'distributor' || user?.is_distributor === true;
  const isReseller = userTypeStr === 'reseller' || user?.is_reseller === true;
  const isDistributorOrReseller = isDistributor || isReseller;
  const creditsEnabled = Boolean(user?.creditPaymentEnabled === true || user?.credit_enabled === true);
  const availableCredit = parseFloat(user?.available_credit ?? user?.availableCredit ?? user?.creditLimit ?? 0);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !user.isGuest,
        isGuest: !!user?.isGuest,
        isDistributor,
        isReseller,
        isDistributorOrReseller,
        creditsEnabled,
        availableCredit,
        refreshUserProfile,
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
