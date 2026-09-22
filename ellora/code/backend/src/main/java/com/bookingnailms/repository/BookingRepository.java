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
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    interface RevenueBucket {
        LocalDateTime getBucketStart();
        BigDecimal getGross();
        BigDecimal getFee();
        Long getCount();
        Long getEstimated();
    }

    @Query(value = "select date_trunc(:bucket, coalesce(b.completed_at,b.updated_at,b.scheduled_at)) as bucketStart, " +
            "coalesce(sum(coalesce(b.service_price_snapshot,s.price)), 0) as gross, " +
            "coalesce(sum(coalesce(b.service_price_snapshot,s.price) * coalesce((select p.percent from platform_fee_policies p " +
            "where p.effective_month <= cast(date_trunc('month', coalesce(b.completed_at,b.updated_at,b.scheduled_at)) as date) order by p.effective_month desc limit 1), 0) / 100), 0) as fee, " +
            "count(*) as count, count(*) filter (where b.revenue_estimated = true or b.service_price_snapshot is null or b.completed_at is null) as estimated " +
            "from bookings b join nail_services s on s.id=b.service_id where b.salon_id = :salon and b.status = 'COMPLETED' " +
            "and coalesce(b.completed_at,b.updated_at,b.scheduled_at) >= :start and coalesce(b.completed_at,b.updated_at,b.scheduled_at) < :end group by 1 order by 1", nativeQuery = true)
    List<RevenueBucket> revenue(@Param("salon") Long salonId, @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end, @Param("bucket") String bucket);

    @Query("select coalesce(sum(coalesce(b.servicePriceSnapshot,b.service.price)), 0) from Booking b where b.salon.id = :salon " +
            "and b.status = 'COMPLETED' and coalesce(b.completedAt,b.updatedAt,b.scheduledAt) >= :start and coalesce(b.completedAt,b.updatedAt,b.scheduledAt) < :end")
    BigDecimal completedGross(@Param("salon") Long salonId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Booking b where b.id = :id")
    java.util.Optional<Booking> findForUpdateById(@Param("id") Long id);
    long countBySalonId(Long salonId);
    long countBySalonIdAndStatus(Long salonId, BookingStatus status);

    Page<Booking> findByCustomerIdOrderByCreatedAtDesc(UUID customerId, Pageable pageable);

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
