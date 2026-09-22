package com.bookingnailms.controller.owner;

import com.bookingnailms.dto.common.*;
import com.bookingnailms.dto.employee.*;
import com.bookingnailms.dto.service.*;
import com.bookingnailms.dto.review.*;
import com.bookingnailms.dto.salon.SalonResponse;
import com.bookingnailms.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/owner")
@RequiredArgsConstructor
public class OwnerController {
    private final SalonService salons;
    private final NailServiceService services;
    private final EmployeeService employees;
    private final ReviewService reviews;
    private final OwnerDashboardService dashboard;

    @GetMapping("/dashboard")
    public ApiResponse<OwnerDashboardService.Summary> dashboard(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(dashboard.get(owner(jwt)), null);
    }

    private UUID owner(Jwt jwt) { return UUID.fromString(jwt.getSubject()); }

    @GetMapping("/salon")
    public ApiResponse<SalonResponse> salon(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(salons.getMySalon(owner(jwt)), null);
    }

    @GetMapping("/services")
    public ApiResponse<List<ServiceResponse>> services(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(services.getServicesBySalon(salons.getMySalon(owner(jwt)).getId()), null);
    }

    @PostMapping("/services")
    public ApiResponse<ServiceResponse> addService(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ServiceRequest request) {
        return ApiResponse.success(services.addService(request, salons.getMySalon(owner(jwt)).getId()), null);
    }

    @PutMapping("/services/{id}")
    public ApiResponse<ServiceResponse> updateService(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id, @Valid @RequestBody ServiceRequest request) {
        return ApiResponse.success(services.updateService(id, request, owner(jwt)), null);
    }

    @DeleteMapping("/services/{id}")
    public ApiResponse<Void> removeService(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        services.deleteService(id, owner(jwt));
        return ApiResponse.success(null, null);
    }

    @GetMapping("/employees")
    public ApiResponse<List<EmployeeResponse>> employees(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(employees.getSalonEmployees(salons.getMySalon(owner(jwt)).getId()), null);
    }

    @PostMapping("/employees")
    public ApiResponse<EmployeeResponse> addEmployee(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody EmployeeRequest request) {
        return ApiResponse.success(employees.addEmployee(request, owner(jwt)), null);
    }

    @PutMapping("/employees/{id}")
    public ApiResponse<EmployeeResponse> updateEmployee(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id, @Valid @RequestBody EmployeeRequest request) {
        return ApiResponse.success(employees.updateEmployee(id, request, owner(jwt)), null);
    }

    @DeleteMapping("/employees/{id}")
    public ApiResponse<Void> removeEmployee(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        employees.deleteEmployee(id, owner(jwt));
        return ApiResponse.success(null, null);
    }

    @GetMapping("/reviews")
    public ApiResponse<PageResponse<ReviewResponse>> reviews(@AuthenticationPrincipal Jwt jwt, @RequestParam(defaultValue = "0") int page) {
        return ApiResponse.success(reviews.getSalonReviews(salons.getMySalon(owner(jwt)).getId(), PageRequest.of(Math.max(0, page), 20)), null);
    }

    @PostMapping("/reviews/{id}/reply")
    public ApiResponse<ReviewResponse> reply(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id, @Valid @RequestBody ReviewReplyRequest request) {
        return ApiResponse.success(reviews.replyToReview(id, request, owner(jwt)), null);
    }
}
