package com.bookingnailms.service;

import com.bookingnailms.enums.BookingStatus;
import com.bookingnailms.exception.ResourceNotFoundException;
import com.bookingnailms.repository.BookingRepository;
import com.bookingnailms.repository.SalonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OwnerDashboardService {
    private final SalonRepository salons;
    private final BookingRepository bookings;

    public record Summary(long totalBookings, long pendingBookings, long confirmedBookings, long completedBookings) {}

    @Transactional(readOnly = true)
    public Summary get(UUID ownerId) {
        Long id = salons.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Salon not found for current owner")).getId();
        return new Summary(bookings.countBySalonId(id),
                bookings.countBySalonIdAndStatus(id, BookingStatus.PENDING),
                bookings.countBySalonIdAndStatus(id, BookingStatus.CONFIRMED),
                bookings.countBySalonIdAndStatus(id, BookingStatus.COMPLETED));
    }
}
