import { apiFetch } from './api';

export async function createDeviceApprovalRequest(tempPublicKey) {
    const response = await apiFetch('/device-approvals/request', {
        method: 'POST',
        body: JSON.stringify({
            tempPublicKey
        })
    });

    if (!response.ok) {
        throw new Error(await readError(response, 'Failed to create approval request'));
    }

    return await response.json();
}

export async function getPendingDeviceApprovals() {
    const response = await apiFetch('/device-approvals/pending', {
        method: 'GET'
    });

    if (!response.ok) {
        throw new Error(await readError(response, 'Failed to load pending device requests'));
    }

    return await response.json();
}

export async function approveDeviceApproval(approvalId, payload) {
    const response = await apiFetch(`/device-approvals/${approvalId}/approve`, {
        method: 'POST',
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(await readError(response, 'Failed to approve device'));
    }

    return await response.json();
}

export async function rejectDeviceApproval(approvalId) {
    const response = await apiFetch(`/device-approvals/${approvalId}/reject`, {
        method: 'POST'
    });

    if (!response.ok) {
        throw new Error(await readError(response, 'Failed to reject device'));
    }

    return await response.json();
}

export async function getCurrentDeviceApprovalResult() {
    const response = await apiFetch('/device-approvals/current/result', {
        method: 'GET'
    });

    if (!response.ok) {
        throw new Error(await readError(response, 'No approval request found'));
    }

    return await response.json();
}

async function readError(response, fallback) {
    try {
        const data = await response.json();
        return data.message || data.detail || fallback;
    } catch {
        return `${fallback}: ${response.status}`;
    }
}