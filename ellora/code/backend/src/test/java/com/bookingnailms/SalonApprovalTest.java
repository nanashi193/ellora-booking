package com.bookingnailms;

import com.bookingnailms.entity.*;
import com.bookingnailms.enums.*;
import com.bookingnailms.repository.*;
import com.bookingnailms.service.AdminService;
import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SalonApprovalTest {
    @Test void registrationStaysPendingAndDoesNotPromoteTheApplicant() {
        var salons = mock(SalonRepository.class);
        var users = mock(UserRepository.class);
        var service = new com.bookingnailms.service.SalonService(salons, users);
        var user = User.builder().id(UUID.randomUUID()).role(Role.CUSTOMER).enabled(true).build();
        when(users.findForUpdateById(user.getId())).thenReturn(Optional.of(user));
        when(salons.save(any(Salon.class))).thenAnswer(invocation -> invocation.getArgument(0));
        var request = new com.bookingnailms.dto.salon.SalonRequest("Salon", "Description", "Address", "City", "District", "0123456789", "owner@example.com");
        var response = service.createSalon(request, user.getId());
        assertEquals(SalonStatus.PENDING_APPROVAL, response.getStatus());
        assertEquals(Role.CUSTOMER, user.getRole());
        when(salons.existsByOwnerId(user.getId())).thenReturn(true);
        assertThrows(com.bookingnailms.exception.BadRequestException.class, () -> service.createSalon(request, user.getId()));
        verify(salons, times(1)).save(any(Salon.class));
    }
    @Test void onlyApprovalPromotesCustomerAndRepeatedDecisionIsRejected() {
        var salons = mock(SalonRepository.class);
        var users = mock(UserRepository.class);
        var service = new AdminService(salons, users, mock(BookingRepository.class), mock(PaymentRepository.class));
        var user = User.builder().id(UUID.randomUUID()).role(Role.CUSTOMER).enabled(true).build();
        var salon = Salon.builder().owner(user).status(SalonStatus.PENDING_APPROVAL).build();
        when(salons.findForUpdateById(1L)).thenReturn(Optional.of(salon));
        when(users.findForUpdateById(user.getId())).thenReturn(Optional.of(user));
        service.approveSalon(1L);
        assertEquals(Role.SALON_OWNER, user.getRole());
        assertEquals(SalonStatus.ACTIVE, salon.getStatus());
        assertThrows(com.bookingnailms.exception.BadRequestException.class, () -> service.rejectSalon(1L));
    }
    @Test void rejectionDoesNotPromoteCustomer() {
        var salons = mock(SalonRepository.class);
        var users = mock(UserRepository.class);
        var service = new AdminService(salons, users, mock(BookingRepository.class), mock(PaymentRepository.class));
        var user = User.builder().role(Role.CUSTOMER).build();
        var salon = Salon.builder().owner(user).status(SalonStatus.PENDING_APPROVAL).build();
        when(salons.findForUpdateById(1L)).thenReturn(Optional.of(salon));
        service.rejectSalon(1L);
        assertEquals(Role.CUSTOMER, user.getRole());
        assertEquals(SalonStatus.REJECTED, salon.getStatus());
        verifyNoInteractions(users);
    }
}
