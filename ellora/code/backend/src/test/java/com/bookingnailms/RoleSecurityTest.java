package com.bookingnailms;

import com.bookingnailms.config.SecurityConfig;
import com.bookingnailms.controller.salon.SalonRegistrationController;
import com.bookingnailms.controller.booking.BookingController;
import com.bookingnailms.entity.User;
import com.bookingnailms.entity.Salon;
import com.bookingnailms.enums.Role;
import com.bookingnailms.repository.*;
import com.bookingnailms.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.test.web.servlet.MockMvc;
import java.util.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({SalonRegistrationController.class, BookingController.class})
@Import(SecurityConfig.class)
class RoleSecurityTest {
    @Autowired MockMvc mvc;
    @MockBean JwtDecoder jwtDecoder;
    @MockBean UserRepository users;
    @MockBean SalonRepository salons;
    @MockBean SalonService salonService;
    @MockBean AdminService admin;
    @MockBean BookingService bookings;
    private final UUID id = UUID.randomUUID();

    void as(Role role) {
        when(jwtDecoder.decode("test-token")).thenReturn(Jwt.withTokenValue("test-token").header("alg", "RS256").subject(id.toString()).build());
        when(users.findById(id)).thenReturn(Optional.of(User.builder().id(id).role(role).enabled(true).locked(false).build()));
    }

    @Test void anonymousCannotReadAdminQueue() throws Exception {
        mvc.perform(get("/admin/salons/pending")).andExpect(status().isUnauthorized());
    }
    @Test void customerCannotApproveOrReadOwnerBookings() throws Exception {
        as(Role.CUSTOMER);
        mvc.perform(post("/admin/salons/1/approve").header("Authorization", "Bearer test-token")).andExpect(status().isForbidden());
        mvc.perform(get("/owner/bookings").param("salonId", "1").header("Authorization", "Bearer test-token")).andExpect(status().isForbidden());
        verifyNoInteractions(admin, bookings);
    }
    @Test void adminCanApproveAndRoleChangesAreReadFromDatabase() throws Exception {
        as(Role.ADMIN);
        mvc.perform(post("/admin/salons/1/approve").header("Authorization", "Bearer test-token")).andExpect(status().isOk());
        verify(admin).approveSalon(1L);
        as(Role.CUSTOMER);
        mvc.perform(post("/admin/salons/2/approve").header("Authorization", "Bearer test-token")).andExpect(status().isForbidden());
        verify(admin, never()).approveSalon(2L);
    }
    @Test void ownerCannotReadAnotherSalonsBookings() throws Exception {
        as(Role.SALON_OWNER);
        when(salons.findById(1L)).thenReturn(Optional.of(Salon.builder().owner(User.builder().id(UUID.randomUUID()).build()).build()));
        mvc.perform(get("/owner/bookings").param("salonId", "1").header("Authorization", "Bearer test-token")).andExpect(status().isForbidden());
        verifyNoInteractions(bookings);
    }
    @Test void lockedAccountCannotUseProtectedEndpoints() throws Exception {
        as(Role.ADMIN);
        users.findById(id).orElseThrow().setLocked(true);
        mvc.perform(get("/admin/salons/pending").header("Authorization", "Bearer test-token")).andExpect(status().isUnauthorized());
    }
}
