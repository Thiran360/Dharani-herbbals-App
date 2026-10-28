package com.dharani

import android.content.Context
import android.content.ContextWrapper
import android.content.pm.PackageManager
import android.content.pm.Signature
import android.os.Build
import android.util.Base64
import android.util.Log
import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.security.NoSuchAlgorithmException
import java.util.Arrays

class AppSignatureHelper(context: Context) : ContextWrapper(context) {

    companion object {
        private const val TAG = "AppSignatureHelper"
        private const val HASH_TYPE = "SHA-256"
        private const val NUM_HASHED_BYTES = 9
        private const val NUM_BASE64_CHAR = 11
    }

    /**
     * Get all the app signatures for current package
     */
    val appSignatures: ArrayList<String>
        get() {
            val appCodes = ArrayList<String>()
            try {
                val pkgName = packageName
                val pkgManager = packageManager
                val signatures: Array<Signature> = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    val packageInfo = pkgManager.getPackageInfo(
                        pkgName,
                        PackageManager.GET_SIGNING_CERTIFICATES
                    )
                    packageInfo.signingInfo?.apkContentsSigners ?: emptyArray()
                } else {
                    @Suppress("DEPRECATION")
                    val packageInfo = pkgManager.getPackageInfo(
                        pkgName,
                        PackageManager.GET_SIGNATURES
                    )
                    @Suppress("DEPRECATION")
                    packageInfo.signatures ?: emptyArray()
                }

                for (signature in signatures) {
                    val hash = hash(pkgName, signature.toCharsString())
                    if (hash != null) {
                        appCodes.add(hash)
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Unable to get package signature: ${e.message}")
            }
            return appCodes
        }

    private fun hash(pkgName: String, signature: String): String? {
        val appInfo = "$pkgName $signature"
        return try {
            val messageDigest = MessageDigest.getInstance(HASH_TYPE)
            messageDigest.update(appInfo.toByteArray(StandardCharsets.UTF_8))
            var hashSignature = messageDigest.digest()

            hashSignature = Arrays.copyOfRange(hashSignature, 0, NUM_HASHED_BYTES)
            var base64Hash = Base64.encodeToString(hashSignature, Base64.NO_PADDING or Base64.NO_WRAP)
            base64Hash = base64Hash.substring(0, NUM_BASE64_CHAR)
            Log.d(TAG, "pkg: $pkgName -- hash: $base64Hash")
            base64Hash
        } catch (e: NoSuchAlgorithmException) {
            Log.e(TAG, "hash:NoSuchAlgorithm", e)
            null
        }
    }
}
