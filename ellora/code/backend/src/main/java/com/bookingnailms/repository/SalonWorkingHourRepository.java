package com.bookingnailms.repository;

import com.bookingnailms.entity.SalonWorkingHour;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

public interface SalonWorkingHourRepository extends JpaRepository<SalonWorkingHour, Long> {
    List<SalonWorkingHour> findBySalonIdOrderByDayOfWeek(Long salonId);
    Optional<SalonWorkingHour> findBySalonIdAndDayOfWeek(Long salonId, DayOfWeek dayOfWeek);
}
