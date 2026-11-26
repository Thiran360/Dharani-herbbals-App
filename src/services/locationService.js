/**
 * Live Location & Address Detection Service for Dharani Herbbals
 * Integrates Android GPS LocationManager, Native Geocoder, and multi-tier Reverse Geocoding fallbacks.
 */

import { PermissionsAndroid, Platform, NativeModules, Alert } from 'react-native';

const { DharaniLocation } = NativeModules;

// Standard list of Indian States/UTs to ensure clean dropdown match
const INDIAN_STATES = [
  'Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana',
  'Maharashtra', 'Delhi', 'West Bengal', 'Gujarat', 'Rajasthan',
  'Uttar Pradesh', 'Madhya Pradesh', 'Bihar', 'Punjab', 'Haryana',
  'Odisha', 'Assam', 'Jharkhand', 'Chhattisgarh', 'Uttarakhand',
  'Goa', 'Himachal Pradesh', 'Jammu and Kashmir', 'Puducherry',
  'Chandigarh', 'Tripura', 'Manipur', 'Meghalaya', 'Nagaland',
  'Mizoram', 'Sikkim', 'Arunachal Pradesh', 'Ladakh',
  'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep',
];

export function matchIndianState(rawState) {
  if (!rawState || typeof rawState !== 'string') return 'Tamil Nadu';
  const clean = rawState.trim().toLowerCase();

  const exact = INDIAN_STATES.find(s => s.toLowerCase() === clean);
  if (exact) return exact;

  const partial = INDIAN_STATES.find(
    s => clean.includes(s.toLowerCase()) || s.toLowerCase().includes(clean)
  );
  if (partial) return partial;

  if (clean.includes('tamil') || clean.includes('tn')) return 'Tamil Nadu';
  if (clean.includes('kerala') || clean.includes('kl')) return 'Kerala';
  if (clean.includes('karnat') || clean.includes('ka')) return 'Karnataka';
  if (clean.includes('andhra') || clean.includes('ap')) return 'Andhra Pradesh';
  if (clean.includes('telang')) return 'Telangana';

  return rawState.trim();
}

/**
 * Requests Android ACCESS_FINE_LOCATION permission
 */
export async function requestLocationPermission(isTamil = false) {
  if (Platform.OS !== 'android') return true;

  try {
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    if (hasPermission) return true;

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: isTamil ? 'இருப்பிட அனுமதி தேவை' : 'Live Location Permission',
        message: isTamil
          ? 'உங்கள் டெலிவரி முகவரியை தானாக கண்டறிய Dharani Herbbals-க்கு ஜிபிஎஸ் அனுமதி தேவை.'
          : 'Dharani Herbbals requires GPS location permission to auto-detect your delivery address for botanical orders.',
        buttonNeutral: isTamil ? 'பிறகு' : 'Ask Later',
        buttonNegative: isTamil ? 'மறுக்க' : 'Cancel',
        buttonPositive: isTamil ? 'அனுமதி' : 'Allow',
      }
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Location permission request error:', err);
    return false;
  }
}

/**
 * Reverse geocodes coordinates via OpenStreetMap Nominatim or BigDataCloud
 */
async function reverseGeocodeWeb(latitude, longitude) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: { 'User-Agent': 'DharaniHerbbalsApp/1.1.0 (Android)' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const streetParts = [
          addr.house_number,
          addr.building,
          addr.road || addr.street,
          addr.suburb || addr.neighbourhood || addr.subdivision,
        ].filter(Boolean);

        const street = streetParts.length > 0 ? streetParts.join(', ') : (data.display_name?.split(',').slice(0, 2).join(', ') || '');
        const city = addr.city || addr.town || addr.village || addr.county || addr.district || '';
        const state = matchIndianState(addr.state || '');
        const pincode = addr.postcode ? addr.postcode.replace(/\D/g, '').slice(0, 6) : '';

        return {
          streetAddress: street,
          city,
          state,
          pincode,
          fullAddress: data.display_name || '',
        };
      }
    }
  } catch (e) {
    console.warn('Nominatim reverse geocode note:', e.message);
  }

  // Backup reverse geocoder
  try {
    const res2 = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2) {
        const city = data2.locality || data2.city || '';
        const state = matchIndianState(data2.principalSubdivision || '');
        const pincode = data2.postcode ? data2.postcode.replace(/\D/g, '').slice(0, 6) : '';
        const street = [data2.locality, data2.localityInfo?.administrative?.[3]?.name].filter(Boolean).join(', ');

        return {
          streetAddress: street,
          city,
          state,
          pincode,
          fullAddress: `${city}, ${state} - ${pincode}`,
        };
      }
    }
  } catch (e) {
    console.warn('BigDataCloud reverse geocode note:', e.message);
  }

  return null;
}

/**
 * IP Geocoding fallback if GPS is unavailable
 */
async function getIpLocationFallback() {
  const providers = [
    'https://ipwhois.app/json/',
    'https://freeipapi.com/api/json',
    'https://ipapi.co/json/',
  ];

  for (const url of providers) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const city = data.city || data.cityName || '';
        const rawState = data.region || data.regionName || data.region_name || '';
        const state = matchIndianState(rawState);
        const pincode = String(data.postal || data.zipCode || data.postalCode || '').replace(/\D/g, '').slice(0, 6);

        if (city || state) {
          return {
            streetAddress: city ? `${city} Area` : '',
            city,
            state,
            pincode,
            fullAddress: `${city}, ${state} - ${pincode}`.trim(),
            isIpFallback: true,
          };
        }
      }
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Main public entrypoint: Fetches high-accuracy live GPS location & complete address
 */
export async function getLiveLocation(isTamil = false) {
  // 1. Request Runtime Permission
  const hasPerm = await requestLocationPermission(isTamil);
  if (!hasPerm) {
    throw new Error(
      isTamil
        ? 'இருப்பிட அனுமதி வழங்கப்படவில்லை. அமைப்புகளில் அனுமதியை இயக்கவும்.'
        : 'Location permission was denied. Please allow location access in your phone settings.'
    );
  }

  // 2. Fetch Native GPS + Android Geocoder
  let nativeResult = null;
  if (DharaniLocation && typeof DharaniLocation.getCurrentLocation === 'function') {
    try {
      nativeResult = await DharaniLocation.getCurrentLocation();
    } catch (nativeErr) {
      console.warn('Native GPS location error:', nativeErr.code, nativeErr.message);
      if (nativeErr.code === 'LOCATION_DISABLED') {
        throw new Error(
          isTamil
            ? 'ஜிபிஎஸ் இருப்பிடம் முடக்கப்பட்டுள்ளது. தயவுசெய்து மொபைல் அமைப்புகளில் GPS/Location-ஐ ஆன் செய்யவும்.'
            : 'GPS / Location is turned off. Please turn on Location/GPS in your phone settings and try again.'
        );
      }
    }
  }

  // 3. Process Native Result if available
  if (nativeResult) {
    const lat = nativeResult.latitude;
    const lng = nativeResult.longitude;

    const hasCityOrState = Boolean(nativeResult.city || nativeResult.state);
    const hasPincode = Boolean(nativeResult.pincode && nativeResult.pincode.length === 6);

    // If native geocoder provided comprehensive address details
    if (hasCityOrState && hasPincode) {
      return {
        streetAddress: nativeResult.streetAddress || '',
        city: nativeResult.city || '',
        state: matchIndianState(nativeResult.state),
        pincode: nativeResult.pincode || '',
        fullAddress: nativeResult.fullAddress || '',
        latitude: lat,
        longitude: lng,
        source: 'gps_native',
      };
    }

    // If native geocoder was partial, enhance via reverse geocoding
    if (lat && lng) {
      const webAddr = await reverseGeocodeWeb(lat, lng);
      if (webAddr) {
        return {
          streetAddress: nativeResult.streetAddress || webAddr.streetAddress || '',
          city: nativeResult.city || webAddr.city || '',
          state: matchIndianState(nativeResult.state || webAddr.state),
          pincode: nativeResult.pincode || webAddr.pincode || '',
          fullAddress: nativeResult.fullAddress || webAddr.fullAddress || '',
          latitude: lat,
          longitude: lng,
          source: 'gps_web_enhanced',
        };
      }
    }
  }

  // 4. IP Fallback if GPS could not obtain coordinates
  const ipResult = await getIpLocationFallback();
  if (ipResult) {
    return {
      ...ipResult,
      source: 'ip_fallback',
    };
  }

  throw new Error(
    isTamil
      ? 'இருப்பிடத்தை கண்டறிய முடியவில்லை. தயவுசெய்து ஊர் மற்றும் அஞ்சல் குறியீட்டை உள்ளிடவும்.'
      : 'Could not auto-detect location. Please enter your address details manually.'
  );
}

export default {
  requestLocationPermission,
  getLiveLocation,
  matchIndianState,
};
