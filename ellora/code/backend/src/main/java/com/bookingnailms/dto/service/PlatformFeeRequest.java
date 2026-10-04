package com.bookingnailms.dto.service;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
public record PlatformFeeRequest(@NotNull @DecimalMin("0") @DecimalMax("100") @Digits(integer=3,fraction=2) BigDecimal percent) {}
