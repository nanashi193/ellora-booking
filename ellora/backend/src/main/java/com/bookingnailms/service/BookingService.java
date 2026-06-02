package com.bookingnailms.service;

import com.bookingnailms.dto.booking.BookingRequest;
import com.bookingnailms.dto.booking.BookingResponse;
import com.bookingnailms.dto.booking.BookingStatusUpdateRequest;
import com.bookingnailms.dto.common.PageResponse;
import com.bookingnailms.entity.Booking;
import com.bookingnailms.entity.Employee;
import com.bookingnailms.entity.NailService;
import com.bookingnailms.entity.Salon;
import com.bookingnailms.entity.User;
import com.bookingnailms.enums.BookingStatus;
import com.bookingnailms.exception.BadRequestException;
import com.bookingnailms.exception.ResourceNotFoundException;
import com.bookingnailms.exception.UnauthorizedException;
import com.bookingnailms.repository.BookingRepository;
import com.bookingnailms.repository.EmployeeRepository;
import com.bookingnailms.repository.NailServiceRepository;
import com.bookingnailms.repository.SalonRepository;
import com.bookingnailms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final SalonRepository salonRepository;
    private final NailServiceRepository nailServiceRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    @Transactional
    public BookingResponse createBooking(BookingRequest request, Long customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", customerId));

        Salon salon = salonRepository.findById(request.getSalonId())
                .orElseThrow(() -> new ResourceNotFoundException("Salon", "id", request.getSalonId()));

        NailService nailService = nailServiceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", request.getServiceId()));

        if (!nailService.getSalon().getId().equals(salon.getId())) {
            throw new BadRequestException("Service does not belong to the specified salon");
        }

        Employee employee = null;
        if (request.getEmployeeId() != null) {
            employee = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));

            if (!employee.getSalon().getId().equals(salon.getId())) {
                throw new BadRequestException("Employee does not belong to the specified salon");
            }
        }

        Booking booking = Booking.builder()
                .customer(customer)
                .salon(salon)
                .service(nailService)
                .employee(employee)
                .scheduledAt(request.getScheduledAt())
                .durationMinutes(nailService.getDurationMinutes())
                .status(BookingStatus.PENDING)
                .customerNote(request.getCustomerNote())
                .build();

        booking = bookingRepository.save(booking);
        log.info("Booking created: {} for customer: {}", booking.getId(), customer.getEmail());

        return mapToBookingResponse(booking);
    }

    @Transactional
    public void cancelBooking(Long bookingId, Long customerId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (!booking.getCustomer().getId().equals(customerId)) {
            throw new UnauthorizedException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED ||
                booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot cancel a booking that is already " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason("Cancelled by customer");
        bookingRepository.save(booking);
        log.info("Booking cancelled: {}", bookingId);
    }

    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> getMyBookings(Long customerId, Pageable pageable) {
        Page<Booking> bookingsPage = bookingRepository.findByCustomerId(customerId, pageable);

        List<BookingResponse> responses = bookingsPage.getContent().stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());

        return PageResponse.of(responses, bookingsPage);
    }

    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> getSalonBookings(Long salonId, BookingStatus status, Pageable pageable) {
        Page<Booking> bookingsPage;

        if (status != null) {
            bookingsPage = bookingRepository.findBySalonIdAndStatus(salonId, status, pageable);
        } else {
            bookingsPage = bookingRepository.findBySalonId(salonId, pageable);
        }

        List<BookingResponse> responses = bookingsPage.getContent().stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());

        return PageResponse.of(responses, bookingsPage);
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long bookingId, BookingStatusUpdateRequest request, Long ownerId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (!booking.getSalon().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You are not the owner of this salon");
        }

        booking.setStatus(request.getStatus());
        if (request.getSalonNote() != null) {
            booking.setSalonNote(request.getSalonNote());
        }

        if (request.getStatus() == BookingStatus.REJECTED || request.getStatus() == BookingStatus.CANCELLED) {
            booking.setCancellationReason(request.getSalonNote());
        }

        booking = bookingRepository.save(booking);
        log.info("Booking {} status updated to: {}", bookingId, request.getStatus());

        return mapToBookingResponse(booking);
    }

    private BookingResponse mapToBookingResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .salonName(booking.getSalon().getName())
                .serviceName(booking.getService().getName())
                .employeeName(booking.getEmployee() != null ? booking.getEmployee().getFullName() : null)
                .scheduledAt(booking.getScheduledAt())
                .durationMinutes(booking.getDurationMinutes())
                .status(booking.getStatus())
                .customerNote(booking.getCustomerNote())
                .salonNote(booking.getSalonNote())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
