# Báo cáo doanh thu và phí nền tảng

- Owner: `/owner/dashboard`, lọc ngày/tuần/tháng/năm hoặc khoảng ngày. Chỉ lịch COMPLETED, ngày hoàn thành theo giờ Việt Nam; khoảng lọc gồm cả ngày kết thúc. Tuần bắt đầu thứ Hai, đầu/cuối kỳ có thể là kỳ chưa đủ ngày.
- Giá dịch vụ được lưu tại lúc đặt cho lịch mới. Lịch cũ thiếu giá/ngày hoàn thành dùng dữ liệu hiện có để ước tính khi đọc, không ghi lại lịch sử; báo cáo hiển thị số lịch ước tính. Không coi doanh thu này là tiền đã thu hay lợi nhuận sau mọi chi phí.
- Admin: `/admin/billing`, một tỷ lệ phần trăm chung cho mọi dịch vụ/tiệm. Chỉ được đặt tỷ lệ từ đầu tháng tiếp theo (theo giờ Việt Nam). Chưa cấu hình là 0%; không tự đặt 3% dựa trên ví dụ.
- Phí tháng = tổng doanh thu COMPLETED trong tháng × tỷ lệ tháng / 100, làm tròn HALF_UP đến đồng. Ví dụ 50.000 × 3% = 1.500. Biểu đồ theo khoảng tính phân bổ phí; công nợ tháng là số cuối cùng để đối soát.
- Hạn thanh toán là ngày cuối tháng. Admin tải ảnh QR JPG/PNG lên Cloudinary; owner nhập số tiền và nội dung chuyển khoản theo màn hình. Không kết nối ngân hàng và không tự xác nhận khi quét QR.
- Admin xác nhận khoản còn nợ sau khi kiểm tra tiền thực nhận; lưu số tiền lũy kế, thời điểm và admin xác nhận. Nếu xác nhận trước cuối tháng và phát sinh thêm doanh thu, phần tăng thêm trở thành số còn nợ, không bị đánh dấu đã trả nhầm. API kiểm tra số tiền hiện tại khớp số tiền admin đã xem và khóa theo tiệm để chặn xác nhận trùng.
- Nút nhắc tạo email trong hàng đợi hiện có cho email tiệm (hoặc email chủ tiệm), không tự gửi theo lịch. Không cho nhắc khoản đã trả/0đ; cách nhau ít nhất 5 phút. Tạo hàng đợi không đảm bảo thư đã vào hộp thư đến.

## Cơ sở dữ liệu

Với Supabase `ddl-auto=none`, chạy `src/main/resources/db/revenue.sql` trước khi khởi động bản mới. Script thêm cột/bảng/index, không backfill giá/ngày vào lịch cũ. Các bảng mới bật RLS, chỉ backend kết nối DB có quyền truy cập. Các môi trường mới dùng Hibernate update vẫn cần tạo dòng settings id=1 (script đã thực hiện).

## Kiểm thử

`PlatformBillingTest`, `OwnerRevenueTest`, `RoleSecurityTest`, frontend `billing-api.spec.ts`. Các test dùng mocks, không gửi email thật, không xác nhận công nợ thật.
