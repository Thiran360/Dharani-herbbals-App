const crypto = require('crypto');
const fs = require('fs');
const config = require('./config');

/**
 * Helper to load private RSA key either from inline PEM or from file path
 */
function getPrivateKey() {
  if (config.PAYGLOCAL_PRIVATE_KEY_PEM && config.PAYGLOCAL_PRIVATE_KEY_PEM.trim().length > 0) {
    return config.PAYGLOCAL_PRIVATE_KEY_PEM;
  }
  if (config.PAYGLOCAL_PRIVATE_KEY_PATH && fs.existsSync(config.PAYGLOCAL_PRIVATE_KEY_PATH)) {
    return fs.readFileSync(config.PAYGLOCAL_PRIVATE_KEY_PATH, 'utf8');
  }
  return null;
}

/**
 * Helper to load public RSA key either from inline PEM or from file path
 */
function getPublicKey() {
  if (config.PAYGLOCAL_PUBLIC_KEY_PEM && config.PAYGLOCAL_PUBLIC_KEY_PEM.trim().length > 0) {
    return config.PAYGLOCAL_PUBLIC_KEY_PEM;
  }
  if (config.PAYGLOCAL_PUBLIC_KEY_PATH && fs.existsSync(config.PAYGLOCAL_PUBLIC_KEY_PATH)) {
    return fs.readFileSync(config.PAYGLOCAL_PUBLIC_KEY_PATH, 'utf8');
  }
  return null;
}

function hasMerchantPrivateKey() {
  const key = getPrivateKey();
  return Boolean(key && key.trim().length > 30);
}

function hasPayGlocalPublicKey() {
  const key = getPublicKey();
  return Boolean(key && key.trim().length > 30);
}

/**
 * Base64URL encoding according to RFC 7515
 */
function base64UrlEncode(data) {
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
  return buffer
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Base64URL decoding
 */
function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString('utf8');
}

/**
 * Generate official PayGlocal x-gl-token-external RSA-signed JWS
 *
 * Header:
 * {
 *   "alg": "RS256",
 *   "kid": "<key-id>",
 *   "iss": "<merchant-id>",
 *   "x-gl-enc": "false",
 *   "is-digested": "true"
 * }
 */
function generateJwsToken(payloadObj, options = {}) {
  const privateKey = options.privateKey || getPrivateKey();
  const merchantId = options.merchantId || config.PAYGLOCAL_MERCHANT_ID;
  const keyId = options.keyId || config.PAYGLOCAL_KEY_ID;

  const header = {
    alg: 'RS256',
    kid: keyId,
    iss: merchantId,
    'x-gl-enc': 'false',
    'is-digested': 'true',
  };

  const payloadString = typeof payloadObj === 'string' ? payloadObj : JSON.stringify(payloadObj);

  // Compute SHA-256 digest of payload
  const sha256Digest = crypto.createHash('sha256').update(payloadString).digest('base64');

  const jwsPayload = {
    digest: sha256Digest,
    digestAlgorithm: 'SHA-256',
    timestamp: Date.now(),
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(jwsPayload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  if (!privateKey) {
    // Return formatted JWS token for sandbox/testing
    const mockSig = base64UrlEncode(crypto.createHash('sha256').update(signingInput).digest());
    return `${signingInput}.${mockSig}`;
  }

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signingInput);
  signer.end();

  const signature = signer.sign(privateKey);
  const encodedSignature = base64UrlEncode(signature);

  return `${signingInput}.${encodedSignature}`;
}

/**
 * Verify incoming JWS from PayGlocal webhook or callback
 */
function verifyJwsToken(jwsToken, options = {}) {
  try {
    const parts = jwsToken.split('.');
    if (parts.length !== 3) {
      return { valid: false, reason: 'Invalid JWS token format' };
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const header = JSON.parse(base64UrlDecode(encodedHeader));
    const payload = JSON.parse(base64UrlDecode(encodedPayload));

    const publicKey = options.publicKey || getPublicKey();
    if (!publicKey) {
      if (config.isProduction) {
        return {
          valid: false,
          reason: 'PayGlocal public certificate is required to verify signatures in production mode',
        };
      }
      // In sandbox mode without PayGlocal cert, parse safely
      return { valid: true, header, payload, unverifiedCert: true };
    }

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${encodedHeader}.${encodedPayload}`);
    verifier.end();

    const signature = Buffer.from(
      encodedSignature.replace(/-/g, '+').replace(/_/g, '/') +
        '='.repeat((4 - (encodedSignature.length % 4)) % 4),
      'base64'
    );

    const valid = verifier.verify(publicKey, signature);
    return { valid, header, payload };
  } catch (err) {
    return { valid: false, reason: err.message };
  }
}

module.exports = {
  generateJwsToken,
  verifyJwsToken,
  getPrivateKey,
  getPublicKey,
  hasMerchantPrivateKey,
  hasPayGlocalPublicKey,
  base64UrlEncode,
  base64UrlDecode,
};

