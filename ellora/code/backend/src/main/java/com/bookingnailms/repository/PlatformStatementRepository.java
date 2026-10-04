package com.bookingnailms.repository;
import com.bookingnailms.entity.PlatformStatement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Optional;
public interface PlatformStatementRepository extends JpaRepository<PlatformStatement,Long> {
    Optional<PlatformStatement> findBySalonIdAndBillingMonth(Long salonId,LocalDate month);
}
