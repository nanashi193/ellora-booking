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
        Salon salon = salonRepository.findForUpdateById(salonId)
                .orElseThrow(() -> new ResourceNotFoundException("Salon", "id", salonId));

        if (salon.getStatus() != SalonStatus.PENDING_APPROVAL) {
            throw new BadRequestException("Salon is not in pending approval status");
        }

        User owner = userRepository.findForUpdateById(salon.getOwner().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));
        if (owner.getRole() != com.bookingnailms.enums.Role.CUSTOMER || !owner.isEnabled() || owner.isLocked()) {
            throw new BadRequestException("Tài khoản đăng ký không đủ điều kiện cấp quyền chủ salon");
        }
        owner.setRole(com.bookingnailms.enums.Role.SALON_OWNER);
        userRepository.save(owner);
        salon.setStatus(SalonStatus.ACTIVE);
        salonRepository.save(salon);
        log.info("Salon approved: {}", salon.getName());
    }

    @Transactional
    public void rejectSalon(Long salonId) {
        Salon salon = salonRepository.findForUpdateById(salonId)
                .orElseThrow(() -> new ResourceNotFoundException("Salon", "id", salonId));

        if (salon.getStatus() != SalonStatus.PENDING_APPROVAL) {
            throw new BadRequestException("Salon is not in pending approval status");
        }

        salon.setStatus(SalonStatus.REJECTED);
        salonRepository.save(salon);
        log.info("Salon rejected: {}", salon.getName());
    }

    @Transactional
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public com.bookingnailms.dto.profile.AdminUserResponse setUserLocked(UUID userId, boolean locked, UUID adminId) {
        User user = userRepository.findForUpdateById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        if (userId.equals(adminId) || user.getRole() == com.bookingnailms.enums.Role.ADMIN) {
            throw new BadRequestException("Không thể khóa hoặc mở khóa tài khoản quản trị viên tại đây.");
        }
        user.setLocked(locked);
        userRepository.save(user);
        return com.bookingnailms.dto.profile.AdminUserResponse.from(user);
    }

    @Transactional(readOnly = true)
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public PageResponse<com.bookingnailms.dto.profile.AdminUserResponse> getAllUsers(String keyword, Pageable pageable) {
        String query = keyword == null ? "" : keyword.trim();
        Page<User> users = query.isEmpty() ? userRepository.findAll(pageable)
                : userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query, pageable);
        return PageResponse.of(users.map(com.bookingnailms.dto.profile.AdminUserResponse::from).getContent(), users);
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
