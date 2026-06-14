package com.fateen.chatapplicationbackend.chat.model;

import com.fateen.chatapplicationbackend.auth.model.User;
import com.fateen.chatapplicationbackend.chat.dto.MessageStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

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
    private String iv;

    @Enumerated(EnumType.STRING)
    private MessageStatus status;

    private Instant createdAt;
}
