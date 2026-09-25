package com.bookingnailms.dto.review;

import jakarta.validation.constraints.*;

public record AdminReviewRequest(@NotNull @Min(1) @Max(5) Integer rating, @Size(max = 1000) String comment) {}
