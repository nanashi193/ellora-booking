package com.bookingnailms.repository;

import com.bookingnailms.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select r from Review r where r.id = :id")
    java.util.Optional<Review> findForUpdateById(@org.springframework.data.repository.query.Param("id") Long id);
    Page<Review> findBySalonIdOrderByCreatedAtDesc(Long salonId, Pageable pageable);
    Page<Review> findByCustomerIdOrderByCreatedAtDesc(UUID customerId, Pageable pageable);
    boolean existsByBookingId(Long bookingId);
}
