package com.bookingnailms.controller.salon;

import com.bookingnailms.dto.common.ApiResponse;
import com.bookingnailms.dto.common.PageResponse;
import com.bookingnailms.dto.salon.*;
import com.bookingnailms.service.AdminService;
import com.bookingnailms.service.SalonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class SalonRegistrationController {
    private final SalonService salons;
    private final AdminService admin;

    @PostMapping("/business/registration")
    public ApiResponse<SalonResponse> register(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody SalonRequest request) {
        return ApiResponse.success(salons.createSalon(request, UUID.fromString(jwt.getSubject())), "Đã gửi đăng ký. Vui lòng chờ admin duyệt.");
    }

    @GetMapping("/business/registration")
    public ApiResponse<SalonResponse> registration(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(salons.getMySalon(UUID.fromString(jwt.getSubject())), null);
    }

    @GetMapping("/admin/salons/pending")
    public ApiResponse<PageResponse<SalonSummaryResponse>> pending(@RequestParam(defaultValue = "0") int page) {
        return ApiResponse.success(admin.getPendingSalons(PageRequest.of(Math.max(0, page), 20)), null);
    }

    @GetMapping("/admin/salons/{id}")
    public ApiResponse<SalonResponse> detail(@PathVariable Long id) {
        return ApiResponse.success(salons.getSalonById(id), null);
    }

    @PostMapping("/admin/salons/{id}/approve")
    public ApiResponse<Void> approve(@PathVariable Long id) {
        admin.approveSalon(id);
        return ApiResponse.success(null, "Đã duyệt và cấp quyền chủ salon.");
    }

    @PostMapping("/admin/salons/{id}/reject")
    public ApiResponse<Void> reject(@PathVariable Long id) {
        admin.rejectSalon(id);
        return ApiResponse.success(null, "Đã từ chối đăng ký.");
    }
}
