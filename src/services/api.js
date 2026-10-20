/**
 * Dharani Herbbals API Service
 * Official Backend: https://api.codingboss.in/herbal
 */

import { API_CONFIG } from '../constants/config';
import storage from './storage';
import { STATIC_CATEGORIES } from '../constants/categories';

const request = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...API_CONFIG.HEADERS,
      ...(options.headers || {}),
    },
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);
    config.signal = controller.signal;

    const response = await fetch(url, config);
    clearTimeout(timeout);

    const contentType = response.headers.get('content-type') || '';
    let data = null;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { text };
      }
    }

    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `HTTP ${response.status}: Request failed`;
      const err = new Error(errorMessage);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Connection timed out. Please check your internet connection.');
    }
    throw error;
  }
};

export const api = {
  // PRODUCTS
  async getProducts() {
    try {
      const data = await request('/products/');
      if (Array.isArray(data) && data.length > 0) {
        // Cache products locally
        await storage.setCachedProducts(data);
        return data;
      }
      return data;
    } catch (error) {
      console.log('api.getProducts fallback to cache:', error.message);
      const cached = await storage.getCachedProducts();
      if (cached && cached.length > 0) return cached;
      throw error;
    }
  },

  async getCategories() {
    try {
      const res = await request('/categories/');
      if (res && res.success && Array.isArray(res.data)) {
        return res.data;
      }
      return STATIC_CATEGORIES;
    } catch (error) {
      console.log('api.getCategories fallback to static:', error.message);
      return STATIC_CATEGORIES;
    }
  },

  async getBrands() {
    try {
      const res = await request('/brands/');
      if (res && res.success && Array.isArray(res.data)) {
        return res.data;
      }
      return [];
    } catch (error) {
      console.log('api.getBrands error:', error.message);
      return [];
    }
  },

  async getMostLoved() {
    try {
      const data = await request('/most-loved/');
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.log('api.getMostLoved error:', error.message);
      return [];
    }
  },

  async getProductReviews(productId) {
    try {
      return await request(`/products/${productId}/reviews/`);
    } catch {
      return [];
    }
  },

  async getProductReviewSummary(productId) {
    try {
      return await request(`/products/${productId}/review-summary/`);
    } catch {
      return null;
    }
  },

  async getProductImages(productId) {
    try {
      return await request(`/product-images/${productId}/`);
    } catch {
      return [];
    }
  },

  async getProductKeyPoints(productId) {
    try {
      return await request(`/products/${productId}/key-points/`);
    } catch {
      return [];
    }
  },

  async getProductVariations(productId) {
    try {
      return await request(`/products/${productId}/variations/`);
    } catch {
      return [];
    }
  },

  // AUTHENTICATION
  async loginWithMobile(mobile) {
    return await request('/user-login/', {
      method: 'POST',
      body: JSON.stringify({
        mobile: mobile,
        phone_number: mobile,
      }),
    });
  },

  async resendOtp(mobile) {
    return await request('/resend-otp/', {
      method: 'POST',
      body: JSON.stringify({
        mobile: mobile,
        phone_number: mobile,
      }),
    });
  },

  async verifyOtp({ mobile, otp, userId }) {
    const payload = {
      mobile: mobile,
      phone_number: mobile,
      otp: otp,
    };
    if (userId) payload.user_id = userId;

    return await request('/verify-otp/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getCustomer(userId) {
    return await request(`/customers/${userId}/`);
  },

  async updateCustomer(userId, { name, email }) {
    return await request(`/customers/${userId}/`, {
      method: 'PUT',
      body: JSON.stringify({ name, email }),
    });
  },

  // CART (When logged in)
  async getCart(userId, { addressId, state } = {}) {
    let url = `/carts/?user_id=${userId}`;
    if (addressId) url += `&address_id=${addressId}`;
    if (state) url += `&state=${encodeURIComponent(state)}`;
    return await request(url);
  },

  async addToCart({ userId, productId, quantity = 1, variationId = null }) {
    const payload = {
      user_id: userId,
      product_id: productId,
      quantity: quantity,
    };
    if (variationId) payload.variation_id = variationId;

    return await request('/carts/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateCartItem(cartItemId, quantity) {
    return await request(`/cart/${cartItemId}/`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  async deleteCartItem(cartItemId) {
    return await request(`/cart/${cartItemId}/`, {
      method: 'DELETE',
    });
  },

  // ADDRESSES
  async getAddresses(userId) {
    try {
      const res = await request(`/address/${userId}/`);
      if (res && Array.isArray(res.addresses)) return res.addresses;
      if (Array.isArray(res)) return res;
      return [];
    } catch {
      return [];
    }
  },

  async addAddress(addressData) {
    return await request('/address/', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  },

  async updateAddress(addressData) {
    return await request('/address/', {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  },

  async deleteAddress(addressId) {
    return await request(`/address/${addressId}/`, {
      method: 'DELETE',
      body: JSON.stringify({ address_id: addressId }),
    });
  },

  // CHECKOUT & ORDERS
  async createCheckout(orderPayload) {
    return await request('/checkout/', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
  },

  // PAYGLOCAL PAYMENT GATEWAY (Connected to Django /herbal/payglocal/)
  async initiatePayGlocalPayment(orderData) {
    const { default: payglocalService } = await import('./payglocalService');
    return await payglocalService.createPayment(orderData);
  },

  async verifyPayGlocalPayment(params) {
    const { default: payglocalService } = await import('./payglocalService');
    const query = typeof params === 'string' ? { gid: params, merchantTxnId: params } : (params || {});
    return await payglocalService.verifyPaymentStatus(query);
  },

  async checkinPayGlocalPayment(params) {
    const { default: payglocalService } = await import('./payglocalService');
    return await payglocalService.checkinPayment(params);
  },


  async getUserOrders(userId, role = 'customer') {
    try {
      const res = await request(`/orders/?user_id=${userId}&role=${role}`);
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.orders)) return res.orders;
      if (res && Array.isArray(res.results)) return res.results;
      return [];
    } catch {
      return [];
    }
  },

  async getMyOrder(orderId) {
    return await request(`/my-orders/${orderId}/`);
  },

  async getOrderTracking(orderId) {
    return await request(`/tracking/${orderId}/`);
  },

  async submitReview(reviewData) {
    return await request('/reviews/submit/', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },
};

export default api;
