package com.bookingnailms.entity;
import jakarta.persistence.*;
import lombok.*;
@Entity @Table(name="platform_billing_settings") @Getter @Setter @NoArgsConstructor
public class PlatformBillingSettings {
    @Id private Long id = 1L;
    private String qrUrl;
}
