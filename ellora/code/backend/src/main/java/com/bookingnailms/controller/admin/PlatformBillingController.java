package com.bookingnailms.controller.admin;
import com.bookingnailms.service.PlatformBillingService;
import com.bookingnailms.dto.common.ApiResponse;
import com.bookingnailms.dto.service.PlatformFeeRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.UUID;
@RestController @RequiredArgsConstructor
public class PlatformBillingController {
    private final PlatformBillingService billing;
    public record Confirmation(@NotNull @DecimalMin("0") BigDecimal expectedDue) {}
    @GetMapping("/admin/billing/config") public ApiResponse<?> config(){return ApiResponse.success(billing.configuration(),null);}
    @PutMapping("/admin/billing/config") public ApiResponse<?> rate(@Valid @RequestBody PlatformFeeRequest body){return ApiResponse.success(billing.setRate(body.percent()),null);}
    @PostMapping("/admin/billing/qr") public ApiResponse<?> qr(@RequestParam MultipartFile file){return ApiResponse.success(billing.uploadQr(file),null);}
    @GetMapping("/admin/billing/statements") public ApiResponse<?> list(@RequestParam String month,@RequestParam(defaultValue="0") int page){return ApiResponse.success(billing.list(month,page),null);}
    @PostMapping("/admin/billing/statements/{id}/confirm") public ApiResponse<?> confirm(@PathVariable Long id,@RequestParam String month,@Valid @RequestBody Confirmation body,@AuthenticationPrincipal Jwt jwt){return ApiResponse.success(billing.confirm(id,month,body.expectedDue(),UUID.fromString(jwt.getSubject())),null);}
    @PostMapping("/admin/billing/statements/{id}/remind") public ApiResponse<?> remind(@PathVariable Long id,@RequestParam String month){billing.remind(id,month);return ApiResponse.success(null,"Đã xếp hàng gửi email nhắc thanh toán.");}
    @GetMapping("/owner/billing") public ApiResponse<?> owner(@AuthenticationPrincipal Jwt jwt,@RequestParam String month){return ApiResponse.success(billing.ownerBill(UUID.fromString(jwt.getSubject()),month),null);}
}
