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
    ShieldAlert
} from 'lucide-react';

import {
    createEncryptedPrivateKeyBackup,
    restorePrivateKeyFromBackup
} from '../crypto/recoveryBackup';

import {
    getRecoveryBackupStatus,
    saveRecoveryBackup,
    getRecoveryBackup, updateCurrentDevicePublicKey
} from '../services/keyBackupApi';

import Button from '../components/Button';
import Input from '../components/Input';
import {
    approveDeviceApproval,
    createDeviceApprovalRequest, getCurrentDeviceApprovalResult,
    getPendingDeviceApprovals,
    rejectDeviceApproval
} from "../services/deviceApprovalApi.js";
import {
    createApprovedDeviceTransferPackage,
    createTemporaryApprovalKeyPair,
    restoreApprovedDevicePackage
} from "../crypto/deviceApprovalCrypto.js";

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

function generateVerificationCode() {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);

    return String(100000 + (array[0] % 900000));
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





export default function Backup() {
    const navigate = useNavigate();

    const username = localStorage.getItem('username') || '';

    const [backupEnabled, setBackupEnabled] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isStatusLoading, setIsStatusLoading] = useState(true);
    const [isSavingBackup, setIsSavingBackup] = useState(false);

    const [activeModal, setActiveModal] = useState(null);

    const [phrase, setPhrase] = useState('');
    const [confirmPhrase, setConfirmPhrase] = useState('');
    const [showPhrase, setShowPhrase] = useState(true);
    const [copied, setCopied] = useState(false);
    const [backupStep, setBackupStep] = useState('intro');

    const [recoverPhrase, setRecoverPhrase] = useState('');
    const [recoverStatus, setRecoverStatus] = useState('idle');

    const [approveStatus, setApproveStatus] = useState('idle');

    const [error, setError] = useState('');

    const [approvalRequest, setApprovalRequest] = useState(null);
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [isCreatingApprovalRequest, setIsCreatingApprovalRequest] = useState(false);
    const [isLoadingPendingApprovals, setIsLoadingPendingApprovals] = useState(false);
    const [isApprovingDevice, setIsApprovingDevice] = useState(false);
    const [approvalPollStatus, setApprovalPollStatus] = useState('idle');

    useEffect(() => {
        const loadBackupStatus = async () => {
            setIsStatusLoading(true);

            try {
                const status = await getRecoveryBackupStatus();

                setBackupEnabled(Boolean(status.enabled));
                setLastUpdated(status.lastUpdated || null);
            } catch (err) {
                console.error('Failed to load backup status:', err);
                setBackupEnabled(false);
                setLastUpdated(null);
            } finally {
                setIsStatusLoading(false);
            }
        };

        loadBackupStatus();
    }, []);

    const verificationCode = useMemo(() => {
        return generateVerificationCode();
    }, [activeModal]);

    const phraseBlocks = useMemo(() => {
        return phrase ? phrase.split(' ') : [];
    }, [phrase]);

    const loadPendingApprovals = async () => {
        setIsLoadingPendingApprovals(true);

        try {
            const data = await getPendingDeviceApprovals();
            setPendingApprovals(data);
        } catch (err) {
            console.error('Failed to load pending approvals:', err);
            setPendingApprovals([]);
        } finally {
            setIsLoadingPendingApprovals(false);
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

    const openApproveModal = async () => {
        setError('');
        setApproveStatus('idle');
        setApprovalRequest(null);
        setPendingApprovals([]);
        setApprovalPollStatus('idle');
        setActiveModal('approve');

        await loadPendingApprovals();
    };

    const openRecoverModal = () => {
        setError('');
        setRecoverPhrase('');
        setRecoverStatus('idle');
        setActiveModal('recover');
    };

    const closeModal = () => {
        if (isSavingBackup || recoverStatus === 'loading' || approveStatus === 'loading') {
            return;
        }

        setActiveModal(null);
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
                setError('Still waiting for approval on trusted device');
                return;
            }

            if (result.status === 'REJECTED') {
                setApprovalPollStatus('rejected');
                setError('Approval request was rejected');
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

            const restored = await restoreApprovedDevicePackage(
                username,
                result
            );

            await updateCurrentDevicePublicKey(restored.publicKey);

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
            setError('Enter your recovery phrase to confirm');
            return;
        }

        if (actual !== expected) {
            setError('Recovery phrase does not match');
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
        } catch (err) {
            setError(err.message || 'Failed to enable backup');
        } finally {
            setIsSavingBackup(false);
        }
    };

    const handleDemoApprove = async () => {
        setApproveStatus('loading');

        await new Promise(resolve => setTimeout(resolve, 800));

        setApproveStatus('done');
    };

    const handleRecover = async () => {
        setError('');

        const trimmedPhrase = recoverPhrase.trim().toLowerCase();

        if (!username) {
            setError('Username missing. Log in again.');
            return;
        }

        if (!trimmedPhrase) {
            setError('Recovery phrase is required');
            return;
        }

        const blockCount = trimmedPhrase.split(/\s+/).length;

        if (blockCount !== 12) {
            setError('Recovery phrase must contain 12 blocks');
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

            setRecoverStatus('done');
        } catch (err) {
            setError(err.message || 'Recovery failed');
            setRecoverStatus('idle');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B0C0E] text-slate-900 dark:text-white p-4 transition-colors">
            <div className="max-w-6xl mx-auto py-8">
                <button
                    onClick={() => navigate('/chat')}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to chat
                </button>

                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <ShieldCheck size={30} />
                        </div>

                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Security & Recovery
                            </h1>

                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                Manage encrypted backup, trusted device approval, and lost-device recovery.
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-4 flex gap-3">
                        <Lock className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />

                        <p className="text-sm text-blue-800 dark:text-blue-200/90 leading-relaxed">
                            Private keys should never be sent in plaintext. Recovery must happen locally on the device.
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-5">
                    <SecurityCard
                        icon={CloudUpload}
                        title="Encrypted Recovery Backup"
                        badge={backupEnabled ? 'ON' : 'OFF'}
                        badgeTone={backupEnabled ? 'success' : 'neutral'}
                        description="Create an encrypted backup of this device private key using a recovery phrase."
                        points={[
                            'Generate recovery phrase',
                            'Encrypt private key locally',
                            'Upload only encrypted backup',
                            'Useful when all devices are lost'
                        ]}
                        buttonText={backupEnabled ? 'Update Backup' : 'Turn On Backup'}
                        onClick={openBackupModal}
                    />

                    <SecurityCard
                        icon={Smartphone}
                        title="Approve New Device"
                        badge="Trusted Device"
                        badgeTone="purple"
                        description="Use an existing trusted device to approve a new device login."
                        points={[
                            'View pending device request',
                            'Match 6-digit verification code',
                            'Approve trusted device',
                            'Re-wrap message keys'
                        ]}
                        buttonText="Approve Device"
                        onClick={openApproveModal}
                    />

                    <SecurityCard
                        icon={KeyRound}
                        title="Recover with Phrase"
                        badge="Lost Device"
                        badgeTone="warning"
                        description="Use this when the old trusted device is lost and backup is enabled."
                        points={[
                            'Enter recovery phrase locally',
                            'Download encrypted backup',
                            'Restore private key',
                            'Recover old chat access'
                        ]}
                        buttonText="Recover Access"
                        onClick={openRecoverModal}
                    />
                </div>

                <div className="mt-6 grid md:grid-cols-3 gap-5">
                    <StatusPanel
                        icon={Database}
                        title="Backup Status"
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
                                : 'No backup created yet'
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
                        value="No phrase = no recovery"
                        detail="If every trusted device is lost and no phrase exists, old messages stay locked"
                    />
                </div>
            </div>

            {activeModal === 'backup' && (
                <Modal title="Encrypted Recovery Backup" onClose={closeModal}>
                    {backupStep === 'intro' && (
                        <div className="space-y-5">
                            <WarningBox>
                                This will create a recovery phrase and use it to encrypt your private key locally.
                                The phrase must never be sent to the server.
                            </WarningBox>

                            <FlowList
                                items={[
                                    'Generate 12-block recovery phrase',
                                    'User confirms the phrase',
                                    'Fetch private key from IndexedDB',
                                    'Encrypt private key locally',
                                    'Upload only encrypted backup'
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

                            <div className="bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                                {showPhrase ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {phraseBlocks.map((block, index) => (
                                            <div
                                                key={`${block}-${index}`}
                                                className="bg-white dark:bg-[#1A1A1D] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3"
                                            >
                                                <span className="text-xs text-slate-400 mr-2">
                                                    {index + 1}.
                                                </span>

                                                <span className="font-mono font-semibold text-sm">
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

                            <div className="grid sm:grid-cols-3 gap-3">
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
                                className="w-full bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-slate-400 font-mono text-sm"
                            />

                            {error && <ErrorText>{error}</ErrorText>}

                            <div className="grid sm:grid-cols-2 gap-3">
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
                                    {isSavingBackup ? 'Encrypting Backup...' : 'Enable Backup'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {backupStep === 'done' && (
                        <SuccessState
                            title="Encrypted backup enabled"
                            text="Your private key was encrypted locally. Only the encrypted backup was uploaded."
                            buttonText="Done"
                            onClick={closeModal}
                        />
                    )}
                </Modal>
            )}

            {activeModal === 'approve' && (
                <Modal title="Approve New Device" onClose={closeModal}>
                    {approveStatus === 'done' && (
                        <SuccessState
                            title="Device approved"
                            text="The new device can now receive the encrypted account key package."
                            buttonText="Done"
                            onClick={closeModal}
                        />
                    )}

                    {approveStatus === 'recovered' && (
                        <SuccessState
                            title="This device is approved"
                            text="Your account private key was restored locally. You can now open your chats."
                            buttonText="Go to Chat"
                            onClick={() => navigate('/chat')}
                        />
                    )}

                    {approveStatus !== 'done' && approveStatus !== 'recovered' && (
                        <div className="space-y-6">
                            <WarningBox>
                                Use this when you still have an old trusted device. The private key is encrypted before transfer.
                            </WarningBox>

                            {error && <ErrorText>{error}</ErrorText>}

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                                        This New Device
                                    </h3>

                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                                        Create an approval request on this device, then approve it from your old trusted device.
                                    </p>

                                    {!approvalRequest ? (
                                        <Button
                                            onClick={handleCreateApprovalRequest}
                                            disabled={isCreatingApprovalRequest}
                                            className="w-full"
                                        >
                                            {isCreatingApprovalRequest ? 'Creating Request...' : 'Request Approval'}
                                        </Button>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-white dark:bg-[#1A1A1D] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                                    Verification Code
                                                </p>

                                                <div className="text-3xl font-black tracking-[0.25em] text-indigo-600 dark:text-indigo-400">
                                                    {approvalRequest.verificationCode}
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Open Security & Recovery on your trusted device and approve the request with this same code.
                                            </p>

                                            <Button
                                                onClick={handleCheckApprovalResult}
                                                disabled={approvalPollStatus === 'checking'}
                                                className="w-full"
                                            >
                                                {approvalPollStatus === 'checking'
                                                    ? 'Checking...'
                                                    : 'I Approved It, Check Now'}
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <h3 className="font-bold text-slate-900 dark:text-white">
                                            Trusted Device
                                        </h3>

                                        <button
                                            onClick={loadPendingApprovals}
                                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                        >
                                            Refresh
                                        </button>
                                    </div>

                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                                        Approve pending requests from your other logged-in devices.
                                    </p>

                                    {isLoadingPendingApprovals ? (
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Loading pending requests...
                                        </p>
                                    ) : pendingApprovals.length === 0 ? (
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            No pending device requests.
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {pendingApprovals.map(request => (
                                                <div
                                                    key={request.approvalId}
                                                    className="bg-white dark:bg-[#1A1A1D] border border-slate-200 dark:border-slate-800 rounded-2xl p-4"
                                                >
                                                    <div className="flex items-start justify-between gap-3 mb-3">
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 dark:text-white">
                                                                {request.deviceName}
                                                            </h4>

                                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                Device ID: {request.newDeviceId}
                                                            </p>
                                                        </div>

                                                        <span className="text-lg font-black tracking-widest text-indigo-600 dark:text-indigo-400">
                                                {request.verificationCode}
                                            </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2">
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
                                                            {isApprovingDevice ? 'Approving...' : 'Approve'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <FlowList
                                items={[
                                    'New device creates temporary key pair',
                                    'Old trusted device encrypts account private key',
                                    'New device downloads encrypted package',
                                    'New device decrypts locally',
                                    'Current device public key is updated'
                                ]}
                            />
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
                                className="w-full bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-slate-400 font-mono text-sm"
                            />

                            {error && <ErrorText>{error}</ErrorText>}

                            <FlowList
                                items={[
                                    'Download encrypted private key backup',
                                    'Derive AES key from recovery phrase',
                                    'Decrypt private key locally',
                                    'Save private key in IndexedDB',
                                    'Mark device as trusted later'
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
                            text="Your private key was restored locally and saved on this device."
                            buttonText="Done"
                            onClick={closeModal}
                        />
                    )}
                </Modal>
            )}
        </div>
    );
}

function SecurityCard({
                          icon: Icon,
                          title,
                          badge,
                          badgeTone,
                          description,
                          points,
                          buttonText,
                          onClick
                      }) {
    return (
        <div className="bg-white/80 dark:bg-[#111113]/80 border border-slate-200/60 dark:border-slate-800 rounded-[1.5rem] shadow-xl shadow-slate-200/30 dark:shadow-none backdrop-blur-xl p-6 flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Icon size={28} />
                </div>

                <Badge tone={badgeTone}>
                    {badge}
                </Badge>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {title}
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {description}
            </p>

            <ul className="mt-5 space-y-2 flex-1">
                {points.map(point => (
                    <li
                        key={point}
                        className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
                    >
                        <CheckCircle2
                            size={16}
                            className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5"
                        />

                        <span>{point}</span>
                    </li>
                ))}
            </ul>

            <Button onClick={onClick} className="w-full mt-6">
                {buttonText}
            </Button>
        </div>
    );
}

function StatusPanel({ icon: Icon, title, value, detail }) {
    return (
        <div className="bg-white/70 dark:bg-[#111113]/70 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Icon size={21} />
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white">
                    {title}
                </h3>
            </div>

            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {value}
            </p>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {detail}
            </p>
        </div>
    );
}

function Modal({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-[#111113] border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {title}
                    </h2>

                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors font-bold"
                    >
                        ×
                    </button>
                </div>

                <div className="p-6">
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
        purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20',
        warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20'
    };

    return (
        <span className={`px-3 py-1 rounded-full border text-xs font-bold ${tones[tone] || tones.neutral}`}>
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

function ErrorText({ children }) {
    return (
        <p className="text-sm font-semibold text-red-500">
            {children}
        </p>
    );
}

function FlowList({ items }) {
    return (
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3">
                Flow
            </h3>

            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={item} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {index + 1}
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            {item}
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
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {title}
                </h3>

                <p className="text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {text}
                </p>
            </div>

            <Button onClick={onClick} className="w-full">
                {buttonText}
            </Button>
        </div>
    );
}