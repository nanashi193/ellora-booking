package com.bookingnailms.dto.salon;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalonSummaryResponse {

    private Long id;
    private String name;
    private String address;
    private String city;
    private String logoUrl;
    private Double averageRating;
    private Integer totalReviews;
}
