package com.bookingnailms.service;

import com.bookingnailms.enums.BookingStatus;
import com.bookingnailms.exception.ResourceNotFoundException;
import com.bookingnailms.repository.BookingRepository;
import com.bookingnailms.repository.SalonRepository;
import com.bookingnailms.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class OwnerDashboardService {
    private final SalonRepository salons;
    private final BookingRepository bookings;
    private final ReviewRepository reviews;

    public record Summary(long totalBookings, long pendingBookings, long confirmedBookings, long completedBookings,
            BigDecimal monthlyRevenue, long monthlyCustomers, double averageRating) {}

    @Transactional(readOnly = true)
    public Summary get(UUID ownerId) {
        Long id = salons.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Salon not found for current owner")).getId();
        LocalDate firstDay = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).withDayOfMonth(1);
        LocalDateTime start = firstDay.atStartOfDay();
        LocalDateTime end = firstDay.plusMonths(1).atStartOfDay();
        return new Summary(bookings.countBySalonId(id),
                bookings.countBySalonIdAndStatus(id, BookingStatus.PENDING),
                bookings.countBySalonIdAndStatus(id, BookingStatus.CONFIRMED),
                bookings.countBySalonIdAndStatus(id, BookingStatus.COMPLETED),
                bookings.completedGross(id, start, end),
                bookings.countCompletedCustomersBySalonAndPeriod(id, start, end),
                reviews.averageRatingBySalon(id));
    }
}
