
import { generateRSAKeys, arrayBufferToBase64 } from "./rsa.js"
import { savePrivateKey,getPrivateKey } from "./storage.js";

export async function initializeKeys() {
   const username =
      localStorage.getItem("username");

    const existing =
      await getPrivateKey(username);

    if (existing) {
      return;
    }
  
    const keyPair = await generateRSAKeys();
  
    const publicKey = await crypto.subtle.exportKey(
      "spki",
      keyPair.publicKey
    );
  
    const publicKeyBase64 = arrayBufferToBase64(publicKey);
  
    await fetch(`${import.meta.env.VITE_API_URL}/keys/public`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
      },
      body: JSON.stringify({
        publicKey: publicKeyBase64
      })
    });
  
    // store private key (temporary unsafe version for now)
    // const privateKey = await crypto.subtle.exportKey(
    //   "pkcs8",
    //   keyPair.privateKey
    // );
  
    await savePrivateKey(
  username,
  keyPair.privateKey
);
  
    
  }