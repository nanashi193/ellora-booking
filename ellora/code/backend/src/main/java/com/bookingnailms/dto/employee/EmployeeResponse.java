package com.bookingnailms.dto.employee;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {

    private Long id;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private String bio;
    private boolean active;
}
