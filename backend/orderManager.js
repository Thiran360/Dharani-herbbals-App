const fs = require('fs');
const path = require('path');
const config = require('./config');

const ORDERS_STORE_PATH = path.join(__dirname, 'orders_store.json');

// In-memory cache backed by file store
let orders = {};

// Load existing orders if any
try {
  if (fs.existsSync(ORDERS_STORE_PATH)) {
    const raw = fs.readFileSync(ORDERS_STORE_PATH, 'utf8');
    orders = JSON.parse(raw);
  }
} catch (e) {
  orders = {};
}

function persistOrders() {
  try {
    fs.writeFileSync(ORDERS_STORE_PATH, JSON.stringify(orders, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist orders:', err.message);
  }
}

/**
 * Calculate authoritative delivery charge based on state & subtotal
 */
function calculateDeliveryCharge(stateName, subtotal) {
  const normState = (stateName || '').trim().toLowerCase();

  if (normState === 'tamil nadu' || normState === 'tn') {
    const rule = config.SHIPPING_RULES.TAMIL_NADU;
    return subtotal >= rule.freeThreshold ? 0 : rule.rate;
  }

  const isSouthState = config.SHIPPING_RULES.SOUTH_STATES.states.some(s =>
    normState.includes(s)
  );
  if (isSouthState) {
    const rule = config.SHIPPING_RULES.SOUTH_STATES;
    return subtotal >= rule.freeThreshold ? 0 : rule.rate;
  }

  const rule = config.SHIPPING_RULES.REST_OF_INDIA;
  return subtotal >= rule.freeThreshold ? 0 : rule.rate;
}

/**
 * Calculate authoritative order pricing from cart items
 */
function calculateAuthoritativeAmount(items, stateName) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Order items list cannot be empty.');
  }

  let subtotal = 0;
  for (const item of items) {
    const qty = parseInt(item.quantity, 10) || 1;
    const price = parseFloat(item.price) || 0;
    if (price <= 0) {
      throw new Error(`Invalid price for product ID ${item.product_id || item.id}`);
    }
    subtotal += price * qty;
  }

  const deliveryCharge = calculateDeliveryCharge(stateName, subtotal);
  const totalAmount = Math.round((subtotal + deliveryCharge) * 100) / 100;

  return {
    subtotal,
    deliveryCharge,
    totalAmount,
  };
}

/**
 * Create or get order by merchantTxnId
 */
function createPendingOrder({
  merchantTxnId,
  userId,
  items,
  shippingAddress,
  customerName,
  phone,
  email,
  state,
  city,
  pincode,
}) {
  // Check if this merchantTxnId already exists (duplicate attempt)
  if (orders[merchantTxnId]) {
    const existing = orders[merchantTxnId];
    if (existing.status === 'COMPLETED') {
      throw new Error('This order has already been paid and completed.');
    }
    return existing;
  }

  const pricing = calculateAuthoritativeAmount(items, state);

  const orderRecord = {
    merchantTxnId,
    orderId: `DH-${Date.now().toString().slice(-6)}`,
    gid: null,
    status: 'PAYMENT_INITIATED', // INITIATED | INPROGRESS | COMPLETED | FAILED | CANCELLED
    userId: userId || 'guest',
    customerName,
    phone,
    email: email || '',
    items,
    shippingAddress,
    state,
    city,
    pincode,
    subtotal: pricing.subtotal,
    deliveryCharge: pricing.deliveryCharge,
    totalAmount: pricing.totalAmount,
    currency: 'INR',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payglocalResponse: null,
    upstreamSynced: false,
    upstreamOrderId: null,
  };

  orders[merchantTxnId] = orderRecord;
  persistOrders();
  return orderRecord;
}

/**
 * Update transaction with PayGlocal GID
 */
function setOrderGid(merchantTxnId, gid) {
  if (orders[merchantTxnId]) {
    orders[merchantTxnId].gid = gid;
    orders[merchantTxnId].updatedAt = new Date().toISOString();
    persistOrders();
  }
}

/**
 * Get order by merchantTxnId or GID
 */
function getOrder(identifier) {
  if (orders[identifier]) return orders[identifier];

  for (const txnId in orders) {
    if (orders[txnId].gid === identifier) {
      return orders[txnId];
    }
  }
  return null;
}

/**
 * Mark order as completed / failed after trusted server-side verification
 */
function updateOrderStatus(identifier, newStatus, details = {}) {
  const order = getOrder(identifier);
  if (!order) return null;

  // Protect against duplicate processing once already COMPLETED
  if (order.status === 'COMPLETED' && newStatus !== 'COMPLETED') {
    return order;
  }

  order.status = newStatus;
  order.updatedAt = new Date().toISOString();
  if (details.payglocalResponse) {
    order.payglocalResponse = details.payglocalResponse;
  }
  if (details.gid && !order.gid) {
    order.gid = details.gid;
  }

  persistOrders();
  return order;
}

/**
 * Synchronize completed order to upstream Dharani Herbbals backend API
 */
async function syncOrderToUpstream(order) {
  if (order.upstreamSynced) return { synced: true, upstreamOrderId: order.upstreamOrderId };

  try {
    const payload = {
      user_id: order.userId === 'guest' ? Date.now() : order.userId,
      address_id: 1,
      shipping_address: order.shippingAddress,
      city: order.city,
      state: order.state,
      pincode: order.pincode,
      phone: order.phone,
      customer_type: 'customer',
      category: 'customer',
      role: 'customer',
      total_amount: order.totalAmount,
      payment_method: 'payglocal',
      items: order.items.map(item => ({
        product_id: item.product_id || item.id,
        quantity: item.quantity,
        price: item.price,
        variation_id: item.variation_id || null,
      })),
    };

    const response = await fetch(config.UPSTREAM_CHECKOUT_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      order.upstreamSynced = true;
      order.upstreamOrderId = data?.order_id || data?.id || order.orderId;
      persistOrders();
      return { synced: true, upstreamOrderId: order.upstreamOrderId };
    }
  } catch (err) {
    console.warn('Upstream order sync warning (local order preserved):', err.message);
  }

  return { synced: false, orderId: order.orderId };
}

module.exports = {
  calculateDeliveryCharge,
  calculateAuthoritativeAmount,
  createPendingOrder,
  setOrderGid,
  getOrder,
  updateOrderStatus,
  syncOrderToUpstream,
  getAllOrders: () => Object.values(orders),
};
