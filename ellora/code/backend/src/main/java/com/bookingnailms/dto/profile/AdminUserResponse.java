package com.bookingnailms.dto.profile;

import com.bookingnailms.entity.User;
import com.bookingnailms.enums.Role;
import java.time.LocalDateTime;
import java.util.UUID;

public record AdminUserResponse(UUID id, String fullName, String email, String phone,
        Role role, boolean enabled, boolean locked, LocalDateTime createdAt) {
    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getPhone(),
                user.getRole(), user.isEnabled(), user.isLocked(), user.getCreatedAt());
    }
}
