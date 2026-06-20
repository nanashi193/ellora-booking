package com.bookingnailms.repository;

import com.bookingnailms.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findBySalonIdOrderByCreatedAtDesc(Long salonId, Pageable pageable);
    Page<Review> findByCustomerIdOrderByCreatedAtDesc(UUID customerId, Pageable pageable);
    boolean existsByBookingId(Long bookingId);
}
