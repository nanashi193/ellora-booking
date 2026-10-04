package com.bookingnailms.repository;

import com.bookingnailms.entity.SalonProfileChange;
import com.bookingnailms.entity.SalonProfileChange.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SalonProfileChangeRepository extends JpaRepository<SalonProfileChange, Long> {
    boolean existsBySalonIdAndStatus(Long salonId, Status status);
    Optional<SalonProfileChange> findFirstBySalonIdOrderByIdDesc(Long salonId);
    Page<SalonProfileChange> findByStatus(Status status, Pageable pageable);
}
