package com.fateen.chatapplicationbackend.auth.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter

@NoArgsConstructor
@AllArgsConstructor
@Setter
public class LoginRequest {

    private String username;
    private String password;
    private String deviceName;
    private String publicKey;

    private String deviceFingerprint;



}