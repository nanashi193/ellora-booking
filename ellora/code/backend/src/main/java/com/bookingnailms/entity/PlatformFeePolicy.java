package com.bookingnailms.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
@Entity @Table(name="platform_fee_policies") @Getter @Setter @NoArgsConstructor
public class PlatformFeePolicy {
    @Id private LocalDate effectiveMonth;
    @Column(nullable=false,precision=5,scale=2) private BigDecimal percent;
}
