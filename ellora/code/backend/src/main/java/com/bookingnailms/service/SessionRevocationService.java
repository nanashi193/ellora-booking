package com.bookingnailms.service;

import com.bookingnailms.entity.RevokedAccessToken;
import com.bookingnailms.exception.BadRequestException;
import com.bookingnailms.repository.RevokedAccessTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class SessionRevocationService {
    private final RevokedAccessTokenRepository tokens;

    @Transactional
    public void revoke(String accessToken, Instant expiresAt) {
        if (accessToken == null || accessToken.isBlank() || expiresAt == null || !expiresAt.isAfter(Instant.now())) {
            throw new BadRequestException("Phiên đăng nhập không hợp lệ hoặc đã hết hạn.");
        }
        tokens.save(new RevokedAccessToken(hash(accessToken), expiresAt));
    }

    @Transactional(readOnly = true)
    public boolean isRevoked(String accessToken) {
        return accessToken != null && tokens.existsById(hash(accessToken));
    }

    @Scheduled(cron = "0 15 * * * *")
    @Transactional
    public void removeExpiredTokens() {
        tokens.deleteExpired(Instant.now());
    }

    private String hash(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is unavailable", e);
        }
    }
}
