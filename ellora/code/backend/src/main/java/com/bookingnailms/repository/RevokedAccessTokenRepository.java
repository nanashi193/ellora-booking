package com.bookingnailms.repository;

import com.bookingnailms.entity.RevokedAccessToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;

public interface RevokedAccessTokenRepository extends JpaRepository<RevokedAccessToken, String> {
    @Modifying
    @Query("delete from RevokedAccessToken token where token.expiresAt <= :now")
    int deleteExpired(@Param("now") Instant now);
}
