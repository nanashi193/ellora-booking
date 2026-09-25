package com.bookingnailms.service;

import com.bookingnailms.dto.common.PageResponse;
import com.bookingnailms.repository.*;
import com.bookingnailms.exception.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@Service @RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminContentService {
    private final SalonRepository salons;
    private final NailServiceRepository services;
    private final EmployeeRepository employees;
    private final OwnerPhotoService photos;
    private final CloudinaryImageService cloud;
    public record SalonItem(Long id, String name, String status) {}
    public record PhotoItem(String kind, Long id, String name, String url) {}
    public record Content(Long id, String name, List<PhotoItem> photos, List<String> gallery) {}
    @Transactional(readOnly = true)
    public PageResponse<SalonItem> list(int page) {
        var result = salons.findAll(PageRequest.of(Math.max(0, page), 20, Sort.by("id").descending()));
        return PageResponse.of(result.stream().map(s -> new SalonItem(s.getId(), s.getName(), s.getStatus().name())).toList(), result);
    }

    @Transactional(readOnly = true)
    public Content detail(Long id) {
        var salon = salons.findById(id).orElseThrow(() -> new ResourceNotFoundException("Salon not found"));
        List<PhotoItem> items = new ArrayList<>();
        items.add(new PhotoItem("cover", id, "Ảnh đại diện tiệm", salon.getLogoUrl()));
        services.findBySalonId(id, Pageable.unpaged()).forEach(s -> items.add(new PhotoItem("services", s.getId(), s.getName(), s.getImageUrl())));
        employees.findBySalonId(id).forEach(e -> items.add(new PhotoItem("employees", e.getId(), e.getFullName(), e.getAvatarUrl())));
        return new Content(id, salon.getName(), items, new ArrayList<>(salon.getImageUrls()));
    }

    @Transactional
    public String upload(Long salonId, String kind, Long id, MultipartFile file, String oldUrl) {
        var salon = salons.findForUpdateById(salonId).orElseThrow(() -> new ResourceNotFoundException("Salon not found"));
        if ("gallery".equals(kind) && oldUrl != null) {
            if (!salonId.equals(id)) throw new BadRequestException("Ảnh không thuộc tiệm này.");
            int index = salon.getImageUrls().indexOf(oldUrl);
            if (index < 0) throw new ResourceNotFoundException("Ảnh không còn trong bộ ảnh.");
            String url = cloud.upload(file);
            salon.getImageUrls().set(index, url);
            return url;
        }
        return photos.upload(salon.getOwner().getId(), kind, id, file);
    }

    @Transactional
    public void remove(Long salonId, String kind, Long id, String url) {
        var salon = salons.findForUpdateById(salonId).orElseThrow(() -> new ResourceNotFoundException("Salon not found"));
        if ("gallery".equals(kind)) {
            if (!salonId.equals(id) || url == null) throw new BadRequestException("Ảnh không hợp lệ.");
            photos.removeGallery(salon.getOwner().getId(), url);
        } else photos.remove(salon.getOwner().getId(), kind, id);
    }
}
