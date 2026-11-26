package com.dharani

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Geocoder
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import java.util.Locale
import java.util.concurrent.atomic.AtomicBoolean

class LocationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "DharaniLocation"

    @ReactMethod
    fun getCurrentLocation(promise: Promise) {
        val finePerm = ContextCompat.checkSelfPermission(
            reactContext,
            Manifest.permission.ACCESS_FINE_LOCATION
        )
        val coarsePerm = ContextCompat.checkSelfPermission(
            reactContext,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )

        if (finePerm != PackageManager.PERMISSION_GRANTED && coarsePerm != PackageManager.PERMISSION_GRANTED) {
            promise.reject("PERMISSION_DENIED", "Location permission is not granted")
            return
        }

        val locationManager = reactContext.getSystemService(Context.LOCATION_SERVICE) as? LocationManager
        if (locationManager == null) {
            promise.reject("UNAVAILABLE", "Location service is unavailable on this device")
            return
        }

        val isGpsEnabled = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)
        val isNetworkEnabled = locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)

        if (!isGpsEnabled && !isNetworkEnabled) {
            promise.reject("LOCATION_DISABLED", "Location services are disabled. Please turn on GPS/Location in Settings.")
            return
        }

        // 1. Try last known location first for instantaneous response
        var bestLastLocation: Location? = null
        val providers = listOf(
            LocationManager.GPS_PROVIDER,
            LocationManager.NETWORK_PROVIDER,
            LocationManager.PASSIVE_PROVIDER
        )

        for (provider in providers) {
            try {
                if (locationManager.isProviderEnabled(provider)) {
                    val loc = locationManager.getLastKnownLocation(provider)
                    if (loc != null) {
                        if (bestLastLocation == null || loc.time > bestLastLocation.time) {
                            bestLastLocation = loc
                        }
                    }
                }
            } catch (_: SecurityException) {
            }
        }

        val currentTime = System.currentTimeMillis()
        // If last location is recent (< 2 minutes old) and has reasonable accuracy (< 100m)
        if (bestLastLocation != null && (currentTime - bestLastLocation.time < 120_000)) {
            processAndResolve(bestLastLocation, promise)
            return
        }

        // 2. Request fresh location update with timeout
        val isResolved = AtomicBoolean(false)
        val handler = Handler(Looper.getMainLooper())

        val locationListener = object : LocationListener {
            override fun onLocationChanged(location: Location) {
                if (isResolved.compareAndSet(false, true)) {
                    try {
                        locationManager.removeUpdates(this)
                    } catch (_: Exception) {}
                    processAndResolve(location, promise)
                }
            }

            @Deprecated("Deprecated in Java")
            override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
            override fun onProviderEnabled(provider: String) {}
            override fun onProviderDisabled(provider: String) {}
        }

        // Timeout Runnable (8 seconds max)
        val timeoutRunnable = Runnable {
            if (isResolved.compareAndSet(false, true)) {
                try {
                    locationManager.removeUpdates(locationListener)
                } catch (_: Exception) {}

                if (bestLastLocation != null) {
                    processAndResolve(bestLastLocation, promise)
                } else {
                    promise.reject("TIMEOUT", "GPS location timed out. Please ensure GPS is enabled and has a clear view of the sky.")
                }
            }
        }

        handler.postDelayed(timeoutRunnable, 8000)

        // Request location on UI thread
        handler.post {
            try {
                if (isGpsEnabled) {
                    locationManager.requestLocationUpdates(
                        LocationManager.GPS_PROVIDER,
                        500L,
                        0f,
                        locationListener,
                        Looper.getMainLooper()
                    )
                }
                if (isNetworkEnabled) {
                    locationManager.requestLocationUpdates(
                        LocationManager.NETWORK_PROVIDER,
                        500L,
                        0f,
                        locationListener,
                        Looper.getMainLooper()
                    )
                }
            } catch (e: SecurityException) {
                if (isResolved.compareAndSet(false, true)) {
                    handler.removeCallbacks(timeoutRunnable)
                    promise.reject("SECURITY_EXCEPTION", e.message ?: "Security exception accessing location")
                }
            } catch (e: Exception) {
                if (bestLastLocation != null && isResolved.compareAndSet(false, true)) {
                    handler.removeCallbacks(timeoutRunnable)
                    processAndResolve(bestLastLocation, promise)
                } else if (isResolved.compareAndSet(false, true)) {
                    handler.removeCallbacks(timeoutRunnable)
                    promise.reject("LOCATION_ERROR", e.message ?: "Failed to request location updates")
                }
            }
        }
    }

    private fun processAndResolve(location: Location, promise: Promise) {
        // Run Geocoder on background thread to prevent UI stutter
        Thread {
            val result: WritableMap = Arguments.createMap()
            result.putDouble("latitude", location.latitude)
            result.putDouble("longitude", location.longitude)
            result.putDouble("accuracy", location.accuracy.toDouble())

            try {
                if (Geocoder.isPresent()) {
                    val geocoder = Geocoder(reactContext, Locale.ENGLISH)
                    @Suppress("DEPRECATION")
                    val addresses = geocoder.getFromLocation(location.latitude, location.longitude, 1)

                    if (!addresses.isNullOrEmpty()) {
                        val addr = addresses[0]

                        val streetParts = mutableListOf<String>()
                        if (!addr.subThoroughfare.isNullOrBlank()) streetParts.add(addr.subThoroughfare)
                        if (!addr.thoroughfare.isNullOrBlank()) streetParts.add(addr.thoroughfare)
                        if (!addr.subLocality.isNullOrBlank() && !streetParts.contains(addr.subLocality)) {
                            streetParts.add(addr.subLocality)
                        }

                        val street = if (streetParts.isNotEmpty()) {
                            streetParts.joinToString(", ")
                        } else {
                            val line0 = addr.getAddressLine(0) ?: ""
                            line0.split(",").take(2).joinToString(", ").trim()
                        }

                        val city = addr.locality
                            ?: addr.subAdminArea
                            ?: addr.subLocality
                            ?: ""

                        val state = addr.adminArea ?: ""
                        val pincode = addr.postalCode ?: ""
                        val full = addr.getAddressLine(0) ?: ""

                        result.putString("streetAddress", street)
                        result.putString("city", city)
                        result.putString("state", state)
                        result.putString("pincode", pincode)
                        result.putString("fullAddress", full)
                        result.putString("country", addr.countryName ?: "India")
                    }
                }
            } catch (e: Exception) {
                result.putString("geocoderError", e.message ?: "Geocoder lookup failed")
            }

            promise.resolve(result)
        }.start()
    }
}
