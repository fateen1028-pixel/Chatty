package com.fateen.chatapplicationbackend.device.model;

import com.fateen.chatapplicationbackend.auth.model.User;
import jakarta.persistence.*;
import lombok.Getter;

import java.time.Instant;

@Getter
@Entity
@Table(name = "device_approvals")
public class DeviceApproval {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Owner user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // The device asking to be approved
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "new_device_id", nullable = false)
    private Device newDevice;

    @Column(nullable = false, length = 6)
    private String verificationCode;

    // New device temporary public key
    @Column(nullable = false, columnDefinition = "TEXT")
    private String tempPublicKey;

    // AES-encrypted exported private key
    @Column(columnDefinition = "TEXT")
    private String encryptedPrivateKey;

    // RSA-encrypted AES key
    @Column(columnDefinition = "TEXT")
    private String encryptedAesKey;

    // AES-GCM IV
    @Column(columnDefinition = "TEXT")
    private String iv;

    // Matching account public key
    @Column(columnDefinition = "TEXT")
    private String accountPublicKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeviceApprovalStatus status;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant expiresAt;

    private Instant approvedAt;

    public DeviceApproval() {
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setNewDevice(Device newDevice) {
        this.newDevice = newDevice;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }

    public void setTempPublicKey(String tempPublicKey) {
        this.tempPublicKey = tempPublicKey;
    }

    public void setEncryptedPrivateKey(String encryptedPrivateKey) {
        this.encryptedPrivateKey = encryptedPrivateKey;
    }

    public void setEncryptedAesKey(String encryptedAesKey) {
        this.encryptedAesKey = encryptedAesKey;
    }

    public void setIv(String iv) {
        this.iv = iv;
    }

    public void setAccountPublicKey(String accountPublicKey) {
        this.accountPublicKey = accountPublicKey;
    }

    public void setStatus(DeviceApprovalStatus status) {
        this.status = status;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public void setApprovedAt(Instant approvedAt) {
        this.approvedAt = approvedAt;
    }
}