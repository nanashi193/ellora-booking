package com.bookingnailms.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import com.bookingnailms.enums.BookingStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private Long salonId;
    private String salonName;
    private Long serviceId;
    private String serviceName;
    private java.math.BigDecimal servicePrice;
    private Long employeeId;
    private String employeeName;
    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private BookingStatus status;
    private String customerNote;
    private String salonNote;
    private String cancellationReason;
    private LocalDateTime createdAt;
}
