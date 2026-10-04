package com.bookingnailms.dto.profile;

import jakarta.validation.constraints.*;

public record ProfileUpdateRequest(
        @NotBlank @Size(max=255) String fullName,
        @Pattern(regexp="^$|^[+0-9 ()-]{8,20}$", message="Số điện thoại không hợp lệ") String phone) {}
