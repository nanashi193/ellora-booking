package com.bookingnailms.controller.admin;

import com.bookingnailms.dto.common.ApiResponse;
import com.bookingnailms.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import java.time.LocalDate;

@RestController
@RequestMapping("/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {
    private final AdminDashboardService dashboard;

    @GetMapping
    public ApiResponse<AdminDashboardService.Summary> summary() {
        return ApiResponse.success(dashboard.summary(), null);
    }

    @GetMapping("/revenue")
    public ApiResponse<AdminDashboardService.RevenueReport> revenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "day") String groupBy) {
        return ApiResponse.success(dashboard.revenue(from, to, groupBy), null);
    }
}
