import { apiFetch } from './api';

export async function getRecoveryBackupStatus() {
    const response = await apiFetch('/key-backup/status', {
        method: 'GET'
    });

    if (!response.ok) {
        throw new Error('Failed to load backup status');
    }

    return await response.json();
}

export async function saveRecoveryBackup(encryptedBackup) {
    const response = await apiFetch('/key-backup', {
        method: 'POST',
        body: JSON.stringify(encryptedBackup)
    });

    if (!response.ok) {
        let message = 'Failed to save encrypted backup';

        try {
            const data = await response.json();
            message = data.message || data.detail || message;
        } catch {
            message = `Server Error: ${response.status}`;
        }

        throw new Error(message);
    }

    return await response.json();
}

export async function getRecoveryBackup() {
    const response = await apiFetch('/key-backup', {
        method: 'GET'
    });

    if (!response.ok) {
        let message = 'Failed to fetch encrypted backup';

        try {
            const data = await response.json();
            message = data.message || data.detail || message;
        } catch {
            message = `Server Error: ${response.status}`;
        }

        throw new Error(message);
    }

    return await response.json();
}

export async function updateCurrentDevicePublicKey(publicKey) {
    const response = await apiFetch('/devices/current/public-key', {
        method: 'PUT',
        body: JSON.stringify({
            publicKey
        })
    });

    if (!response.ok) {
        let message = 'Failed to update current device public key';

        try {
            const data = await response.json();
            message = data.message || data.detail || message;
        } catch {
            message = `Server Error: ${response.status}`;
        }

        throw new Error(message);
    }

    return await response.json();
}