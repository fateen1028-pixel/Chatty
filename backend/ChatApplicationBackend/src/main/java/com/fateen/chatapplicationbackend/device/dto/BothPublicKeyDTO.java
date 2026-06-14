package com.fateen.chatapplicationbackend.device.dto;

public record BothPublicKeyDTO(String senderPublicKey,String receiverPublicKey) {
    public static record DevicePublicKeyDTO(
            Long deviceId,
            String publicKey
    ) {
    }

    public static record PublicKeyDTO(
            String publicKey
    ) {}
}
