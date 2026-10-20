const config = require('./config');
const { generateJwsToken } = require('./payglocalCrypto');

/**
 * Initiate PayCollect payment session with PayGlocal
 */
async function initiatePayCollect({
  merchantTxnId,
  amount,
  currency = 'INR',
  callbackUrl,
  customer = {},
  shippingAddress = {},
}) {
  const formattedAmount = Number(amount).toFixed(2);
  const effectiveCallback = callbackUrl || config.PAYGLOCAL_CALLBACK_URL;

  // PayGlocal PayCollect Payload Format
  const payload = {
    merchantTxnId,
    paymentData: {
      totalAmount: formattedAmount,
      txnCurrency: currency,
    },
    merchantCallbackURL: effectiveCallback,
    clientData: {
      merchantCustomerId: customer.id ? String(customer.id) : `CUST-${Date.now()}`,
      email: customer.email || 'customer@dharaniherbbals.in',
      callingCode: '+91',
      phoneNumber: customer.phone ? customer.phone.replace(/[^0-9]/g, '').slice(-10) : '9788122001',
    },
    riskData: {
      orderType: 'PHYSICAL_GOODS',
      shippingAddress: {
        addressLine1: shippingAddress.addressLine1 || shippingAddress.street || 'Chemparuthi Street',
        city: shippingAddress.city || 'Erode',
        state: shippingAddress.state || 'Tamil Nadu',
        country: 'IND',
        postalCode: shippingAddress.postalCode || shippingAddress.pincode || '638459',
      },
    },
  };

  // Check if live merchant private key is available
  const hasPrivateKey = Boolean(
    (config.PAYGLOCAL_PRIVATE_KEY_PEM && config.PAYGLOCAL_PRIVATE_KEY_PEM.length > 20) ||
    (config.PAYGLOCAL_PRIVATE_KEY_PATH && config.PAYGLOCAL_PRIVATE_KEY_PATH.length > 0)
  );

  // If live or sandbox credentials with real key are configured, make network call
  if (config.PAYGLOCAL_ENV !== 'mock_sandbox' && hasPrivateKey) {
    try {
      const jwsToken = generateJwsToken(payload);
      const url = `${config.PAYGLOCAL_BASE_URL}/gl/v1/payments/initiate/paycollect`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gl-token-external': jwsToken,
          'x-gl-merchantid': config.PAYGLOCAL_MERCHANT_ID,
          'x-gl-merchant-id': config.PAYGLOCAL_MERCHANT_ID,
          'x-gl-kid': config.PAYGLOCAL_KEY_ID,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);
      if (response.ok && data) {
        return {
          success: true,
          gid: data.gid,
          redirectUrl: data.data?.redirectUrl || data.redirectUrl,
          status: data.status || 'CREATED',
          raw: data,
        };
      } else {
        const errMessage = (data && (data.message || data.error || data.detail)) || `HTTP ${response.status} from PayGlocal`;
        if (config.isProduction) {
          throw new Error(`PayGlocal production initiate failed: ${errMessage}`);
        }
        console.warn('PayGlocal initiate returned non-200 in sandbox, utilizing sandbox test harness:', errMessage);
      }
    } catch (netErr) {
      if (config.isProduction) {
        throw netErr;
      }
      console.warn('PayGlocal network error in sandbox mode, utilizing sandbox harness:', netErr.message);
    }
  } else if (config.isProduction) {
    throw new Error('PayGlocal production mode requires a valid RSA merchant private key.');
  }

  // Official Sandbox Test Harness: Hosted test payment page with full scenario simulation
  const mockGid = `gl-${merchantTxnId}-${Date.now().toString().slice(-4)}`;
  const sandboxCheckoutUrl = `http://localhost:${config.PORT}/api/payglocal/sandbox-checkout?gid=${encodeURIComponent(mockGid)}&txnId=${encodeURIComponent(merchantTxnId)}&amount=${encodeURIComponent(formattedAmount)}`;

  return {
    success: true,
    gid: mockGid,
    redirectUrl: sandboxCheckoutUrl,
    status: 'CREATED',
    isSandboxHarness: true,
  };
}


/**
 * Check payment status using PayGlocal's official status API:
 * GET /gl/v1/payments/{gid_or_merchantTxnId}/status
 */
async function checkStatus(identifier) {
  const hasPrivateKey = Boolean(
    (config.PAYGLOCAL_PRIVATE_KEY_PEM && config.PAYGLOCAL_PRIVATE_KEY_PEM.length > 20) ||
    (config.PAYGLOCAL_PRIVATE_KEY_PATH && config.PAYGLOCAL_PRIVATE_KEY_PATH.length > 0)
  );

  if (config.PAYGLOCAL_ENV !== 'mock_sandbox' && hasPrivateKey) {
    try {
      const jwsToken = generateJwsToken({ checkId: identifier });
      const url = `${config.PAYGLOCAL_BASE_URL}/gl/v1/payments/${encodeURIComponent(identifier)}/status`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-gl-token-external': jwsToken,
          'x-gl-merchantid': config.PAYGLOCAL_MERCHANT_ID,
          'x-gl-merchant-id': config.PAYGLOCAL_MERCHANT_ID,
          'x-gl-kid': config.PAYGLOCAL_KEY_ID,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          gid: data.gid || identifier,
          merchantTxnId: data.merchantTxnId,
          status: data.status, // SENT_FOR_CAPTURE | AUTHORIZED | INPROGRESS | ISSUER_DECLINE | FAILED
          raw: data,
        };
      }
    } catch (err) {
      console.warn('PayGlocal live status check error:', err.message);
    }
  }

  return null;
}

/**
 * Official Refund API:
 * POST /gl/v1/payments/{gid}/refund
 */
async function refundPayment({ gid, merchantRefundId, amount, currency = 'INR', reason }) {
  const payload = {
    merchantRefundId: merchantRefundId || `RF-${Date.now()}`,
    refundData: {
      totalAmount: Number(amount).toFixed(2),
      txnCurrency: currency,
    },
    refundReason: reason || 'Customer request',
  };

  const jwsToken = generateJwsToken(payload);
  const url = `${config.PAYGLOCAL_BASE_URL}/gl/v1/payments/${encodeURIComponent(gid)}/refund`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gl-token-external': jwsToken,
        'x-gl-merchantid': config.PAYGLOCAL_MERCHANT_ID,
        'x-gl-merchant-id': config.PAYGLOCAL_MERCHANT_ID,
        'x-gl-kid': config.PAYGLOCAL_KEY_ID,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return {
      success: response.ok,
      data,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
}

module.exports = {
  initiatePayCollect,
  checkStatus,
  refundPayment,
};
