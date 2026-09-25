package com.bookingnailms.repository;
import com.bookingnailms.entity.PlatformFeePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Optional;
public interface PlatformFeePolicyRepository extends JpaRepository<PlatformFeePolicy,LocalDate> {
    Optional<PlatformFeePolicy> findFirstByEffectiveMonthLessThanEqualOrderByEffectiveMonthDesc(LocalDate month);
}
