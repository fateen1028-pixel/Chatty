package com.fateen.chatapplicationbackend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(unique = true)
    private String token;

    private String username;

    private LocalDateTime expiryDate;

    private boolean revoked = false;

    @ManyToOne
    @JoinColumn(name = "device_id")
    private Device device;


    @Column(nullable = false)
    private String familyId;

    public RefreshToken(
            String token,
            String username,
            LocalDateTime expiryDate,
            String familyId,
            Device device
    ) {

        this.token = token;

        this.username = username;

        this.expiryDate = expiryDate;

        this.familyId = familyId;

        this.revoked = false;

        this.device = device;
    }
}