package com.bookingnailms.service;

import com.bookingnailms.dto.salon.SalonWorkingHourRequest;
import com.bookingnailms.entity.SalonWorkingHour;
import com.bookingnailms.exception.BadRequestException;
import com.bookingnailms.exception.ResourceNotFoundException;
import com.bookingnailms.repository.SalonRepository;
import com.bookingnailms.repository.SalonWorkingHourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SalonWorkingHourService {
    private final SalonWorkingHourRepository hours;
    private final SalonRepository salons;

    @Transactional(readOnly = true)
    public List<SalonWorkingHourRequest> get(Long salonId) {
        requireSalon(salonId);
        var saved = hours.findBySalonIdOrderByDayOfWeek(salonId);
        return Arrays.stream(DayOfWeek.values()).map(day -> saved.stream()
                .filter(row -> row.getDayOfWeek() == day).findFirst()
                .map(row -> new SalonWorkingHourRequest(day, row.getOpenTime(), row.getCloseTime(), row.isClosed()))
                .orElseGet(() -> defaults(day))).toList();
    }

    @Transactional
    public List<SalonWorkingHourRequest> update(UUID ownerId, List<SalonWorkingHourRequest> requested) {
        var salon = salons.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Salon not found for current owner"));
        if (requested == null || requested.size() != 7 || requested.stream().anyMatch(Objects::isNull)
                || requested.stream().map(SalonWorkingHourRequest::dayOfWeek).distinct().count() != 7
                || requested.stream().anyMatch(row -> row.dayOfWeek() == null)) {
            throw new BadRequestException("Cần cài đặt giờ cho đủ bảy ngày trong tuần.");
        }
        for (var row : requested) {
            if (!row.closed() && (row.openTime() == null || row.closeTime() == null
                    || !row.openTime().isBefore(row.closeTime())
                    || row.openTime().getMinute() % 30 != 0 || row.closeTime().getMinute() % 30 != 0
                    || row.openTime().getSecond() != 0 || row.closeTime().getSecond() != 0
                    || row.openTime().getNano() != 0 || row.closeTime().getNano() != 0)) {
                throw new BadRequestException("Giờ mở và đóng cửa phải hợp lệ, cách nhau theo mốc 30 phút.");
            }
        }
        var existing = hours.findBySalonIdOrderByDayOfWeek(salon.getId()).stream()
                .collect(java.util.stream.Collectors.toMap(SalonWorkingHour::getDayOfWeek, row -> row));
        hours.saveAll(requested.stream().map(row -> {
            var saved = existing.getOrDefault(row.dayOfWeek(), SalonWorkingHour.builder()
                    .salon(salon).dayOfWeek(row.dayOfWeek()).build());
            saved.setClosed(row.closed());
            saved.setOpenTime(row.closed() ? null : row.openTime());
            saved.setCloseTime(row.closed() ? null : row.closeTime());
            return saved;
        }).toList());
        return get(salon.getId());
    }

    @Transactional(readOnly = true)
    public SalonWorkingHourRequest get(Long salonId, DayOfWeek day) {
        requireSalon(salonId);
        return hours.findBySalonIdAndDayOfWeek(salonId, day)
                .map(row -> new SalonWorkingHourRequest(day, row.getOpenTime(), row.getCloseTime(), row.isClosed()))
                .orElseGet(() -> defaults(day));
    }

    private void requireSalon(Long id) {
        if (!salons.existsById(id)) throw new ResourceNotFoundException("Salon", "id", id);
    }

    private SalonWorkingHourRequest defaults(DayOfWeek day) {
        boolean closed = day == DayOfWeek.SUNDAY;
        return new SalonWorkingHourRequest(day, closed ? null : LocalTime.of(9, 0), closed ? null : LocalTime.of(18, 0), closed);
    }
}
