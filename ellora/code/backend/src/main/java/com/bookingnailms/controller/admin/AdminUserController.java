package com.bookingnailms.controller.admin;

import com.bookingnailms.dto.common.*;
import com.bookingnailms.dto.profile.AdminUserResponse;
import com.bookingnailms.service.AdminService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController @RequestMapping("/admin/users") @RequiredArgsConstructor
public class AdminUserController {
    private final AdminService admin;
    public record LockRequest(@NotNull Boolean locked) {}

    @GetMapping
    public ApiResponse<PageResponse<AdminUserResponse>> list(@RequestParam(defaultValue="") String keyword,
            @RequestParam(defaultValue="0") int page) {
        return ApiResponse.success(admin.getAllUsers(keyword,
                PageRequest.of(Math.max(0,page),20,Sort.by("createdAt").descending().and(Sort.by("id")))), null);
    }

    @PatchMapping("/{id}/lock")
    public ApiResponse<AdminUserResponse> lock(@PathVariable UUID id, @Valid @RequestBody LockRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(admin.setUserLocked(id,request.locked(),UUID.fromString(jwt.getSubject())), "Đã cập nhật trạng thái tài khoản.");
    }
}
