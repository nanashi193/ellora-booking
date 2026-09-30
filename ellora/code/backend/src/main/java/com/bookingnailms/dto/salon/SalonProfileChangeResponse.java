package com.bookingnailms.dto.salon;

import com.bookingnailms.entity.SalonProfileChange.Status;
import java.time.Instant;
import java.util.List;
import com.bookingnailms.entity.SalonProfileChange.Kind;

public record SalonProfileChangeResponse(Long id, Long salonId, String salonName,
        SalonRequest current, SalonRequest proposed, Status status, Instant submittedAt, Instant reviewedAt,
        Kind kind, String currentLogoUrl, String proposedLogoUrl,
        List<String> currentImageUrls, List<String> proposedImageUrls) {}
