package com.bookingnailms.service;
import com.bookingnailms.repository.*;
import com.bookingnailms.exception.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;
import java.util.ArrayList;
import java.util.List;
import com.bookingnailms.entity.SalonProfileChange.Kind;
@Service
@RequiredArgsConstructor
public class OwnerPhotoService {
    private final SalonRepository salons;
    private final NailServiceRepository services;
    private final EmployeeRepository employees;
    private final CloudinaryImageService cloud;
    private final SalonProfileChangeService changes;
    @Transactional
    public String upload(UUID owner, String kind, Long id, MultipartFile file) {
        var owned=salons.findByOwnerId(owner).orElseThrow(()->new ResourceNotFoundException("Salon not found"));
        var salon=salons.findForUpdateById(owned.getId()).orElseThrow(()->new ResourceNotFoundException("Salon not found"));
        switch(kind) {
            case "cover", "gallery":
                if(!salon.getId().equals(id)) throw new AccessDeniedException("Not your salon");
                changes.preparePhotoChange(salon);
                if(kind.equals("gallery") && salon.getImageUrls().size()>=10) throw new BadRequestException("Tối đa 10 ảnh salon.");
                String url=cloud.upload(file);
                var gallery = new ArrayList<>(salon.getImageUrls());
                if(kind.equals("gallery")) gallery.add(url);
                changes.submitPhoto(salon, kind.equals("cover") ? Kind.COVER : Kind.GALLERY,
                        kind.equals("cover") ? url : salon.getLogoUrl(), gallery);
                return url;
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
    public List<String> uploadGallery(UUID owner, Long salonId, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) throw new BadRequestException("Chọn ít nhất một ảnh để tải lên.");
        if (files.size() > 10) throw new BadRequestException("Mỗi lần chỉ có thể tải tối đa 10 ảnh.");
        var owned = salons.findByOwnerId(owner).orElseThrow(() -> new ResourceNotFoundException("Salon not found"));
        if (!owned.getId().equals(salonId)) throw new AccessDeniedException("Not your salon");
        var salon = salons.findForUpdateById(owned.getId()).orElseThrow(() -> new ResourceNotFoundException("Salon not found"));
        changes.preparePhotoChange(salon);
        if (salon.getImageUrls().size() + files.size() > 10) {
            throw new BadRequestException("Mỗi tiệm được có tối đa 10 ảnh. Tiệm hiện có " + salon.getImageUrls().size() + " ảnh.");
        }
        var gallery = new ArrayList<>(salon.getImageUrls());
        var uploaded = new ArrayList<String>();
        for (MultipartFile file : files) {
            String url = cloud.upload(file);
            uploaded.add(url);
            gallery.add(url);
        }
        changes.submitPhoto(salon, Kind.GALLERY, salon.getLogoUrl(), gallery);
        return uploaded;
    }
    @Transactional
    public void remove(UUID owner, String kind, Long id) {
        var owned=salons.findByOwnerId(owner).orElseThrow(()->new ResourceNotFoundException("Salon not found"));
        var salon=salons.findForUpdateById(owned.getId()).orElseThrow(()->new ResourceNotFoundException("Salon not found"));
        switch(kind) {
            case "cover":
                if(!salon.getId().equals(id)) throw new AccessDeniedException("Not your salon");
                changes.preparePhotoChange(salon);
                changes.submitPhoto(salon, Kind.COVER, null, salon.getImageUrls()); break;
            case "services":
                var service=services.findById(id).orElseThrow(()->new ResourceNotFoundException("Service not found"));
                if(!service.getSalon().getId().equals(salon.getId())) throw new AccessDeniedException("Not your service");
                service.setImageUrl(null); services.save(service); break;
            case "employees":
                var employee=employees.findById(id).orElseThrow(()->new ResourceNotFoundException("Employee not found"));
                if(!employee.getSalon().getId().equals(salon.getId())) throw new AccessDeniedException("Not your employee");
                employee.setAvatarUrl(null); employees.save(employee); break;
            default: throw new BadRequestException("Loại ảnh không hợp lệ.");
        }
    }
    @Transactional
    public void removeGallery(UUID owner, String url) {
        var owned=salons.findByOwnerId(owner).orElseThrow(()->new ResourceNotFoundException("Salon not found"));
        var salon=salons.findForUpdateById(owned.getId()).orElseThrow(()->new ResourceNotFoundException("Salon not found"));
        changes.preparePhotoChange(salon);
        var gallery = new ArrayList<>(salon.getImageUrls());
        if (!gallery.remove(url)) throw new ResourceNotFoundException("Ảnh không còn trong bộ ảnh.");
        changes.submitPhoto(salon, Kind.GALLERY, salon.getLogoUrl(), gallery);
    }
}
