/**
 * Language Context for Dharani Herbbals (English & தமிழ்)
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../services/storage';

const TRANSLATIONS = {
  en: {
    home: 'Home',
    shop: 'Shop',
    categories: 'Categories',
    search: 'Search',
    cart: 'Cart',
    account: 'Account',
    wishlist: 'Wishlist',
    myOrders: 'My Orders',
    savedAddresses: 'Saved Addresses',
    aboutUs: 'About Us',
    contact: 'Contact',
    policies: 'Policies',
    allProducts: 'All Products',
    featuredTitle: 'Our Most Loved Picks',
    featuredSubtitle: 'Quintessential herbal remedies meticulously crafted for holistic nourishment.',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    quickView: 'Quick View',
    off: 'OFF',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    subtotal: 'Subtotal',
    deliveryFee: 'Delivery Fee',
    freeDelivery: 'FREE Delivery',
    total: 'Total',
    checkout: 'Checkout',
    continueShopping: 'Continue Shopping',
    emptyCart: 'Your cart is empty',
    emptyCartSubtitle: 'Explore our herbal formulations and bring home the power of nature.',
    login: 'Login',
    logout: 'Log Out',
    welcome: 'Welcome to Dharani Herbbals',
    loginSubtitle: 'Enter your 10-digit mobile number to access your account & orders',
    sendOtp: 'Send OTP',
    verifyOtp: 'Verify OTP',
    resendOtp: 'Resend OTP',
    orderHistory: 'Order History',
    trackOrder: 'Track Order',
    callNow: 'Call Us',
    whatsapp: 'WhatsApp',
    pureHerbalTag: '🌿 100% Natural & Herbal',
  },
  ta: {
    home: 'முகப்பு',
    shop: 'அங்காடி',
    categories: 'பிரிவுகள்',
    search: 'தேடல்',
    cart: 'கூடை',
    account: 'கணக்கு',
    wishlist: 'விருப்பப்பட்டியல்',
    myOrders: 'என் ஆர்டர்கள்',
    savedAddresses: 'சேமிக்கப்பட்ட முகவரிகள்',
    aboutUs: 'எங்களை பற்றி',
    contact: 'தொடர்புக்கு',
    policies: 'கொள்கைகள்',
    allProducts: 'அனைத்து தயாரிப்புகள்',
    featuredTitle: 'மிகவும் விரும்பப்பட்டவை',
    featuredSubtitle: 'தூய மூலிகைகளால் தயாரிக்கப்பட்ட பாரம்பரிய தயாரிப்புகள்.',
    addToCart: 'கூடையில் சேர்',
    buyNow: 'உடனே வாங்கு',
    quickView: 'பார்வை',
    off: 'தள்ளுபடி',
    inStock: 'இருப்பில் உள்ளது',
    outOfStock: 'தற்போது இல்லை',
    subtotal: 'கூட்டுத்தொகை',
    deliveryFee: 'டெலிவரி கட்டணம்',
    freeDelivery: 'இலவச டெலிவரி',
    total: 'மொத்தத் தொகை',
    checkout: 'செக்அவுட் செய்',
    continueShopping: 'தொடர்ந்து வாங்குக',
    emptyCart: 'கூடையில் பொருட்கள் இல்லை',
    emptyCartSubtitle: 'எங்கள் மூலிகை தயாரிப்புகளை உலாவுக மற்றும் இயற்கையின் நன்மைகளைப் பெறுங்கள்.',
    login: 'உள்நுழைக',
    logout: 'வெளியேறு',
    welcome: 'தரணி ஹெர்பல்ஸ்க்கு நல்வரவு',
    loginSubtitle: 'உங்கள் கணக்கை அணுக 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்',
    sendOtp: 'OTP அனுப்புக',
    verifyOtp: 'OTP சரிபார்க்கவும்',
    resendOtp: 'மீண்டும் OTP அனுப்புக',
    orderHistory: 'ஆர்டர் வரலாறு',
    trackOrder: 'ஆர்டரை கண்காணிக்கவும்',
    callNow: 'அழைக்க',
    whatsapp: 'வாட்ஸ்அப்',
    pureHerbalTag: '🌿 100% இயற்கை மூலிகை',
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    storage.getLanguage().then(lang => {
      if (lang) setLanguageState(lang);
    });
  }, []);

  const setLanguage = async lang => {
    setLanguageState(lang);
    await storage.setLanguage(lang);
  };

  const t = key => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isTamil: language === 'ta' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;
