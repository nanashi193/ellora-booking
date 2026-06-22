package com.bookingnailms.controller.profile;

import com.bookingnailms.dto.common.ApiResponse;
import com.bookingnailms.dto.profile.ProfileResponse;
import com.bookingnailms.dto.profile.ProfileSyncRequest;
import com.bookingnailms.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/profiles/me")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> sync(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ProfileSyncRequest request) {
        ProfileResponse profile = profileService.sync(UUID.fromString(jwt.getSubject()), request);
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile synchronized"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> get(
            @AuthenticationPrincipal Jwt jwt) {
        ProfileResponse profile = profileService.get(UUID.fromString(jwt.getSubject()));
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile loaded"));
    }
}
