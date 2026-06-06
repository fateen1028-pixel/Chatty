import {
  generateAESKey,
  encryptMessageAES,
  decryptMessageAES
} from "./aes.js";

import {
  encryptAESKey,
  decryptAESKey
} from "./rsa.js";



export async function encryptChatMessage(
    plaintext,
    senderPublicKey,
    receiverPublicKey
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

  const senderEncryptedAesKey =
      await encryptAESKey(
          aesKey,
          senderPublicKey
      );

  const receiverEncryptedAesKey =
      await encryptAESKey(
          aesKey,
          receiverPublicKey
      );

  return {
    ciphertext,
    iv,
    senderEncryptedAesKey,
    receiverEncryptedAesKey
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