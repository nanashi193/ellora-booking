package com.bookingnailms;
import com.bookingnailms.entity.Salon;
import com.bookingnailms.repository.*;
import com.bookingnailms.service.OwnerRevenueService;
import com.bookingnailms.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class OwnerRevenueTest {
 @Test void zeroFillsBucketsAndUsesExclusiveEndDateAndAuthenticatedSalon(){
    SalonRepository salons=mock(SalonRepository.class);BookingRepository bookings=mock(BookingRepository.class);
    UUID owner=UUID.randomUUID();when(salons.findByOwnerId(owner)).thenReturn(Optional.of(Salon.builder().id(42L).build()));
    BookingRepository.RevenueBucket row=mock(BookingRepository.RevenueBucket.class);
    when(row.getBucketStart()).thenReturn(LocalDateTime.of(2026,9,21,0,0));when(row.getGross()).thenReturn(new BigDecimal("50000"));
    when(row.getFee()).thenReturn(new BigDecimal("1500"));when(row.getCount()).thenReturn(1L);when(row.getEstimated()).thenReturn(0L);
    when(bookings.revenue(eq(42L),any(),any(),eq("week"))).thenReturn(List.of(row));
    OwnerRevenueService service=new OwnerRevenueService(salons,bookings);
    var report=service.report(owner,LocalDate.of(2026,9,15),LocalDate.of(2026,9,27),"week");
    assertEquals(2,report.points().size());assertEquals(0,report.points().get(0).bookings());
    assertEquals(new BigDecimal("48500"),report.net());
    verify(bookings).revenue(42L,LocalDateTime.of(2026,9,15,0,0),LocalDateTime.of(2026,9,28,0,0),"week");
    assertThrows(BadRequestException.class,()->service.report(owner,LocalDate.of(2026,9,28),LocalDate.of(2026,9,27),"day"));
 }
}
