package com.fateen.chatapplicationbackend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "devices")
@Getter
@Setter
@NoArgsConstructor
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String deviceName;

    @Column(nullable = false, unique = true)
    private String deviceFingerprint;

    @Column(columnDefinition = "TEXT")
    private String publicKey;

    private Instant createdAt;

    private Instant lastSeen;

    private boolean active;


}