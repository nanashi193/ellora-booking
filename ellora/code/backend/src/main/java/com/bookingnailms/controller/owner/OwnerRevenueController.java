package com.bookingnailms.controller.owner;

import com.bookingnailms.dto.common.ApiResponse;
import com.bookingnailms.service.OwnerRevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;
import java.util.UUID;

@RestController @RequiredArgsConstructor
public class OwnerRevenueController {
    private final OwnerRevenueService revenue;
    @GetMapping("/owner/revenue")
    public ApiResponse<OwnerRevenueService.Report> report(@AuthenticationPrincipal Jwt jwt,
            @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue="day") String groupBy) {
        return ApiResponse.success(revenue.report(UUID.fromString(jwt.getSubject()), from, to, groupBy), null);
    }
}
