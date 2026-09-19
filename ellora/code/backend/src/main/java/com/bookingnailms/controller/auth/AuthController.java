package com.bookingnailms.controller.auth;

import com.bookingnailms.dto.auth.ChangePasswordRequest;
import com.bookingnailms.dto.auth.ConfirmForgotPasswordRequest;
import com.bookingnailms.dto.auth.ForgotPasswordRequest;
import com.bookingnailms.dto.common.ApiResponse;
import com.bookingnailms.service.CognitoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "API xác thực người dùng")
public class AuthController {

    private final CognitoService cognitoService;

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/auth/forgot-password
    // Bước 1: Gửi mã OTP về email (không cần đăng nhập)
    // ──────────────────────────────────────────────────────────────────────────

    @Operation(
            summary = "Quên mật khẩu",
            description = "Gửi mã xác nhận OTP đến email người dùng để bắt đầu luồng đặt lại mật khẩu."
    )
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        cognitoService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(null,
                "Nếu email tồn tại trong hệ thống, mã xác nhận đã được gửi đến hộp thư của bạn."));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/auth/forgot-password/confirm
    // Bước 2: Xác nhận OTP + đặt mật khẩu mới (không cần đăng nhập)
    // ──────────────────────────────────────────────────────────────────────────

    @Operation(
            summary = "Xác nhận đặt lại mật khẩu",
            description = "Xác nhận mã OTP và đặt mật khẩu mới cho tài khoản."
    )
    @PostMapping("/forgot-password/confirm")
    public ResponseEntity<ApiResponse<Void>> confirmForgotPassword(
            @Valid @RequestBody ConfirmForgotPasswordRequest request) {

        cognitoService.confirmForgotPassword(
                request.getEmail(),
                request.getConfirmationCode(),
                request.getNewPassword());

        return ResponseEntity.ok(ApiResponse.success(null, "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại."));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/auth/change-password
    // Đổi mật khẩu khi đã đăng nhập
    // ──────────────────────────────────────────────────────────────────────────

    @Operation(
            summary = "Đổi mật khẩu",
            description = "Đổi mật khẩu cho tài khoản đang đăng nhập. Cần cung cấp mật khẩu hiện tại và mật khẩu mới."
    )
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ChangePasswordRequest request) {

        // Lấy raw access token từ Jwt để gọi Cognito changePassword API
        String accessToken = jwt.getTokenValue();

        cognitoService.changePassword(
                accessToken,
                request.getCurrentPassword(),
                request.getNewPassword());

        return ResponseEntity.ok(ApiResponse.success(null, "Đổi mật khẩu thành công."));
    }
}
