package com.bookingnailms;
import com.bookingnailms.service.*;
import com.bookingnailms.repository.*;
import com.bookingnailms.entity.*;
import com.bookingnailms.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class OwnerPhotoTest {
 @Test void invalidImageIsRejectedBeforeCloudRequest(){
  var cloud=new CloudinaryImageService("","","");
  assertThrows(BadRequestException.class,()->cloud.upload(new MockMultipartFile("file","fake.png","image/png","not an image".getBytes())));
 }
 @Test void validImageWithoutCredentialsReturnsUnavailable() throws Exception {
  var out=new java.io.ByteArrayOutputStream();javax.imageio.ImageIO.write(new java.awt.image.BufferedImage(2,2,java.awt.image.BufferedImage.TYPE_INT_RGB),"png",out);
  var cloud=new CloudinaryImageService("","","");
  var error=assertThrows(ResponseStatusException.class,()->cloud.upload(new MockMultipartFile("file","test.png","image/png",out.toByteArray())));
  assertEquals(503,error.getStatusCode().value());
 }
 @Test void ownershipIsCheckedBeforeUploadAndUrlIsSaved(){
  var salons=mock(SalonRepository.class);var services=mock(NailServiceRepository.class);var employees=mock(EmployeeRepository.class);var cloud=mock(CloudinaryImageService.class);
  UUID owner=UUID.randomUUID();var salon=Salon.builder().id(42L).build();
  when(salons.findByOwnerId(owner)).thenReturn(Optional.of(salon));when(salons.findForUpdateById(42L)).thenReturn(Optional.of(salon));
  var photo=new OwnerPhotoService(salons,services,employees,cloud);var file=new MockMultipartFile("file",new byte[]{1});
  when(services.findById(8L)).thenReturn(Optional.of(NailService.builder().salon(Salon.builder().id(99L).build()).build()));
  assertThrows(AccessDeniedException.class,()->photo.upload(owner,"services",8L,file));verifyNoInteractions(cloud);
  when(cloud.upload(file)).thenReturn("https://res.cloudinary.com/test/image/upload/photo.png");
  photo.upload(owner,"cover",42L,file);assertTrue(salon.getLogoUrl().startsWith("https://res.cloudinary.com/"));verify(salons).save(salon);
 }
 @Test void galleryLimitRejectsBeforeCloudUpload(){
  var salons=mock(SalonRepository.class);var cloud=mock(CloudinaryImageService.class);UUID owner=UUID.randomUUID();
  var salon=Salon.builder().id(42L).imageUrls(new ArrayList<>(Collections.nCopies(10,"https://example.com/image.png"))).build();
  when(salons.findByOwnerId(owner)).thenReturn(Optional.of(salon));when(salons.findForUpdateById(42L)).thenReturn(Optional.of(salon));
  var photos=new OwnerPhotoService(salons,mock(NailServiceRepository.class),mock(EmployeeRepository.class),cloud);
  assertThrows(BadRequestException.class,()->photos.upload(owner,"gallery",42L,new MockMultipartFile("file",new byte[]{1})));verifyNoInteractions(cloud);
 }
}
