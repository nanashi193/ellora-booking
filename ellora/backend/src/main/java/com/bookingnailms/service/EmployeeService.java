package com.bookingnailms.service;

import com.bookingnailms.dto.employee.EmployeeRequest;
import com.bookingnailms.dto.employee.EmployeeResponse;
import com.bookingnailms.entity.Employee;
import com.bookingnailms.entity.Salon;
import com.bookingnailms.exception.ResourceNotFoundException;
import com.bookingnailms.exception.UnauthorizedException;
import com.bookingnailms.repository.EmployeeRepository;
import com.bookingnailms.repository.SalonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final SalonRepository salonRepository;

    @Transactional
    public EmployeeResponse addEmployee(EmployeeRequest request, Long ownerId) {
        Salon salon = salonRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Salon not found for current owner"));

        Employee employee = Employee.builder()
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .bio(request.getBio())
                .active(true)
                .salon(salon)
                .build();

        employee = employeeRepository.save(employee);
        log.info("Employee added: {} to salon: {}", employee.getFullName(), salon.getName());

        return mapToEmployeeResponse(employee);
    }

    @Transactional
    public EmployeeResponse updateEmployee(Long employeeId, EmployeeRequest request, Long ownerId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        if (!employee.getSalon().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You are not the owner of this salon");
        }

        employee.setFullName(request.getFullName());
        employee.setPhone(request.getPhone());
        employee.setBio(request.getBio());

        employee = employeeRepository.save(employee);
        log.info("Employee updated: {}", employee.getFullName());

        return mapToEmployeeResponse(employee);
    }

    @Transactional
    public void deleteEmployee(Long employeeId, Long ownerId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        if (!employee.getSalon().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You are not the owner of this salon");
        }

        employee.setActive(false);
        employeeRepository.save(employee);
        log.info("Employee soft-deleted: {}", employee.getFullName());
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getSalonEmployees(Long salonId) {
        if (!salonRepository.existsById(salonId)) {
            throw new ResourceNotFoundException("Salon", "id", salonId);
        }

        return employeeRepository.findBySalonIdAndActiveTrue(salonId).stream()
                .map(this::mapToEmployeeResponse)
                .collect(Collectors.toList());
    }

    private EmployeeResponse mapToEmployeeResponse(Employee employee) {
        return EmployeeResponse.builder()
                .id(employee.getId())
                .fullName(employee.getFullName())
                .phone(employee.getPhone())
                .avatarUrl(employee.getAvatarUrl())
                .bio(employee.getBio())
                .active(employee.isActive())
                .build();
    }
}
