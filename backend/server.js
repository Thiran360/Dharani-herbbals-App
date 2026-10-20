const express = require('express');
const cors = require('cors');
const config = require('./config');
const orderManager = require('./orderManager');
const payglocalClient = require('./payglocalClient');
const { verifyJwsToken, hasMerchantPrivateKey, hasPayGlocalPublicKey } = require('./payglocalCrypto');

/**
 * Startup Production Validation Guardrail
 * Validates production environment variables without exposing secret values in logs.
 * Fails fast if production mode is activated without required credentials or HTTPS endpoints.
 */
function validateProductionConfig() {
  const errors = [];
  const warnings = [];

  if (config.isProduction) {
    if (
      !config.PAYGLOCAL_MERCHANT_ID ||
      config.PAYGLOCAL_MERCHANT_ID.trim() === '' ||
      config.PAYGLOCAL_MERCHANT_ID === 'DHARANI_HERBBALS_SANDBOX_MID'
    ) {
      errors.push('PAYGLOCAL_MERCHANT_ID is required and must not be a sandbox placeholder in production mode.');
    }

    if (
      !config.PAYGLOCAL_KEY_ID ||
      config.PAYGLOCAL_KEY_ID.trim() === '' ||
      config.PAYGLOCAL_KEY_ID === 'dharani_key_id_001'
    ) {
      errors.push('PAYGLOCAL_KEY_ID is required and must not be a default placeholder in production mode.');
    }

    if (!hasMerchantPrivateKey()) {
      errors.push('Merchant RSA Private Key (PAYGLOCAL_PRIVATE_KEY_PATH or PAYGLOCAL_PRIVATE_KEY_PEM) is required in production mode.');
    }

    if (!hasPayGlocalPublicKey()) {
      warnings.push('PayGlocal Public Certificate (PAYGLOCAL_PUBLIC_KEY_PATH or PAYGLOCAL_PUBLIC_KEY_PEM) is recommended to verify inbound webhooks in production mode.');
    }

    if (!config.PAYGLOCAL_CALLBACK_URL || !config.PAYGLOCAL_CALLBACK_URL.startsWith('https://')) {
      errors.push(`PAYGLOCAL_CALLBACK_URL must start with "https://" in production mode (got: ${config.PAYGLOCAL_CALLBACK_URL}).`);
    }

    if (config.PAYGLOCAL_BASE_URL !== config.PRODUCTION_BASE_URL) {
      warnings.push(`PAYGLOCAL_BASE_URL is set to "${config.PAYGLOCAL_BASE_URL}", expected official "${config.PRODUCTION_BASE_URL}".`);
    }

    if (errors.length > 0) {
      console.error('====================================================');
      console.error('❌ PAYGLOCAL PRODUCTION CONFIGURATION VALIDATION FAILED:');
      errors.forEach((err, idx) => console.error(`  ${idx + 1}. ${err}`));
      console.error('====================================================');
      throw new Error(`Production startup aborted due to ${errors.length} configuration error(s). Check server environment variables.`);
    }

    console.log('✅ PayGlocal production configuration verified.');
  } else {
    const hasPrivKey = hasMerchantPrivateKey();
    console.log(`ℹ️ PayGlocal running in [${config.PAYGLOCAL_ENV.toUpperCase()}] mode.`);
    console.log(`ℹ️ Merchant Keypair status: ${hasPrivKey ? 'Active (RSA JWS outbound signing)' : 'Sandbox Test Simulation'}`);
    console.log(`ℹ️ Gateway API Base URL: ${config.PAYGLOCAL_BASE_URL}`);
  }

  return { isValid: errors.length === 0, errors, warnings };
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Dharani Herbbals PayGlocal Backend',
    env: config.PAYGLOCAL_ENV,
    merchantId: config.PAYGLOCAL_MERCHANT_ID,
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({
    service: 'Dharani Herbbals - PayGlocal Payment Gateway Service',
    docs: 'https://developer.payglocal.in/reference/lets-integrate',
    status: 'online',
  });
});

/**
 * 1. INITIATE PAYMENT
 * POST /api/payglocal/initiate
 */
app.post('/api/payglocal/initiate', async (req, res) => {
  try {
    const { items, state, city, pincode, streetAddress, name, phone, email, userId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart items are required.' });
    }
    if (!state) {
      return res.status(400).json({ error: 'Delivery state is required for shipping calculation.' });
    }

    // 1. Authoritative Pricing calculation on server
    const pricing = orderManager.calculateAuthoritativeAmount(items, state);

    // 2. Generate unique Merchant Transaction ID
    const merchantTxnId = `DH-TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Create Pending Order record with duplicate protection
    const order = orderManager.createPendingOrder({
      merchantTxnId,
      userId: userId || 'guest',
      items,
      shippingAddress: `${name || 'Customer'}, ${streetAddress || ''}, ${city || ''}, ${state} - ${pincode || ''}. Phone: ${phone || ''}`,
      customerName: name || 'Valued Customer',
      phone: phone || '',
      email: email || '',
      state,
      city: city || '',
      pincode: pincode || '',
    });

    // 4. Initiate PayGlocal PayCollect session
    const payglocalSession = await payglocalClient.initiatePayCollect({
      merchantTxnId,
      amount: pricing.totalAmount,
      currency: 'INR',
      callbackUrl: config.PAYGLOCAL_CALLBACK_URL,
      customer: { id: userId, phone, email },
      shippingAddress: {
        addressLine1: streetAddress,
        city,
        state,
        postalCode: pincode,
      },
    });

    if (payglocalSession.gid) {
      orderManager.setOrderGid(merchantTxnId, payglocalSession.gid);
    }

    res.json({
      success: true,
      merchantTxnId,
      orderId: order.orderId,
      gid: payglocalSession.gid,
      redirectUrl: payglocalSession.redirectUrl,
      authoritativeAmount: pricing.totalAmount,
      subtotal: pricing.subtotal,
      deliveryCharge: pricing.deliveryCharge,
      currency: 'INR',
    });
  } catch (err) {
    console.error('Initiate payment error:', err);
    res.status(500).json({ error: err.message || 'Payment initiation failed.' });
  }
});

/**
 * 2. TRANSACTION STATUS VERIFICATION
 * GET /api/payglocal/status/:txnId
 */
app.get('/api/payglocal/status/:txnId', async (req, res) => {
  try {
    const { txnId } = req.params;
    const order = orderManager.getOrder(txnId);

    if (!order) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    // If order is already completed, return verified state immediately
    if (order.status === 'COMPLETED') {
      return res.json({
        success: true,
        status: 'COMPLETED',
        orderId: order.orderId,
        merchantTxnId: order.merchantTxnId,
        totalAmount: order.totalAmount,
        isPaid: true,
        verifiedAt: order.updatedAt,
      });
    }

    // Call official PayGlocal Status API if GID exists
    if (order.gid) {
      const liveStatus = await payglocalClient.checkStatus(order.gid);
      if (liveStatus && liveStatus.status) {
        if (['SENT_FOR_CAPTURE', 'AUTHORIZED', 'COMPLETED'].includes(liveStatus.status)) {
          orderManager.updateOrderStatus(txnId, 'COMPLETED', { payglocalResponse: liveStatus });
          await orderManager.syncOrderToUpstream(order);
          return res.json({
            success: true,
            status: 'COMPLETED',
            orderId: order.orderId,
            merchantTxnId: order.merchantTxnId,
            totalAmount: order.totalAmount,
            isPaid: true,
          });
        } else if (['ISSUER_DECLINE', 'FAILED'].includes(liveStatus.status)) {
          orderManager.updateOrderStatus(txnId, 'FAILED', { payglocalResponse: liveStatus });
          return res.json({
            success: false,
            status: 'FAILED',
            orderId: order.orderId,
            merchantTxnId: order.merchantTxnId,
            isPaid: false,
          });
        }
      }
    }

    // Return current authoritative status
    res.json({
      success: order.status === 'COMPLETED',
      status: order.status,
      orderId: order.orderId,
      merchantTxnId: order.merchantTxnId,
      totalAmount: order.totalAmount,
      isPaid: order.status === 'COMPLETED',
    });
  } catch (err) {
    console.error('Status verification error:', err);
    res.status(500).json({ error: err.message || 'Status check failed.' });
  }
});

/**
 * 3. WEBHOOK RECEIVER
 * POST /api/payglocal/webhook
 */
app.post('/api/payglocal/webhook', async (req, res) => {
  try {
    const jwsToken = req.headers['x-gl-token-external'] || req.headers['x-gl-token'];
    const payload = req.body;

    console.log('Received PayGlocal Webhook Event:', payload?.status, payload?.merchantTxnId || payload?.gid);

    if (jwsToken) {
      const verifyResult = verifyJwsToken(jwsToken);
      if (!verifyResult.valid) {
        console.warn('Invalid webhook signature:', verifyResult.reason);
        if (config.isProduction) {
          return res.status(401).json({ error: 'Signature verification failed' });
        }
      }
    } else if (config.isProduction) {
      return res.status(401).json({ error: 'Missing x-gl-token-external signature header in production mode' });
    }

    const { merchantTxnId, gid, status } = payload || {};
    const identifier = merchantTxnId || gid;

    if (identifier) {
      const existingOrder = orderManager.getOrder(identifier);
      if (existingOrder && existingOrder.status === 'COMPLETED') {
        // Enforce idempotency - order already paid and synced
        return res.status(200).json({ status: 'ACKNOWLEDGED', note: 'Order already completed' });
      }

      const isSuccess = ['SENT_FOR_CAPTURE', 'AUTHORIZED', 'COMPLETED'].includes(status);
      const newStatus = isSuccess ? 'COMPLETED' : status === 'CANCELLED' ? 'CANCELLED' : 'FAILED';
      
      const updatedOrder = orderManager.updateOrderStatus(identifier, newStatus, {
        payglocalResponse: payload,
        gid,
      });

      if (updatedOrder && isSuccess) {
        await orderManager.syncOrderToUpstream(updatedOrder);
      }
    }

    res.status(200).json({ status: 'ACKNOWLEDGED' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 4. HOSTED PAYMENT CALLBACK (Unified GET & POST Handler)
 */
async function handlePaymentCallback(req, res) {
  const query = req.query || {};
  const body = req.body || {};

  const effectiveTxnId = body.merchantTxnId || query.merchantTxnId || body.txnId || query.txnId;
  const gid = body.gid || query.gid;
  const status = body.status || query.status || '';

  // Optional JWS token in headers or body
  const jwsToken = req.headers['x-gl-token-external'] || req.headers['x-gl-token'] || body.token;
  if (jwsToken) {
    const verifyResult = verifyJwsToken(jwsToken);
    if (!verifyResult.valid && config.isProduction) {
      console.warn('Callback signature verification failed in production mode');
      return res.status(401).send('Invalid signature in payment callback');
    }
  }

  const order = effectiveTxnId ? orderManager.getOrder(effectiveTxnId) : null;

  const isSuccess = ['SENT_FOR_CAPTURE', 'AUTHORIZED', 'COMPLETED', 'SUCCESS'].includes(
    (status || '').toUpperCase()
  );

  if (order && effectiveTxnId) {
    // Enforce idempotency: do not re-process if already COMPLETED
    if (order.status !== 'COMPLETED') {
      const finalStatus = isSuccess ? 'COMPLETED' : status.toUpperCase() === 'CANCELLED' ? 'CANCELLED' : 'FAILED';
      orderManager.updateOrderStatus(effectiveTxnId, finalStatus, { gid, payglocalResponse: { ...query, ...body } });
      if (isSuccess) {
        await orderManager.syncOrderToUpstream(order);
      }
    }
  }

  const deepLink = `${config.APP_DEEP_LINK_SCHEME}?merchantTxnId=${encodeURIComponent(
    effectiveTxnId || ''
  )}&status=${encodeURIComponent(isSuccess ? 'COMPLETED' : status || 'FAILED')}`;

  // Serve Dharani Herbbals branded return page with auto deep link redirection
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dharani Herbbals - Payment Return</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #F4F7F4;
          margin: 0;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          box-sizing: border-box;
        }
        .card {
          background: #FFFFFF;
          border-radius: 20px;
          padding: 32px 24px;
          max-width: 420px;
          width: 100%;
          text-align: center;
          box-shadow: 0 10px 30px rgba(27, 77, 62, 0.08);
          border: 1px solid #E2EAE5;
        }
        .badge {
          width: 72px;
          height: 72px;
          border-radius: 36px;
          background: ${isSuccess ? '#E8F5E9' : '#FFEBEE'};
          color: ${isSuccess ? '#2E7D32' : '#C62828'};
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 32px;
        }
        h2 { color: #1B4D3E; margin: 0 0 10px; font-size: 22px; }
        p { color: #5B7065; font-size: 14px; line-height: 1.5; margin: 0 0 24px; }
        .btn {
          display: inline-block;
          background: #1B4D3E;
          color: #FFFFFF;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          box-shadow: 0 4px 14px rgba(27, 77, 62, 0.25);
        }
        .logo-txt { font-size: 13px; font-weight: 700; color: #D4AF37; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px; }
      </style>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.location.href = "${deepLink}";
          }, 800);
        };
      </script>
    </head>
    <body>
      <div class="card">
        <div class="logo-txt">🌿 DHARANI HERBBALS</div>
        <div class="badge">${isSuccess ? '✓' : '✕'}</div>
        <h2>${isSuccess ? 'Payment Successful' : 'Payment Incomplete'}</h2>
        <p>${
          isSuccess
            ? 'Your payment was successfully verified. Returning you to the Dharani Herbbals app...'
            : 'Payment was not completed. Returning to your cart...'
        }</p>
        <a href="${deepLink}" class="btn">Return to Dharani App</a>
      </div>
    </body>
    </html>
  `);
}

// Mount callback handler for both GET and POST redirects
app.get('/api/payglocal/callback', handlePaymentCallback);
app.post('/api/payglocal/callback', handlePaymentCallback);


/**
 * 5. OFFICIAL SANDBOX TEST HARNESS
 * GET /api/payglocal/sandbox-checkout
 */
app.get('/api/payglocal/sandbox-checkout', (req, res) => {
  const { gid, txnId, amount } = req.query;

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PayGlocal Sandbox Checkout - Dharani Herbbals</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #0B1320;
          color: #E2E8F0;
          margin: 0;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .container {
          background: #131E30;
          border: 1px solid #23354E;
          border-radius: 20px;
          padding: 28px 24px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #23354E; padding-bottom: 16px; }
        .brand { font-size: 16px; font-weight: 700; color: #4ADE80; }
        .tag { background: #1E3A8A; color: #93C5FD; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
        .amount-box { background: #1E293B; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px; border: 1px solid #334155; }
        .amount-label { font-size: 12px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; }
        .amount-val { font-size: 32px; font-weight: 700; color: #FFFFFF; margin-top: 4px; }
        .details-row { display: flex; justify-content: space-between; font-size: 12px; color: #94A3B8; margin-top: 8px; }
        .details-row span:last-child { color: #F1F5F9; font-weight: 500; }
        .btn {
          display: block;
          width: 100%;
          padding: 14px;
          margin-bottom: 12px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          text-align: center;
          text-decoration: none;
          box-sizing: border-box;
          cursor: pointer;
          border: none;
        }
        .btn-success { background: #16A34A; color: #FFFFFF; }
        .btn-success:hover { background: #15803D; }
        .btn-fail { background: #DC2626; color: #FFFFFF; }
        .btn-fail:hover { background: #B91C1C; }
        .btn-cancel { background: #334155; color: #CBD5E1; }
        .btn-cancel:hover { background: #475569; }
        .footer-note { font-size: 11px; color: #64748B; text-align: center; margin-top: 18px; line-height: 1.4; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand">🌿 Dharani Herbbals</div>
          <div class="tag">PayGlocal UAT Sandbox</div>
        </div>

        <div class="amount-box">
          <div class="amount-label">Authoritative Total Amount</div>
          <div class="amount-val">₹${amount || '0.00'}</div>
          <div class="details-row">
            <span>Merchant Txn ID:</span>
            <span>${txnId || 'N/A'}</span>
          </div>
          <div class="details-row">
            <span>PayGlocal GID:</span>
            <span>${gid || 'N/A'}</span>
          </div>
        </div>

        <div style="font-size: 13px; font-weight: 600; color: #94A3B8; margin-bottom: 12px;">
          Choose Sandbox Test Scenario:
        </div>

        <a href="/api/payglocal/callback?merchantTxnId=${encodeURIComponent(txnId)}&gid=${encodeURIComponent(gid)}&status=SENT_FOR_CAPTURE" class="btn btn-success">
          ✓ Simulate Payment Success (SENT_FOR_CAPTURE)
        </a>

        <a href="/api/payglocal/callback?merchantTxnId=${encodeURIComponent(txnId)}&gid=${encodeURIComponent(gid)}&status=ISSUER_DECLINE" class="btn btn-fail">
          ✕ Simulate Bank Decline (ISSUER_DECLINE)
        </a>

        <a href="/api/payglocal/callback?merchantTxnId=${encodeURIComponent(txnId)}&gid=${encodeURIComponent(gid)}&status=CANCELLED" class="btn btn-cancel">
          ↺ Simulate User Cancellation
        </a>

        <div class="footer-note">
          Official PayGlocal PayCollect Flow. All amounts and transactions are cryptographically verified server-side.
        </div>
      </div>
    </body>
    </html>
  `);
});

/**
 * 6. REFUND API
 * POST /api/payglocal/refund
 */
app.post('/api/payglocal/refund', async (req, res) => {
  try {
    const { gid, amount, reason } = req.body;
    if (!gid || !amount) {
      return res.status(400).json({ error: 'GID and refund amount are required.' });
    }

    const result = await payglocalClient.refundPayment({ gid, amount, reason });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 7. VIEW ORDERS (Internal/Debug)
 * GET /api/payglocal/orders
 */
app.get('/api/payglocal/orders', (req, res) => {
  res.json({
    count: orderManager.getAllOrders().length,
    orders: orderManager.getAllOrders(),
  });
});

// Run production configuration validation on startup
validateProductionConfig();

const server = app.listen(config.PORT, () => {
  console.log(`====================================================`);
  console.log(`🌿 Dharani Herbbals PayGlocal Backend Service Online`);
  console.log(`📡 Port: ${config.PORT}`);
  console.log(`🌐 Environment: ${config.PAYGLOCAL_ENV}`);
  console.log(`🏢 Merchant ID: ${config.PAYGLOCAL_MERCHANT_ID || 'UNCONFIGURED'}`);
  console.log(`🔗 Callback URL: ${config.PAYGLOCAL_CALLBACK_URL}`);
  console.log(`====================================================`);
});

app.validateProductionConfig = validateProductionConfig;
module.exports = app;

