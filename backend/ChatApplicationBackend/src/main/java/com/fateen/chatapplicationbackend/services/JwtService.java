package com.fateen.chatapplicationbackend.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ClaimsBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    @Value("${JWT_SECRET}")
    private String SECRET;

    private SecretKey SECRET_KEY;

    // 15 minutes
    private final long ACCESS_TOKEN_EXPIRATION =
            1000 * 60 * 15;

    // 7 days
    private final long REFRESH_TOKEN_EXPIRATION =
            1000L * 60 * 60 * 24 * 7;

    @PostConstruct
    public void init() {
        SECRET_KEY = Keys.hmacShaKeyFor(
                SECRET.getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateAccessToken(String username) {

        return Jwts.builder()
                .subject(username)
                .claim("type", "access")
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + ACCESS_TOKEN_EXPIRATION
                        )
                )
                .signWith(SECRET_KEY)
                .compact();
    }


    public String generateRefreshToken(String username){
        return Jwts.builder()
                .subject(username)
                .claim("type", "refresh")
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + REFRESH_TOKEN_EXPIRATION
                        )
                )
                .signWith(SECRET_KEY)
                .compact();
    }


    //Extract Username
    public String extractUsername(String token) {

        return Jwts.parser()
                .verifyWith(SECRET_KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public String extractTokenType(String token) {

        return extractClaims(token)
                .get("type", String.class);
    }

//    public boolean isTokenValid(String token) {
//
//        try {
//
//            Jwts.parser()
//                    .verifyWith(SECRET_KEY)
//                    .build()
//                    .parseSignedClaims(token);
//
//            return true;
//
//        } catch (Exception e) {
//
//            return false;
//        }
//    }

    public boolean isRefreshTokenValid(String token) {

        try {

            Claims claims =
                    extractClaims(token);

            return claims.getExpiration()
                    .after(new Date())

                    &&

                    "refresh".equals(
                            claims.get(
                                    "type",
                                    String.class
                            )
                    );

        } catch (Exception e) {

            return false;
        }
    }

    public boolean isAccessTokenValid(String token) {

        try {

            Claims claims =
                    extractClaims(token);

            return claims.getExpiration()
                    .after(new Date())

                    &&

                    "access".equals(
                            claims.get(
                                    "type",
                                    String.class
                            )
                    );

        } catch (Exception e) {

            return false;
        }
    }

    private Claims extractClaims(String token) {

        return Jwts.parser()
                .verifyWith(SECRET_KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }



}