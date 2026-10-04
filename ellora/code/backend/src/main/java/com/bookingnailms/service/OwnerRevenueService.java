package com.bookingnailms.service;

import com.bookingnailms.repository.*;
import com.bookingnailms.exception.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.*;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service @RequiredArgsConstructor
public class OwnerRevenueService {
    private final SalonRepository salons;
    private final BookingRepository bookings;
    public record Point(LocalDate date, BigDecimal gross, BigDecimal fee, BigDecimal net, long bookings) {}
    public record Report(LocalDate from, LocalDate to, String groupBy, BigDecimal gross, BigDecimal fee,
                         BigDecimal net, long completedBookings, long estimatedBookings, List<Point> points) {}

    @Transactional(readOnly = true)
    public Report report(UUID owner, LocalDate from, LocalDate to, String groupBy) {
        if (from == null || to == null || to.isBefore(from) || to.isAfter(from.plusYears(10))
                || !Set.of("day", "week", "month", "year").contains(groupBy)) {
            throw new BadRequestException("Chọn khoảng ngày hợp lệ (tối đa 10 năm) và nhóm ngày/tuần/tháng/năm.");
        }
        var salon = salons.findByOwnerId(owner).orElseThrow(() -> new ResourceNotFoundException("Salon not found"));
        var rows = bookings.revenue(salon.getId(), from.atStartOfDay(), to.plusDays(1).atStartOfDay(), groupBy);
        Map<LocalDate, BookingRepository.RevenueBucket> data = new HashMap<>();
        rows.forEach(row -> data.put(row.getBucketStart().toLocalDate(), row));
        List<Point> points = new ArrayList<>();
        BigDecimal gross = BigDecimal.ZERO, fee = BigDecimal.ZERO;
        long count = 0, estimated = 0;
        for (LocalDate day = floor(from, groupBy); !day.isAfter(to); day = next(day, groupBy)) {
            var row = data.get(day);
            BigDecimal g = row == null ? BigDecimal.ZERO : row.getGross();
            BigDecimal f = row == null ? BigDecimal.ZERO : row.getFee();
            long n = row == null ? 0 : row.getCount();
            points.add(new Point(day, g, f, g.subtract(f), n));
            gross = gross.add(g); fee = fee.add(f); count += n;
            estimated += row == null ? 0 : row.getEstimated();
        }
        return new Report(from, to, groupBy, gross, fee, gross.subtract(fee), count, estimated, points);
    }
    private LocalDate floor(LocalDate day, String group) {
        return switch (group) {
            case "week" -> day.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            case "month" -> day.withDayOfMonth(1);
            case "year" -> day.withDayOfYear(1);
            default -> day;
        };
    }
    private LocalDate next(LocalDate day, String group) {
        return switch (group) {
            case "week" -> day.plusWeeks(1);
            case "month" -> day.plusMonths(1);
            case "year" -> day.plusYears(1);
            default -> day.plusDays(1);
        };
    }
}
