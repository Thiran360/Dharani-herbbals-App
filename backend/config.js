require('dotenv').config();

const PORT = process.env.PORT || 5000;
const PAYGLOCAL_ENV = process.env.PAYGLOCAL_ENV || 'sandbox'; // 'sandbox' | 'production' | 'mock_sandbox'

const SANDBOX_BASE_URL = 'https://api.uat.payglocal.in';
const PRODUCTION_BASE_URL = 'https://api.payglocal.in';

const PAYGLOCAL_BASE_URL = process.env.PAYGLOCAL_BASE_URL || 
  (PAYGLOCAL_ENV === 'production' ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL);

module.exports = {
  PORT,
  PAYGLOCAL_ENV,
  PAYGLOCAL_BASE_URL,
  SANDBOX_BASE_URL,
  PRODUCTION_BASE_URL,
  isProduction: PAYGLOCAL_ENV === 'production',
  isSandbox: PAYGLOCAL_ENV === 'sandbox',
  PAYGLOCAL_MERCHANT_ID: process.env.PAYGLOCAL_MERCHANT_ID || (PAYGLOCAL_ENV === 'production' ? '' : 'DHARANI_HERBBALS_SANDBOX_MID'),
  PAYGLOCAL_KEY_ID: process.env.PAYGLOCAL_KEY_ID || (PAYGLOCAL_ENV === 'production' ? '' : 'dharani_key_id_001'),
  PAYGLOCAL_PRIVATE_KEY_PATH: process.env.PAYGLOCAL_PRIVATE_KEY_PATH || '',
  PAYGLOCAL_PRIVATE_KEY_PEM: process.env.PAYGLOCAL_PRIVATE_KEY_PEM || '',
  PAYGLOCAL_PUBLIC_KEY_PATH: process.env.PAYGLOCAL_PUBLIC_KEY_PATH || '',
  PAYGLOCAL_PUBLIC_KEY_PEM: process.env.PAYGLOCAL_PUBLIC_KEY_PEM || '',
  PAYGLOCAL_CALLBACK_URL: process.env.PAYGLOCAL_CALLBACK_URL || `http://localhost:${PORT}/api/payglocal/callback`,
  APP_DEEP_LINK_SCHEME: process.env.APP_DEEP_LINK_SCHEME || 'dharani://payment-callback',
  UPSTREAM_CHECKOUT_API: process.env.UPSTREAM_CHECKOUT_API || 'https://api.codingboss.in/herbal/checkout/',
  
  // Dharani Herbbals Authentic Shipping Rules
  SHIPPING_RULES: {
    TAMIL_NADU: {
      rate: 50,
      freeThreshold: 750,
      minOrder: 110,
    },
    SOUTH_STATES: {
      states: ['kerala', 'karnataka', 'andhra pradesh'],
      rate: 150,
      freeThreshold: 1000,
      minOrder: 400,
    },
    REST_OF_INDIA: {
      rate: 200,
      freeThreshold: 1000,
      minOrder: 500,
    },
  },
};
