package com.bookingnailms.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
@Entity @Table(name="platform_statements",uniqueConstraints=@UniqueConstraint(columnNames={"salon_id","billing_month"}))
@Getter @Setter @NoArgsConstructor
public class PlatformStatement {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="salon_id",nullable=false) private Long salonId;
    @Column(name="billing_month",nullable=false) private LocalDate billingMonth;
    @Column(nullable=false,precision=15,scale=0) private BigDecimal paidAmount = BigDecimal.ZERO;
    private LocalDateTime paidAt;
    private UUID confirmedBy;
    private LocalDateTime remindedAt;
}
