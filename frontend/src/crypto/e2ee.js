import {
  generateAESKey,
  encryptMessageAES,
  decryptMessageAES
} from "./aes.js";

import {
  encryptAESKey,
  decryptAESKey,
  importPublicKey
} from "./rsa.js";

export async function encryptChatMessageForDevices(
    plaintext,
    devices
) {
  const aesKey =
      await generateAESKey();

  const {
    ciphertext,
    iv
  } = await encryptMessageAES(
      plaintext,
      aesKey
  );

  const keys =
      await Promise.all(
          devices.map(async (device) => {
            const publicKey =
                await importPublicKey(
                    device.publicKey
                );

            const encryptedAesKey =
                await encryptAESKey(
                    aesKey,
                    publicKey
                );

            return {
              deviceId: device.deviceId,
              encryptedAesKey
            };
          })
      );

  return {
    ciphertext,
    iv,
    keys
  };
}

export async function decryptChatMessage(
    ciphertext,
    encryptedAesKey,
    iv,
    privateKey
) {
  const aesKey =
      await decryptAESKey(
          encryptedAesKey,
          privateKey
      );

  return await decryptMessageAES(
      ciphertext,
      aesKey,
      iv
  );
}