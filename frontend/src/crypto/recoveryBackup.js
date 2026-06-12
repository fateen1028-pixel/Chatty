import { getPrivateKey, savePrivateKey } from './storage';

const BACKUP_VERSION = 1;
const KDF_NAME = 'PBKDF2';
const KDF_HASH = 'SHA-256';
const KDF_ITERATIONS = 310000;
const AES_ALGORITHM = 'AES-GCM';
const AES_KEY_LENGTH = 256;

function normalizeRecoveryPhrase(recoveryPhrase) {
    return recoveryPhrase
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}

export function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';

    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
}

export function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes.buffer;
}

export function generateRecoveryKey() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);

    const base64 = arrayBufferToBase64(bytes.buffer)
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replaceAll('=', '');

    return base64.match(/.{1,4}/g).join('-');
}

async function deriveAesKeyFromRecoveryPhrase(recoveryPhrase, salt) {
    const normalizedPhrase = normalizeRecoveryPhrase(recoveryPhrase);
    const encoder = new TextEncoder();

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(normalizedPhrase),
        KDF_NAME,
        false,
        ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
        {
            name: KDF_NAME,
            salt,
            iterations: KDF_ITERATIONS,
            hash: KDF_HASH
        },
        keyMaterial,
        {
            name: AES_ALGORITHM,
            length: AES_KEY_LENGTH
        },
        false,
        ['encrypt', 'decrypt']
    );
}

export async function createEncryptedPrivateKeyBackup(username, recoveryPhrase) {
    if (!username) {
        throw new Error('Username is required');
    }

    if (!recoveryPhrase?.trim()) {
        throw new Error('Recovery phrase is required');
    }

    const privateKey = await getPrivateKey(username);


    if (!privateKey) {
        throw new Error('No private key found on this device');
    }

    const publicKeyStorageKey = `publicKey-${username}`;
    const publicKey = localStorage.getItem(publicKeyStorageKey);

    if (!publicKey) {
        throw new Error('No public key found on this device');
    }

    const exportedPrivateKey = await crypto.subtle.exportKey(
        'pkcs8',
        privateKey
    );

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const aesKey = await deriveAesKeyFromRecoveryPhrase(
        recoveryPhrase,
        salt
    );

    const encryptedPrivateKey = await crypto.subtle.encrypt(
        {
            name: AES_ALGORITHM,
            iv
        },
        aesKey,
        exportedPrivateKey
    );

    return {
        version: BACKUP_VERSION,
        algorithm: AES_ALGORITHM,
        kdf: KDF_NAME,
        hash: KDF_HASH,
        iterations: KDF_ITERATIONS,
        salt: arrayBufferToBase64(salt),
        iv: arrayBufferToBase64(iv),
        encryptedPrivateKey: arrayBufferToBase64(encryptedPrivateKey),
        publicKey,
        createdAt: new Date().toISOString()
    };
}

export async function restorePrivateKeyFromBackup(username, recoveryPhrase, backup) {
    if (!username) {
        throw new Error('Username is required');
    }

    if (!recoveryPhrase?.trim()) {
        throw new Error('Recovery phrase is required');
    }

    if (!backup?.encryptedPrivateKey || !backup?.salt || !backup?.iv) {
        throw new Error('Invalid encrypted backup');
    }

    const salt = new Uint8Array(base64ToArrayBuffer(backup.salt));
    const iv = new Uint8Array(base64ToArrayBuffer(backup.iv));

    const aesKey = await deriveAesKeyFromRecoveryPhrase(
        recoveryPhrase,
        salt
    );

    let decryptedPrivateKey;

    try {
        decryptedPrivateKey = await crypto.subtle.decrypt(
            {
                name: AES_ALGORITHM,
                iv
            },
            aesKey,
            base64ToArrayBuffer(backup.encryptedPrivateKey)
        );
    } catch {
        throw new Error('Invalid recovery phrase or corrupted backup');
    }

    const privateKey = await crypto.subtle.importKey(
        'pkcs8',
        decryptedPrivateKey,
        {
            name: 'RSA-OAEP',
            hash: 'SHA-256'
        },
        true,
        ['decrypt']
    );

    await savePrivateKey(username, privateKey);

    if (!backup.publicKey) {
        throw new Error('Backup is missing public key');
    }

    localStorage.setItem(`publicKey-${username}`, backup.publicKey);

    return {
        privateKey,
        publicKey: backup.publicKey
    };
}