package com.dharani

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.util.Log
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.auth.api.phone.SmsRetriever
import com.google.android.gms.common.api.CommonStatusCodes
import com.google.android.gms.common.api.Status
import java.util.regex.Pattern

class OtpAutoFillModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    companion object {
        const val NAME = "OtpAutoFillModule"
        private const val TAG = "OtpAutoFillModule"
        private const val SMS_CONSENT_REQUEST = 1502
    }

    private var smsReceiver: BroadcastReceiver? = null
    private var isReceiverRegistered = false
    private var lastEmittedOtp: String? = null
    private var lastEmittedTime: Long = 0L

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun getAppHash(promise: Promise) {
        try {
            val helper = AppSignatureHelper(reactContext)
            val signatures = helper.appSignatures
            if (signatures.isNotEmpty()) {
                val array = Arguments.createArray()
                for (sig in signatures) {
                    array.pushString(sig)
                }
                promise.resolve(array)
            } else {
                promise.resolve(Arguments.createArray())
            }
        } catch (e: Exception) {
            promise.reject("APP_HASH_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun startOtpListener(promise: Promise) {
        try {
            // Unregister any previous receiver first
            unregisterReceiverSafely()

            val client = SmsRetriever.getClient(reactContext)

            // Start SMS Retriever (for messages with 11-char app hash)
            client.startSmsRetriever()
                .addOnSuccessListener {
                    Log.d(TAG, "SmsRetriever started successfully")
                }
                .addOnFailureListener { e ->
                    Log.w(TAG, "SmsRetriever failed to start: ${e.message}")
                }

            // Start SMS User Consent (for messages without app hash)
            client.startSmsUserConsent(null)
                .addOnSuccessListener {
                    Log.d(TAG, "SmsUserConsent started successfully")
                }
                .addOnFailureListener { e ->
                    Log.w(TAG, "SmsUserConsent failed to start: ${e.message}")
                }

            smsReceiver = object : BroadcastReceiver() {
                override fun onReceive(context: Context?, intent: Intent?) {
                    if (intent == null || intent.action != SmsRetriever.SMS_RETRIEVED_ACTION) {
                        return
                    }

                    val extras = intent.extras ?: return
                    val status = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        extras.getParcelable(SmsRetriever.EXTRA_STATUS, Status::class.java)
                    } else {
                        @Suppress("DEPRECATION")
                        extras.getParcelable(SmsRetriever.EXTRA_STATUS)
                    } ?: return

                    when (status.statusCode) {
                        CommonStatusCodes.SUCCESS -> {
                            // 1. Direct message (SMS Retriever with 11-char app hash)
                            val message = extras.getString(SmsRetriever.EXTRA_SMS_MESSAGE)
                            if (!message.isNullOrBlank()) {
                                val otp = extractOtp(message)
                                if (otp != null) {
                                    sendOtpToJs(otp, message)
                                }
                                return
                            }

                            // 2. User Consent Intent (SMS without app hash)
                            val consentIntent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                extras.getParcelable(SmsRetriever.EXTRA_CONSENT_INTENT, Intent::class.java)
                            } else {
                                @Suppress("DEPRECATION")
                                extras.getParcelable(SmsRetriever.EXTRA_CONSENT_INTENT)
                            }

                            if (consentIntent != null) {
                                val currentAct = reactContext.currentActivity
                                if (currentAct != null) {
                                    try {
                                        currentAct.startActivityForResult(consentIntent, SMS_CONSENT_REQUEST)
                                    } catch (e: Exception) {
                                        Log.e(TAG, "Failed to start consent activity: ${e.message}")
                                    }
                                }
                            }
                        }
                        CommonStatusCodes.TIMEOUT -> {
                            Log.d(TAG, "SMS Retriever timed out")
                        }
                    }
                }
            }

            val intentFilter = IntentFilter(SmsRetriever.SMS_RETRIEVED_ACTION)
            ContextCompat.registerReceiver(
                reactContext,
                smsReceiver!!,
                intentFilter,
                ContextCompat.RECEIVER_EXPORTED
            )
            isReceiverRegistered = true
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start OTP listener: ${e.message}")
            promise.reject("START_LISTENER_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun stopOtpListener(promise: Promise? = null) {
        try {
            unregisterReceiverSafely()
            promise?.resolve(true)
        } catch (e: Exception) {
            promise?.reject("STOP_LISTENER_ERROR", e.message, e)
        }
    }

    private fun unregisterReceiverSafely() {
        if (isReceiverRegistered && smsReceiver != null) {
            try {
                reactContext.unregisterReceiver(smsReceiver)
            } catch (e: Exception) {
                Log.w(TAG, "Receiver not registered or already unregistered: ${e.message}")
            }
            isReceiverRegistered = false
            smsReceiver = null
        }
    }

    override fun onActivityResult(
        activity: Activity,
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        if (requestCode == SMS_CONSENT_REQUEST) {
            if (resultCode == Activity.RESULT_OK && data != null) {
                val message = data.getStringExtra(SmsRetriever.EXTRA_SMS_MESSAGE)
                if (!message.isNullOrBlank()) {
                    val otp = extractOtp(message)
                    if (otp != null) {
                        sendOtpToJs(otp, message)
                    }
                }
            } else {
                Log.d(TAG, "SMS Consent dialog was dismissed or denied (resultCode=$resultCode)")
            }
        }
    }

    override fun onNewIntent(intent: Intent) {}

    private fun extractOtp(message: String): String? {
        // 1. Keyword-based 6-digit match (e.g., "verification code is 123456", "OTP: 123456")
        val patternKeyword6 = Pattern.compile("(?i)(?:otp|code|verification|passcode)[^0-9]{0,15}(\\d{6})")
        val matcherKeyword6 = patternKeyword6.matcher(message)
        if (matcherKeyword6.find()) {
            return matcherKeyword6.group(1)
        }

        // 2. Standalone 6-digit match
        val pattern6 = Pattern.compile("(?<!\\d)(\\d{6})(?!\\d)")
        val matcher6 = pattern6.matcher(message)
        if (matcher6.find()) {
            return matcher6.group(1)
        }

        // 3. Keyword-based 4-digit match
        val patternKeyword4 = Pattern.compile("(?i)(?:otp|code|verification|passcode)[^0-9]{0,15}(\\d{4})")
        val matcherKeyword4 = patternKeyword4.matcher(message)
        if (matcherKeyword4.find()) {
            return matcherKeyword4.group(1)
        }

        // 4. Standalone 4-digit match
        val pattern4 = Pattern.compile("(?<!\\d)(\\d{4})(?!\\d)")
        val matcher4 = pattern4.matcher(message)
        if (matcher4.find()) {
            return matcher4.group(1)
        }

        return null
    }

    private fun sendOtpToJs(otp: String, message: String) {
        val now = System.currentTimeMillis()
        if (otp == lastEmittedOtp && (now - lastEmittedTime) < 5000L) {
            Log.d(TAG, "Duplicate OTP event ignored ($otp)")
            return
        }
        lastEmittedOtp = otp
        lastEmittedTime = now

        try {
            Log.d(TAG, "Emitting onOtpReceived event to React Native JS: $otp")
            val params = Arguments.createMap().apply {
                putString("otp", otp)
                putString("message", message)
            }
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onOtpReceived", params)
        } catch (e: Exception) {
            Log.e(TAG, "Error sending OTP event to JS: ${e.message}")
        }
    }

    @ReactMethod
    fun addListener(eventName: String?) {}

    @ReactMethod
    fun removeListeners(count: Int?) {}

    override fun invalidate() {
        unregisterReceiverSafely()
        super.invalidate()
    }
}
