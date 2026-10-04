package com.bookingnailms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "revoked_access_tokens", indexes = @Index(name = "idx_revoked_access_tokens_expires_at", columnList = "expires_at"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RevokedAccessToken {
    @Id
    @Column(name = "token_hash", length = 64, nullable = false)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;
}
