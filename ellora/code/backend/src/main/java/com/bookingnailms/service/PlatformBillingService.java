package com.bookingnailms.service;

import com.bookingnailms.entity.*;
import com.bookingnailms.repository.*;
import com.bookingnailms.dto.common.PageResponse;
import com.bookingnailms.exception.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.math.*;
import java.time.*;
import java.util.*;

@Service @RequiredArgsConstructor
public class PlatformBillingService {
    private final PlatformFeePolicyRepository policies;
    private final PlatformBillingSettingsRepository settings;
    private final PlatformStatementRepository statements;
    private final SalonRepository salons;
    private final BookingRepository bookings;
    private final CloudinaryImageService cloud;
    private final BookingEmailService emails;
    private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    public record Configuration(BigDecimal currentPercent, BigDecimal nextPercent, LocalDate effectiveMonth, String qrUrl) {}
    public record Bill(Long salonId, String salonName, String month, BigDecimal gross, BigDecimal percent,
            BigDecimal fee, BigDecimal paid, BigDecimal due, LocalDate dueDate, String status,
            String transferContent, String qrUrl, LocalDateTime paidAt, LocalDateTime remindedAt) {}
    private LocalDate currentMonth() { return LocalDate.now(ZONE).withDayOfMonth(1); }
    private PlatformBillingSettings settings() { return settings.findById(1L).orElseThrow(() -> new ResourceNotFoundException("Chưa khởi tạo cấu hình thanh toán.")); }
    private BigDecimal rate(LocalDate month) { return policies.findFirstByEffectiveMonthLessThanEqualOrderByEffectiveMonthDesc(month).map(PlatformFeePolicy::getPercent).orElse(BigDecimal.ZERO); }

    @Transactional(readOnly=true)
    public Configuration configuration() {
        LocalDate next=currentMonth().plusMonths(1);
        return new Configuration(rate(currentMonth()),rate(next),next,settings().getQrUrl());
    }
    @Transactional @PreAuthorize("hasRole('ADMIN')")
    public Configuration setRate(BigDecimal percent) {
        settings.lockSettings().orElseThrow(() -> new ResourceNotFoundException("Billing settings not found"));
        var policy=new PlatformFeePolicy(); policy.setEffectiveMonth(currentMonth().plusMonths(1)); policy.setPercent(percent);
        policies.saveAndFlush(policy);
        return configuration();
    }
    @Transactional @PreAuthorize("hasRole('ADMIN')")
    public String uploadQr(MultipartFile file) {
        var config=settings.lockSettings().orElseThrow(() -> new ResourceNotFoundException("Billing settings not found"));
        String url=cloud.upload(file);config.setQrUrl(url);settings.save(config);return url;
    }
    private LocalDate month(String value) {
        try {
            LocalDate month=YearMonth.parse(value).atDay(1);
            if(month.isAfter(currentMonth())||month.isBefore(currentMonth().minusYears(10)))throw new IllegalArgumentException();
            return month;
        } catch(java.time.format.DateTimeParseException|IllegalArgumentException ex) { throw new BadRequestException("Chọn tháng hợp lệ, không lớn hơn tháng hiện tại (tối đa 10 năm)."); }
    }
    @Transactional(readOnly=true)
    public Bill ownerBill(UUID owner,String month) {
        var salon=salons.findByOwnerId(owner).orElseThrow(() -> new ResourceNotFoundException("Salon not found"));
        return bill(salon,month(month));
    }
    @Transactional(readOnly=true) @PreAuthorize("hasRole('ADMIN')")
    public PageResponse<Bill> list(String month,int page) {
        LocalDate period=month(month);
        var result=salons.findAll(PageRequest.of(Math.max(page,0),20,Sort.by("id").descending()));
        return PageResponse.of(result.stream().map(s->bill(s,period)).toList(),result);
    }
    private Bill bill(Salon salon,LocalDate month) {
        BigDecimal gross=bookings.completedGross(salon.getId(),month.atStartOfDay(),month.plusMonths(1).atStartOfDay());
        BigDecimal percent=rate(month);
        BigDecimal fee=gross.multiply(percent).divide(BigDecimal.valueOf(100),0,RoundingMode.HALF_UP);
        var saved=statements.findBySalonIdAndBillingMonth(salon.getId(),month).orElse(new PlatformStatement());
        BigDecimal due=fee.subtract(saved.getPaidAmount()).max(BigDecimal.ZERO);
        LocalDate deadline=month.withDayOfMonth(month.lengthOfMonth());
        String status=due.signum()==0?(fee.signum()==0?"NO_FEE":"PAID"):(LocalDate.now(ZONE).isAfter(deadline)?"OVERDUE":"UNPAID");
        return new Bill(salon.getId(),salon.getName(),YearMonth.from(month).toString(),gross,percent,fee,saved.getPaidAmount(),due,deadline,status,
                "ELLORA "+salon.getId()+" "+month.toString().substring(0,7).replace("-",""),settings().getQrUrl(),saved.getPaidAt(),saved.getRemindedAt());
    }
    private PlatformStatement statement(Long salon,LocalDate month) {
        return statements.findBySalonIdAndBillingMonth(salon,month).orElseGet(()->{var s=new PlatformStatement();s.setSalonId(salon);s.setBillingMonth(month);return s;});
    }
    @Transactional @PreAuthorize("hasRole('ADMIN')")
    public Bill confirm(Long salonId,String period,BigDecimal expectedDue,UUID admin) {
        LocalDate month=month(period);
        var salon=salons.findForUpdateById(salonId).orElseThrow(() -> new ResourceNotFoundException("Salon not found"));
        Bill bill=bill(salon,month);
        if(bill.due().signum()==0)return bill;
        if(bill.due().compareTo(expectedDue)!=0)throw new BadRequestException("Số tiền đã thay đổi. Tải lại trước khi xác nhận.");
        var saved=statement(salonId,month);
        saved.setPaidAmount(saved.getPaidAmount().add(bill.due()));saved.setPaidAt(LocalDateTime.now(ZONE));saved.setConfirmedBy(admin);
        statements.saveAndFlush(saved);return bill(salon,month);
    }
    @Transactional @PreAuthorize("hasRole('ADMIN')")
    public void remind(Long salonId,String period) {
        LocalDate month=month(period);
        var salon=salons.findForUpdateById(salonId).orElseThrow(() -> new ResourceNotFoundException("Salon not found"));
        Bill bill=bill(salon,month);
        if(bill.due().signum()==0)throw new BadRequestException("Tiệm không còn phí phải thanh toán trong tháng này.");
        var saved=statement(salonId,month);LocalDateTime now=LocalDateTime.now(ZONE);
        if(saved.getRemindedAt()!=null&&saved.getRemindedAt().isAfter(now.minusMinutes(5)))throw new BadRequestException("Đã gửi nhắc gần đây. Vui lòng chờ 5 phút.");
        String recipient=salon.getEmail()==null||salon.getEmail().isBlank()?salon.getOwner().getEmail():salon.getEmail();
        emails.enqueueBillingReminder(recipient,"Tiệm "+salon.getName()+" còn phí nền tảng tháng "+bill.month()+" cần thanh toán."
                +"\nSố tiền: "+bill.due().toPlainString()+" VNĐ\nTỷ lệ: "+bill.percent()+"%\nHạn thanh toán: "+bill.dueDate()
                +"\nNội dung chuyển khoản: "+bill.transferContent()+"\nVui lòng mở Phân tích trên trang chủ tiệm để xem mã QR thanh toán."
                +"\nNếu đã chuyển khoản, vui lòng liên hệ quản trị viên để đối soát.");
        saved.setRemindedAt(now);statements.save(saved);
    }
}
