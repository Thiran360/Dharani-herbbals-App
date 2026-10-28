const { execSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');

function computeHash(packageName, certDerBytes) {
  // Signature.toCharsString() in Android:
  // Each byte is converted to 2 lowercase or uppercase hex characters.
  // Wait, let's check Android's Signature.java implementation of toCharsString():
  // public String toCharsString() {
  //     byte[] sig = mSignature;
  //     final int N = sig.length;
  //     final int N2 = N*2;
  //     char[] text = new char[N2];
  //     for (int j=0; j < N; j++) {
  //         byte v = sig[j];
  //         int d = (v>>4)&0xf;
  //         text[j*2] = (char)(d >= 10 ? ('a' + d - 10) : ('0' + d));
  //         d = v&0xf;
  //         text[j*2 + 1] = (char)(d >= 10 ? ('a' + d - 10) : ('0' + d));
  //     }
  //     return new String(text);
  // }
  // That is lower-case hex representation of cert DER bytes!
  const hex = certDerBytes.toString('hex');
  const appInfo = packageName + ' ' + hex;
  const hash = crypto.createHash('sha256').update(appInfo, 'utf8').digest();
  const first9 = hash.slice(0, 9);
  const base64 = first9.toString('base64');
  return base64.slice(0, 11);
}

function getCertDer(keystorePath, alias, storepass) {
  const tmpCert = 'scratch/temp_cert.der';
  execSync(`keytool -exportcert -alias "${alias}" -keystore "${keystorePath}" -storepass "${storepass}" -file "${tmpCert}"`, { stdio: 'pipe' });
  const der = fs.readFileSync(tmpCert);
  fs.unlinkSync(tmpCert);
  return der;
}

try {
  const pkg = 'in.dharaniherbbals.app';

  const debugDer = getCertDer('android/app/debug.keystore', 'androiddebugkey', 'android');
  const debugHash = computeHash(pkg, debugDer);
  console.log(`Debug Keystore Hash: [${debugHash}]`);

  const releaseDer = getCertDer('android/app/dharani-upload-key.keystore', 'dharani-key-alias', 'dharaniherbbals123');
  const releaseHash = computeHash(pkg, releaseDer);
  console.log(`Release Keystore Hash: [${releaseHash}]`);
} catch (e) {
  console.error(e);
}
