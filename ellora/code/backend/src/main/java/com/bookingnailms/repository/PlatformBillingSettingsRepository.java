package com.bookingnailms.repository;
import com.bookingnailms.entity.PlatformBillingSettings;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.util.Optional;
public interface PlatformBillingSettingsRepository extends JpaRepository<PlatformBillingSettings,Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select s from PlatformBillingSettings s where s.id = 1")
    Optional<PlatformBillingSettings> lockSettings();
}
