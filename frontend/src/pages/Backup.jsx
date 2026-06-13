import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ShieldCheck,
    KeyRound,
    Smartphone,
    CloudUpload,
    CheckCircle2,
    AlertTriangle,
    Copy,
    RefreshCw,
    Eye,
    EyeOff,
    Lock,
    Database,
    Monitor,
    ShieldAlert,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

import {
    createEncryptedPrivateKeyBackup,
    restorePrivateKeyFromBackup
} from '../crypto/recoveryBackup';

import {
    getRecoveryBackupStatus,
    saveRecoveryBackup,
    getRecoveryBackup,
    updateCurrentDevicePublicKey
} from '../services/keyBackupApi';

import {
    approveDeviceApproval,
    createDeviceApprovalRequest,
    getCurrentDeviceApprovalResult,
    getPendingDeviceApprovals,
    rejectDeviceApproval
} from '../services/deviceApprovalApi';

import {
    createApprovedDeviceTransferPackage,
    createTemporaryApprovalKeyPair,
    restoreApprovedDevicePackage
} from '../crypto/deviceApprovalCrypto';

import { getPrivateKey } from '../crypto/storage';
import { decryptAESKey } from '../crypto/rsa';
import { apiFetch } from '../services/api';

import Button from '../components/Button';
import Input from '../components/Input';

function generateRecoveryPhrase() {
    const bytes = new Uint8Array(48);
    crypto.getRandomValues(bytes);

    const chunks = [];

    for (let i = 0; i < bytes.length; i += 4) {
        const chunk = Array.from(bytes.slice(i, i + 4))
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');

        chunks.push(chunk);
    }

    return chunks.join(' ');
}

function formatDateTime(value) {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString();
}

function makeApiError(message, status) {
    const error = new Error(message);
    error.status = status;
    return error;
}

async function getRecentChatsForAccessCheck() {
    const response = await apiFetch('/messages/recent-chats', {
        method: 'GET'
    });

    if (!response.ok) {
        throw makeApiError('Could not check recent chats', response.status);
    }

    const data = await response.json();

    return Array.isArray(data) ? data : [];
}

async function getConversationForAccessCheck(receiverId) {
    const response = await apiFetch(`/messages/chat/${receiverId}`, {
        method: 'GET'
    });

    if (!response.ok) {
        throw makeApiError('Could not check chat messages', response.status);
    }

    const data = await response.json();

    return Array.isArray(data) ? data : [];
}

async function canDecryptMessageKey(encryptedAesKey, privateKey) {
    if (!encryptedAesKey) {
        return false;
    }

    try {
        await decryptAESKey(encryptedAesKey, privateKey);
        return true;
    } catch {
        return false;
    }
}

async function verifyChatAccessWithPrivateKey(privateKey) {
    const recentChats = await getRecentChatsForAccessCheck();

    if (recentChats.length === 0) {
        return {
            trusted: true,
            reason: 'no_chats',
            checkedMessages: 0,
            failedMessages: 0
        };
    }

    const chatsToCheck = recentChats.slice(0, 10);

    let checkedMessages = 0;
    let decryptableMessages = 0;
    let failedMessages = 0;
    let conversationsChecked = 0;

    for (const chat of chatsToCheck) {
        if (!chat?.id) {
            failedMessages += 1;
            continue;
        }

        let messages;

        try {
            messages = await getConversationForAccessCheck(chat.id);
            conversationsChecked += 1;
        } catch {
            failedMessages += 1;
            continue;
        }

        if (!messages.length) {
            continue;
        }

        for (const message of messages) {
            checkedMessages += 1;

            const canDecrypt = await canDecryptMessageKey(
                message.encryptedAesKey,
                privateKey
            );

            if (canDecrypt) {
                decryptableMessages += 1;
            } else {
                failedMessages += 1;
            }
        }
    }

    if (checkedMessages === 0 && recentChats.length > 0) {
        return {
            trusted: false,
            reason: 'no_message_keys_checked',
            checkedMessages,
            failedMessages,
            conversationsChecked
        };
    }

    if (failedMessages > 0) {
        return {
            trusted: false,
            reason: 'some_message_keys_failed',
            checkedMessages,
            decryptableMessages,
            failedMessages,
            conversationsChecked
        };
    }

    if (decryptableMessages > 0) {
        return {
            trusted: true,
            reason: 'message_keys_decrypt',
            checkedMessages,
            decryptableMessages,
            failedMessages,
            conversationsChecked
        };
    }

    return {
        trusted: false,
        reason: 'no_decryptable_keys',
        checkedMessages,
        decryptableMessages,
        failedMessages,
        conversationsChecked
    };
}

function getAccessFailureMessage(reason) {
    if (reason === 'some_message_keys_failed') {
        return 'This device is logged in, but it cannot decrypt one or more old chat keys yet.';
    }

    if (reason === 'no_message_keys_checked') {
        return 'This device could not verify readable chat keys.';
    }

    if (reason === 'no_decryptable_keys') {
        return 'This device has local keys, but they do not unlock old chats.';
    }

    return 'This device cannot read old encrypted chats yet.';
}

export default function Backup() {
    const navigate = useNavigate();

    const username = localStorage.getItem('username') || '';

    const [backupEnabled, setBackupEnabled] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isStatusLoading, setIsStatusLoading] = useState(true);
    const [isSavingBackup, setIsSavingBackup] = useState(false);

    const [deviceAccessStatus, setDeviceAccessStatus] = useState('checking');
    const [deviceAccessDetail, setDeviceAccessDetail] = useState('Checking this device...');

    const [openMenu, setOpenMenu] = useState(null);

    const [activeModal, setActiveModal] = useState(null);

    const [phrase, setPhrase] = useState('');
    const [confirmPhrase, setConfirmPhrase] = useState('');
    const [showPhrase, setShowPhrase] = useState(true);
    const [copied, setCopied] = useState(false);
    const [backupStep, setBackupStep] = useState('intro');

    const [recoverPhrase, setRecoverPhrase] = useState('');
    const [recoverStatus, setRecoverStatus] = useState('idle');

    const [recoverHasTrustedDevice, setRecoverHasTrustedDevice] = useState(null);
    const [recoverHasPhrase, setRecoverHasPhrase] = useState(null);

    const [approveStatus, setApproveStatus] = useState('idle');
    const [approveMode, setApproveMode] = useState(null);

    const [approvalRequest, setApprovalRequest] = useState(null);
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [isCreatingApprovalRequest, setIsCreatingApprovalRequest] = useState(false);
    const [isLoadingPendingApprovals, setIsLoadingPendingApprovals] = useState(false);
    const [isApprovingDevice, setIsApprovingDevice] = useState(false);
    const [approvalPollStatus, setApprovalPollStatus] = useState('idle');

    const [error, setError] = useState('');

    const phraseBlocks = useMemo(() => {
        return phrase ? phrase.split(' ') : [];
    }, [phrase]);

    const pendingApprovalCount = pendingApprovals.length;

    const getRecommendedMenu = (status, enabled, pendingCount) => {
        if (status === 'needs_restore') {
            return 'recover';
        }

        if (status === 'trusted' && pendingCount > 0) {
            return 'approval';
        }

        if (status === 'trusted' && !enabled) {
            return 'backup';
        }

        return null;
    };

    const loadPendingApprovals = async ({ silent = false } = {}) => {
        if (!silent) {
            setIsLoadingPendingApprovals(true);
        }

        try {
            const data = await getPendingDeviceApprovals();
            const list = Array.isArray(data) ? data : [];

            setPendingApprovals(list);
            return list;
        } catch (err) {
            if (!silent) {
                console.error('Failed to load pending approvals:', err);
            }

            setPendingApprovals([]);
            return [];
        } finally {
            if (!silent) {
                setIsLoadingPendingApprovals(false);
            }
        }
    };

    const loadInitialSecurityState = async () => {
        setIsStatusLoading(true);
        setDeviceAccessStatus('checking');
        setDeviceAccessDetail('Checking this device...');

        try {
            const status = await getRecoveryBackupStatus();
            const enabled = Boolean(status.enabled);

            setBackupEnabled(enabled);
            setLastUpdated(status.lastUpdated || null);

            if (!username) {
                setDeviceAccessStatus('unknown');
                setDeviceAccessDetail('Username missing. Log in again.');
                setOpenMenu(null);
                return;
            }

            const localPrivateKey = await getPrivateKey(username).catch(() => null);
            const localPublicKey = localStorage.getItem(`publicKey-${username}`);

            if (!localPrivateKey || !localPublicKey) {
                setDeviceAccessStatus('needs_restore');
                setDeviceAccessDetail('This device does not have a local chat access key.');
                setOpenMenu('recover');
                return;
            }

            let accessCheck;

            try {
                accessCheck = await verifyChatAccessWithPrivateKey(localPrivateKey);
            } catch (err) {
                console.error('Failed to cryptographically verify chat access:', err);

                if (err.status === 400 || err.status === 404) {
                    setDeviceAccessStatus('needs_restore');
                    setDeviceAccessDetail('This device is logged in, but old chat keys are not available here yet.');
                    setOpenMenu('recover');
                    return;
                }

                setDeviceAccessStatus('unknown');
                setDeviceAccessDetail('Could not verify whether this device can read old chats.');
                setOpenMenu('recover');
                return;
            }

            if (!accessCheck.trusted) {
                setDeviceAccessStatus('needs_restore');
                setDeviceAccessDetail(getAccessFailureMessage(accessCheck.reason));
                setOpenMenu('recover');
                return;
            }

            if (enabled) {
                const backup = await getRecoveryBackup().catch(() => null);

                if (backup?.publicKey && localPublicKey !== backup.publicKey) {
                    setDeviceAccessStatus('needs_restore');
                    setDeviceAccessDetail('This device has a different key from your recovery backup. Restore chat access before opening old chats.');
                    setOpenMenu('recover');
                    return;
                }
            }

            const pending = await loadPendingApprovals({ silent: true });

            setDeviceAccessStatus('trusted');

            if (accessCheck.reason === 'no_chats') {
                setDeviceAccessDetail('This device has chat access. No old chats were found to verify.');
            } else {
                setDeviceAccessDetail('This device can decrypt your old chat keys.');
            }

            setOpenMenu(getRecommendedMenu('trusted', enabled, pending.length));
        } catch (err) {
            console.error('Failed to load security state:', err);

            setBackupEnabled(false);
            setLastUpdated(null);
            setDeviceAccessStatus('unknown');
            setDeviceAccessDetail('Could not verify this device access. Try again.');
            setOpenMenu(null);
        } finally {
            setIsStatusLoading(false);
        }
    };

    useEffect(() => {
        loadInitialSecurityState();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [username]);

    const toggleMenu = (menu) => {
        setError('');
        setOpenMenu(prev => prev === menu ? null : menu);

        if (menu === 'approval') {
            loadPendingApprovals({ silent: true });
        }
    };

    const openBackupModal = () => {
        setError('');
        setPhrase('');
        setConfirmPhrase('');
        setShowPhrase(true);
        setCopied(false);
        setBackupStep('intro');
        setActiveModal('backup');
    };

    const openRecoverModal = () => {
        setError('');
        setRecoverPhrase('');
        setRecoverStatus('idle');
        setActiveModal('recover');
    };

    const openApproveModal = async (mode = null) => {
        setError('');
        setApproveStatus('idle');
        setApprovalRequest(null);
        setApprovalPollStatus('idle');
        setApproveMode(mode);
        setActiveModal('approve');

        if (mode === 'trusted') {
            await loadPendingApprovals();
        }
    };

    const chooseNewDeviceMode = () => {
        setError('');
        setApproveMode('new');
    };

    const chooseTrustedDeviceMode = async () => {
        setError('');
        setApproveMode('trusted');
        await loadPendingApprovals();
    };

    const closeModal = () => {
        const isBusy =
            isSavingBackup ||
            recoverStatus === 'loading' ||
            approveStatus === 'loading' ||
            isCreatingApprovalRequest ||
            isApprovingDevice ||
            approvalPollStatus === 'checking';

        if (isBusy) {
            return;
        }

        setActiveModal(null);
        setError('');
    };

    const resetApprovalRequest = () => {
        setApprovalRequest(null);
        setApprovalPollStatus('idle');
        setError('');
    };

    const handleCreateApprovalRequest = async () => {
        setError('');
        setIsCreatingApprovalRequest(true);

        try {
            const { tempPublicKey } = await createTemporaryApprovalKeyPair(username);

            const request = await createDeviceApprovalRequest(tempPublicKey);

            setApprovalRequest(request);
            setApprovalPollStatus('waiting');
        } catch (err) {
            setError(err.message || 'Failed to create approval request');
        } finally {
            setIsCreatingApprovalRequest(false);
        }
    };

    const handleRejectPendingDevice = async (approvalId) => {
        setError('');

        try {
            await rejectDeviceApproval(approvalId);
            await loadPendingApprovals();
            await loadInitialSecurityState();
        } catch (err) {
            setError(err.message || 'Failed to reject device');
        }
    };

    const handleCheckApprovalResult = async () => {
        setError('');
        setApprovalPollStatus('checking');

        try {
            const result = await getCurrentDeviceApprovalResult();

            if (result.status === 'PENDING') {
                setApprovalPollStatus('waiting');
                setError('Still waiting for approval on your trusted device.');
                return;
            }

            if (result.status === 'REJECTED') {
                setApprovalPollStatus('rejected');
                setError('Approval request was rejected. Create a new request or use your recovery phrase.');
                return;
            }

            if (result.status === 'EXPIRED') {
                setApprovalPollStatus('expired');
                setError('Approval request expired. Create a new request.');
                return;
            }

            if (result.status !== 'APPROVED') {
                setApprovalPollStatus('idle');
                setError(`Unknown approval status: ${result.status}`);
                return;
            }

            const restored = await restoreApprovedDevicePackage(username, result);

            await updateCurrentDevicePublicKey(restored.publicKey);
            await loadInitialSecurityState();

            setApprovalPollStatus('approved');
            setApproveStatus('recovered');
        } catch (err) {
            setApprovalPollStatus('waiting');
            setError(err.message || 'Failed to check approval result');
        }
    };

    const handleApprovePendingDevice = async (pendingRequest) => {
        setError('');
        setIsApprovingDevice(true);

        try {
            const payload = await createApprovedDeviceTransferPackage(
                username,
                pendingRequest.tempPublicKey
            );

            await approveDeviceApproval(
                pendingRequest.approvalId,
                payload
            );

            await loadPendingApprovals();
            await loadInitialSecurityState();

            setApproveStatus('done');
        } catch (err) {
            setError(err.message || 'Failed to approve device');
        } finally {
            setIsApprovingDevice(false);
        }
    };

    const handleGeneratePhrase = () => {
        setPhrase(generateRecoveryPhrase());
        setConfirmPhrase('');
        setCopied(false);
        setError('');
        setBackupStep('show');
    };

    const handleCopyPhrase = async () => {
        if (!phrase) {
            return;
        }

        try {
            await navigator.clipboard.writeText(phrase);
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch {
            setError('Failed to copy recovery phrase');
        }
    };

    const handleConfirmBackup = async () => {
        setError('');

        const expected = phrase.trim().toLowerCase();
        const actual = confirmPhrase.trim().toLowerCase();

        if (!username) {
            setError('Username missing. Log in again.');
            return;
        }

        if (!actual) {
            setError('Enter your recovery phrase to confirm.');
            return;
        }

        if (actual !== expected) {
            setError('Recovery phrase does not match.');
            return;
        }

        setIsSavingBackup(true);

        try {
            const encryptedBackup = await createEncryptedPrivateKeyBackup(
                username,
                phrase
            );

            const saved = await saveRecoveryBackup(encryptedBackup);

            setBackupEnabled(true);
            setLastUpdated(saved.lastUpdated || encryptedBackup.createdAt);
            setBackupStep('done');

            await loadInitialSecurityState();
        } catch (err) {
            setError(err.message || 'Failed to enable backup');
        } finally {
            setIsSavingBackup(false);
        }
    };

    const handleRecover = async () => {
        setError('');

        const trimmedPhrase = recoverPhrase.trim().toLowerCase();

        if (!username) {
            setError('Username missing. Log in again.');
            return;
        }

        if (!trimmedPhrase) {
            setError('Recovery phrase is required.');
            return;
        }

        const blockCount = trimmedPhrase.split(/\s+/).length;

        if (blockCount !== 12) {
            setError('Recovery phrase must contain 12 blocks.');
            return;
        }

        setRecoverStatus('loading');

        try {
            const encryptedBackup = await getRecoveryBackup();

            const restored = await restorePrivateKeyFromBackup(
                username,
                trimmedPhrase,
                encryptedBackup
            );

            await updateCurrentDevicePublicKey(restored.publicKey);
            await loadInitialSecurityState();

            setRecoverStatus('done');
        } catch (err) {
            setError(err.message || 'Recovery failed');
            setRecoverStatus('idle');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B0C0E] text-slate-900 dark:text-white px-3 py-4 sm:p-4 transition-colors">
            <div className="max-w-5xl mx-auto py-4 sm:py-8">
                <button
                    onClick={() => navigate('/chat')}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 mb-5 sm:mb-6 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to chat
                </button>

                <PageHeader />

                <DeviceStatusPanel
                    status={deviceAccessStatus}
                    detail={deviceAccessDetail}
                    backupEnabled={backupEnabled}
                    lastUpdated={lastUpdated}
                    isStatusLoading={isStatusLoading}
                    pendingApprovalCount={pendingApprovalCount}
                    onRetry={loadInitialSecurityState}
                />

                <div className="space-y-4">
                    <ProblemMenu
                        icon={CloudUpload}
                        title="Enable backup"
                        question="Want to protect your chats if this device is lost?"
                        badge={backupEnabled ? 'Enabled' : 'Recommended'}
                        tone={backupEnabled ? 'success' : 'warning'}
                        isOpen={openMenu === 'backup'}
                        onToggle={() => toggleMenu('backup')}
                    >
                        <EnableBackupContent
                            status={deviceAccessStatus}
                            backupEnabled={backupEnabled}
                            lastUpdated={lastUpdated}
                            onCreateBackup={openBackupModal}
                            onRestore={() => {
                                setOpenMenu('recover');
                                setRecoverHasTrustedDevice(null);
                                setRecoverHasPhrase(null);
                            }}
                        />
                    </ProblemMenu>

                    <ProblemMenu
                        icon={KeyRound}
                        title="Recover chats"
                        question="Can’t read your old messages on this device?"
                        badge={deviceAccessStatus === 'needs_restore' ? 'Needed' : 'Help'}
                        tone={deviceAccessStatus === 'needs_restore' ? 'warning' : 'neutral'}
                        isOpen={openMenu === 'recover'}
                        onToggle={() => toggleMenu('recover')}
                    >
                        <RecoverChatsContent
                            status={deviceAccessStatus}
                            recoverHasTrustedDevice={recoverHasTrustedDevice}
                            setRecoverHasTrustedDevice={setRecoverHasTrustedDevice}
                            recoverHasPhrase={recoverHasPhrase}
                            setRecoverHasPhrase={setRecoverHasPhrase}
                            onStartApproval={() => openApproveModal('new')}
                            onRecoverWithPhrase={openRecoverModal}
                            onBackToChat={() => navigate('/chat')}
                        />
                    </ProblemMenu>

                    <ProblemMenu
                        icon={Smartphone}
                        title="Device approval"
                        question="Need to approve another device or approve this one?"
                        badge={pendingApprovalCount > 0 ? `${pendingApprovalCount} waiting` : 'Check'}
                        tone={pendingApprovalCount > 0 ? 'warning' : 'blue'}
                        isOpen={openMenu === 'approval'}
                        onToggle={() => toggleMenu('approval')}
                    >
                        <DeviceApprovalContent
                            status={deviceAccessStatus}
                            pendingApprovalCount={pendingApprovalCount}
                            isLoadingPendingApprovals={isLoadingPendingApprovals}
                            pendingApprovals={pendingApprovals}
                            onRefresh={() => loadPendingApprovals()}
                            onReviewRequests={() => openApproveModal('trusted')}
                            onRequestApproval={() => openApproveModal('new')}
                            onRecoverWithPhrase={openRecoverModal}
                        />
                    </ProblemMenu>
                </div>

                {deviceAccessStatus === 'trusted' && backupEnabled && pendingApprovalCount === 0 && (
                    <div className="mt-5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4 flex gap-3">
                        <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" size={20} />

                        <div>
                            <p className="font-bold text-emerald-800 dark:text-emerald-200">
                                Everything looks good. No action needed.
                            </p>

                            <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                                This device can decrypt old chat keys, recovery backup is enabled, and no device is waiting for approval.
                            </p>
                        </div>
                    </div>
                )}

                <div className="mt-5 sm:mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                    <StatusPanel
                        icon={Database}
                        title="Recovery Backup"
                        value={
                            isStatusLoading
                                ? 'Checking...'
                                : backupEnabled
                                    ? 'Enabled'
                                    : 'Not enabled'
                        }
                        detail={
                            lastUpdated
                                ? `Last updated: ${formatDateTime(lastUpdated)}`
                                : 'No recovery phrase created yet'
                        }
                    />

                    <StatusPanel
                        icon={Monitor}
                        title="Current User"
                        value={username || 'Unknown'}
                        detail="This page is protected behind login"
                    />

                    <StatusPanel
                        icon={ShieldAlert}
                        title="Failure Rule"
                        value="No key = no old chats"
                        detail="Without a trusted device or recovery phrase, old encrypted messages stay locked"
                    />
                </div>
            </div>

            {activeModal === 'backup' && (
                <Modal title="Create Recovery Phrase" onClose={closeModal}>
                    {backupStep === 'intro' && (
                        <div className="space-y-5">
                            <WarningBox>
                                This creates a recovery phrase and uses it to encrypt your chat access key locally.
                                The phrase must never be sent to the server.
                            </WarningBox>

                            <StepBox
                                steps={[
                                    'Generate a 12-block recovery phrase',
                                    'Save the phrase somewhere safe',
                                    'Confirm the phrase',
                                    'Encrypt your chat access key locally',
                                    'Upload only the encrypted backup'
                                ]}
                            />

                            <Button onClick={handleGeneratePhrase} className="w-full">
                                Generate Recovery Phrase
                            </Button>
                        </div>
                    )}

                    {backupStep === 'show' && (
                        <div className="space-y-5">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Save this phrase
                                </h3>

                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Write it down. Don’t screenshot it. Don’t share it. If you lose it, recovery is impossible.
                                </p>
                            </div>

                            <div className="bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4">
                                {showPhrase ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                        {phraseBlocks.map((block, index) => (
                                            <div
                                                key={`${block}-${index}`}
                                                className="bg-white dark:bg-[#1A1A1D] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3"
                                            >
                                                <span className="text-xs text-slate-400 mr-2">
                                                    {index + 1}.
                                                </span>

                                                <span className="font-mono font-semibold text-xs sm:text-sm break-all">
                                                    {block}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-32 flex items-center justify-center text-slate-500 dark:text-slate-400 font-semibold">
                                        Recovery phrase hidden
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowPhrase(prev => !prev)}
                                >
                                    {showPhrase ? (
                                        <EyeOff size={17} className="mr-2" />
                                    ) : (
                                        <Eye size={17} className="mr-2" />
                                    )}

                                    {showPhrase ? 'Hide' : 'Show'}
                                </Button>

                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleCopyPhrase}
                                >
                                    {copied ? (
                                        <CheckCircle2 size={17} className="mr-2" />
                                    ) : (
                                        <Copy size={17} className="mr-2" />
                                    )}

                                    {copied ? 'Copied' : 'Copy'}
                                </Button>

                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleGeneratePhrase}
                                >
                                    <RefreshCw size={17} className="mr-2" />
                                    Regenerate
                                </Button>
                            </div>

                            {error && <ErrorText>{error}</ErrorText>}

                            <Button onClick={() => setBackupStep('confirm')} className="w-full">
                                I Saved It
                            </Button>
                        </div>
                    )}

                    {backupStep === 'confirm' && (
                        <div className="space-y-5">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Confirm recovery phrase
                                </h3>

                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Paste or type the full phrase to prove you saved it.
                                </p>
                            </div>

                            <textarea
                                value={confirmPhrase}
                                onChange={(e) => setConfirmPhrase(e.target.value)}
                                rows={4}
                                placeholder="Enter your 12-block recovery phrase"
                                disabled={isSavingBackup}
                                className="w-full bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-slate-400 font-mono text-sm"
                            />

                            {error && <ErrorText>{error}</ErrorText>}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setBackupStep('show')}
                                    disabled={isSavingBackup}
                                >
                                    Back
                                </Button>

                                <Button
                                    onClick={handleConfirmBackup}
                                    disabled={isSavingBackup}
                                >
                                    {isSavingBackup ? 'Encrypting Backup...' : 'Enable Recovery Phrase'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {backupStep === 'done' && (
                        <SuccessState
                            title="Recovery phrase enabled"
                            text="Your chat access key was encrypted locally. Only the encrypted backup was uploaded."
                            buttonText="Done"
                            onClick={closeModal}
                        />
                    )}
                </Modal>
            )}

            {activeModal === 'approve' && (
                <Modal
                    title={
                        approveMode === 'new'
                            ? 'Approve this device'
                            : approveMode === 'trusted'
                                ? 'Review device request'
                                : 'Device approval'
                    }
                    onClose={closeModal}
                >
                    {approveStatus === 'done' && (
                        <SuccessState
                            title="Device approved"
                            text="The new device can now restore encrypted chat access."
                            buttonText="Done"
                            onClick={closeModal}
                        />
                    )}

                    {approveStatus === 'recovered' && (
                        <SuccessState
                            title="This device is approved"
                            text="Your chat access key was restored locally. You can now open your chats."
                            buttonText="Go to Chat"
                            onClick={() => navigate('/chat')}
                        />
                    )}

                    {approveStatus !== 'done' && approveStatus !== 'recovered' && (
                        <div className="space-y-6">
                            {error && <ErrorText>{error}</ErrorText>}

                            {!approveMode && (
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                        Which device are you using right now?
                                    </p>

                                    <ModeChoice
                                        icon={Smartphone}
                                        title="This is my new device"
                                        text="I logged in here and need access to my old encrypted chats."
                                        buttonText="Request approval"
                                        onClick={chooseNewDeviceMode}
                                    />

                                    <ModeChoice
                                        icon={ShieldCheck}
                                        title="This is my trusted device"
                                        text="I want to approve another device that is waiting for access."
                                        buttonText="View requests"
                                        onClick={chooseTrustedDeviceMode}
                                    />
                                </div>
                            )}

                            {approveMode === 'new' && (
                                <div className="space-y-5">
                                    <WarningBox>
                                        Keep your trusted device nearby. This device will show a code. Approve only if the same code appears on your trusted device.
                                    </WarningBox>

                                    {!approvalRequest ? (
                                        <div className="space-y-5">
                                            <StepBox
                                                steps={[
                                                    'Create an approval request on this device',
                                                    'Open Encrypted Chat Access on your trusted device',
                                                    'Open Device approval there',
                                                    'Approve only if the code matches'
                                                ]}
                                            />

                                            <Button
                                                onClick={handleCreateApprovalRequest}
                                                disabled={isCreatingApprovalRequest}
                                                className="w-full"
                                            >
                                                {isCreatingApprovalRequest
                                                    ? 'Creating request...'
                                                    : 'Start approval request'}
                                            </Button>

                                            <Button
                                                variant="secondary"
                                                onClick={openRecoverModal}
                                                className="w-full"
                                            >
                                                I do not have my trusted device
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-5">
                                            <div className="bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 rounded-2xl p-5 text-center">
                                                <p className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-3">
                                                    Match this code on your trusted device
                                                </p>

                                                <div className="text-3xl sm:text-4xl font-black tracking-[0.18em] sm:tracking-[0.25em] text-cyan-700 dark:text-cyan-300 break-all">
                                                    {approvalRequest.verificationCode}
                                                </div>
                                            </div>

                                            <StepBox
                                                steps={[
                                                    'Open ChatApp on your trusted device',
                                                    'Go to Encrypted Chat Access',
                                                    'Open Device approval',
                                                    'Approve only if the code matches'
                                                ]}
                                            />

                                            <div className="space-y-3">
                                                <Button
                                                    onClick={handleCheckApprovalResult}
                                                    disabled={approvalPollStatus === 'checking'}
                                                    className="w-full"
                                                >
                                                    {approvalPollStatus === 'checking'
                                                        ? 'Checking...'
                                                        : 'I approved it, check now'}
                                                </Button>

                                                {(approvalPollStatus === 'expired' || approvalPollStatus === 'rejected') && (
                                                    <Button
                                                        variant="secondary"
                                                        onClick={resetApprovalRequest}
                                                        className="w-full"
                                                    >
                                                        Create a new request
                                                    </Button>
                                                )}

                                                <Button
                                                    variant="secondary"
                                                    onClick={openRecoverModal}
                                                    className="w-full"
                                                >
                                                    Use recovery phrase instead
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {approveMode === 'trusted' && (
                                <div className="space-y-5">
                                    <WarningBox>
                                        Approving allows the new device to read your encrypted chat history. Only approve if the code matches on both devices.
                                    </WarningBox>

                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">
                                                Devices waiting for approval
                                            </h3>

                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                Compare the code shown here with the code on the new device.
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => loadPendingApprovals()}
                                            className="text-sm sm:text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline self-start sm:self-auto"
                                        >
                                            Refresh
                                        </button>
                                    </div>

                                    {isLoadingPendingApprovals ? (
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Loading pending requests...
                                        </p>
                                    ) : pendingApprovals.length === 0 ? (
                                        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                                            <p className="font-bold text-slate-900 dark:text-white">
                                                No devices are waiting.
                                            </p>

                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                On the new device, open Device approval and tap “Start approval request” first.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {pendingApprovals.map(request => (
                                                <div
                                                    key={request.approvalId}
                                                    className="bg-white dark:bg-[#1A1A1D] border border-slate-200 dark:border-slate-800 rounded-2xl p-4"
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 dark:text-white">
                                                                New device request
                                                            </h4>

                                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                                {request.deviceName}
                                                            </p>

                                                            <p className="text-xs text-slate-400 mt-1">
                                                                Device ID: {request.newDeviceId}
                                                            </p>
                                                        </div>

                                                        <div className="sm:text-right">
                                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                                                Code
                                                            </p>

                                                            <span className="text-2xl font-black tracking-widest text-cyan-600 dark:text-cyan-400">
                                                                {request.verificationCode}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3 mb-4">
                                                        Approve only if this code matches the code shown on your new device.
                                                    </p>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        <Button
                                                            variant="secondary"
                                                            onClick={() => handleRejectPendingDevice(request.approvalId)}
                                                            disabled={isApprovingDevice}
                                                        >
                                                            Reject
                                                        </Button>

                                                        <Button
                                                            onClick={() => handleApprovePendingDevice(request)}
                                                            disabled={isApprovingDevice}
                                                        >
                                                            {isApprovingDevice
                                                                ? 'Approving...'
                                                                : 'Approve this device'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </Modal>
            )}

            {activeModal === 'recover' && (
                <Modal title="Recover with Phrase" onClose={closeModal}>
                    {recoverStatus !== 'done' ? (
                        <div className="space-y-5">
                            <WarningBox>
                                Use this only when the old trusted device is lost. The phrase is used locally and is not sent to the server.
                            </WarningBox>

                            <Input
                                type="text"
                                placeholder="Username"
                                value={username || 'Unknown'}
                                disabled
                            />

                            <textarea
                                value={recoverPhrase}
                                onChange={(e) => setRecoverPhrase(e.target.value)}
                                rows={4}
                                placeholder="Enter your 12-block recovery phrase"
                                disabled={recoverStatus === 'loading'}
                                className="w-full bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-slate-400 font-mono text-sm"
                            />

                            {error && <ErrorText>{error}</ErrorText>}

                            <StepBox
                                steps={[
                                    'Download encrypted chat access backup',
                                    'Use your recovery phrase locally',
                                    'Restore your chat access key on this device',
                                    'Update this device as trusted',
                                    'Open chats again'
                                ]}
                            />

                            <Button
                                onClick={handleRecover}
                                className="w-full"
                                disabled={recoverStatus === 'loading'}
                            >
                                {recoverStatus === 'loading' ? 'Recovering...' : 'Recover Chat Access'}
                            </Button>
                        </div>
                    ) : (
                        <SuccessState
                            title="Chat access recovered"
                            text="Your chat access key was restored locally and saved on this device."
                            buttonText="Go to Chat"
                            onClick={() => navigate('/chat')}
                        />
                    )}
                </Modal>
            )}
        </div>
    );
}

function PageHeader() {
    return (
        <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 flex-shrink-0">
                    <ShieldCheck size={30} />
                </div>

                <div>
                    <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Encrypted Chat Access
                    </h1>

                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Protect, recover, or approve access to your encrypted messages.
                    </p>
                </div>
            </div>

            <div className="mt-5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-4 flex gap-3">
                <Lock className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />

                <p className="text-sm text-blue-800 dark:text-blue-200/90 leading-relaxed">
                    This page does not trust a device just because it has a local key. It verifies whether the device can decrypt old chat keys.
                </p>
            </div>
        </div>
    );
}

function DeviceStatusPanel({
                               status,
                               detail,
                               backupEnabled,
                               lastUpdated,
                               isStatusLoading,
                               pendingApprovalCount,
                               onRetry
                           }) {
    const isTrusted = status === 'trusted';
    const needsRestore = status === 'needs_restore';
    const unknown = status === 'unknown';
    const hasPending = pendingApprovalCount > 0;

    let title = 'Checking this device...';
    let tone = 'neutral';

    if (isTrusted) {
        title = 'This is a trusted device';
        tone = hasPending ? 'warning' : 'success';
    }

    if (needsRestore) {
        title = 'This device needs chat access';
        tone = 'warning';
    }

    if (unknown) {
        title = 'Could not check chat access';
        tone = 'neutral';
    }

    return (
        <div
            className={`mb-5 sm:mb-6 border rounded-[1.5rem] p-5 sm:p-6 ${
                tone === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
                    : tone === 'warning'
                        ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
                        : 'bg-white dark:bg-[#111113] border-slate-200 dark:border-slate-800'
            }`}
        >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                <div className="flex items-start gap-4">
                    <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                            tone === 'success'
                                ? 'bg-emerald-500 text-white'
                                : tone === 'warning'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-slate-500 text-white'
                        }`}
                    >
                        {isTrusted ? <ShieldCheck size={25} /> : <AlertTriangle size={25} />}
                    </div>

                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
                            Current device
                        </p>

                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                            {title}
                        </h2>

                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                            {detail}
                        </p>

                        {hasPending && isTrusted && (
                            <p className="text-sm font-bold text-amber-700 dark:text-amber-300 mt-3">
                                {pendingApprovalCount} device request{pendingApprovalCount > 1 ? 's' : ''} waiting for approval.
                            </p>
                        )}

                        {unknown && (
                            <Button
                                variant="secondary"
                                onClick={onRetry}
                                className="mt-4"
                            >
                                Retry check
                            </Button>
                        )}
                    </div>
                </div>

                <div className="bg-white/70 dark:bg-black/20 border border-white/60 dark:border-white/10 rounded-2xl p-4 min-w-full lg:min-w-[260px]">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Recovery phrase:{' '}
                        <span className="font-bold">
                            {isStatusLoading ? 'Checking...' : backupEnabled ? 'Enabled' : 'Not enabled'}
                        </span>
                    </p>

                    {lastUpdated ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Last updated: {formatDateTime(lastUpdated)}
                        </p>
                    ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            No recovery phrase created yet.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

function ProblemMenu({
                         icon: Icon,
                         title,
                         question,
                         badge,
                         tone,
                         isOpen,
                         onToggle,
                         children
                     }) {
    return (
        <div className="bg-white/90 dark:bg-[#111113]/90 border border-slate-200/70 dark:border-slate-800 rounded-[1.5rem] overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none">
            <button
                type="button"
                onClick={onToggle}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
            >
                <div className="flex items-start gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
                        <Icon size={23} />
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                                {title}
                            </h2>

                            <Badge tone={tone}>
                                {badge}
                            </Badge>
                        </div>

                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                            {question}
                        </p>
                    </div>
                </div>

                <div className="flex-shrink-0 text-slate-400">
                    {isOpen ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                </div>
            </button>

            {isOpen && (
                <div className="px-4 sm:px-5 pb-5">
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
}

function EnableBackupContent({
                                 status,
                                 backupEnabled,
                                 lastUpdated,
                                 onCreateBackup,
                                 onRestore
                             }) {
    const trusted = status === 'trusted';

    if (!trusted) {
        return (
            <div className="space-y-4">
                <WarningBox>
                    This device cannot create a recovery backup yet because it does not have verified chat access.
                    Restore chat access first.
                </WarningBox>

                <Button onClick={onRestore} className="w-full sm:w-auto">
                    Restore chat access first
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                    {backupEnabled ? 'Recovery phrase is enabled' : 'Create a recovery phrase'}
                </h3>

                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {backupEnabled
                        ? 'Your encrypted chats can be recovered using your saved recovery phrase. Update it only if you want to replace the old one.'
                        : 'If you lose all trusted devices, your old encrypted messages may be lost. Create a recovery phrase now.'}
                </p>

                {lastUpdated && (
                    <p className="text-xs text-slate-400 mt-2">
                        Last updated: {formatDateTime(lastUpdated)}
                    </p>
                )}
            </div>

            <Button onClick={onCreateBackup} className="w-full sm:w-auto">
                {backupEnabled ? 'Update recovery phrase' : 'Create recovery phrase'}
            </Button>
        </div>
    );
}

function RecoverChatsContent({
                                 status,
                                 recoverHasTrustedDevice,
                                 setRecoverHasTrustedDevice,
                                 recoverHasPhrase,
                                 setRecoverHasPhrase,
                                 onStartApproval,
                                 onRecoverWithPhrase,
                                 onBackToChat
                             }) {
    if (status === 'trusted') {
        return (
            <div className="space-y-4">
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4">
                    <p className="font-bold text-emerald-800 dark:text-emerald-200">
                        This device already has verified chat access.
                    </p>

                    <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                        Use this section on the device where old chats are not readable.
                    </p>
                </div>

                <Button variant="secondary" onClick={onBackToChat} className="w-full sm:w-auto">
                    Back to chat
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <QuestionBlock
                question="Do you still have another trusted device?"
                description="Example: your old phone, old laptop, or another browser where your chats are still readable."
                leftText="Yes, I have it"
                rightText="No, I lost it"
                value={recoverHasTrustedDevice}
                onLeft={() => {
                    setRecoverHasTrustedDevice('yes');
                    setRecoverHasPhrase(null);
                }}
                onRight={() => {
                    setRecoverHasTrustedDevice('no');
                    setRecoverHasPhrase(null);
                }}
            />

            {recoverHasTrustedDevice === 'yes' && (
                <div className="space-y-4">
                    <InfoBox>
                        Use trusted-device approval. This device will show a code. Approve the same code from your old trusted device.
                    </InfoBox>

                    <Button onClick={onStartApproval} className="w-full sm:w-auto">
                        Start approval request
                    </Button>
                </div>
            )}

            {recoverHasTrustedDevice === 'no' && (
                <div className="space-y-5">
                    <QuestionBlock
                        question="Do you have your recovery phrase?"
                        description="This is the 12-block phrase you created when enabling backup."
                        leftText="Yes, I have the phrase"
                        rightText="No, I don’t have it"
                        value={recoverHasPhrase}
                        onLeft={() => setRecoverHasPhrase('yes')}
                        onRight={() => setRecoverHasPhrase('no')}
                    />

                    {recoverHasPhrase === 'yes' && (
                        <div className="space-y-4">
                            <InfoBox>
                                Use your recovery phrase to restore chat access on this device. The phrase stays local and is not sent to the server.
                            </InfoBox>

                            <Button onClick={onRecoverWithPhrase} className="w-full sm:w-auto">
                                Recover with phrase
                            </Button>
                        </div>
                    )}

                    {recoverHasPhrase === 'no' && (
                        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-4">
                            <p className="font-bold text-red-700 dark:text-red-300">
                                Recovery is not possible.
                            </p>

                            <p className="text-sm text-red-600 dark:text-red-300 mt-1 leading-relaxed">
                                Your encrypted messages need either a trusted device or your recovery phrase.
                                Without both, old encrypted messages cannot be restored.
                            </p>

                            <Button variant="secondary" onClick={onBackToChat} className="mt-4 w-full sm:w-auto">
                                Back to chat
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function DeviceApprovalContent({
                                   status,
                                   pendingApprovalCount,
                                   isLoadingPendingApprovals,
                                   pendingApprovals,
                                   onRefresh,
                                   onReviewRequests,
                                   onRequestApproval,
                                   onRecoverWithPhrase
                               }) {
    if (status === 'trusted') {
        return (
            <div className="space-y-4">
                <InfoBox>
                    This is a trusted device. You can approve another device from here.
                </InfoBox>

                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                                Pending requests
                            </p>

                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {isLoadingPendingApprovals
                                    ? 'Checking requests...'
                                    : pendingApprovalCount > 0
                                        ? `${pendingApprovalCount} device${pendingApprovalCount > 1 ? 's' : ''} waiting for approval.`
                                        : 'No devices are waiting.'}
                            </p>
                        </div>

                        <button
                            onClick={onRefresh}
                            className="text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:underline self-start sm:self-auto"
                        >
                            Refresh
                        </button>
                    </div>

                    {pendingApprovals.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {pendingApprovals.slice(0, 2).map(request => (
                                <div
                                    key={request.approvalId}
                                    className="bg-white dark:bg-[#111113] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 flex items-center justify-between gap-3"
                                >
                                    <div>
                                        <p className="font-semibold text-sm text-slate-900 dark:text-white">
                                            {request.deviceName}
                                        </p>

                                        <p className="text-xs text-slate-400">
                                            Code: {request.verificationCode}
                                        </p>
                                    </div>

                                    <span className="text-xs font-bold text-amber-600 dark:text-amber-300">
                                        Waiting
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Button onClick={onReviewRequests} className="w-full sm:w-auto">
                    Review device requests
                </Button>
            </div>
        );
    }

    if (status === 'needs_restore') {
        return (
            <div className="space-y-4">
                <WarningBox>
                    This device is not trusted yet. To read old chats here, approve this device from a trusted device or recover using your phrase.
                </WarningBox>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button onClick={onRequestApproval} className="w-full">
                        Request approval from trusted device
                    </Button>

                    <Button variant="secondary" onClick={onRecoverWithPhrase} className="w-full">
                        Recover using phrase
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <WarningBox>
                Device status could not be verified. Try refreshing, or use recovery if this device cannot read old chats.
            </WarningBox>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button onClick={onRequestApproval} className="w-full">
                    Request approval
                </Button>

                <Button variant="secondary" onClick={onRecoverWithPhrase} className="w-full">
                    Recover using phrase
                </Button>
            </div>
        </div>
    );
}

function QuestionBlock({
                           question,
                           description,
                           leftText,
                           rightText,
                           value,
                           onLeft,
                           onRight
                       }) {
    return (
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <h3 className="font-bold text-slate-900 dark:text-white">
                {question}
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <Button
                    variant={value === 'yes' ? 'primary' : 'secondary'}
                    onClick={onLeft}
                    className="w-full"
                >
                    {leftText}
                </Button>

                <Button
                    variant={value === 'no' ? 'primary' : 'secondary'}
                    onClick={onRight}
                    className="w-full"
                >
                    {rightText}
                </Button>
            </div>
        </div>
    );
}

function StatusPanel({ icon: Icon, title, value, detail }) {
    return (
        <div className="bg-white/70 dark:bg-[#111113]/70 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
                    <Icon size={21} />
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white">
                    {title}
                </h3>
            </div>

            <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 break-words">
                {value}
            </p>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {detail}
            </p>
        </div>
    );
}

function Modal({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[90vh] bg-white dark:bg-[#111113] border border-slate-200 dark:border-slate-800 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
                <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 flex-shrink-0">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        {title}
                    </h2>

                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors font-bold flex-shrink-0"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                <div className="p-4 sm:p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

function Badge({ tone, children }) {
    const tones = {
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
        neutral: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20',
        warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20'
    };

    return (
        <span className={`px-3 py-1 rounded-full border text-xs font-bold whitespace-nowrap ${tones[tone] || tones.neutral}`}>
            {children}
        </span>
    );
}

function WarningBox({ children }) {
    return (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex gap-3">
            <AlertTriangle
                className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                size={20}
            />

            <p className="text-sm text-amber-700 dark:text-amber-200/90 leading-relaxed">
                {children}
            </p>
        </div>
    );
}

function InfoBox({ children }) {
    return (
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200/90 leading-relaxed">
                {children}
            </p>
        </div>
    );
}

function ErrorText({ children }) {
    return (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl px-4 py-3">
            <p className="text-sm font-semibold text-red-600 dark:text-red-300">
                {children}
            </p>
        </div>
    );
}

function ModeChoice({ icon: Icon, title, text, buttonText, onClick }) {
    return (
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
                    <Icon size={22} />
                </div>

                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                        {title}
                    </h3>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {text}
                    </p>
                </div>
            </div>

            <Button onClick={onClick} className="w-full">
                {buttonText}
            </Button>
        </div>
    );
}

function StepBox({ steps }) {
    return (
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3">
                What to do
            </h3>

            <div className="space-y-3">
                {steps.map((step, index) => (
                    <div key={step} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-cyan-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {index + 1}
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {step}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SuccessState({ title, text, buttonText, onClick }) {
    return (
        <div className="text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 size={42} />
            </div>

            <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {title}
                </h3>

                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {text}
                </p>
            </div>

            <Button onClick={onClick} className="w-full">
                {buttonText}
            </Button>
        </div>
    );
}