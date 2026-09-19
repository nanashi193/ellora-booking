package com.bookingnailms;

import com.bookingnailms.entity.*;
import com.bookingnailms.dto.employee.EmployeeRequest;
import com.bookingnailms.dto.service.ServiceRequest;
import com.bookingnailms.exception.UnauthorizedException;
import com.bookingnailms.repository.*;
import com.bookingnailms.service.*;
import org.junit.jupiter.api.Test;
import java.util.*;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OwnerDataTest {
    @Test void employeeIsSavedToAuthenticatedOwnersSalon() {
        var employees = mock(EmployeeRepository.class);
        var salons = mock(SalonRepository.class);
        UUID owner = UUID.randomUUID();
        var salon = Salon.builder().id(42L).name("My salon").build();
        when(salons.findByOwnerId(owner)).thenReturn(Optional.of(salon));
        when(employees.save(any())).thenAnswer(i -> i.getArgument(0));
        var result = new EmployeeService(employees, salons)
                .addEmployee(new EmployeeRequest("Test employee", "0901234567", "Nail artist"), owner);
        assertEquals("Test employee", result.getFullName());
        verify(employees).save(argThat(e -> e.getSalon() == salon && e.isActive()));
    }

    @Test void anotherOwnerCannotEditOrDisableServiceOrEmployee() {
        var services = mock(NailServiceRepository.class);
        var employees = mock(EmployeeRepository.class);
        var salons = mock(SalonRepository.class);
        var salon = Salon.builder().owner(User.builder().id(UUID.randomUUID()).build()).build();
        when(services.findById(7L)).thenReturn(Optional.of(NailService.builder().salon(salon).build()));
        when(employees.findById(8L)).thenReturn(Optional.of(Employee.builder().salon(salon).build()));
        UUID other = UUID.randomUUID();
        var service = new NailServiceService(services, salons, mock(ServiceCategoryRepository.class));
        var staff = new EmployeeService(employees, salons);
        assertThrows(UnauthorizedException.class, () -> service.updateService(7L, new ServiceRequest(), other));
        assertThrows(UnauthorizedException.class, () -> service.deleteService(7L, other));
        assertThrows(UnauthorizedException.class, () -> staff.updateEmployee(8L, new EmployeeRequest(), other));
        assertThrows(UnauthorizedException.class, () -> staff.deleteEmployee(8L, other));
        verify(services, never()).save(any());
        verify(employees, never()).save(any());
    }

    @Test void serviceFieldsArePersistedAndDisablePreservesRecord() {
        var services = mock(NailServiceRepository.class);
        var salons = mock(SalonRepository.class);
        UUID owner = UUID.randomUUID();
        var salon = Salon.builder().id(42L).owner(User.builder().id(owner).build()).build();
        when(salons.findById(42L)).thenReturn(Optional.of(salon));
        when(services.save(any())).thenAnswer(i -> i.getArgument(0));
        var service = new NailServiceService(services, salons, mock(ServiceCategoryRepository.class));
        var request = new ServiceRequest("Gel nails", "Description", BigDecimal.valueOf(150000), 45, null);
        var result = service.addService(request, 42L);
        assertEquals(request.getPrice(), result.getPrice());
        assertEquals(45, result.getDurationMinutes());
        var entity = NailService.builder().id(7L).salon(salon).active(true).build();
        when(services.findById(7L)).thenReturn(Optional.of(entity));
        service.deleteService(7L, owner);
        assertFalse(entity.isActive());
        verify(services, never()).delete(any());
    }
}
