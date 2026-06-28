package com.bookingnailms.service;

import com.bookingnailms.dto.profile.ProfileResponse;
import com.bookingnailms.dto.profile.ProfileSyncRequest;
import com.bookingnailms.entity.User;
import com.bookingnailms.enums.Role;
import com.bookingnailms.exception.ResourceNotFoundException;
import com.bookingnailms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;

    @Transactional
    public ProfileResponse sync(UUID cognitoUserId, ProfileSyncRequest request) {
        User user = userRepository.findById(cognitoUserId)
                .orElseGet(() -> User.builder()
                        .id(cognitoUserId)
                        .role(Role.CUSTOMER)
                        .enabled(true)
                        .locked(false)
                        .build());

        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setFullName(request.getFullName().trim());

        return toResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public ProfileResponse get(UUID cognitoUserId) {
        return userRepository.findById(cognitoUserId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Profile", "cognitoUserId", cognitoUserId));
    }

    private ProfileResponse toResponse(User user) {
        return ProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }
}
