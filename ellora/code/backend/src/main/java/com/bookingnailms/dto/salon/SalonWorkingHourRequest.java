package com.bookingnailms.dto.salon;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record SalonWorkingHourRequest(DayOfWeek dayOfWeek, LocalTime openTime, LocalTime closeTime, boolean closed) {}
