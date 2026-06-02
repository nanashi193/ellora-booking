package com.bookingnailms.service;

import com.bookingnailms.dto.service.ServiceRequest;
import com.bookingnailms.dto.service.ServiceResponse;
import com.bookingnailms.entity.NailService;
import com.bookingnailms.entity.Salon;
import com.bookingnailms.entity.ServiceCategory;
import com.bookingnailms.exception.ResourceNotFoundException;
import com.bookingnailms.exception.UnauthorizedException;
import com.bookingnailms.repository.NailServiceRepository;
import com.bookingnailms.repository.SalonRepository;
import com.bookingnailms.repository.ServiceCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NailServiceService {

    private final NailServiceRepository nailServiceRepository;
    private final SalonRepository salonRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;

    @Transactional
    public ServiceResponse addService(ServiceRequest request, Long salonId) {
        Salon salon = salonRepository.findById(salonId)
                .orElseThrow(() -> new ResourceNotFoundException("Salon", "id", salonId));

        ServiceCategory category = null;
        if (request.getCategoryId() != null) {
            category = serviceCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("ServiceCategory", "id", request.getCategoryId()));
        }

        NailService nailService = NailService.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .durationMinutes(request.getDurationMinutes())
                .active(true)
                .salon(salon)
                .category(category)
                .build();

        nailService = nailServiceRepository.save(nailService);
        log.info("Service added: {} to salon: {}", nailService.getName(), salon.getName());

        return mapToServiceResponse(nailService);
    }

    @Transactional
    public ServiceResponse updateService(Long serviceId, ServiceRequest request, Long ownerId) {
        NailService nailService = nailServiceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", serviceId));

        if (!nailService.getSalon().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You are not the owner of this salon");
        }

        ServiceCategory category = null;
        if (request.getCategoryId() != null) {
            category = serviceCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("ServiceCategory", "id", request.getCategoryId()));
        }

        nailService.setName(request.getName());
        nailService.setDescription(request.getDescription());
        nailService.setPrice(request.getPrice());
        nailService.setDurationMinutes(request.getDurationMinutes());
        nailService.setCategory(category);

        nailService = nailServiceRepository.save(nailService);
        log.info("Service updated: {}", nailService.getName());

        return mapToServiceResponse(nailService);
    }

    @Transactional
    public void deleteService(Long serviceId, Long ownerId) {
        NailService nailService = nailServiceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", serviceId));

        if (!nailService.getSalon().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You are not the owner of this salon");
        }

        nailService.setActive(false);
        nailServiceRepository.save(nailService);
        log.info("Service soft-deleted: {}", nailService.getName());
    }

    @Transactional(readOnly = true)
    public List<ServiceResponse> getServicesBySalon(Long salonId) {
        if (!salonRepository.existsById(salonId)) {
            throw new ResourceNotFoundException("Salon", "id", salonId);
        }

        return nailServiceRepository.findBySalonIdAndActiveTrue(salonId).stream()
                .map(this::mapToServiceResponse)
                .collect(Collectors.toList());
    }

    private ServiceResponse mapToServiceResponse(NailService nailService) {
        return ServiceResponse.builder()
                .id(nailService.getId())
                .name(nailService.getName())
                .description(nailService.getDescription())
                .price(nailService.getPrice())
                .durationMinutes(nailService.getDurationMinutes())
                .imageUrl(nailService.getImageUrl())
                .categoryName(nailService.getCategory() != null ? nailService.getCategory().getName() : null)
                .active(nailService.isActive())
                .build();
    }
}
