/**
 * Dharani Herbbals Configuration & Business Constants
 * Primary source of truth: https://dharaniherbbals.in/
 */

export const API_CONFIG = {
  BASE_URL: 'https://api.codingboss.in/herbal',
  HEADERS: {
    'ngrok-skip-browser-warning': 'true',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  TIMEOUT_MS: 15000,
};

export const PAYGLOCAL_CONFIG = {
  // Official Dharani Herbbals Django PayGlocal Backend Endpoints: /herbal/payglocal/
  // Uses existing deployed backend (https://api.codingboss.in/herbal)
  // Zero merchant secrets, private keys, or credentials stored in mobile app
  BASE_URL: `${API_CONFIG.BASE_URL}/payglocal`,
  ENDPOINTS: {
    CREATE: '/create/',
    STATUS: '/status/',
    CHECKIN: '/checkin/',
    CALLBACK: '/callback/',
  },
  TIMEOUT_MS: 15000,
};



export const BUSINESS_INFO = {
  NAME: 'Dharani Herbbals',
  TAGLINE: '100% Natural Wellness & Herbal Care',
  TAGLINE_TA: '100% இயற்கை மூலிகை மற்றும் நலவாழ்வு',
  DESCRIPTION: 'Handcrafted herbal formulations inspired by generations of Siddha wisdom and refined through modern expertise.',
  HERITAGE_YEAR: 2004,
  FOUNDED_YEAR: 2007,
  PHONE_PRIMARY: '+91 97881 22001',
  PHONE_SECONDARY: '+91 99655 32001',
  WHATSAPP_NUMBER: '919788122001',
  EMAIL_PRIMARY: 'info@dharaniherbbals.in',
  EMAIL_SECONDARY: 'info@dharanimart.in',
  WEBSITE: 'https://dharaniherbbals.in/',
  INSTAGRAM: 'https://www.instagram.com/dharani_herbbals',
  FACEBOOK: 'https://www.facebook.com/profile.php?id=61574767123085',
  MAPS_URL: 'https://maps.google.com/maps?q=11.3580361,77.1650379',
  HOURS: 'Mon - Sat: 9:00 AM - 7:00 PM',
  
  ADDRESS: {
    STREET_1: '7/470-1, Chemparuthi Street,',
    STREET_2: 'West Nehru Nagar,',
    TOWN: 'Punjai Puliampatti,',
    TALUK: 'Sathyamangalam (TALUK),',
    DISTRICT: 'Erode',
    PINCODE: '638 459',
    STATE: 'Tamil Nadu',
    COUNTRY: 'India',
    FULL: '7/470-1, Chemparuthi Street, West Nehru Nagar, Punjai Puliampatti, Sathyamangalam (TALUK), Erode - 638 459, Tamil Nadu, India',
  },
};

/**
 * Authentic Shipping & Delivery Rules
 * Source: website shipping calculator & chatbot logic
 */
export const SHIPPING_RULES = {
  TAMIL_NADU: {
    code: 'TN',
    name: 'Tamil Nadu',
    rate: 50,
    freeThreshold: 750,
    minOrder: 110,
  },
  SOUTH_STATES: {
    states: ['Kerala', 'Karnataka', 'Andhra Pradesh'],
    rate: 150,
    freeThreshold: 1000,
    minOrder: 400,
  },
  REST_OF_INDIA: {
    rate: 200,
    freeThreshold: 1000,
    minOrder: 500,
  },
};

export const COMPANY_STATS = [
  { value: '6L+', label: 'Satisfied Customers', labelTa: 'திருப்தியடைந்த வாடிக்கையாளர்கள்' },
  { value: '350+', label: 'Herbal Formulations', labelTa: 'பாரம்பரிய மூலிகை தயாரிப்புகள்' },
  { value: '100%', label: 'Naturally Derived', labelTa: 'இயற்கை மூலிகைகள்' },
  { value: '15+', label: 'Years of Heritage', labelTa: 'ஆண்டுகள் பாரம்பரியம்' },
];

export const CORE_VALUES = [
  {
    title: 'Quality First',
    titleTa: 'உயர்ந்த தரம்',
    description: 'Maintaining consistent quality, authenticity, and care in every formulation.',
    icon: 'shield',
  },
  {
    title: 'Natural & Safe',
    titleTa: 'இயற்கை & பாதுகாப்பானது',
    description: 'Crafted with carefully selected natural ingredients, ensuring quality and purity.',
    icon: 'leaf',
  },
  {
    title: 'Rooted in Tradition',
    titleTa: 'பாரம்பரியம்',
    description: 'Generations of Siddha wisdom combined with contemporary herbal expertise.',
    icon: 'sparkles',
  },
  {
    title: 'Customer Focused',
    titleTa: 'வாடிக்கையாளர் திருப்தி',
    description: 'We listen to our customers and continuously improve our products based on feedback.',
    icon: 'heart',
  },
];

export default {
  API_CONFIG,
  PAYGLOCAL_CONFIG,
  BUSINESS_INFO,
  SHIPPING_RULES,
  COMPANY_STATS,
  CORE_VALUES,
};
