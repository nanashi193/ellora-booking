package com.bookingnailms;
import com.bookingnailms.entity.*;
import com.bookingnailms.repository.*;
import com.bookingnailms.service.*;
import com.bookingnailms.exception.BadRequestException;
import org.junit.jupiter.api.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PlatformBillingTest {
    PlatformFeePolicyRepository policies=mock(PlatformFeePolicyRepository.class);
    PlatformBillingSettingsRepository settings=mock(PlatformBillingSettingsRepository.class);
    PlatformStatementRepository statements=mock(PlatformStatementRepository.class);
    SalonRepository salons=mock(SalonRepository.class);
    BookingRepository bookings=mock(BookingRepository.class);
    BookingEmailService emails=mock(BookingEmailService.class);
    PlatformBillingService service=new PlatformBillingService(policies,settings,statements,salons,bookings,mock(CloudinaryImageService.class),emails);
    LocalDate month=LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).withDayOfMonth(1);
    UUID owner=UUID.randomUUID(),admin=UUID.randomUUID();
    Salon salon=Salon.builder().id(42L).name("Tiệm thử").owner(User.builder().id(owner).email("owner@example.com").build()).build();
    PlatformStatement saved;
    @BeforeEach void setup(){
        var config=new PlatformBillingSettings();config.setQrUrl("https://example.com/qr.png");
        when(settings.findById(1L)).thenReturn(Optional.of(config));when(settings.lockSettings()).thenReturn(Optional.of(config));
        var policy=new PlatformFeePolicy();policy.setPercent(new BigDecimal("3"));policy.setEffectiveMonth(month);
        when(policies.findFirstByEffectiveMonthLessThanEqualOrderByEffectiveMonthDesc(any())).thenReturn(Optional.of(policy));
        when(salons.findByOwnerId(owner)).thenReturn(Optional.of(salon));when(salons.findForUpdateById(42L)).thenReturn(Optional.of(salon));
        when(bookings.completedGross(eq(42L),any(),any())).thenReturn(new BigDecimal("50000"));
        when(statements.findBySalonIdAndBillingMonth(eq(42L),any())).thenAnswer(i->Optional.ofNullable(saved));
        when(statements.saveAndFlush(any())).thenAnswer(i->{saved=i.getArgument(0);return saved;});
        when(statements.save(any())).thenAnswer(i->{saved=i.getArgument(0);return saved;});
    }
    @Test void calculatesThreePercentAndMonthEndAndRecordsPaymentOnce(){
        String period=YearMonth.from(month).toString();
        var bill=service.ownerBill(owner,period);
        assertEquals(new BigDecimal("1500"),bill.fee());assertEquals(bill.fee(),bill.due());
        assertEquals(month.withDayOfMonth(month.lengthOfMonth()),bill.dueDate());
        assertThrows(BadRequestException.class,()->service.confirm(42L,period,new BigDecimal("1400"),admin));
        assertEquals("PAID",service.confirm(42L,period,new BigDecimal("1500"),admin).status());
        assertEquals(admin,saved.getConfirmedBy());
        service.confirm(42L,period,new BigDecimal("1500"),admin);
        verify(statements,times(1)).saveAndFlush(any());
        assertThrows(BadRequestException.class,()->service.remind(42L,period));verifyNoInteractions(emails);
        when(bookings.completedGross(eq(42L),any(),any())).thenReturn(new BigDecimal("60000"));
        assertEquals(new BigDecimal("300"),service.ownerBill(owner,period).due());
    }
    @Test void changedRateOnlyWritesNextMonthPolicy(){
        service.setRate(new BigDecimal("5"));
        var captor=org.mockito.ArgumentCaptor.forClass(PlatformFeePolicy.class);
        verify(policies).saveAndFlush(captor.capture());
        assertEquals(month.plusMonths(1),captor.getValue().getEffectiveMonth());
        assertEquals(new BigDecimal("5"),captor.getValue().getPercent());
    }
    @Test void reminderQueuesMailAndRejectsImmediateRepeat(){
        String period=YearMonth.from(month).toString();service.remind(42L,period);
        verify(emails).enqueueBillingReminder(eq("owner@example.com"),contains("1500 VNĐ"));
        assertThrows(BadRequestException.class,()->service.remind(42L,period));
        verifyNoMoreInteractions(emails);
    }
    @Test void handlesLeapYearEndAndRejectsFutureMonth(){
        assertEquals(LocalDate.of(2024,2,29),service.ownerBill(owner,"2024-02").dueDate());
        assertThrows(BadRequestException.class,()->service.ownerBill(owner,YearMonth.from(month.plusMonths(1)).toString()));
    }
}
