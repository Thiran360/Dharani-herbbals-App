/**
 * Official PayGlocal Integration Service for Dharani Herbbals React Native App
 * Directly connects to the existing deployed Django backend at:
 * https://api.codingboss.in/herbal/payglocal/
 *
 * Endpoints:
 * - herbal/payglocal/create/   -> payglocal_create_payment
 * - herbal/payglocal/callback/ -> payglocal_callback (Server-to-Server / Hosted Web Return)
 * - herbal/payglocal/status/   -> payglocal_status
 * - herbal/payglocal/checkin/  -> payglocal_checkin
 *
 * Security: Zero private keys, key IDs, or API secrets are stored on the mobile device.
 * All PayGlocal signing and token generation occurs securely on the Django backend.
 */

import { API_CONFIG, PAYGLOCAL_CONFIG } from '../constants/config';

async function postToPaymentApi(endpoint, body = {}) {
  const url = `${PAYGLOCAL_CONFIG.BASE_URL}${endpoint}`;
  const timeoutMs = PAYGLOCAL_CONFIG.TIMEOUT_MS || 15000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(API_CONFIG.HEADERS || {}),
      },
      body: JSON.stringify(body),
    });

    clearTimeout(timer);

    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { rawText: text };
    }

    if (!response.ok) {
      const errorMsg = data.message || data.error || `HTTP ${response.status} from payment API`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

export const payglocalService = {
  /**
   * 1. Create PayGlocal payment session via Django:
   * POST /herbal/payglocal/create/
   *
   * @param {Object} params
   * @param {number|string} params.orderId - Numeric order ID from Django checkout
   * @param {number|string} params.amount - Total order amount
   * @param {number|string} params.userId - User ID
   * @param {string} params.mobile - Customer 10-digit mobile number
   * @param {string} params.email - Customer email address
   * @param {string} params.returnUrl - Deep link return scheme (default: dharani://payment-callback)
   */
  async createPayment({ orderId, amount, userId, mobile, email, returnUrl }) {
    if (!orderId) {
      throw new Error('Order ID is required to initiate PayGlocal payment.');
    }
    if (!amount || parseFloat(amount) <= 0) {
      throw new Error('Valid amount is required to initiate PayGlocal payment.');
    }

    const payload = {
      order_id: Number(orderId),
      amount: parseFloat(Number(amount).toFixed(2)),
      user_id: Number(userId) || 1,
      mobile: (mobile || '').replace(/[^0-9]/g, '').slice(-10) || '9788122001',
      email: email || 'customer@dharaniherbbals.in',
      return_url: returnUrl || 'dharani://payment-callback',
    };

    const res = await postToPaymentApi(PAYGLOCAL_CONFIG.ENDPOINTS.CREATE, payload);

    const redirectUrl =
      res.response?.data?.redirectUrl ||
      res.redirect_url ||
      res.payment_url ||
      res.data?.redirectUrl;

    const gid = res.gid || res.response?.gid;
    const merchantTxnId = res.merchant_txn_id || res.response?.data?.merchantTxnId;

    if (!redirectUrl) {
      throw new Error(res.message || 'Payment initiation failed: no redirect URL returned.');
    }

    return {
      success: true,
      redirectUrl,
      gid,
      merchantTxnId,
      orderId: Number(orderId),
      raw: res,
    };
  },

  /**
   * 2. Checkin / Verify payment via Django check-in endpoint:
   * POST /herbal/payglocal/checkin/
   * Queries PayGlocal gateway and updates payment status in Django database.
   *
   * @param {Object} params
   * @param {string} params.gatewayTransactionId - PayGlocal GID (gl_o-...)
   */
  async checkinPayment({ gatewayTransactionId }) {
    if (!gatewayTransactionId) {
      throw new Error('Gateway transaction ID (GID) is required for checkin.');
    }

    return await postToPaymentApi(PAYGLOCAL_CONFIG.ENDPOINTS.CHECKIN, {
      gateway_transaction_id: gatewayTransactionId,
    });
  },

  /**
   * 3. Query Django status endpoint:
   * POST /herbal/payglocal/status/
   *
   * @param {Object} params
   * @param {string} params.gid - PayGlocal GID
   * @param {string} params.merchantTxnId - Merchant Transaction ID
   */
  async checkPaymentStatus({ gid, merchantTxnId }) {
    return await postToPaymentApi(PAYGLOCAL_CONFIG.ENDPOINTS.STATUS, {
      gid: gid || undefined,
      merchant_txn_id: merchantTxnId || undefined,
    });
  },

  /**
   * 4. Multi-source Authoritative Payment Verification
   * Never trusts client state. Confirms real gateway transaction state from server.
   *
   * @param {Object} params
   * @param {string} params.gid - PayGlocal GID
   * @param {string} params.merchantTxnId - Merchant Txn ID
   * @param {number|string} params.orderId - Numeric order ID
   */
  async verifyPaymentStatus({ gid, merchantTxnId, orderId }) {
    const targetGid = gid;
    let checkinResult = null;

    // 1. Query Django check-in endpoint (queries PayGlocal & updates DB)
    if (targetGid) {
      try {
        checkinResult = await this.checkinPayment({ gatewayTransactionId: targetGid });
      } catch (err) {
        console.log('Payment checkin query note:', err.message);
      }
    }

    if (checkinResult) {
      const gwStatus = (
        checkinResult.gateway_status ||
        checkinResult.data?.status ||
        checkinResult.status ||
        ''
      ).toUpperCase();

      // Check success states
      if (
        ['SENT_FOR_CAPTURE', 'AUTHORIZED', 'COMPLETED', 'SUCCESS'].includes(gwStatus) ||
        checkinResult.status === 'completed' ||
        checkinResult.status === 'success'
      ) {
        return {
          success: true,
          isPaid: true,
          status: 'COMPLETED',
          gatewayStatus: gwStatus,
          orderId,
          gid: targetGid,
          merchantTxnId,
          details: checkinResult,
        };
      }

      // Check failure / decline states
      if (
        ['FAILED', 'ISSUER_DECLINE', 'DECLINED'].includes(gwStatus) ||
        checkinResult.status === 'failed'
      ) {
        return {
          success: false,
          isPaid: false,
          status: 'FAILED',
          gatewayStatus: gwStatus,
          orderId,
          gid: targetGid,
          merchantTxnId,
          details: checkinResult,
        };
      }

      // Check cancellation state
      if (['CANCELLED', 'CANCELED', 'USER_DROPPED'].includes(gwStatus)) {
        return {
          success: false,
          isPaid: false,
          status: 'CANCELLED',
          gatewayStatus: gwStatus,
          orderId,
          gid: targetGid,
          merchantTxnId,
          details: checkinResult,
        };
      }

      // Inprogress / Pending
      if (['INPROGRESS', 'PENDING', 'INITIATED'].includes(gwStatus) || checkinResult.status === 'pending') {
        return {
          success: false,
          isPaid: false,
          status: 'PENDING',
          gatewayStatus: gwStatus,
          orderId,
          gid: targetGid,
          merchantTxnId,
          details: checkinResult,
        };
      }
    }

    // 2. Query Django Status endpoint as secondary check
    if (gid || merchantTxnId) {
      try {
        const statusRes = await this.checkPaymentStatus({ gid, merchantTxnId });
        if (statusRes && statusRes.status) {
          const s = String(statusRes.status).toUpperCase();
          if (['SENT_FOR_CAPTURE', 'AUTHORIZED', 'COMPLETED', 'SUCCESS'].includes(s)) {
            return {
              success: true,
              isPaid: true,
              status: 'COMPLETED',
              orderId,
              gid,
              merchantTxnId,
            };
          }
          if (['FAILED', 'ISSUER_DECLINE'].includes(s)) {
            return {
              success: false,
              isPaid: false,
              status: 'FAILED',
              orderId,
              gid,
              merchantTxnId,
            };
          }
        }
      } catch (err) {
        // Handled silently: endpoint may have settings.PAYGLOCAL_API_KEY issue on backend
      }
    }

    // Default to PENDING if not yet resolved
    return {
      success: false,
      isPaid: false,
      status: 'PENDING',
      orderId,
      gid: targetGid,
      merchantTxnId,
    };
  },
};

export default payglocalService;
