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

@WebMvcTest({SalonRegistrationController.class, BookingController.class, com.bookingnailms.controller.owner.OwnerController.class, com.bookingnailms.controller.admin.AdminContentController.class, com.bookingnailms.controller.admin.PlatformBillingController.class, com.bookingnailms.controller.owner.OwnerRevenueController.class})
@Import(SecurityConfig.class)
class RoleSecurityTest {
    @Autowired MockMvc mvc;
    @MockBean JwtDecoder jwtDecoder;
    @MockBean UserRepository users;
    @MockBean SalonRepository salons;
    @MockBean SalonService salonService;
    @MockBean AdminService admin;
    @MockBean BookingService bookings;
    @MockBean NailServiceService services;
    @MockBean EmployeeService employees;
    @MockBean ReviewService reviews;
    @MockBean OwnerDashboardService dashboard;
    @MockBean AdminContentService content;
    @MockBean PlatformBillingService billing;
    @MockBean OwnerRevenueService revenue;

    @Test void billingControlsAreAdminOnlyAndOwnerReportUsesJwtIdentity() throws Exception {
        for(Role role:List.of(Role.CUSTOMER,Role.SALON_OWNER)){
            as(role);
            mvc.perform(put("/admin/billing/config").header("Authorization","Bearer test-token").contentType("application/json").content("{\"percent\":3}")).andExpect(status().isForbidden());
            mvc.perform(post("/admin/billing/statements/42/confirm?month=2026-09").header("Authorization","Bearer test-token").contentType("application/json").content("{\"expectedDue\":1500}")).andExpect(status().isForbidden());
            mvc.perform(post("/admin/billing/statements/42/remind?month=2026-09").header("Authorization","Bearer test-token")).andExpect(status().isForbidden());
        }
        verifyNoInteractions(billing);
        as(Role.SALON_OWNER);
        mvc.perform(get("/owner/revenue?from=2026-09-01&to=2026-09-30&groupBy=month&salonId=999").header("Authorization","Bearer test-token")).andExpect(status().isOk());
        verify(revenue).report(eq(id),any(),any(),eq("month"));
        as(Role.ADMIN);
        mvc.perform(put("/admin/billing/config").header("Authorization","Bearer test-token").contentType("application/json").content("{\"percent\":101}")).andExpect(status().isBadRequest());
        mvc.perform(put("/admin/billing/config").header("Authorization","Bearer test-token").contentType("application/json").content("{\"percent\":3}")).andExpect(status().isOk());
        verify(billing).setRate(new java.math.BigDecimal("3"));
    }

    @Test void onlyAdminCanModerateContent() throws Exception {
        for (Role role : List.of(Role.CUSTOMER, Role.SALON_OWNER)) {
            as(role);
            mvc.perform(get("/admin/content/salons").header("Authorization", "Bearer test-token")).andExpect(status().isForbidden());
            mvc.perform(delete("/admin/content/reviews/1").header("Authorization", "Bearer test-token")).andExpect(status().isForbidden());
            mvc.perform(delete("/admin/content/reviews/1/reply").header("Authorization", "Bearer test-token")).andExpect(status().isForbidden());
            mvc.perform(delete("/admin/content/salons/2/photos/cover/2").header("Authorization", "Bearer test-token")).andExpect(status().isForbidden());
        }
        verifyNoInteractions(content, reviews);
        as(Role.ADMIN);
        mvc.perform(put("/admin/content/reviews/1").header("Authorization", "Bearer test-token")
                .contentType("application/json").content("{\"rating\":4,\"comment\":\"Đã kiểm duyệt\"}")).andExpect(status().isOk());
        verify(reviews).adminEdit(eq(1L), any());
        mvc.perform(delete("/admin/content/reviews/1/reply").header("Authorization", "Bearer test-token")).andExpect(status().isOk());
        verify(reviews).adminReply(1L, null);
    }
    private final UUID id = UUID.randomUUID();

    void as(Role role) {
        when(jwtDecoder.decode("test-token")).thenReturn(Jwt.withTokenValue("test-token").header("alg", "RS256").subject(id.toString()).build());
        when(users.findById(id)).thenReturn(Optional.of(User.builder().id(id).role(role).enabled(true).locked(false).build()));
    }

    @Test void anonymousCannotReadAdminQueue() throws Exception {
        mvc.perform(get("/admin/salons/pending")).andExpect(status().isUnauthorized());
    }
    @Test void ownerServiceCreationUsesAuthenticatedSalonAndRejectsInvalidInput() throws Exception {
        as(Role.SALON_OWNER);
        when(salonService.getMySalon(id)).thenReturn(com.bookingnailms.dto.salon.SalonResponse.builder().id(42L).build());
        mvc.perform(post("/owner/services").header("Authorization", "Bearer test-token")
                .contentType("application/json")
                .content("{\"name\":\"Gel nails\",\"price\":150000,\"durationMinutes\":45,\"salonId\":999}"))
                .andExpect(status().isOk());
        verify(services).addService(any(), eq(42L));
        mvc.perform(post("/owner/services").header("Authorization", "Bearer test-token")
                .contentType("application/json").content("{\"name\":\"\",\"price\":-1,\"durationMinutes\":0}"))
                .andExpect(status().isBadRequest());
        verifyNoMoreInteractions(services);
    }
    @Test void customerCannotManageOwnerData() throws Exception {
        as(Role.CUSTOMER);
        for (String path : List.of("/owner/services", "/owner/employees", "/owner/reviews", "/owner/dashboard")) {
            mvc.perform(get(path).header("Authorization", "Bearer test-token")).andExpect(status().isForbidden());
            mvc.perform(post(path).header("Authorization", "Bearer test-token")).andExpect(status().isForbidden());
        }
        verifyNoInteractions(services, employees, reviews, dashboard);
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
