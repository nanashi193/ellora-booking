# Thông báo lịch hẹn

- Tạo lịch PENDING: lưu email cho email của salon, nếu trống dùng email chủ salon.
- Tiệm xác nhận PENDING → CONFIRMED: lưu email xác nhận cho khách.
- Hàng đợi `booking_emails` lưu cùng transaction với lịch hẹn. Worker chạy mỗi 10 giây, lỗi SMTP tự thử lại, khoảng cách tăng dần tối đa 1 giờ. Cấu hình mail chưa bật thì email vẫn chờ trong DB.
- Xác nhận lặp không tạo thêm email. SMTP có thể gửi trùng nếu tiến trình bị dừng đúng lúc SMTP đã nhận nhưng DB chưa ghi nhận; không cam kết exactly-once.

## Cấu hình trong `.env.supabase` hoặc biến môi trường máy chủ

```dotenv
MAIL_ENABLED=true
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=YOUR_SENDER_EMAIL
MAIL_PASSWORD=YOUR_GMAIL_APP_PASSWORD
MAIL_FROM=YOUR_SENDER_EMAIL
```

Dùng mật khẩu ứng dụng Gmail, không dùng mật khẩu đăng nhập. Không commit cấu hình thật. Khởi động lại backend sau khi đổi cấu hình. Chưa có thông tin SMTP thì để `MAIL_ENABLED=false`.

## Schema

JPA quản lý entity `BookingEmail` khi `ddl-auto=update`. Profile Supabase giữ `ddl-auto=none`; chạy script `src/main/resources/db/booking-emails.sql` một lần trước khi chạy bản mới trên DB đó. Script chỉ tạo bảng/hạng mục mới, không sửa dữ liệu lịch hẹn cũ.

## Chuông

Mở trang owner, bấm **Bật chuông lịch hẹn** mỗi lần mở lại trang để trình duyệt cho phép âm thanh. Kiểm tra lịch chờ mỗi 5 giây, lịch chưa báo sẽ reo từng nhịp tối đa 30 giây. Có nút tắt; xác nhận lịch cũng tắt chuông. Các lịch đến trong cùng đợt reo không kéo dài thời gian. Lịch đã báo được nhớ trong session của tab, theo salon. Hai tab owner có thể cùng reo. Không có chuông khi đóng trang; trình duyệt/thiết bị ngủ có thể trì hoãn kiểm tra. Email vẫn xử lý độc lập trên backend.

Kiểm thử luồng thực: khách tạo lịch → chủ tiệm mở owner/bật chuông → kiểm tra mail tiệm → xác nhận → kiểm tra mail khách. Không gửi email thật trong unit test.
