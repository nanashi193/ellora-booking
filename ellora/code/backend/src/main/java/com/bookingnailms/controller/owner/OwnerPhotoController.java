package com.bookingnailms.controller.owner;
import com.bookingnailms.service.OwnerPhotoService;
import com.bookingnailms.dto.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;
@RestController
@RequiredArgsConstructor
@RequestMapping("/owner/photos")
public class OwnerPhotoController {
    private final OwnerPhotoService photos;
    @PostMapping(value="/{kind}/{id}", consumes="multipart/form-data")
    public ApiResponse<String> upload(@AuthenticationPrincipal Jwt jwt,@PathVariable String kind,@PathVariable Long id,@RequestParam("file") MultipartFile file) {
        return ApiResponse.success(photos.upload(UUID.fromString(jwt.getSubject()),kind,id,file),null);
    }
    @DeleteMapping("/gallery")
    public ApiResponse<Void> remove(@AuthenticationPrincipal Jwt jwt,@RequestParam String url) {
        photos.removeGallery(UUID.fromString(jwt.getSubject()),url);return ApiResponse.success(null,null);
    }
}
