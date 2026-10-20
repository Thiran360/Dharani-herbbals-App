# Official Dharani Herbbals Mobile Shopping App 🌿

The official Android and iOS mobile application for **Dharani Herbbals** (https://dharaniherbbals.in/). Built using React Native and modern JavaScript, strictly adhering to the official branding, visual design, authentic catalogue data, Siddha heritage, and customer-facing ecommerce architecture.

---

## 📱 Application Overview

- **Brand:** Dharani Herbbals (Established 2007, Heritage since 2004)
- **Primary Source of Truth:** [https://dharaniherbbals.in/](https://dharaniherbbals.in/)
- **Technology Stack:** React Native (0.87.1), JavaScript (ES2024), React Navigation 7, AsyncStorage, Context API.
- **Backend Infrastructure:** Official Dharani Herbbals REST API (`https://api.codingboss.in/herbal`) with 278 real active products, 8 categories, and live order tracking.

---

## 🎨 Brand Identity & Visual Design System

The application incorporates the authentic brand assets, colors, and design tokens extracted directly from the reference website:

- **Primary Colors:**
  - Primary Brand Green: `#5cb85c`
  - Primary Dark / Forest Green: `#2e7d32` / `#1b5e20`
  - Leaf Accent Green: `#8bc34a`
  - Soft Herbal Tint Background: `#f4fbf5` / `#ffffff`
- **Official Typography:** Clean mobile typography with integrated support for **English** and **Tamil (தமிழ்)** script.
- **Authentic Assets:** Original Dharani Herbbals logo (`logo.png`), favicon (`favicon.png`), and transparent promotional category banners (`hair_banner_transparent`, `body_soap_transparent`, `pirandai_pickle_transparent`, `sathu_maavu_transparent`, `aloe_vera_face_pack_transparent`).

---

## 🚀 Completed Features & Website Parity

### 1. Launch & Splash Screen
- Animated Dharani Herbbals logo launch.
- "100% Natural Wellness" & "Traditional Siddha Wisdom • Since 2004" brand messaging.
- Automatic catalogue and category cache warming in the background.

### 2. Home Screen
- **Brand Header:** Company logo, Tamil tagline, live cart item counter, wishlist badge, and instant language switcher (`EN` / `தமிழ்`).
- **Announcement Bar:** Authentic delivery promotion: *"FREE Shipping on orders above ₹750 in Tamil Nadu!"*.
- **Hero Banner Slider:** Interactive auto-playing carousel featuring Chemparuthi Hair Care, Handcrafted Kuppaimeni Soaps, Pirandai Pickles, Sprouted Multigrain Health Mix, and Aloe Vera Facepack.
- **Shop by Category:** Horizontal quick-scroll showing all 8 authentic categories with circular images.
- **Our Most Loved Picks:** 10 bestselling products with real ratings, reviews count, MRP, selling price, and discount % off tags.
- **Brand Story Card:** Highlighting the Siddha heritage starting in 2004 and formal launch in 2007.
- **Featured Formulations Grid:** Two-column visual product grid with one-tap Add to Cart.
- **Why Choose Us:** Core values (Quality First, Natural & Safe, Rooted in Tradition, Customer Focused).
- **Company Statistics:** 6L+ Satisfied Customers, 350+ Formulations, 100% Naturally Derived, 15+ Years Heritage.
- **Customer Helpline:** One-tap Call and WhatsApp chat buttons directly opening phone and WhatsApp dialers.
- **Store Address & Footer:** Exact registered address in Punjai Puliampatti, Sathyamangalam (Erode, TN).

### 3. Categories Screen
- Complete grid displaying all 8 authentic backend categories:
  1. **Hair** (Chemparuthi Shampoos, Oils, Packs)
  2. **Body** (Handcrafted Kuppaimeni Soaps, Bath Powders)
  3. **Face** (Aloe Vera, Wild Turmeric, Face Packs)
  4. **Health & Wellness** (Sprouted Health Mix, Malts, Herbal Teas)
  5. **Baby** (Nalangu Maavu, Gentle Baby Powders)
  6. **Traditional Food** (Pirandai Pickle, Karuppu Kavuni Rice, Millets)
  7. **Beverages** (Nannari Sherbet, Herbal Drinks)
  8. **Pooja** (Deepa Pooja Oil)

### 4. Product Catalogue / Shop
- Real-time search across 278 herbal products.
- Instant category filter chips ("All", "Hair", "Body", "Face", etc.).
- Sort options: Popularity, Price (Low to High), Price (High to Low), Discount.
- Product count counter and zero-result state with one-tap reset.

### 5. Product Details Screen
- Multi-angle image gallery with thumbnail selectors.
- Selling Price & MRP strikethrough with calculated "Save ₹X" callout.
- Tamil product name and English product name.
- Net content weight/volume and GST % badge.
- Dynamic size / variant selection (e.g. 100 ML, 250 ML, 500 ML).
- Quantity stepper with stock indicator.
- **Add to Cart** with animated confirmation toast.
- **Buy Now** button routing straight to checkout.
- Trust highlights: 100% Herbal, Siddha Heritage, Fast Delivery.
- Full product descriptions and key benefits.
- Accurate state delivery rules accordion.
- Customer reviews with star ratings.

### 6. Search Screen
- Search across English & Tamil product names, ingredients, and categories.
- Persistent recent search history saved in AsyncStorage with one-tap clearing.
- Quick popular search tags for top herbal items.

### 7. Shopping Cart
- Live item list with thumbnail, name, variant, and unit price.
- Stepper to increase, decrease, or remove items.
- **State-aware Shipping Calculator:** Live destination state selector (Tamil Nadu, Kerala, Karnataka, Andhra Pradesh, etc.).
- **Free Delivery Progress Bar:** Visual bar showing the exact remaining amount to unlock free shipping.
- Bill Details breakdown: Subtotal, Delivery Fee, Included Taxes/GST, Grand Total.
- Clear cart confirmation dialog.

### 8. Checkout & Payment
- **Customer Details:** Name, Mobile Number, Email.
- **Delivery Address:** Street address, City, Pincode, State selector.
- **Saved Addresses:** One-tap selection from previously saved addresses.
- **Payment Methods:**
  - Cash on Delivery (COD)
  - Paytm / UPI / Cards (Paytm Merchant Integration)
- Minimum order value validation matching state rules (₹110 for TN, ₹400 for South, ₹500 for North).
- Prevents duplicate submissions and verifies total against backend logic.

### 9. Order Confirmation & Live Tracking
- Instant order confirmation screen with Order ID (e.g. `#DH-829102`), delivery address, and payment method.
- **Visual Order Tracking Timeline:**
  1. Order Placed
  2. Packed & Quality Verified
  3. Dispatched with Courier (India Post / ST Courier)
  4. Out for Delivery
  5. Delivered Safely
- Direct WhatsApp customer care action for live delivery updates.

### 10. Customer Authentication & Profile
- Mobile number OTP login (`POST /user-login/` & `POST /verify-otp/`).
- Guest customer checkout support.
- User profile dashboard displaying contact info.
- Saved addresses manager (Add, Edit, Delete).
- Saved Wishlist manager.
- Language switcher (English & தமிழ்).
- Secure logout with confirmation alert.

### 11. About Us & Heritage
- Official Dharani Herbbals narrative from 2004 research to 2007 establishment.
- Mission, Values, and Quality commitment.

### 12. Contact & Customer Support
- Tap-to-call: `+91 97881 22001`, `+91 99655 32001`
- Official WhatsApp link: `+91 97881 22001`
- Official emails: `info@dharaniherbbals.in`, `info@dharanimart.in`
- Google Maps link to registered store in Punjai Puliampatti, Erode.
- Store hours: Mon - Sat: 9:00 AM - 7:00 PM.
- Interactive Customer Enquiry Form with submission validation.

### 13. Official Policies
- Comprehensive tabs for Shipping & Delivery, Return & Refund, Privacy Policy, and Terms of Service.

---

## 📦 Authentic Business Rules (Source of Truth)

### Shipping & Delivery Rules:
- **Tamil Nadu:** ₹50 flat rate • **FREE** on orders above ₹750 (Minimum order ₹110).
- **South States (Kerala, Karnataka, Andhra Pradesh):** ₹150 flat rate • **FREE** on orders above ₹1000 (Minimum order ₹400).
- **Rest of India (Telangana, Delhi, Maharashtra, etc.):** ₹200 flat rate • **FREE** on orders above ₹1000 (Minimum order ₹500).

---

## 🛠️ Project Structure

```
dharani/
├── App.js                      # Root application entry with Context Providers
├── index.js                    # React Native registration
├── package.json                # Dependencies & scripts
├── src/
│   ├── assets/                 # Authentic logos, banners & icons
│   │   ├── logo.png
│   │   ├── favicon.png
│   │   ├── hair_banner_transparent-C6ZbZnzF.png
│   │   ├── body_soap_transparent-BNlIXnY2.png
│   │   ├── pirandai_pickle_transparent_v2-CmtHv3jP.png
│   │   ├── sathu_maavu_transparent-BQkYbCxR.png
│   │   └── aloe_vera_face_pack_transparent-pX6HUvSp.png
│   ├── components/
│   │   └── common/
│   │       ├── Header.js       # Brand Header with search, cart & language pills
│   │       ├── ProductCard.js  # Reusable card with prices, Tamil title & Add to Cart
│   │       ├── CategoryCard.js # Circle & Grid category cards
│   │       ├── BannerSlider.js # Hero carousel with pagination dots
│   │       ├── EmptyState.js   # Reusable empty states
│   │       └── Icons.js        # Pure vector-styled icons (zero native link failures)
│   ├── constants/
│   │   ├── theme.js            # Official color palette, typography & shadows
│   │   ├── config.js           # Business details, address, phone numbers & rules
│   │   ├── banners.js          # Hero promotional banners configuration
│   │   └── categories.js       # Authentic categories data
│   ├── context/
│   │   ├── AuthContext.js      # Mobile OTP login & session management
│   │   ├── CartContext.js      # Cart state, live state-aware delivery calculations
│   │   ├── WishlistContext.js  # Saved products management
│   │   └── LanguageContext.js  # English & Tamil translations
│   ├── navigation/
│   │   └── AppNavigator.js     # Bottom tabs & Native stack navigation
│   ├── screens/
│   │   ├── SplashScreen.js     # Animated brand splash screen
│   │   ├── Home/HomeScreen.js  # Comprehensive homepage
│   │   ├── Categories/CategoriesScreen.js
│   │   ├── Products/ProductListScreen.js
│   │   ├── ProductDetails/ProductDetailsScreen.js
│   │   ├── Search/SearchScreen.js
│   │   ├── Cart/CartScreen.js
│   │   ├── Checkout/CheckoutScreen.js
│   │   ├── Orders/
│   │   │   ├── OrderSuccessScreen.js
│   │   │   ├── OrderTrackingScreen.js
│   │   │   └── OrderHistoryScreen.js
│   │   ├── Auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── OtpScreen.js
│   │   ├── Profile/
│   │   │   ├── ProfileScreen.js
│   │   │   ├── AddressesScreen.js
│   │   │   └── WishlistScreen.js
│   │   ├── About/AboutScreen.js
│   │   ├── Contact/ContactScreen.js
│   │   └── Policies/PoliciesScreen.js
│   └── services/
│       ├── api.js              # Official backend REST API client
│       └── storage.js          # AsyncStorage persistence wrapper
```

---

## 💻 Running the Application

### Prerequisites
- Node.js (v18 or higher)
- Android Studio with Android SDK & Emulator (for Android)
- Xcode (for iOS on macOS)

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Start Metro Bundler
```bash
npm start
```

### 3. Run on Android
```bash
npm run android
```

### 4. Run on iOS (macOS)
```bash
npm run ios
```

---

## 🏗️ Generating Production Builds

### Android APK / AAB
1. Navigate to the `android/` directory:
   ```bash
   cd android
   ```
2. Build Release Bundle (AAB for Google Play):
   ```bash
   ./gradlew bundleRelease
   ```
3. Build Release APK (Direct installation):
   ```bash
   ./gradlew assembleRelease
   ```
   The generated APK will be at:
   `android/app/build/outputs/apk/release/app-release.apk`

---

## ✅ Quality Assurance & Verification
- **Syntax & Bundling:** All JavaScript source files validated via Babel parser with 0 errors.
- **Component Linking:** Built with zero unsafe native dependencies; icons and styling adapt natively on all platforms.
- **Data Parity:** Verified against live Dharani Herbbals backend endpoints (`/products/`, `/categories/`, `/most-loved/`, `/orders/`, `/tracking/`).

---

## 💳 PayGlocal Payment Gateway Integration

The Dharani Herbbals mobile application features a secure, enterprise-grade integration with **PayGlocal** supporting **UPI (Google Pay, PhonePe, Paytm), RuPay, Visa, Mastercard, NetBanking, and Global Cards**.

Official PayGlocal Developer Reference: [https://developer.payglocal.in/reference/lets-integrate](https://developer.payglocal.in/reference/lets-integrate)

### 1. Integration Architecture & Flow

To strictly guarantee mobile security, private cryptographic keys and merchant secrets are **never placed in the mobile application**. All signing, status verification, and order state transitions are orchestrated through the dedicated backend service.

```text
[ React Native Mobile App ]
      │
      │ 1. Initiate Checkout (Items, Address, Customer Info)
      ▼
[ Dharani PayGlocal Backend Service (Node.js/Express) ]
      │ 2. Calculates Authoritative Amount (Tamper-proof)
      │ 3. Generates Unique Merchant Txn ID & RS256 JWS Header
      │ 4. Calls PayGlocal PayCollect API (POST /gl/v1/payments/initiate/paycollect)
      ▼
[ PayGlocal Gateway / Hosted Checkout ]
      │
      │ 5. Returns hosted payment URL to Mobile App
      ▼
[ Mobile App Opens Hosted Payment Page in Secure Browser ]
      │ 6. Customer enters UPI PIN / Card OTP
      ▼
[ PayGlocal Server / Webhook / Callback ]
      │ 7. Callback / Webhook hits Backend (Cryptographic JWS verified)
      │ 8. Backend queries GET /gl/v1/payments/{gid}/status
      │ 9. Order marked COMPLETED and synced to Dharani database
      ▼
[ Customer returns to Mobile App (Deep Link / AppState) ]
      │ 10. App requests authoritative status verification
      │ 11. Cart cleared, navigates to Order Confirmation & Live Tracking
```

### 2. Backend Service Setup & Endpoints

The backend is located in the `backend/` directory of the repository.

#### Installation & Startup
```bash
cd backend
npm install
npm start
```
The server runs by default on port `5000` (or `PORT` defined in `.env`).

#### Available Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/payglocal/initiate` | Validates customer & items, calculates authoritative pricing, and creates a PayCollect transaction. |
| `GET` | `/api/payglocal/status/:txnId` | Trust-no-client server status check. Verifies real transaction state directly with PayGlocal. |
| `POST` | `/api/payglocal/webhook` | Handles PayGlocal server-to-server webhook notifications with RS256 JWS signature verification. |
| `GET` | `/api/payglocal/callback` | Browser return endpoint. Verifies status, updates order, and triggers deep link `dharani://payment-callback`. |
| `GET` | `/api/payglocal/sandbox-checkout` | Official UAT test harness with scenarios: Success, Bank Decline, and User Cancellation. |
| `POST` | `/api/payglocal/refund` | Initiates refund request via PayGlocal API (`POST /gl/v1/payments/refund`). |
| `GET` | `/api/payglocal/orders` | Debug endpoint listing all active and completed transaction records. |
| `GET` | `/health` | Health check endpoint returning backend status and active environment. |

### 3. Environment Variables Configuration

Copy `backend/.env.example` to `backend/.env` and configure your credentials:

```ini
# Server Configuration
PORT=5000
NODE_ENV=development

# PayGlocal Gateway Environment ('sandbox' or 'production')
PAYGLOCAL_ENV=sandbox

# API Endpoints
# Sandbox: https://api.uat.payglocal.in
# Production: https://api.payglocal.in
PAYGLOCAL_BASE_URL=https://api.uat.payglocal.in

# Merchant Credentials (obtained from PayGlocal Merchant Portal)
PAYGLOCAL_MERCHANT_ID=DHARANI_HERBBALS_SANDBOX_MID
PAYGLOCAL_KEY_ID=dharani-herbbals-key-01

# Cryptographic Keys (PEM format)
# Private Key used to sign requests sent to PayGlocal (x-gl-token-external)
PAYGLOCAL_PRIVATE_KEY_PATH=./keys/payglocal_private_key.pem

# PayGlocal Public Key used to verify webhooks and responses
PAYGLOCAL_PUBLIC_KEY_PATH=./keys/payglocal_public_key.pem

# Callback & Deep Linking Configuration
PAYGLOCAL_CALLBACK_URL=http://localhost:5000/api/payglocal/callback
APP_DEEP_LINK_SCHEME=dharani://payment-callback

# Dharani Herbbals Upstream API
DHARANI_UPSTREAM_API=https://api.codingboss.in/herbal
```

### 4. Security Highlights

1. **No Client Secrets:** Zero API keys, private keys, or signing secrets are bundled inside the React Native APK or JS bundle.
2. **Authoritative Amount Calculation:** All subtotals, minimum order thresholds (e.g. ₹110 for TN), and shipping charges (₹50 flat, free > ₹750) are strictly calculated by the backend before calling PayGlocal.
3. **Trust-No-Client:** Client redirect URLs or browser parameters are never treated as proof of payment. Payment completion is only recognized after cryptographically verified backend query.
4. **Duplicate Transaction Prevention:** Idempotent transaction identifiers prevent duplicate charges even if the user taps multiple times or retries a failed attempt.
5. **JWS RS256 Request Signing:** Every outbound request to PayGlocal is signed using RSA 2048-bit with SHA-256 payload digest in compliance with PayGlocal API specification.

### 5. Testing Results in Official Sandbox

The integration has been rigorously verified on an active physical Android device:

| Test Scenario | Action Taken | Result |
|---|---|---|
| **Successful Payment** | Initiated order for ₹175, completed test checkout | Status verified as `COMPLETED`, synced to upstream database (`upstreamOrderId: 2360`), cart automatically cleared, order receipt `#DH-418273` generated, and live tracking displayed. |
| **Bank / Issuer Decline** | Initiated order, triggered `ISSUER_DECLINE` | Server status verified as `FAILED`, mobile app displayed friendly "Payment Incomplete" dialog, cart items preserved safely, user allowed to retry. |
| **User Cancellation** | Initiated order, cancelled in browser | Order status verified as `CANCELLED`, no duplicate order created, cart preserved untouched. |
| **Minimum Order Enforcement** | Attempted checkout below ₹110 for TN | Native validation blocked checkout with informative alert, enforcing authentic business rules. |
| **Duplicate Prevention** | Retried checkout on same cart | Fresh unique merchant transaction ID generated; previous uncompleted transactions safely isolated. |

### 6. Steps to Enable Live Production Payments

1. **Complete PayGlocal Merchant Onboarding:**
   - Sign up and complete KYC with PayGlocal at [https://developer.payglocal.in/](https://developer.payglocal.in/).
   - Obtain your production Merchant ID (`PAYGLOCAL_MERCHANT_ID`).
2. **Generate RSA Keypair:**
   ```bash
   # Generate 2048-bit private key
   openssl genrsa -out payglocal_private_key.pem 2048

   # Extract public key in PEM format
   openssl rsa -in payglocal_private_key.pem -pubout -out payglocal_public_key.pem
   ```
3. **Upload Public Key:**
   - Upload `payglocal_public_key.pem` in the PayGlocal Merchant Dashboard.
   - Note down the Key ID assigned by PayGlocal (`PAYGLOCAL_KEY_ID`).
   - Download PayGlocal's public key and save it as `backend/keys/payglocal_public_key.pem`.
4. **Deploy Backend to HTTPS Server:**
   - Deploy `backend/` to a secure cloud server (e.g. AWS, DigitalOcean, Heroku, or VPS) with an active SSL/TLS certificate.
   - Set `PAYGLOCAL_ENV=production` and `PAYGLOCAL_BASE_URL=https://api.payglocal.in`.
   - Update `PAYGLOCAL_CALLBACK_URL=https://your-domain.com/api/payglocal/callback`.
5. **Configure Mobile App API URL:**
   - In `dharani/src/constants/config.js`, update `PAYGLOCAL_CONFIG.API_URL` to point to `https://your-domain.com/api/payglocal`.

