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

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final SalonRepository salonRepository;

    @Transactional
    public ReviewResponse createReview(ReviewRequest request, Long customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", customerId));

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", request.getBookingId()));

        if (!booking.getCustomer().getId().equals(customerId)) {
            throw new UnauthorizedException("You can only review your own bookings");
        }

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new BadRequestException("You can only review completed bookings");
        }

        if (reviewRepository.existsByBookingId(booking.getId())) {
            throw new BadRequestException("You have already reviewed this booking");
        }

        Review review = Review.builder()
                .customer(customer)
                .salon(booking.getSalon())
                .booking(booking)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        review = reviewRepository.save(review);

        // Update salon average rating
        updateSalonRating(booking.getSalon());

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
    public ReviewResponse replyToReview(Long reviewId, ReviewReplyRequest request, Long ownerId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        if (!review.getSalon().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You are not the owner of this salon");
        }

        review.setSalonReply(request.getReply());
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

        salon.setAverageRating(Math.round(avgRating * 10.0) / 10.0);
        salon.setTotalReviews((int) allReviews.getTotalElements());
        salonRepository.save(salon);
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
