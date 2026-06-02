package com.bookingnailms.repository;

import com.bookingnailms.entity.Salon;
import com.bookingnailms.enums.SalonStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SalonRepository extends JpaRepository<Salon, Long> {

    Page<Salon> findByStatus(SalonStatus status, Pageable pageable);

    Optional<Salon> findByOwnerId(Long ownerId);

    @Query("SELECT s FROM Salon s WHERE s.status = 'ACTIVE' AND " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.city) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.district) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Salon> searchActive(@Param("keyword") String keyword, Pageable pageable);

    Page<Salon> findByStatusAndCityIgnoreCase(SalonStatus status, String city, Pageable pageable);
}
