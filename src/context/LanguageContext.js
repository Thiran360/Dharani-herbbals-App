/**
 * Language Context for Dharani Herbbals (English & தமிழ்)
 * Strict Language Switching with 100% matched bilingual dictionaries
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../services/storage';
import {
  getLocalizedProductName,
  getLocalizedProductDescription,
  getLocalizedCategoryName,
} from '../utils/localization';

export const TRANSLATIONS = {
  en: {
    // Navigation & Tabs
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
    contact: 'Contact Specialist',
    policies: 'Policies',
    allProducts: 'All Products',

    // Common Actions & Controls
    back: 'Back',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    continue: 'Continue',
    confirm: 'Confirm',
    ok: 'OK',
    edit: 'Edit',
    delete: 'Delete',
    apply: 'Apply',
    remove: 'Remove',
    loading: 'Loading...',
    required: 'Required Field',

    // Home Screen Sections
    announcementDelivery: 'FREE DELIVERY ON ORDERS ABOVE 750 ACROSS TAMIL NADU',
    searchPlaceholder: 'Search natural herbal oils, powders & teas...',
    topCategories: 'Explore Categories',
    mostLovedPicks: 'Our Most Loved Picks',
    mostLovedSubtitle: 'Time-tested herbal remedies with proven results',
    topRatedBadge: 'TOP RATED PICKS',
    seeAll: 'See All ›',
    viewAll: 'View All ›',
    heritageSince2004: 'HERITAGE SINCE 2004',
    rootedInHeritage: 'Rooted in Siddha Heritage',
    storyLocation: 'Punjai Puliampatti, TN',
    storyDesc: 'Our journey began in 2004 with deep research into timeless Siddha and Ayurvedic botanical wisdom, formally establishing Dharani Herbbals in 2007 to deliver chemical-free natural living to every home.',
    readHeritageStory: 'Read Our Heritage Story ›',
    featuredFormulations: 'Featured Formulations',
    featuredSubtitle: '100% Naturally Derived Ayurvedic Care',
    whyDharaniPill: 'WHY DHARANI HERBBALS',
    whyDharaniTitle: 'Crafted with Purity & Care',
    whyDharaniSubtitle: "Authentic Siddha standards for your family's health",
    twoDecades: 'Two Decades of Trusted Healing',
    needHelp: 'Need Help Choosing Herbs?',
    needHelpSubtitle: 'Our herbal wellness specialists are ready to guide you with personalized recommendations.',
    callSpecialist: 'Call Specialist',
    whatsapp: 'WhatsApp',
    pureHerbalTag: '🌿 100% Natural & Herbal',
    footerHeritageTag: 'Traditional Siddha Wisdom Since 2004',
    allRightsReserved: 'All rights reserved.',

    // Product Card & Details
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    quickView: 'Quick View',
    off: 'OFF',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    quantity: 'Quantity',
    description: 'Description',
    keyHighlights: 'Key Highlights',
    howToUse: 'How to Use',
    ingredients: 'Herbal Ingredients',
    reviews: 'Customer Reviews',
    verifiedCustomer: 'Verified Customer',
    addedToCartToast: 'Added to Cart successfully!',
    shareProduct: 'Share',

    // Cart & Checkout
    shoppingBag: 'Shopping Cart',
    emptyCart: 'Your cart is empty',
    emptyCartSubtitle: 'Explore our herbal formulations and bring home the power of nature.',
    priceDetails: 'Price Details',
    subtotal: 'Subtotal',
    deliveryFee: 'Delivery Fee',
    freeDelivery: 'FREE Delivery',
    total: 'Total Amount',
    grandTotal: 'Grand Total',
    proceedToCheckout: 'Proceed to Checkout ›',
    continueShopping: 'Continue Shopping',
    deliveryAddress: 'Delivery Address',
    addNewAddress: 'Add New Address',
    fullName: 'Full Name',
    mobileNumber: 'Mobile Number',
    emailAddress: 'Email Address',
    streetAddress: 'Flat / House No. / Street Address',
    city: 'City / Town',
    state: 'State',
    pincode: 'Pincode',
    paymentMethod: 'Payment Method',
    placeOrder: 'Place Order',
    payWithPayGlocal: 'Pay Securely with PayGlocal',
    cashOnDelivery: 'Cash on Delivery (COD)',
    orderPlacedSuccess: 'Order Placed Successfully!',
    orderSummary: 'Order Summary',
    trackOrder: 'Track Order',
    paymentPending: 'Payment Pending',
    paymentFailed: 'Payment Failed',
    paymentCancelled: 'Payment Cancelled',
    minOrderRequired: 'Minimum Order Required',
    orderHistory: 'Order History',
    noOrdersYet: 'No orders placed yet',
    customerInfo: 'Customer Information',
    deliveryState: 'Delivery State',
    shippingTo: 'Shipping to',
    taxesAndPackaging: 'Taxes & Quality Packaging',
    included: 'Included',
    totalPayable: 'Total Payable',
    inclusiveTaxes: 'Inclusive of all charges',
    confirmAndPlaceOrder: 'Confirm & Place Order ›',
    formulations: 'Formulation(s)',

    // Authentication & OTP
    login: 'Login',
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to log out?',
    signInOrRegister: 'Login',
    loginSubtitle: 'Enter your 10-digit mobile number to receive a secure one-time verification code (OTP).',
    loginRequiredPrompt: 'Please login with your mobile number to purchase and place your order.',
    sendOtp: 'Send Verification OTP ›',
    enterOtp: 'Enter Verification Code',
    otpSentTo: 'We sent a verification code to',
    verifyAndProceed: 'Verify & Proceed ›',
    resendOtp: 'Resend Code via SMS',
    resendIn: 'Resend code in',
    invalidMobile: 'Please enter a valid 10-digit mobile number.',
    invalidOtp: 'Please enter a valid 6-digit OTP code.',
    otpFailed: 'Invalid OTP. Please check the code sent to your phone.',
    loginSuccess: 'Login Successful!',
    welcomeBack: 'Welcome to Dharani Herbals!',
    loginSuccessDesc: 'You are now logged in to your account.',
    continueBtn: 'Continue →',
    networkError: 'Network connection issue. Please check your internet connection.',
    dialerUnavailable: 'Unable to open phone dialer. Please call directly: ',
    whatsappUnavailable: 'WhatsApp could not be opened on this device.',

    // Wishlist & Saved Addresses
    myWishlist: 'My Wishlist',
    emptyWishlistTitle: 'Your Wishlist is Empty',
    emptyWishlistSub: 'Save your favorite herbal shampoos, soaps, and health mixes here for easy access.',
    exploreCatalogue: 'Explore Catalogue',
    addAddress: 'Add New Address',
    noSavedAddresses: 'No saved addresses yet',
    saveAddress: 'Save Address',
    defaultAddress: 'Default Address',

    // Contact & Support Screen
    getInTouch: 'Get In Touch',
    contactSubtitle: 'Have questions about our Siddha formulations, order status, or wellness guidance? Our dispensary team is here to assist.',
    phoneSupport: 'Phone Support',
    whatsappSupport: 'Instant WhatsApp Chat',
    whatsappFastResponse: 'Fast responses for order queries & product advice',
    chatOnWhatsApp: 'Chat on WhatsApp ›',
    emailSupport: 'Email Support',
    storeHours: 'Store & Office Hours',
    sundayHoliday: 'Sunday: Weekly Holiday',
    storeAddress: 'Registered Head Office & Store',
    openGoogleMaps: 'Open in Google Maps ›',
    sendMessage: 'Send Us a Message',
    sendMessageSub: 'Drop our herbal wellness consultants a message. We usually respond within 24 hours.',
    submitMessage: 'Submit Message ›',
    enquirySent: 'Thank you! Your enquiry has been received. Our wellness team will contact you shortly.',

    // About Us Screen
    aboutDharani: 'About Dharani Herbbals',
    timeHonoredHeritage: 'TIME-HONORED SIDDHA HERITAGE',
    rootedInNature: 'Rooted in Nature,\nCrafted with Wisdom',
    aboutBannerSub: 'Your trusted sanctuary for authentic botanical wellness and traditional herbal health formulations from Tamil Nadu.',
    ourMission: 'Our Sacred Mission',
    ourMissionDesc: 'To make traditional Siddha and Ayurvedic botanical wisdom accessible to every home through pure, ethical, and meticulously crafted wellness remedies.',
    ourHeritage: 'Our Living Heritage',
    ourHeritageDesc: 'Beginning in 2004 with deep research into ancient Siddha manuscripts, Dharani Herbbals was formally established in 2007 at Punjai Puliampatti near Sathyamangalam, Tamil Nadu.',
    journeyInNumbers: 'Our Journey in Numbers',
    guidingValues: 'Our Guiding Values',
    guidingValuesSub: 'These enduring principles guide every herbal harvest and formulation.',
    dharaniDifference: 'The Dharani Difference',
    dharaniDifferenceSub: 'Our unwavering dedication to purity and authenticity.',
    experiencePureCare: 'Experience Pure Natural Care',
    experiencePureCareSub: 'Join thousands of satisfied patrons embracing authentic Dharani Herbbals in their daily wellness routine.',
    exploreCollections: 'Explore Collections ›',
    contactTeam: 'Contact Team',

    // Order Tracking
    trackYourOrder: 'Track Your Order',
    trackingOrder: 'Tracking Order',
    orderPlacedStep: 'Order Placed & Confirmed',
    orderPackedStep: 'Packed & Quality Verified',
    orderDispatchedStep: 'Dispatched with Courier',
    outForDeliveryStep: 'Out for Delivery',
    deliveredSafelyStep: 'Delivered Safely',
  },

  ta: {
    // Navigation & Tabs
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
    contact: 'நிபுணரைத் தொடர்பு கொள்க',
    policies: 'கொள்கைகள்',
    allProducts: 'அனைத்து தயாரிப்புகள்',

    // Common Actions & Controls
    back: 'பின்செல்',
    close: 'மூடுக',
    save: 'சேமி',
    cancel: 'ரத்து',
    continue: 'தொடர்க',
    confirm: 'உறுதி செய்',
    ok: 'சரி',
    edit: 'திருத்து',
    delete: 'நீக்கு',
    apply: 'பயன்படுத்து',
    remove: 'அகற்று',
    loading: 'ஏற்றப்படுகிறது...',
    required: 'தேவையான விவரம்',

    // Home Screen Sections
    announcementDelivery: 'தமிழ்நாட்டிற்குள் ₹750க்கு மேல் இலவச டெலிவரி!',
    searchPlaceholder: 'இயற்கை மூலிகை தைலம், பொடி, தேநீர் தேடுக...',
    topCategories: 'முக்கிய பிரிவுகள்',
    mostLovedPicks: 'வாடிக்கையாளர்களின் விருப்பங்கள்',
    mostLovedSubtitle: 'அதிகம் விரும்பப்படும் இயற்கை தயாரிப்புகள்',
    topRatedBadge: 'சிறந்த தேர்வுகள்',
    seeAll: 'அனைத்தும் ›',
    viewAll: 'அனைத்தும் ›',
    heritageSince2004: '2004 முதல் பாரம்பரியம்',
    rootedInHeritage: 'சித்த மருத்துவ பாரம்பரியம்',
    storyLocation: 'புஞ்சை புளியம்பட்டி, தமிழ்நாடு',
    storyDesc: '2004-ல் சித்த மற்றும் ஆயுர்வேத மருத்துவ ஆராய்ச்சியுடன் தொடங்கி, 2007-ல் ரசாயனமற்ற தூய இயற்கை வாழ்வை ஒவ்வொரு இல்லத்திற்கும் கொண்டு சேர்க்க தரணி ஹெர்பல்ஸ் நிறுவப்பட்டது.',
    readHeritageStory: 'எங்கள் பாரம்பரிய வரலாறு வாசிக்க ›',
    featuredFormulations: 'சிறப்பு தயாரிப்புகள்',
    featuredSubtitle: '100% தூய இயற்கை ஊட்டச்சத்து',
    whyDharaniPill: 'ஏன் தரணி ஹெர்பல்ஸ்?',
    whyDharaniTitle: 'தூய்மை மற்றும் அக்கறையுடன் தயாரிக்கப்பட்டது',
    whyDharaniSubtitle: 'உங்கள் குடும்ப ஆரோக்கியத்திற்கான உண்மையான சித்த மருத்துவ தரம்',
    twoDecades: 'இரு தசாப்தங்களாக நம்பகமான ஆரோக்கியம்',
    needHelp: 'மூலிகைகள் தேர்ந்தெடுக்க உதவி தேவையா?',
    needHelpSubtitle: 'எங்கள் மூலிகை நலவாழ்வு நிபுணர்கள் உங்களுக்கு உதவ தயாராக உள்ளனர்.',
    callSpecialist: 'அழைக்க',
    whatsapp: 'வாட்ஸ்அப்',
    pureHerbalTag: '🌿 100% இயற்கை மூலிகை',
    footerHeritageTag: '2004 முதல் பாரம்பரிய சித்த மருத்துவம்',
    allRightsReserved: 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',

    // Product Card & Details
    addToCart: 'கூடையில் சேர்',
    buyNow: 'உடனே வாங்கு',
    quickView: 'பார்வை',
    off: 'தள்ளுபடி',
    inStock: 'இருப்பில் உள்ளது',
    outOfStock: 'தற்போது இல்லை',
    quantity: 'அளவு',
    description: 'விவரம்',
    keyHighlights: 'முக்கிய நன்மைகள்',
    howToUse: 'பயன்படுத்தும் முறை',
    ingredients: 'இயற்கை மூலிகைகள்',
    reviews: 'வாடிக்கையாளர் மதிப்புரைகள்',
    verifiedCustomer: 'உறுதிப்படுத்தப்பட்ட வாடிக்கையாளர்',
    addedToCartToast: 'கூடையில் வெற்றிகரமாக சேர்க்கப்பட்டது!',
    shareProduct: 'பகிர்க',

    // Cart & Checkout
    shoppingBag: 'ஷாப்பிங் கூடை',
    emptyCart: 'கூடையில் பொருட்கள் இல்லை',
    emptyCartSubtitle: 'எங்கள் மூலிகை தயாரிப்புகளை உலாவுக மற்றும் இயற்கையின் நன்மைகளைப் பெறுங்கள்.',
    priceDetails: 'விலை விவரங்கள்',
    subtotal: 'கூட்டுத்தொகை',
    deliveryFee: 'டெலிவரி கட்டணம்',
    freeDelivery: 'இலவச டெலிவரி',
    total: 'மொத்தத் தொகை',
    grandTotal: 'செலுத்த வேண்டிய தொகை',
    proceedToCheckout: 'செக்அவுட் தொடரவும் ›',
    continueShopping: 'தொடர்ந்து வாங்குக',
    deliveryAddress: 'டெலிவரி முகவரி',
    addNewAddress: 'புதிய முகவரி சேர்க்க',
    fullName: 'முழு பெயர்',
    mobileNumber: 'மொபைல் எண்',
    emailAddress: 'மின்னஞ்சல் முகவரி',
    streetAddress: 'வீட்டு எண் / தெரு முகவரி',
    city: 'நகரம் / ஊர்',
    state: 'மாநிலம்',
    pincode: 'அஞ்சல் குறியீடு',
    paymentMethod: 'பணம் செலுத்தும் முறை',
    placeOrder: 'ஆர்டர் செய்க',
    payWithPayGlocal: 'PayGlocal மூலம் பாதுகாப்பாக செலுத்தவும்',
    cashOnDelivery: 'பொருளைப் பெற்றதும் பணம் செலுத்துதல் (COD)',
    orderPlacedSuccess: 'ஆர்டர் வெற்றிகரமாக பதிவு செய்யப்பட்டது!',
    orderSummary: 'ஆர்டர் விவரங்கள்',
    trackOrder: 'ஆர்டரை கண்காணிக்கவும்',
    paymentPending: 'பணம் செலுத்துதல் நிலுவையில் உள்ளது',
    paymentFailed: 'பணம் செலுத்துதல் தோல்வியடைந்தது',
    paymentCancelled: 'பணம் செலுத்துதல் ரத்து செய்யப்பட்டது',
    minOrderRequired: 'குறைந்தபட்ச ஆர்டர் தேவை',
    orderHistory: 'ஆர்டர் வரலாறு',
    noOrdersYet: 'ஆர்டர்கள் எதுவும் இல்லை',
    customerInfo: 'வாடிக்கையாளர் விவரங்கள்',
    deliveryState: 'டெலிவரி மாநிலம்',
    shippingTo: 'டெலிவரி முகவரி',
    taxesAndPackaging: 'வரி & தரமான பேக்கிங்',
    included: 'சேர்க்கப்பட்டுள்ளது',
    totalPayable: 'செலுத்த வேண்டிய தொகை',
    inclusiveTaxes: 'அனைத்து கட்டணங்களும் அடங்கும்',
    confirmAndPlaceOrder: 'உறுதி செய்து ஆர்டர் செய்க ›',
    formulations: 'பொருட்கள்',

    // Authentication & OTP
    login: 'உள்நுழைக',
    logout: 'வெளியேறு',
    logoutConfirm: 'நிச்சயமாக வெளியேற விரும்புகிறீர்களா?',
    signInOrRegister: 'உள்நுழைக',
    loginSubtitle: 'உங்கள் கணக்கு மற்றும் ஆர்டர்களை அணுக 10 இலக்க மொபைல் எண்ணை உள்ளிட்டு OTP பெறவும்.',
    loginRequiredPrompt: 'பொருட்களை வாங்க தயவுசெய்து உங்கள் மொபைல் எண்ணை உள்ளிட்டு உள்நுழையவும்.',
    sendOtp: 'சரிபார்ப்பு OTP அனுப்புக ›',
    enterOtp: 'சரிபார்ப்பு குறியீட்டை உள்ளிடவும்',
    otpSentTo: 'சரிபார்ப்பு குறியீடு அனுப்பப்பட்ட எண்',
    verifyAndProceed: 'சரிபார்த்து தொடரவும் ›',
    resendOtp: 'மீண்டும் SMS மூலம் OTP அனுப்புக',
    resendIn: 'மீண்டும் அனுப்ப',
    invalidMobile: 'சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.',
    invalidOtp: 'சரியான 6 இலக்க OTP குறியீட்டை உள்ளிடவும்.',
    otpFailed: 'தவறான OTP. உங்கள் தொலைபேசிக்கு வந்த குறியீட்டை சரிபார்க்கவும்.',
    loginSuccess: 'உள்நுழைவு வெற்றிகரமாக முடிந்தது!',
    welcomeBack: 'தாரணி ஹெர்பல்ஸுக்கு நல்வரவு!',
    loginSuccessDesc: 'உங்கள் கணக்கில் வெற்றிகரமாக உள்நுழைந்துள்ளீர்கள்.',
    continueBtn: 'தொடரவும் →',
    networkError: 'இணைய இணைப்பு பிழை. தயவுசெய்து உங்கள் இணையத்தை சரிபார்க்கவும்.',
    dialerUnavailable: 'அழைக்க முடியவில்லை. நேரடியாக அழைக்கவும்: ',
    whatsappUnavailable: 'உங்கள் சாதனத்தில் வாட்ஸ்அப் செயலி திறக்க முடியவில்லை.',

    // Wishlist & Saved Addresses
    myWishlist: 'என் விருப்பப்பட்டியல்',
    emptyWishlistTitle: 'உங்கள் விருப்பப்பட்டியல் காலியாக உள்ளது',
    emptyWishlistSub: 'உங்களுக்குப் பிடித்த மூலிகை தயாரிப்புகளை எளிதில் அணுக இங்கே சேமியுங்கள்.',
    exploreCatalogue: 'தயாரிப்புகளைப் பார்க்க',
    addAddress: 'புதிய முகவரி சேர்க்க',
    noSavedAddresses: 'சேமிக்கப்பட்ட முகவரிகள் எதுவும் இல்லை',
    saveAddress: 'முகவரியைச் சேமி',
    defaultAddress: 'முதன்மையான முகவரி',

    // Contact & Support Screen
    getInTouch: 'தொடர்பு கொள்க',
    contactSubtitle: 'எங்கள் சித்த மூலிகை தயாரிப்புகள், ஆர்டர் அல்லது நல்வாழ்வு வழிகாட்டுதல் பற்றிய கேள்விகள் உள்ளதா? உதவ தயாராக உள்ளோம்.',
    phoneSupport: 'தொலைபேசி உதவி',
    whatsappSupport: 'உடனடி வாட்ஸ்அப் அரட்டை',
    whatsappFastResponse: 'ஆர்டர் மற்றும் தயாரிப்பு கேள்விகளுக்கு விரைவான பதில்கள்',
    chatOnWhatsApp: 'வாட்ஸ்அப்பில் உரையாட ›',
    emailSupport: 'மின்னஞ்சல் உதவி',
    storeHours: 'பணி நேரம்',
    sundayHoliday: 'ஞாயிறு: வார விடுமுறை',
    storeAddress: 'தலைமை அலுவலகம் & முகவரி',
    openGoogleMaps: 'Google Maps-ல் பார்க்க ›',
    sendMessage: 'செய்தி அனுப்பவும்',
    sendMessageSub: 'எங்கள் மூலிகை நலவாழ்வு ஆலோசகர்களுக்கு செய்தி அனுப்புங்கள். 24 மணி நேரத்திற்குள் பதிலளிப்போம்.',
    submitMessage: 'செய்தி அனுப்புக ›',
    enquirySent: 'நன்றி! உங்கள் செய்தி பெறப்பட்டது. எங்கள் மருத்துவக் குழு விரைவில் உங்களைத் தொடர்பு கொள்ளும்.',

    // About Us Screen
    aboutDharani: 'எங்களை பற்றி',
    timeHonoredHeritage: 'பாரம்பரிய சித்த மருத்துவப் பெருமை',
    rootedInNature: 'இயற்கையோடு இணைந்து,\nஅறிவார்ந்த தயாரிப்பு',
    aboutBannerSub: 'தமிழ்நாட்டின் பாரம்பரிய மூலிகைகள் மற்றும் தூய சித்த மருத்துவக் கூட்டுத் தயாரிப்புகளுக்கான உங்களின் நம்பகமான புகலிடம்.',
    ourMission: 'எங்கள் புனித லட்சியம்',
    ourMissionDesc: 'பாரம்பரிய சித்த மற்றும் ஆயுர்வேத மருத்துவ அறிவை தூய்மையான, நம்பகமான இயற்கை தயாரிப்புகள் மூலம் ஒவ்வொரு இல்லத்திற்கும் கொண்டு சேர்ப்பதே எங்கள் லட்சியம்.',
    ourHeritage: 'எங்கள் வாழும் பாரம்பரியம்',
    ourHeritageDesc: '2004-ல் பழங்கால சித்த மருத்துவக் குறிப்புகளின் ஆழமான ஆராய்ச்சியோடு தொடங்கி, 2007-ல் சத்தியமங்கலம் அருகே புஞ்சை புளியம்பட்டியில் தரணி ஹெர்பல்ஸ் நிறுவப்பட்டது.',
    journeyInNumbers: 'எண்களில் எங்கள் பயணம்',
    guidingValues: 'எங்கள் வழிகாட்டும் கொள்கைகள்',
    guidingValuesSub: 'ஒவ்வொரு மூலிகை அறுவடை மற்றும் தயாரிப்பிலும் இந்தக் கொள்கைகளே எங்களை வழிநடத்துகின்றன.',
    dharaniDifference: 'தரணி ஹெர்பல்ஸ் சிறப்பு',
    dharaniDifferenceSub: 'தூய்மை மற்றும் தரத்தில் எங்களின் அசைக்க முடியாத அர்ப்பணிப்பு.',
    experiencePureCare: 'தூய இயற்கை பராமரிப்பை அனுபவியுங்கள்',
    experiencePureCareSub: 'ஆயிரக்கணக்கான வாடிக்கையாளர்களோடு இணைந்து உங்கள் தினசரி நலவாழ்வில் தரணி ஹெர்பல்ஸை இணையுங்கள்.',
    exploreCollections: 'தயாரிப்புகளைப் பார்க்க ›',
    contactTeam: 'குழுவைத் தொடர்பு கொள்க',

    // Order Tracking
    trackYourOrder: 'உங்கள் ஆர்டரைக் கண்காணிக்கவும்',
    trackingOrder: 'ஆர்டர் எண்',
    orderPlacedStep: 'ஆர்டர் பதிவு செய்யப்பட்டது',
    orderPackedStep: 'பேக்கிங் & தரம் சரிபார்க்கப்பட்டது',
    orderDispatchedStep: 'கொரியர் மூலம் அனுப்பப்பட்டது',
    outForDeliveryStep: 'டெலிவரிக்கு வந்துள்ளது',
    deliveredSafelyStep: 'பாதுகாப்பாக டெலிவரி செய்யப்பட்டது',
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    storage.getLanguage().then(lang => {
      if (lang === 'ta' || lang === 'en') {
        setLanguageState(lang);
      }
    });
  }, []);

  const setLanguage = async lang => {
    const nextLang = lang === 'ta' ? 'ta' : 'en';
    setLanguageState(nextLang);
    await storage.setLanguage(nextLang);
  };

  const t = (key, fallback) => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (dict && dict[key]) return dict[key];
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
    return fallback !== undefined ? fallback : key;
  };

  const getProductName = prod => getLocalizedProductName(prod, language);
  const getProductDescription = prod => getLocalizedProductDescription(prod, language);
  const getCategoryName = cat => getLocalizedCategoryName(cat, language);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isTamil: language === 'ta',
        getProductName,
        getProductDescription,
        getCategoryName,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;
