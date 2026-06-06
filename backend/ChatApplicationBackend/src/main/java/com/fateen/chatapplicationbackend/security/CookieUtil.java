package com.fateen.chatapplicationbackend.security;

import jakarta.servlet.http.Cookie;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class CookieUtil {

    public ResponseCookie createRefreshTokenCookie(
            String refreshToken
    ) {

        return ResponseCookie.from(
                        "refreshToken",
                        refreshToken
                )
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .domain("fateen.dev")
                .sameSite("Lax")
                .build();
    }

    public ResponseCookie deleteRefreshTokenCookie() {

        return ResponseCookie.from(
                        "refreshToken",
                        ""
                )
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .domain("fateen.dev")
                .sameSite("Lax")
                .build();
    }
}