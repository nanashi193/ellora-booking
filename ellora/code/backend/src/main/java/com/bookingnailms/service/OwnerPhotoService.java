package com.bookingnailms.service;
import com.bookingnailms.repository.*;
import com.bookingnailms.exception.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;
@Service
@RequiredArgsConstructor
public class OwnerPhotoService {
    private final SalonRepository salons;
    private final NailServiceRepository services;
    private final EmployeeRepository employees;
    private final CloudinaryImageService cloud;
    @Transactional
    public String upload(UUID owner, String kind, Long id, MultipartFile file) {
        var owned=salons.findByOwnerId(owner).orElseThrow(()->new ResourceNotFoundException("Salon not found"));
        var salon=salons.findForUpdateById(owned.getId()).orElseThrow(()->new ResourceNotFoundException("Salon not found"));
        switch(kind) {
            case "cover", "gallery":
                if(!salon.getId().equals(id)) throw new AccessDeniedException("Not your salon");
                if(kind.equals("gallery") && salon.getImageUrls().size()>=10) throw new BadRequestException("Tối đa 10 ảnh salon.");
                String url=cloud.upload(file);
                if(kind.equals("cover")) salon.setLogoUrl(url); else salon.getImageUrls().add(url);
                salons.save(salon); return url;
            case "services":
                var service=services.findById(id).orElseThrow(()->new ResourceNotFoundException("Service not found"));
                if(!service.getSalon().getId().equals(salon.getId())) throw new AccessDeniedException("Not your service");
                String image=cloud.upload(file); service.setImageUrl(image); services.save(service); return image;
            case "employees":
                var employee=employees.findById(id).orElseThrow(()->new ResourceNotFoundException("Employee not found"));
                if(!employee.getSalon().getId().equals(salon.getId())) throw new AccessDeniedException("Not your employee");
                String avatar=cloud.upload(file); employee.setAvatarUrl(avatar); employees.save(employee); return avatar;
            default: throw new BadRequestException("Loại ảnh không hợp lệ.");
        }
    }
    @Transactional
    public void removeGallery(UUID owner, String url) {
        var owned=salons.findByOwnerId(owner).orElseThrow(()->new ResourceNotFoundException("Salon not found"));
        var salon=salons.findForUpdateById(owned.getId()).orElseThrow(()->new ResourceNotFoundException("Salon not found"));
        salon.getImageUrls().remove(url); salons.save(salon);
    }
}
