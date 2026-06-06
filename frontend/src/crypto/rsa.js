export async function generateRSAKeys() {

  return await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent:
        new Uint8Array([1,0,1]),
      hash: "SHA-256"
    },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptAESKey(
  aesKey,
  publicKey
) {

  const exportedAES =
    await crypto.subtle.exportKey(
      "raw",
      aesKey
    );

  const encrypted =
    await crypto.subtle.encrypt(
      {
        name: "RSA-OAEP"
      },
      publicKey,
      exportedAES
    );

  return arrayBufferToBase64(
    encrypted
  );
}


export async function decryptAESKey(
  encryptedAESKey,
  privateKey
) {

  const decrypted =
    await crypto.subtle.decrypt(
      {
        name: "RSA-OAEP"
      },
      privateKey,
      base64ToArrayBuffer(
        encryptedAESKey
      )
    );

  return await crypto.subtle.importKey(
    "raw",
    decrypted,
    {
      name: "AES-GCM"
    },
    true,
    ["decrypt"]
  );
}

export async function importPublicKey(pem) {
  const binaryDer = base64ToArrayBuffer(pem);
  return await crypto.subtle.importKey(
    "spki",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );
}

export function arrayBufferToBase64(buffer) {

  return btoa(
    String.fromCharCode(
      ...new Uint8Array(buffer)
    )
  );
}

export function base64ToArrayBuffer(base64) {

  const binary =
    atob(base64);

  return Uint8Array.from(
    binary,
    c => c.charCodeAt(0)
  );
}