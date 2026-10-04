package com.bookingnailms.entity;

import com.bookingnailms.dto.salon.SalonRequest;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;
import java.util.List;

@Entity
@Table(name = "salon_profile_changes", indexes = {
        @Index(name = "idx_salon_profile_changes_status", columnList = "status,id"),
        @Index(name = "idx_salon_profile_changes_salon", columnList = "salon_id,id")})
@Getter @Setter @NoArgsConstructor
public class SalonProfileChange {
    public enum Status { PENDING, APPROVED, REJECTED }
    public enum Kind { PROFILE, COVER, GALLERY }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "salon_id", nullable = false)
    private Salon salon;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private SalonRequest proposed;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private Kind kind = Kind.PROFILE;
    @Column(columnDefinition = "text")
    private String previousLogoUrl;
    @Column(columnDefinition = "text")
    private String proposedLogoUrl;
    @JdbcTypeCode(SqlTypes.JSON) @Column(columnDefinition = "jsonb")
    private List<String> previousImageUrls;
    @JdbcTypeCode(SqlTypes.JSON) @Column(columnDefinition = "jsonb")
    private List<String> proposedImageUrls;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private Status status = Status.PENDING;
    @Column(nullable = false)
    private Instant submittedAt = Instant.now();
    private Instant reviewedAt;
    private UUID reviewedBy;
}
