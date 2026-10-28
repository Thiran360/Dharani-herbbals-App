/**
 * OTP Auto-Fill Service for Android
 * Supports both Google Play Services SMS Retriever API (instant with 11-char hash)
 * and SMS User Consent API (system one-tap consent sheet for standard SMS)
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { OtpAutoFillModule } = NativeModules;

let eventEmitter = null;
if (Platform.OS === 'android' && OtpAutoFillModule) {
  eventEmitter = new NativeEventEmitter(OtpAutoFillModule);
}

/**
 * Start listening for incoming OTP SMS on Android.
 * @param {Function} onOtpReceived - Callback invoked with (otp, rawMessage)
 * @returns {Promise<Function>} Cleanup function to stop listening
 */
export const startOtpListener = async (onOtpReceived) => {
  if (Platform.OS !== 'android' || !OtpAutoFillModule) {
    return () => {};
  }

  try {
    await OtpAutoFillModule.startOtpListener();

    let subscription = null;
    if (eventEmitter) {
      subscription = eventEmitter.addListener('onOtpReceived', (event) => {
        const otpCode = typeof event === 'string' ? event : event?.otp;
        const msgText = typeof event === 'object' && event?.message ? event.message : '';
        if (otpCode && typeof onOtpReceived === 'function') {
          onOtpReceived(otpCode, msgText);
        }
      });
    }

    return () => {
      try {
        if (subscription) {
          subscription.remove();
        }
        OtpAutoFillModule.stopOtpListener().catch(() => {});
      } catch (err) {
        // Safe fallback
      }
    };
  } catch (error) {
    // If Google Play Services is unavailable, gracefully degrade to manual entry
    return () => {};
  }
};

/**
 * Stop listening for OTP SMS
 */
export const stopOtpListener = async () => {
  if (Platform.OS === 'android' && OtpAutoFillModule) {
    try {
      await OtpAutoFillModule.stopOtpListener();
    } catch (e) {
      // Ignore
    }
  }
};

/**
 * Retrieve the 11-character SMS Retriever application hash(es)
 * for backend SMS template configuration.
 * @returns {Promise<string[]>} Array of 11-character hash strings
 */
export const getAppHash = async () => {
  if (Platform.OS === 'android' && OtpAutoFillModule?.getAppHash) {
    try {
      return await OtpAutoFillModule.getAppHash();
    } catch (e) {
      return [];
    }
  }
  return [];
};

export default {
  startOtpListener,
  stopOtpListener,
  getAppHash,
};
