export async function generateAESKey() {

  return await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptMessageAES(
  message,
  aesKey
) {

  const iv =
    crypto.getRandomValues(
      new Uint8Array(12)
    );

  const encoded =
    new TextEncoder()
      .encode(message);

  const encrypted =
    await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv
      },
      aesKey,
      encoded
    );

  return {

    ciphertext:
      arrayBufferToBase64(encrypted),

    iv:
      arrayBufferToBase64(iv)
  };
}

export async function decryptMessageAES(
  ciphertext,
  aesKey,
  iv
) {

  const decrypted =
    await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: base64ToArrayBuffer(iv)
      },
      aesKey,
      base64ToArrayBuffer(ciphertext)
    );

    console.log("ciphertext =", JSON.stringify(ciphertext));
    console.log("iv =", JSON.stringify(iv));

  return new TextDecoder()
    .decode(decrypted);
}


export function arrayBufferToBase64(buffer) {

  return btoa(
    String.fromCharCode(
      ...new Uint8Array(buffer)
    )
  );
}

export function base64ToArrayBuffer(base64) {

    const padded =
        base64 + '='.repeat((4 - base64.length % 4) % 4);

    const binary = atob(padded);

    return Uint8Array.from(
        binary,
        c => c.charCodeAt(0)
    );
}