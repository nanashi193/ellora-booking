package com.bookingnailms.controller.booking;

import com.bookingnailms.dto.common.ApiResponse;
import com.bookingnailms.dto.review.ReviewRequest;
import com.bookingnailms.dto.review.ReviewResponse;
import com.bookingnailms.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviews;

    @PostMapping("/reviews")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ReviewResponse> create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ReviewRequest request) {
        return ApiResponse.success(reviews.createReview(request, UUID.fromString(jwt.getSubject())), "Đã gửi đánh giá.");
    }
}
