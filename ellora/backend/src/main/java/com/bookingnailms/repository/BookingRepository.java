package com.bookingnailms.repository;

import com.bookingnailms.entity.Booking;
import com.bookingnailms.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Page<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId, Pageable pageable);

    Page<Booking> findBySalonIdOrderByScheduledAtDesc(Long salonId, Pageable pageable);

    Page<Booking> findBySalonIdAndStatusOrderByScheduledAtDesc(Long salonId, BookingStatus status, Pageable pageable);

    List<Booking> findByEmployeeIdAndScheduledAtBetween(Long employeeId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(SUM(b.service.price), 0) FROM Booking b " +
           "WHERE b.salon.id = :salonId AND b.status = 'COMPLETED' " +
           "AND b.scheduledAt BETWEEN :start AND :end")
    BigDecimal calculateRevenue(@Param("salonId") Long salonId,
                                @Param("start") LocalDateTime start,
                                @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(b.service.price), 0) FROM Booking b " +
           "WHERE b.status = 'COMPLETED' AND b.scheduledAt BETWEEN :start AND :end")
    BigDecimal calculateTotalPlatformRevenue(@Param("start") LocalDateTime start,
                                             @Param("end") LocalDateTime end);
}
