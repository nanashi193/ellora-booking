package com.bookingnailms.dto.booking;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {

    @NotNull(message = "Salon không được để trống")
    private Long salonId;

    @NotNull(message = "Dịch vụ không được để trống")
    private Long serviceId;

    private Long employeeId;

    @NotNull(message = "Thời gian hẹn không được để trống")
    private LocalDateTime scheduledAt;

    @Size(max = 1000, message = "Ghi chú không được vượt quá 1000 ký tự")
    private String customerNote;
}
