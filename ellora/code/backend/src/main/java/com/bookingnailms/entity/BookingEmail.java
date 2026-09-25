package com.bookingnailms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "booking_emails", uniqueConstraints = @UniqueConstraint(columnNames = {"booking_id", "kind"}))
@Getter @Setter @NoArgsConstructor
public class BookingEmail {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "booking_id")
    private Long bookingId;
    @Column(nullable = false)
    private String kind;
    @Column(nullable = false)
    private String recipient;
    @Column(nullable = false)
    private String subject;
    @Column(nullable = false, columnDefinition = "text")
    private String body;
    private Instant sentAt;
    @Column(nullable = false)
    private Instant nextAttemptAt = Instant.now();
    private int attempts;
}
