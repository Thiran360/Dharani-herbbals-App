/**
 * Dharani Herbbals API Service
 * Official Backend: https://api.codingboss.in/herbal
 */

import { API_CONFIG } from '../constants/config';
import storage from './storage';
import { STATIC_CATEGORIES, getCategoryLocalImage, getCategoryRemoteImage } from '../constants/categories';
import { isArppuShampoo, isAloeVeraShampoo, isKadalaiMittai } from '../utils/formatters';

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

const sanitizeProduct = p => {
  if (!p) return p;
  const nameLower = (p.name || '').toLowerCase();
  const img = p.image || '';

  // Fix images where backend erroneously served Vaishnavi.jpeg placeholder or missing image
  if (img.includes('Vaishnavi.jpeg') || !img || img.length < 5) {
    if (nameLower.includes('arappu') || nameLower.includes('aruppu')) {
      p.image = 'https://vedanmart.com/images/herbal/12.jpeg';
      if (!p.extra_images || p.extra_images.length === 0) {
        p.extra_images = ['https://vedanmart.com/images/Body/VEDAN%20GREEN%20ARAPPU%20POWDER.jpeg'];
      }
    } else if (nameLower.includes('veppilai') || nameLower.includes('vepila') || nameLower.includes('neem')) {
      p.image = 'https://vedanmart.com/images/Body/NEEM%20LEAVES%20POWDER.jpeg';
      if (!p.extra_images || p.extra_images.length === 0) {
        p.extra_images = ['https://vedanmart.com/images/Health%20&%20Wellness/veppilai%20powder.jpeg'];
      }
    } else if (nameLower.includes('karuveppilai') || nameLower.includes('curry leaf')) {
      p.image = 'https://vedanmart.com/images/herbal/5.jpeg';
      if (!p.extra_images || p.extra_images.length === 0) {
        p.extra_images = ['https://vedanmart.com/images/Health%20&%20Wellness/veppilai%20powder.jpeg'];
      }
    }
  }

  if (p.id === 1292) {
    p.image = 'https://vedanmart.com/images/herbal/12.jpeg';
  }
  if (p.id === 1286) {
    p.image = 'https://vedanmart.com/images/Body/NEEM%20LEAVES%20POWDER.jpeg';
  }
  if (p.id === 1285) {
    p.image = 'https://vedanmart.com/images/herbal/5.jpeg';
  }

  // Weight & Volume Catalog corrections for zero/missing weights
  if (p.id === 1305 || isKadalaiMittai(p)) {
    p.weight_volume = '';
    p.unit = '';
    p.size = '';
  } else if (p.id === 1255 || /chemparuthi.*shampoo/i.test(p.name)) {
    p.weight_volume = '0.125';
    p.unit = 'ML';
  } else if (p.id === 1250 || isAloeVeraShampoo(p)) {
    p.weight_volume = '0.125';
    p.unit = 'ML';
  } else if (isArppuShampoo(p)) {
    p.weight_volume = p.weight_volume || '0.125';
    p.unit = p.unit || 'ML';
  } else if (p.id === 1073 || /kandakathiri.*powder/i.test(p.name)) {
    p.weight_volume = '0.050';
    p.unit = 'G';
  }

  // Pricing & Offer Corrections:
  // Arppu Shampoo: Sell at ₹65 only (remove 50% discount and crossed out ₹130)
  if (isArppuShampoo(p)) {
    p.price = 65;
    p.mrp = 65;
    p.originalPrice = 65;
    p.original_price = 65;
    p.customer_price = 65;
    p.discount = 0;
    p.discount_percent = 0;
  }

  // Aloe Vera Shampoo: Sell at ₹65 only (remove 19% discount and crossed out old price)
  if (isAloeVeraShampoo(p)) {
    p.price = 65;
    p.mrp = 65;
    p.originalPrice = 65;
    p.original_price = 65;
    p.customer_price = 65;
    p.discount = 0;
    p.discount_percent = 0;
  }

  return p;
};

export const api = {
  // PRODUCTS
  async getProducts() {
    try {
      const data = await request('/products/');
      if (Array.isArray(data) && data.length > 0) {
        const cleaned = data.map(sanitizeProduct);
        // Cache products locally
        await storage.setCachedProducts(cleaned);
        return cleaned;
      }
      return data;
    } catch (error) {
      console.log('api.getProducts fallback to cache:', error.message);
      const cached = await storage.getCachedProducts();
      if (cached && cached.length > 0) return cached.map(sanitizeProduct);
      throw error;
    }
  },

  async getCategories() {
    try {
      const res = await request('/categories/');
      if (res && res.success && Array.isArray(res.data)) {
        return res.data.map(apiCat => {
          const apiNameLower = (apiCat.name || '').trim().toLowerCase();
          const staticMatch = STATIC_CATEGORIES.find(
            s => s.id === apiCat.id || s.name.toLowerCase() === apiNameLower
          );
          const localImg = staticMatch?.localImage || getCategoryLocalImage(apiCat);
          const remoteImg = (apiCat.image && typeof apiCat.image === 'string' && apiCat.image.startsWith('http'))
            ? apiCat.image
            : (staticMatch?.image || getCategoryRemoteImage(apiCat));

          return {
            ...staticMatch,
            ...apiCat,
            id: apiCat.id ?? staticMatch?.id,
            name: apiCat.name || staticMatch?.name,
            nameTa: staticMatch?.nameTa || apiCat.nameTa,
            description: staticMatch?.description || apiCat.description,
            image: remoteImg,
            localImage: localImg,
          };
        });
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
      if (Array.isArray(data)) return data.map(sanitizeProduct);
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
      const vars = await request(`/products/${productId}/variations/`);
      if (Array.isArray(vars)) {
        return vars.map(v => {
          if (productId === 1250 || isAloeVeraShampoo(v) || isArppuShampoo(v)) {
            v.price = 65;
            v.mrp = 65;
            v.customer_price = 65;
          }
          return v;
        });
      }
      return [];
    } catch {
      return [];
    }
  },

  // AUTHENTICATION
  async loginWithMobile(mobile) {
    const res = await request('/user-login/', {
      method: 'POST',
      body: JSON.stringify({
        mobile: mobile,
        phone_number: mobile,
      }),
    });
    // Security: sanitize response, never expose server OTP in application layer
    if (res && typeof res === 'object' && 'otp' in res) {
      delete res.otp;
    }
    return res;
  },

  async resendOtp(mobile) {
    const res = await request('/resend-otp/', {
      method: 'POST',
      body: JSON.stringify({
        mobile: mobile,
        phone_number: mobile,
      }),
    });
    // Security: sanitize response, never expose server OTP in application layer
    if (res && typeof res === 'object' && 'otp' in res) {
      delete res.otp;
    }
    return res;
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

  async validateSession(userId) {
    if (!userId) return false;
    try {
      const res = await request(`/address/${userId}/`);
      if (res && (res.user_id || Array.isArray(res.addresses))) {
        return true;
      }
      return false;
    } catch (err) {
      if (
        err.status === 400 ||
        err.status === 401 ||
        err.status === 404 ||
        (err.message && err.message.includes('No User matches'))
      ) {
        const authErr = new Error('Session invalid or user not found');
        authErr.isAuthInvalid = true;
        throw authErr;
      }
      throw err;
    }
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

  // DYNAMIC SHIPPING CHARGES API
  async getShippingCharges() {
    try {
      const res = await request('/shipping-charge/');
      if (res && Array.isArray(res.data)) {
        await storage.setCachedShippingRates(res.data);
        return res.data;
      }
      return [];
    } catch (error) {
      console.log('api.getShippingCharges fallback to cache:', error.message);
      const cached = await storage.getCachedShippingRates();
      return Array.isArray(cached) ? cached : [];
    }
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
