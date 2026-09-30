package com.bookingnailms.controller.admin;

import com.bookingnailms.dto.common.*;
import com.bookingnailms.dto.review.*;
import com.bookingnailms.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController @RequestMapping("/admin/content") @RequiredArgsConstructor
public class AdminContentController {
    private final AdminContentService content;
    private final ReviewService reviews;
    @GetMapping("/salons")
    public ApiResponse<?> list(@RequestParam(defaultValue = "0") int page) { return ApiResponse.success(content.list(page), null); }
    @GetMapping("/salons/{id}")
    public ApiResponse<?> detail(@PathVariable Long id) { return ApiResponse.success(content.detail(id), null); }
    @GetMapping("/salons/{id}/reviews")
    public ApiResponse<?> reviews(@PathVariable Long id, @RequestParam(defaultValue = "0") int page) {
        return ApiResponse.success(reviews.getSalonReviews(id, PageRequest.of(Math.max(0, page), 20)), null);
    }
    @PostMapping("/salons/{salonId}/photos/{kind}/{id}")
    public ApiResponse<String> upload(@PathVariable Long salonId, @PathVariable String kind, @PathVariable Long id,
            @RequestParam MultipartFile file, @RequestParam(required = false) String oldUrl) {
        return ApiResponse.success(content.upload(salonId, kind, id, file, oldUrl), null);
    }
    @DeleteMapping("/salons/{salonId}/photos/{kind}/{id}")
    public ApiResponse<Void> remove(@PathVariable Long salonId, @PathVariable String kind, @PathVariable Long id,
            @RequestParam(required = false) String url) {
        content.remove(salonId, kind, id, url); return ApiResponse.success(null, null);
    }
    @PutMapping("/reviews/{id}")
    public ApiResponse<Void> edit(@PathVariable Long id, @Valid @RequestBody AdminReviewRequest request) {
        reviews.adminEdit(id, request); return ApiResponse.success(null, null);
    }
    @DeleteMapping("/reviews/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) { reviews.adminDelete(id); return ApiResponse.success(null, null); }
    @PutMapping("/reviews/{id}/reply")
    public ApiResponse<Void> reply(@PathVariable Long id, @Valid @RequestBody ReviewReplyRequest request) {
        reviews.adminReply(id, request.getReply()); return ApiResponse.success(null, null);
    }
    @DeleteMapping("/reviews/{id}/reply")
    public ApiResponse<Void> deleteReply(@PathVariable Long id) { reviews.adminReply(id, null); return ApiResponse.success(null, null); }
}
