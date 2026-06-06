import {
    generateRSAKeys,
    arrayBufferToBase64
} from "./rsa.js";

import {
    savePrivateKey,
    getPrivateKey
} from "./storage.js";

function getOrCreateDeviceFingerprint(username) {
    const key = `deviceFingerprint-${username}`;

    let fingerprint =
        localStorage.getItem(key);

    if (!fingerprint) {
        fingerprint = crypto.randomUUID();
        localStorage.setItem(key, fingerprint);
    }

    return fingerprint;
}

function getDeviceName() {
    const ua = navigator.userAgent;

    if (ua.includes("Firefox")) return "Firefox Browser";
    if (ua.includes("Edg")) return "Edge Browser";
    if (ua.includes("Chrome")) return "Chrome Browser";
    if (ua.includes("Safari")) return "Safari Browser";

    return "Unknown Browser";
}

export async function prepareDeviceForLogin(username) {
    const deviceFingerprint =
        getOrCreateDeviceFingerprint(username);

    const publicKeyStorageKey =
        `publicKey-${username}`;

    const existingPrivateKey =
        await getPrivateKey(username);

    const existingPublicKey =
        localStorage.getItem(publicKeyStorageKey);

    if (existingPrivateKey && existingPublicKey) {
        return {
            deviceName: getDeviceName(),
            deviceFingerprint,
            publicKey: existingPublicKey
        };
    }

    const keyPair =
        await generateRSAKeys();

    const exportedPublicKey =
        await crypto.subtle.exportKey(
            "spki",
            keyPair.publicKey
        );

    const publicKeyBase64 =
        arrayBufferToBase64(exportedPublicKey);

    await savePrivateKey(
        username,
        keyPair.privateKey
    );

    localStorage.setItem(
        publicKeyStorageKey,
        publicKeyBase64
    );

    return {
        deviceName: getDeviceName(),
        deviceFingerprint,
        publicKey: publicKeyBase64
    };
}