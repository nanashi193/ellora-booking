package com.bookingnailms.service;

import com.bookingnailms.dto.common.PageResponse;
import com.bookingnailms.dto.salon.SalonRequest;
import com.bookingnailms.dto.salon.SalonResponse;
import com.bookingnailms.dto.salon.SalonSummaryResponse;
import com.bookingnailms.entity.Salon;
import com.bookingnailms.entity.User;
import com.bookingnailms.enums.SalonStatus;
import com.bookingnailms.exception.BadRequestException;
import com.bookingnailms.exception.ResourceNotFoundException;
import com.bookingnailms.exception.UnauthorizedException;
import com.bookingnailms.repository.SalonRepository;
import com.bookingnailms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SalonService {

    private final SalonRepository salonRepository;
    private final UserRepository userRepository;

    @Transactional
    public SalonResponse createSalon(SalonRequest request, UUID ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", ownerId));

        if (salonRepository.existsByOwnerId(ownerId)) {
            throw new BadRequestException("You already have a salon registered");
        }

        Salon salon = Salon.builder()
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .city(request.getCity())
                .district(request.getDistrict())
                .phone(request.getPhone())
                .email(request.getEmail())
                .status(SalonStatus.PENDING_APPROVAL)
                .averageRating(BigDecimal.ZERO)
                .totalReviews(0)
                .owner(owner)
                .build();

        salon = salonRepository.save(salon);
        log.info("Salon created: {} by owner: {}", salon.getName(), owner.getEmail());

        return mapToSalonResponse(salon);
    }

    @Transactional
    public SalonResponse updateSalon(Long salonId, SalonRequest request, UUID ownerId) {
        Salon salon = salonRepository.findById(salonId)
                .orElseThrow(() -> new ResourceNotFoundException("Salon", "id", salonId));

        if (!salon.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You are not the owner of this salon");
        }

        salon.setName(request.getName());
        salon.setDescription(request.getDescription());
        salon.setAddress(request.getAddress());
        salon.setCity(request.getCity());
        salon.setDistrict(request.getDistrict());
        salon.setPhone(request.getPhone());
        salon.setEmail(request.getEmail());

        salon = salonRepository.save(salon);
        log.info("Salon updated: {}", salon.getName());

        return mapToSalonResponse(salon);
    }

    @Transactional(readOnly = true)
    public SalonResponse getSalonById(Long id) {
        Salon salon = salonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salon", "id", id));
        return mapToSalonResponse(salon);
    }

    @Transactional(readOnly = true)
    public PageResponse<SalonSummaryResponse> searchSalons(String keyword, Pageable pageable) {
        Page<Salon> salonsPage;

        if (keyword != null && !keyword.trim().isEmpty()) {
            salonsPage = salonRepository.findByNameContainingIgnoreCaseAndStatus(
                    keyword.trim(), SalonStatus.ACTIVE, pageable);
        } else {
            salonsPage = salonRepository.findByStatus(SalonStatus.ACTIVE, pageable);
        }

        List<SalonSummaryResponse> summaries = salonsPage.getContent().stream()
                .map(this::mapToSalonSummaryResponse)
                .collect(Collectors.toList());

        return PageResponse.of(summaries, salonsPage);
    }

    @Transactional(readOnly = true)
    public SalonResponse getMySalon(UUID ownerId) {
        Salon salon = salonRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Salon not found for current owner"));
        return mapToSalonResponse(salon);
    }

    private SalonResponse mapToSalonResponse(Salon salon) {
        return SalonResponse.builder()
                .id(salon.getId())
                .name(salon.getName())
                .description(salon.getDescription())
                .address(salon.getAddress())
                .city(salon.getCity())
                .district(salon.getDistrict())
                .phone(salon.getPhone())
                .email(salon.getEmail())
                .logoUrl(salon.getLogoUrl())
                .imageUrls(salon.getImageUrls())
                .status(salon.getStatus())
                .latitude(salon.getLatitude())
                .longitude(salon.getLongitude())
                .averageRating(salon.getAverageRating())
                .totalReviews(salon.getTotalReviews())
                .ownerId(salon.getOwner().getId())
                .ownerName(salon.getOwner().getFullName())
                .serviceCount(salon.getServices() != null ? salon.getServices().size() : 0)
                .createdAt(salon.getCreatedAt())
                .updatedAt(salon.getUpdatedAt())
                .build();
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
