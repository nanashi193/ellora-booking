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
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final SalonRepository salonRepository;
    private final NailServiceRepository nailServiceRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final BookingEmailService bookingEmails;

    @Transactional
    public BookingResponse createBooking(BookingRequest request, UUID customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", customerId));

        Salon salon = salonRepository.findById(request.getSalonId())
                .orElseThrow(() -> new ResourceNotFoundException("Salon", "id", request.getSalonId()));
        if (salon.getStatus() != com.bookingnailms.enums.SalonStatus.ACTIVE) {
            throw new BadRequestException("Salon is not accepting bookings");
        }

        NailService nailService = nailServiceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", request.getServiceId()));

        if (!nailService.isActive() || !nailService.getSalon().getId().equals(salon.getId())) {
            throw new BadRequestException("Service does not belong to the specified salon");
        }

        Employee employee = null;
        if (request.getEmployeeId() != null) {
            employee = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));

            if (!employee.isActive() || !employee.getSalon().getId().equals(salon.getId())) {
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
                .servicePriceSnapshot(nailService.getPrice())
                .status(BookingStatus.PENDING)
                .customerNote(request.getCustomerNote())
                .build();

        booking = bookingRepository.save(booking);
        bookingEmails.enqueue(booking, false);
        log.info("Booking created: {} for customer: {}", booking.getId(), customer.getEmail());

        return mapToBookingResponse(booking);
    }

    @Transactional
    public void cancelBooking(Long bookingId, UUID customerId) {
        Booking booking = bookingRepository.findForUpdateById(bookingId)
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
    public PageResponse<BookingResponse> getMyBookings(UUID customerId, Pageable pageable) {
        Page<Booking> bookingsPage =
                bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customerId, pageable);

        List<BookingResponse> responses = bookingsPage.getContent().stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());

        return PageResponse.of(responses, bookingsPage);
    }

    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> getSalonBookings(Long salonId, BookingStatus status, Pageable pageable) {
        Page<Booking> bookingsPage;

        if (status != null) {
            bookingsPage =
                    bookingRepository.findBySalonIdAndStatusOrderByScheduledAtDesc(
                            salonId, status, pageable);
        } else {
            bookingsPage =
                    bookingRepository.findBySalonIdOrderByScheduledAtDesc(salonId, pageable);
        }

        List<BookingResponse> responses = bookingsPage.getContent().stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());

        return PageResponse.of(responses, bookingsPage);
    }

    @Transactional
    public BookingResponse updateBookingStatus(
            Long bookingId, BookingStatusUpdateRequest request, UUID ownerId) {
        Booking booking = bookingRepository.findForUpdateById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (!booking.getSalon().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You are not the owner of this salon");
        }

        if (booking.getStatus() == request.getStatus()) return mapToBookingResponse(booking);
        boolean allowed = switch (booking.getStatus()) {
            case PENDING -> request.getStatus() == BookingStatus.CONFIRMED || request.getStatus() == BookingStatus.REJECTED || request.getStatus() == BookingStatus.CANCELLED;
            case CONFIRMED -> request.getStatus() == BookingStatus.IN_PROGRESS || request.getStatus() == BookingStatus.CANCELLED;
            case IN_PROGRESS -> request.getStatus() == BookingStatus.COMPLETED || request.getStatus() == BookingStatus.CANCELLED;
            default -> false;
        };
        if (!allowed) throw new BadRequestException("Invalid booking status transition");
        booking.setStatus(request.getStatus());
        if (request.getStatus() == BookingStatus.COMPLETED) {
            if (booking.getServicePriceSnapshot() == null) {
                booking.setServicePriceSnapshot(booking.getService().getPrice());
                booking.setRevenueEstimated(true);
            }
            booking.setCompletedAt(java.time.LocalDateTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")));
        }
        if (request.getSalonNote() != null) {
            booking.setSalonNote(request.getSalonNote());
        }

        if (request.getStatus() == BookingStatus.REJECTED || request.getStatus() == BookingStatus.CANCELLED) {
            booking.setCancellationReason(request.getSalonNote());
        }

        booking = bookingRepository.save(booking);
        log.info("Booking {} status updated to: {}", bookingId, request.getStatus());
        if (booking.getStatus() == BookingStatus.CONFIRMED) bookingEmails.enqueue(booking, true);

        return mapToBookingResponse(booking);
    }

    private BookingResponse mapToBookingResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .salonId(booking.getSalon().getId())
                .salonName(booking.getSalon().getName())
                .customerName(booking.getCustomer().getFullName())
                .serviceId(booking.getService().getId())
                .serviceName(booking.getService().getName())
                .servicePrice(booking.getServicePriceSnapshot() != null ? booking.getServicePriceSnapshot() : booking.getService().getPrice())
                .employeeId(booking.getEmployee() != null ? booking.getEmployee().getId() : null)
                .employeeName(booking.getEmployee() != null ? booking.getEmployee().getFullName() : null)
                .scheduledAt(booking.getScheduledAt())
                .durationMinutes(booking.getDurationMinutes())
                .status(booking.getStatus())
                .reviewed(booking.getReview() != null)
                .customerNote(booking.getCustomerNote())
                .salonNote(booking.getSalonNote())
                .cancellationReason(booking.getCancellationReason())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
