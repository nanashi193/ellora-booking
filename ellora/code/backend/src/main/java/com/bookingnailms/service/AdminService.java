package com.bookingnailms.service;

import com.bookingnailms.dto.common.PageResponse;
import com.bookingnailms.dto.salon.SalonSummaryResponse;
import com.bookingnailms.entity.Salon;
import com.bookingnailms.entity.User;
import com.bookingnailms.enums.SalonStatus;
import com.bookingnailms.exception.BadRequestException;
import com.bookingnailms.exception.ResourceNotFoundException;
import com.bookingnailms.repository.BookingRepository;
import com.bookingnailms.repository.PaymentRepository;
import com.bookingnailms.repository.SalonRepository;
import com.bookingnailms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final SalonRepository salonRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public PageResponse<SalonSummaryResponse> getPendingSalons(Pageable pageable) {
        Page<Salon> salonsPage = salonRepository.findByStatus(SalonStatus.PENDING_APPROVAL, pageable);

        List<SalonSummaryResponse> summaries = salonsPage.getContent().stream()
                .map(this::mapToSalonSummaryResponse)
                .collect(Collectors.toList());

        return PageResponse.of(summaries, salonsPage);
    }

    @Transactional
    public void approveSalon(Long salonId) {
        Salon salon = salonRepository.findById(salonId)
                .orElseThrow(() -> new ResourceNotFoundException("Salon", "id", salonId));

        if (salon.getStatus() != SalonStatus.PENDING_APPROVAL) {
            throw new BadRequestException("Salon is not in pending approval status");
        }

        salon.setStatus(SalonStatus.ACTIVE);
        salonRepository.save(salon);
        log.info("Salon approved: {}", salon.getName());
    }

    @Transactional
    public void rejectSalon(Long salonId) {
        Salon salon = salonRepository.findById(salonId)
                .orElseThrow(() -> new ResourceNotFoundException("Salon", "id", salonId));

        if (salon.getStatus() != SalonStatus.PENDING_APPROVAL) {
            throw new BadRequestException("Salon is not in pending approval status");
        }

        salon.setStatus(SalonStatus.REJECTED);
        salonRepository.save(salon);
        log.info("Salon rejected: {}", salon.getName());
    }

    @Transactional
    public void lockUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setLocked(true);
        userRepository.save(user);
        log.info("User locked: {}", user.getEmail());
    }

    @Transactional
    public void unlockUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setLocked(false);
        userRepository.save(user);
        log.info("User unlocked: {}", user.getEmail());
    }

    @Transactional(readOnly = true)
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public BigDecimal getPlatformRevenue(LocalDateTime start, LocalDateTime end) {
        // Sum all completed booking payments within the date range
        return bookingRepository.findAll().stream()
                .filter(b -> b.getPayment() != null)
                .filter(b -> b.getCreatedAt() != null)
                .filter(b -> !b.getCreatedAt().isBefore(start) && !b.getCreatedAt().isAfter(end))
                .map(b -> b.getPayment().getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private SalonSummaryResponse mapToSalonSummaryResponse(Salon salon) {
        return SalonSummaryResponse.builder()
                .id(salon.getId())
                .name(salon.getName())
                .address(salon.getAddress())
                .city(salon.getCity())
                .logoUrl(salon.getLogoUrl())
                .averageRating(salon.getAverageRating())
                .totalReviews(salon.getTotalReviews())
                .build();
    }
}
