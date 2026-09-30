package com.bookingnailms.dto.salon;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalonRequest {
    @NotBlank(message = "Tên salon không được để trống")
    @jakarta.validation.constraints.Size(max=255)
    private String name;

    @jakarta.validation.constraints.Size(max=5000)
    private String description;

    @NotBlank(message = "Địa chỉ không được để trống")
    @jakarta.validation.constraints.Size(max=255)
    private String address;

    @NotBlank(message = "Thành phố không được để trống")
    @jakarta.validation.constraints.Size(max=255)
    private String city;

    @NotBlank(message = "Quận/Huyện không được để trống")
    @jakarta.validation.constraints.Size(max=255)
    private String district;

    @jakarta.validation.constraints.Pattern(regexp="^$|^[+0-9 ()-]{8,20}$", message="Số điện thoại không hợp lệ")
    private String phone;

    @Email(message = "Email không hợp lệ")
    @jakarta.validation.constraints.Size(max=255)
    private String email;
}
