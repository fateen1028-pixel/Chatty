package com.fateen.chatapplicationbackend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "message_device_keys",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "message_id",
                                "device_id"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class MessageDeviceKey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "message_id")
    private Message message;

    @ManyToOne
    @JoinColumn(name = "device_id")
    private Device device;

    @Column(columnDefinition = "TEXT")
    private String encryptedAesKey;
}