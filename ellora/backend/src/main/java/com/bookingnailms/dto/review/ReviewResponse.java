package com.bookingnailms.dto.review;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {

    private Long id;
    private String customerName;
    private Integer rating;
    private String comment;
    private String salonReply;
    private LocalDateTime salonRepliedAt;
    private LocalDateTime createdAt;
}
