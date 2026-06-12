package com.fateen.chatapplicationbackend.services;

import com.fateen.chatapplicationbackend.models.Device;
import com.fateen.chatapplicationbackend.models.DeviceApproval;
import com.fateen.chatapplicationbackend.models.User;
import com.fateen.chatapplicationbackend.models.dto.*;
import com.fateen.chatapplicationbackend.models.enums.DeviceApprovalStatus;
import com.fateen.chatapplicationbackend.repository.AuthRepo;
import com.fateen.chatapplicationbackend.repository.DeviceApprovalRepository;
import com.fateen.chatapplicationbackend.repository.DeviceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DeviceApprovalService {

    private static final long APPROVAL_EXPIRY_MINUTES = 5;

    private final DeviceApprovalRepository deviceApprovalRepository;
    private final DeviceRepository deviceRepository;
    private final AuthRepo authRepo;
    private final SecureRandom secureRandom = new SecureRandom();

    public DeviceApprovalService(
            DeviceApprovalRepository deviceApprovalRepository,
            DeviceRepository deviceRepository,
            AuthRepo authRepo
    ) {
        this.deviceApprovalRepository = deviceApprovalRepository;
        this.deviceRepository = deviceRepository;
        this.authRepo = authRepo;
    }


    @Transactional
    public DeviceApprovalCreatedResponse createRequest(
            String username,
            Long currentDeviceId,
            CreateDeviceApprovalRequest request
    ) {
        User user = getUser(username);

        Device newDevice = getActiveDevice(currentDeviceId);

        ensureDeviceBelongsToUser(newDevice, user);

        if (request == null || isBlank(request.tempPublicKey())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Temporary public key is required"
            );
        }

        DeviceApproval approval = new DeviceApproval();

        approval.setUser(user);
        approval.setNewDevice(newDevice);
        approval.setTempPublicKey(request.tempPublicKey());
        approval.setVerificationCode(generateCode());
        approval.setStatus(DeviceApprovalStatus.PENDING);
        approval.setExpiresAt(
                Instant.now().plusSeconds(APPROVAL_EXPIRY_MINUTES * 60)
        );

        DeviceApproval saved = deviceApprovalRepository.save(approval);

        return new DeviceApprovalCreatedResponse(
                saved.getId(),
                saved.getVerificationCode(),
                saved.getStatus().name(),
                saved.getExpiresAt().toString()
        );
    }

    public List<PendingDeviceApprovalResponse> getPendingRequests(
            String username,
            Long currentDeviceId
    ) {
        User user = getUser(username);

        Device currentDevice = getActiveDevice(currentDeviceId);

        ensureDeviceBelongsToUser(currentDevice, user);

        Instant now = Instant.now();

        return deviceApprovalRepository
                .findPendingWithNewDevice(
                        user,
                        DeviceApprovalStatus.PENDING,
                        now
                )
                .stream()
                .filter(approval -> !approval.getNewDevice().getId().equals(currentDeviceId))
                .map(approval -> new PendingDeviceApprovalResponse(
                        approval.getId(),
                        approval.getNewDevice().getId(),
                        approval.getNewDevice().getDeviceName(),
                        approval.getVerificationCode(),
                        approval.getTempPublicKey(),
                        approval.getCreatedAt().toString(),
                        approval.getExpiresAt().toString()
                ))
                .toList();
    }


    @Transactional
    public DeviceApprovalResultResponse approveRequest(
            String username,
            Long currentDeviceId,
            Long approvalId,
            ApproveDeviceRequest request
    ) {
        User user = getUser(username);

        Device currentDevice = getActiveDevice(currentDeviceId);

        ensureDeviceBelongsToUser(currentDevice, user);

        DeviceApproval approval = deviceApprovalRepository
                .findByIdAndUser(approvalId, user)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Approval request not found"
                ));

        if (approval.getNewDevice().getId().equals(currentDeviceId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot approve the same device"
            );
        }

        ensurePendingAndNotExpired(approval);

        validateApprovalPayload(request);

        approval.setEncryptedPrivateKey(request.encryptedPrivateKey());
        approval.setEncryptedAesKey(request.encryptedAesKey());
        approval.setIv(request.iv());
        approval.setAccountPublicKey(request.accountPublicKey());
        approval.setStatus(DeviceApprovalStatus.APPROVED);
        approval.setApprovedAt(Instant.now());

        DeviceApproval saved = deviceApprovalRepository.save(approval);

        return toResult(saved, true);
    }

    public DeviceApprovalResultResponse getCurrentResult(
            String username,
            Long currentDeviceId
    ) {
        User user = getUser(username);

        Device currentDevice = getActiveDevice(currentDeviceId);

        ensureDeviceBelongsToUser(currentDevice, user);

        DeviceApproval approval = deviceApprovalRepository
                .findTopByNewDevice_IdOrderByCreatedAtDesc(currentDeviceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No approval request found for this device"
                ));

        if (!approval.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Not your approval request"
            );
        }

        if (
                approval.getStatus() == DeviceApprovalStatus.PENDING
                        &&
                        approval.getExpiresAt().isBefore(Instant.now())
        ) {
            approval.setStatus(DeviceApprovalStatus.EXPIRED);
            deviceApprovalRepository.save(approval);
        }

        boolean includeEncryptedPayload =
                approval.getStatus() == DeviceApprovalStatus.APPROVED;

        return toResult(approval, includeEncryptedPayload);
    }

    @Transactional
    public DeviceApprovalResultResponse rejectRequest(
            String username,
            Long currentDeviceId,
            Long approvalId
    ) {
        User user = getUser(username);

        Device currentDevice = getActiveDevice(currentDeviceId);

        ensureDeviceBelongsToUser(currentDevice, user);

        DeviceApproval approval = deviceApprovalRepository
                .findByIdAndUser(approvalId, user)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Approval request not found"
                ));

        if (approval.getNewDevice().getId().equals(currentDeviceId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot reject the same device"
            );
        }

        ensurePendingAndNotExpired(approval);

        approval.setStatus(DeviceApprovalStatus.REJECTED);

        DeviceApproval saved = deviceApprovalRepository.save(approval);

        return toResult(saved, false);
    }

    private void ensurePendingAndNotExpired(DeviceApproval approval) {
        if (approval.getStatus() != DeviceApprovalStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Approval request is not pending"
            );
        }

        if (approval.getExpiresAt().isBefore(Instant.now())) {
            approval.setStatus(DeviceApprovalStatus.EXPIRED);
            deviceApprovalRepository.save(approval);

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Approval request expired"
            );
        }
    }

    private void validateApprovalPayload(ApproveDeviceRequest request) {
        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Request body is required"
            );
        }

        if (isBlank(request.encryptedPrivateKey())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Encrypted private key is required"
            );
        }

        if (isBlank(request.encryptedAesKey())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Encrypted AES key is required"
            );
        }

        if (isBlank(request.iv())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "IV is required"
            );
        }

        if (isBlank(request.accountPublicKey())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Account public key is required"
            );
        }
    }

    private User getUser(String username) {
        if (isBlank(username)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Unauthenticated request"
            );
        }

        return authRepo.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));
    }

    private Device getActiveDevice(Long deviceId) {
        return deviceRepository.findByIdAndActiveTrue(deviceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Device not found"
                ));
    }

    private void ensureDeviceBelongsToUser(Device device, User user) {
        if (!device.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Device does not belong to user"
            );
        }
    }

    private String generateCode() {
        int code = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(code);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private DeviceApprovalResultResponse toResult(
            DeviceApproval approval,
            boolean includeEncryptedPayload
    ) {
        return new DeviceApprovalResultResponse(
                approval.getId(),
                approval.getStatus().name(),
                includeEncryptedPayload ? approval.getEncryptedPrivateKey() : null,
                includeEncryptedPayload ? approval.getEncryptedAesKey() : null,
                includeEncryptedPayload ? approval.getIv() : null,
                includeEncryptedPayload ? approval.getAccountPublicKey() : null,
                approval.getExpiresAt().toString(),
                approval.getApprovedAt() == null
                        ? null
                        : approval.getApprovedAt().toString()
        );
    }
}