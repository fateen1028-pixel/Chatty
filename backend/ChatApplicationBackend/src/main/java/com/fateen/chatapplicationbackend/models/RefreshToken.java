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


    @Column(nullable = false)
    private String familyId;

    public RefreshToken(
            String token,
            String username,
            LocalDateTime expiryDate,
            String familyId
    ) {

        this.token = token;

        this.username = username;

        this.expiryDate = expiryDate;

        this.familyId = familyId;

        this.revoked = false;
    }
}