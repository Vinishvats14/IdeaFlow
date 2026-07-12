package com.vinu.cms.security.jwt;

import com.vinu.cms.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    private static final String TOKEN_TYPE_CLAIM = "token_type";
    private static final String ACCESS = "ACCESS";
    private static final String REFRESH = "REFRESH";

    private final JwtProperties jwtProperties;

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    public String generateAccessToken(User user) {
        return buildToken(user, jwtProperties.getAccessTokenExpiration(), ACCESS);
    }

    public String generateRefreshToken(User user) {
        return buildToken(user, jwtProperties.getRefreshTokenExpiration(), REFRESH);
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        Claims claims = extractAllClaims(token);
        return claims.getSubject().equals(userDetails.getUsername())
                && claims.getExpiration().after(new Date());
    }

    public Date extractExpiration(String token) {
        return extractAllClaims(token).getExpiration();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isAccessToken(String token) {
        return ACCESS.equals(extractAllClaims(token).get(TOKEN_TYPE_CLAIM, String.class));
    }

    private String buildToken(User user, long expirationMillis, String tokenType) {
        Map<String, Object> claims = new HashMap<>();
        claims.put(TOKEN_TYPE_CLAIM, tokenType);
        claims.put("roles", user.getRoles().stream().map(role -> role.getName().name()).toList());

        Instant now = Instant.now();

        return Jwts.builder()
                .claims(claims)
                .subject(user.getUsername())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMillis)))
                .signWith(secretKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private SecretKey secretKey() {
        byte[] secretBytes = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            try {
                secretBytes = MessageDigest.getInstance("SHA-256").digest(secretBytes);
            } catch (NoSuchAlgorithmException ex) {
                throw new IllegalStateException("Unable to initialize JWT signing key", ex);
            }
        }
        return Keys.hmacShaKeyFor(secretBytes);
    }
}
