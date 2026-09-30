package com.bookingnailms.service;

import com.bookingnailms.enums.BookingStatus;
import com.bookingnailms.enums.Role;
import com.bookingnailms.enums.SalonStatus;
import com.bookingnailms.exception.BadRequestException;
import com.bookingnailms.repository.BookingRepository;
import com.bookingnailms.repository.SalonRepository;
import com.bookingnailms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.DayOfWeek;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {
    private final UserRepository users;
    private final SalonRepository salons;
    private final BookingRepository bookings;

    public record Summary(long customers, long activeSalons, long salonsAwaitingApproval,
            long totalBookings, long completedBookings, long customersWithCompletedBooking,
            long returningCustomers, BigDecimal returningCustomerRate) {}
    public record RevenuePoint(LocalDate date, BigDecimal gross, BigDecimal fee, long bookings) {}
    public record RevenueReport(LocalDate from, LocalDate to, String groupBy, BigDecimal gross, BigDecimal fee,
            long completedBookings, long estimatedBookings, List<RevenuePoint> points) {}

    @Transactional(readOnly = true)
    public Summary summary() {
        long completedCustomers = bookings.countDistinctCustomersByStatus(BookingStatus.COMPLETED);
        long returningCustomers = bookings.countReturningCustomers();
        BigDecimal rate = completedCustomers == 0 ? BigDecimal.ZERO
                : BigDecimal.valueOf(returningCustomers).multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(completedCustomers), 1, RoundingMode.HALF_UP);
        return new Summary(users.countByRole(Role.CUSTOMER), salons.countByStatus(SalonStatus.ACTIVE),
                salons.countByStatus(SalonStatus.PENDING_APPROVAL), bookings.count(),
                bookings.countByStatus(BookingStatus.COMPLETED), completedCustomers, returningCustomers, rate);
    }

    @Transactional(readOnly = true)
    public RevenueReport revenue(LocalDate from, LocalDate to, String groupBy) {
        if (from == null || to == null || to.isBefore(from) || to.isAfter(from.plusYears(10))
                || !Set.of("day", "week", "month", "year").contains(groupBy)) {
            throw new BadRequestException("Chọn khoảng ngày hợp lệ (tối đa 10 năm) và nhóm ngày/tuần/tháng/năm.");
        }
        var rows = bookings.platformRevenue(from.atStartOfDay(), to.plusDays(1).atStartOfDay(), groupBy);
        Map<LocalDate, BookingRepository.RevenueBucket> data = new HashMap<>();
        rows.forEach(row -> data.put(row.getBucketStart().toLocalDate(), row));
        List<RevenuePoint> points = new ArrayList<>();
        BigDecimal gross = BigDecimal.ZERO, fee = BigDecimal.ZERO;
        long count = 0, estimated = 0;
        for (LocalDate date = floor(from, groupBy); !date.isAfter(to); date = next(date, groupBy)) {
            var row = data.get(date);
            BigDecimal periodGross = row == null ? BigDecimal.ZERO : row.getGross();
            BigDecimal periodFee = row == null ? BigDecimal.ZERO : row.getFee();
            long periodCount = row == null ? 0 : row.getCount();
            points.add(new RevenuePoint(date, periodGross, periodFee, periodCount));
            gross = gross.add(periodGross); fee = fee.add(periodFee); count += periodCount;
            estimated += row == null ? 0 : row.getEstimated();
        }
        return new RevenueReport(from, to, groupBy, gross, fee, count, estimated, points);
    }

    private LocalDate floor(LocalDate date, String group) {
        return switch (group) {
            case "week" -> date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            case "month" -> date.withDayOfMonth(1);
            case "year" -> date.withDayOfYear(1);
            default -> date;
        };
    }

    private LocalDate next(LocalDate date, String group) {
        return switch (group) {
            case "week" -> date.plusWeeks(1);
            case "month" -> date.plusMonths(1);
            case "year" -> date.plusYears(1);
            default -> date.plusDays(1);
        };
    }
}
