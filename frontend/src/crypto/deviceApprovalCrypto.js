import { getPrivateKey, savePrivateKey } from './storage';
import {
    generateRSAKeys,
    arrayBufferToBase64,
    base64ToArrayBuffer,
    importPublicKey
} from './rsa';

const TEMP_PRIVATE_KEY_PREFIX = 'approvalTempPrivateKey';

function getTempPrivateKeyStorageKey(username) {
    return `${TEMP_PRIVATE_KEY_PREFIX}-${username}`;
}

export async function createTemporaryApprovalKeyPair(username) {
    if (!username) {
        throw new Error('Username is required');
    }

    const keyPair = await generateRSAKeys();

    const exportedPublicKey = await crypto.subtle.exportKey(
        'spki',
        keyPair.publicKey
    );

    const exportedPrivateKey = await crypto.subtle.exportKey(
        'pkcs8',
        keyPair.privateKey
    );

    const tempPublicKey = arrayBufferToBase64(exportedPublicKey);
    const tempPrivateKey = arrayBufferToBase64(exportedPrivateKey);

    localStorage.setItem(
        getTempPrivateKeyStorageKey(username),
        tempPrivateKey
    );

    return {
        tempPublicKey
    };
}

export async function createApprovedDeviceTransferPackage(username, tempPublicKey) {
    if (!username) {
        throw new Error('Username is required');
    }

    if (!tempPublicKey) {
        throw new Error('Temporary public key is missing');
    }

    const accountPrivateKey = await getPrivateKey(username);

    if (!accountPrivateKey) {
        throw new Error('No private key found on this trusted device');
    }

    const accountPublicKey = localStorage.getItem(`publicKey-${username}`);

    if (!accountPublicKey) {
        throw new Error('No account public key found on this trusted device');
    }

    const exportedPrivateKey = await crypto.subtle.exportKey(
        'pkcs8',
        accountPrivateKey
    );

    const aesKey = await crypto.subtle.generateKey(
        {
            name: 'AES-GCM',
            length: 256
        },
        true,
        ['encrypt', 'decrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedPrivateKey = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv
        },
        aesKey,
        exportedPrivateKey
    );

    const rawAesKey = await crypto.subtle.exportKey(
        'raw',
        aesKey
    );

    const importedTempPublicKey = await importPublicKey(tempPublicKey);

    const encryptedAesKey = await crypto.subtle.encrypt(
        {
            name: 'RSA-OAEP'
        },
        importedTempPublicKey,
        rawAesKey
    );

    return {
        encryptedPrivateKey: arrayBufferToBase64(encryptedPrivateKey),
        encryptedAesKey: arrayBufferToBase64(encryptedAesKey),
        iv: arrayBufferToBase64(iv),
        accountPublicKey
    };
}

export async function restoreApprovedDevicePackage(username, approvalResult) {
    if (!username) {
        throw new Error('Username is required');
    }

    const tempPrivateKeyBase64 = localStorage.getItem(
        getTempPrivateKeyStorageKey(username)
    );

    if (!tempPrivateKeyBase64) {
        throw new Error('Temporary approval private key missing on this device');
    }

    if (
        !approvalResult?.encryptedPrivateKey ||
        !approvalResult?.encryptedAesKey ||
        !approvalResult?.iv ||
        !approvalResult?.accountPublicKey
    ) {
        throw new Error('Approval result is missing encrypted key data');
    }

    const tempPrivateKey = await crypto.subtle.importKey(
        'pkcs8',
        base64ToArrayBuffer(tempPrivateKeyBase64),
        {
            name: 'RSA-OAEP',
            hash: 'SHA-256'
        },
        true,
        ['decrypt']
    );

    const rawAesKey = await crypto.subtle.decrypt(
        {
            name: 'RSA-OAEP'
        },
        tempPrivateKey,
        base64ToArrayBuffer(approvalResult.encryptedAesKey)
    );

    const aesKey = await crypto.subtle.importKey(
        'raw',
        rawAesKey,
        {
            name: 'AES-GCM'
        },
        false,
        ['decrypt']
    );

    const decryptedPrivateKey = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: base64ToArrayBuffer(approvalResult.iv)
        },
        aesKey,
        base64ToArrayBuffer(approvalResult.encryptedPrivateKey)
    );

    const restoredPrivateKey = await crypto.subtle.importKey(
        'pkcs8',
        decryptedPrivateKey,
        {
            name: 'RSA-OAEP',
            hash: 'SHA-256'
        },
        true,
        ['decrypt']
    );

    await savePrivateKey(username, restoredPrivateKey);

    localStorage.setItem(
        `publicKey-${username}`,
        approvalResult.accountPublicKey
    );

    localStorage.removeItem(
        getTempPrivateKeyStorageKey(username)
    );

    return {
        privateKey: restoredPrivateKey,
        publicKey: approvalResult.accountPublicKey
    };
}