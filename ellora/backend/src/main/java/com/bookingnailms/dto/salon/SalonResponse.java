package com.bookingnailms.dto.salon;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalonResponse {
    private Long id;
    private String name;
    private String description;
    private String address;
    private String city;
    private String district;
    private String phone;
    private String email;
    private String logoUrl;
    private String status;
    private BigDecimal averageRating;
    private Integer totalReviews;
    private Long ownerId;
    private String ownerName;
}
