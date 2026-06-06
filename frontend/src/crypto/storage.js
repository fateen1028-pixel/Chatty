const DB_NAME = 'e2ee-chat';
const STORE_NAME = "keys";


function openDB() {

  return new Promise((resolve, reject) => {

    const request =
      indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {

      const db = request.result;

      if (
        !db.objectStoreNames.contains(
          STORE_NAME
        )
      ) {

        db.createObjectStore(
          STORE_NAME
        );
      }
    };

    request.onsuccess = () =>
      resolve(request.result);

    request.onerror = () =>
      reject(request.error);
  });
}

export async function savePrivateKey(
  username,
  privateKey
) {

  const exported =
    await crypto.subtle.exportKey(
      "pkcs8",
      privateKey
    );

  const db =
    await openDB();

  return new Promise((resolve, reject) => {

    const tx =
      db.transaction(
        STORE_NAME,
        "readwrite"
      );

    tx.objectStore(STORE_NAME)
      .put(
        exported,
        `privateKey-${username}`
      );

    tx.oncomplete = () =>
      resolve();

    tx.onerror = () =>
      reject(tx.error);
  });
}

export async function getPrivateKey(
  username
) {

  const db =
    await openDB();

  return new Promise((resolve, reject) => {

    const tx =
      db.transaction(
        STORE_NAME,
        "readonly"
      );

    const request =
      tx.objectStore(STORE_NAME)
        .get(
          `privateKey-${username}`
        );

    request.onsuccess =
      async () => {

        const keyData =
          request.result;

        if (!keyData) {

          resolve(null);
          return;
        }

        const privateKey =
          await crypto.subtle.importKey(
            "pkcs8",
            keyData,
            {
              name: "RSA-OAEP",
              hash: "SHA-256"
            },
            true,
            ["decrypt"]
          );

        resolve(privateKey);
      };

    request.onerror = () =>
      reject(request.error);
  });
}