package com.fateen.chatapplicationbackend.models;

import com.fateen.chatapplicationbackend.models.enums.MessageStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="sender_id")
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id")
    private User receiver;


    @Column(columnDefinition = "TEXT")
    private String ciphertext;


    @Column(columnDefinition = "TEXT")
    private String senderEncryptedAesKey;

    @Column(columnDefinition = "TEXT")
    private String receiverEncryptedAesKey;

    @Column(columnDefinition = "TEXT")
    private String iv;

    @Enumerated(EnumType.STRING)
    private MessageStatus status;

    private Instant createdAt;
}
