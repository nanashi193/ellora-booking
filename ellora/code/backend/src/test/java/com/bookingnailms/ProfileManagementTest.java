package com.bookingnailms;

import com.bookingnailms.dto.profile.*;
import com.bookingnailms.dto.salon.SalonRequest;
import com.bookingnailms.entity.*;
import com.bookingnailms.enums.*;
import com.bookingnailms.exception.*;
import com.bookingnailms.repository.*;
import com.bookingnailms.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProfileManagementTest {
    @Test void editedNameSurvivesLoginSyncAndAvatarKeepsOtherFields() {
        var users=mock(UserRepository.class);var service=new ProfileService(users);
        var id=UUID.randomUUID();
        var user=User.builder().id(id).email("linh@example.com").fullName("Old name").role(Role.CUSTOMER).build();
        when(users.findForUpdateById(id)).thenReturn(Optional.of(user));
        when(users.save(any())).thenAnswer(call->call.getArgument(0));
        service.update(id,new ProfileUpdateRequest("  Linh mới  ","0901234567"));
        var response=service.sync(id,new ProfileSyncRequest("linh@example.com","Old Cognito name"));
        assertEquals("Linh mới",response.getFullName());assertEquals("0901234567",response.getPhone());
        assertEquals(Role.CUSTOMER,response.getRole());assertEquals("linh@example.com",response.getEmail());
        assertEquals("https://example.com/avatar.png",service.updateAvatar(id,"https://example.com/avatar.png").getAvatarUrl());
        assertEquals("Linh mới",user.getFullName());
    }

    @Test void newProfileStillGetsCognitoNameAndUnknownProfileCannotBeEdited() {
        var users=mock(UserRepository.class);var service=new ProfileService(users);
        when(users.save(any())).thenAnswer(call->call.getArgument(0));
        var response=service.sync(UUID.randomUUID(),new ProfileSyncRequest("linh@example.com","Linh"));
        assertEquals("Linh",response.getFullName());assertEquals(Role.CUSTOMER,response.getRole());
        assertThrows(ResourceNotFoundException.class,()->service.update(UUID.randomUUID(),new ProfileUpdateRequest("Name","")));
    }

    @Test void salonEditWaitsForApprovalAndRejectsUnknownOwner() {
        var salons=mock(SalonRepository.class);var changes=mock(SalonProfileChangeRepository.class);
        var service=new SalonProfileChangeService(salons,changes,mock(jakarta.persistence.EntityManager.class));
        var owner=UUID.randomUUID();
        var salon=Salon.builder().id(42L).owner(User.builder().id(owner).build()).status(SalonStatus.ACTIVE)
                .logoUrl("https://example.com/photo.png").build();
        when(salons.findByOwnerId(owner)).thenReturn(Optional.of(salon));
        when(salons.findForUpdateById(42L)).thenReturn(Optional.of(salon));
        when(changes.save(any())).thenAnswer(call->call.getArgument(0));
        var request=new SalonRequest("Tiệm mới","Giới thiệu","Địa chỉ","HCM","Quận 1","0901234567","salon@example.com");
        assertThrows(ResourceNotFoundException.class,()->service.submit(UUID.randomUUID(),request));
        verify(salons,never()).save(any());
        var response=service.submit(owner,request);
        assertEquals("Tiệm mới",response.proposed().getName());
        assertEquals(SalonProfileChange.Status.PENDING,response.status());assertNull(salon.getName());
        assertEquals(SalonStatus.ACTIVE,salon.getStatus());assertEquals(owner,salon.getOwner().getId());
        assertEquals("https://example.com/photo.png",salon.getLogoUrl());verify(salons,never()).save(any());
    }

    @Test void locksAndUnlocksWithoutChangingRoleAndProtectsAdmins() {
        var users=mock(UserRepository.class);var service=new AdminService(mock(SalonRepository.class),users,mock(BookingRepository.class),mock(PaymentRepository.class));
        var id=UUID.randomUUID();var admin=UUID.randomUUID();
        var user=User.builder().id(id).role(Role.SALON_OWNER).build();
        when(users.findForUpdateById(id)).thenReturn(Optional.of(user));
        assertTrue(service.setUserLocked(id,true,admin).locked());assertEquals(Role.SALON_OWNER,user.getRole());
        assertFalse(service.setUserLocked(id,false,admin).locked());
        assertThrows(BadRequestException.class,()->service.setUserLocked(id,true,id));
        user.setRole(Role.ADMIN);
        assertThrows(BadRequestException.class,()->service.setUserLocked(id,true,admin));
        assertFalse(user.isLocked());
    }

    @Test void userSearchReturnsSafePaginatedDtos() {
        var users=mock(UserRepository.class);var service=new AdminService(mock(SalonRepository.class),users,mock(BookingRepository.class),mock(PaymentRepository.class));
        var page=PageRequest.of(0,20);var user=User.builder().id(UUID.randomUUID()).fullName("Linh").email("linh@example.com").role(Role.CUSTOMER).build();
        when(users.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase("linh","linh",page))
                .thenReturn(new PageImpl<>(List.of(user),page,1));
        var result=service.getAllUsers(" linh ",page);
        assertEquals(1,result.getTotalElements());assertEquals("linh@example.com",result.getContent().get(0).email());
    }
}
