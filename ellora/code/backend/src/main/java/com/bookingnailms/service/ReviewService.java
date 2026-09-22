package com.bookingnailms.service;

import com.bookingnailms.dto.common.PageResponse;
import com.bookingnailms.dto.review.ReviewReplyRequest;
import com.bookingnailms.dto.review.ReviewRequest;
import com.bookingnailms.dto.review.ReviewResponse;
import com.bookingnailms.entity.Booking;
import com.bookingnailms.entity.Review;
import com.bookingnailms.entity.Salon;
import com.bookingnailms.entity.User;
import com.bookingnailms.enums.BookingStatus;
import com.bookingnailms.exception.BadRequestException;
import com.bookingnailms.exception.ResourceNotFoundException;
import com.bookingnailms.exception.UnauthorizedException;
import com.bookingnailms.repository.BookingRepository;
import com.bookingnailms.repository.ReviewRepository;
import com.bookingnailms.repository.SalonRepository;
import com.bookingnailms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final SalonRepository salonRepository;

    @Transactional
    public ReviewResponse createReview(ReviewRequest request, UUID customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", customerId));

        Booking booking = bookingRepository.findForUpdateById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", request.getBookingId()));

        if (!booking.getCustomer().getId().equals(customerId)) {
            throw new UnauthorizedException("Bạn chỉ có thể đánh giá lịch hẹn của mình.");
        }

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new BadRequestException("Chỉ có thể đánh giá lịch hẹn đã hoàn thành.");
        }

        if (reviewRepository.existsByBookingId(booking.getId())) {
            throw new BadRequestException("Bạn đã đánh giá lịch hẹn này rồi.");
        }

        // Serialize rating updates across different bookings for the same salon.
        Salon salon = salonRepository.findForUpdateById(booking.getSalon().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Salon not found"));

        Review review = Review.builder()
                .customer(customer)
                .salon(salon)
                .booking(booking)
                .rating(request.getRating())
                .comment(request.getComment() == null ? null : request.getComment().strip())
                .build();

        review = reviewRepository.save(review);

        // Update salon average rating
        updateSalonRating(salon);

        log.info("Review created for booking: {} by customer: {}", booking.getId(), customer.getEmail());

        return mapToReviewResponse(review);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getSalonReviews(Long salonId, Pageable pageable) {
        if (!salonRepository.existsById(salonId)) {
            throw new ResourceNotFoundException("Salon", "id", salonId);
        }

        Page<Review> reviewsPage = reviewRepository.findBySalonIdOrderByCreatedAtDesc(salonId, pageable);

        List<ReviewResponse> responses = reviewsPage.getContent().stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());

        return PageResponse.of(responses, reviewsPage);
    }

    @Transactional
    public ReviewResponse replyToReview(
            Long reviewId, ReviewReplyRequest request, UUID ownerId) {
        Review review = reviewRepository.findForUpdateById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        if (!review.getSalon().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You are not the owner of this salon");
        }

        if (review.getSalonReply() != null || review.getSalonRepliedAt() != null) {
            throw new BadRequestException("Phản hồi đã gửi không thể chỉnh sửa hoặc gửi lại.");
        }
        review.setSalonReply(request.getReply().strip());
        review.setSalonRepliedAt(LocalDateTime.now());

        review = reviewRepository.save(review);
        log.info("Review {} replied by salon owner", reviewId);

        return mapToReviewResponse(review);
    }

    private void updateSalonRating(Salon salon) {
        Page<Review> allReviews = reviewRepository.findBySalonIdOrderByCreatedAtDesc(
                salon.getId(), Pageable.unpaged());

        double avgRating = allReviews.getContent().stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        salon.setAverageRating(
                BigDecimal.valueOf(avgRating).setScale(1, RoundingMode.HALF_UP));
        salon.setTotalReviews((int) allReviews.getTotalElements());
        salonRepository.save(salon);
    }

    @Transactional
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public void adminEdit(Long id, com.bookingnailms.dto.review.AdminReviewRequest request) {
        Review review = reviewRepository.findForUpdateById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        Salon salon = salonRepository.findForUpdateById(review.getSalon().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Salon not found"));
        review.setRating(request.rating());
        review.setComment(request.comment() == null ? null : request.comment().strip());
        reviewRepository.saveAndFlush(review);
        updateSalonRating(salon);
    }

    @Transactional
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public void adminDelete(Long id) {
        Review review = reviewRepository.findForUpdateById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        Salon salon = salonRepository.findForUpdateById(review.getSalon().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Salon not found"));
        review.getBooking().setReview(null);
        reviewRepository.delete(review);
        reviewRepository.flush();
        updateSalonRating(salon);
    }

    @Transactional
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public void adminReply(Long id, String reply) {
        Review review = reviewRepository.findForUpdateById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        review.setSalonReply(reply == null ? null : reply.strip());
        // Keep the timestamp on removal so the owner cannot repost moderated content.
        review.setSalonRepliedAt(LocalDateTime.now());
        reviewRepository.save(review);
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .customerName(review.getCustomer().getFullName())
                .rating(review.getRating())
                .comment(review.getComment())
                .salonReply(review.getSalonReply())
                .salonRepliedAt(review.getSalonRepliedAt())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
