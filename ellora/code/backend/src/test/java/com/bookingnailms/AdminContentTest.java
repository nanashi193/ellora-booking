package com.bookingnailms;
import com.bookingnailms.entity.*;
import com.bookingnailms.repository.*;
import com.bookingnailms.service.*;
import com.bookingnailms.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdminContentTest {
    @Test void galleryReplacementChangesOnlySelectedImageAndRejectsStaleUrls() {
        SalonRepository salons=mock(SalonRepository.class);
        CloudinaryImageService cloud=mock(CloudinaryImageService.class);
        OwnerPhotoService photos=mock(OwnerPhotoService.class);
        AdminContentService service=new AdminContentService(salons,mock(NailServiceRepository.class),mock(EmployeeRepository.class),photos,cloud);
        UUID owner=UUID.randomUUID();
        Salon salon=Salon.builder().id(7L).owner(User.builder().id(owner).build()).imageUrls(new ArrayList<>(List.of("first","old"))).build();
        when(salons.findForUpdateById(7L)).thenReturn(Optional.of(salon));
        var file=new MockMultipartFile("file","a.png","image/png",new byte[]{1});
        when(cloud.upload(file)).thenReturn("new");
        assertEquals("new",service.upload(7L,"gallery",7L,file,"old"));
        assertEquals(List.of("first","new"),salon.getImageUrls());
        assertThrows(ResourceNotFoundException.class,()->service.upload(7L,"gallery",7L,file,"old"));
        verify(cloud,times(1)).upload(file);
        service.remove(7L,"employees",12L,null);
        verify(photos).remove(owner,"employees",12L);
    }
}
