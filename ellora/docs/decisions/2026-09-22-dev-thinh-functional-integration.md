# Tích hợp chức năng từ Dev-Thinh vào backup

Hai commit `5e03202` và `4721ab6` được chuyển chọn lọc lên nền `dev` tại `4096d41`. Các trang hiện có giữ cấu trúc UI của `dev`; đường dẫn cài đặt là `/setting/profile`, `/setting/my-bookings`, `/setting/security`.

Backend bổ sung API đổi/quên mật khẩu, booking, đăng ký/duyệt salon, dữ liệu salon công khai, quản lý owner và ảnh Cloudinary. API booking owner trả thêm `customerName` để lịch hẹn hiện tên khách. Frontend giữ URL backend của `dev` thay vì URL localhost của nhánh nguồn. Cloudinary cần `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` trong môi trường backend.

Booking API nhận một dịch vụ mỗi yêu cầu, vì vậy wizard chỉ cho chọn một dịch vụ. Dashboard và các báo cáo chưa có API dữ liệu tương ứng hiện trạng thái trống. Hai trang mới là `/business-registration` và `/admin/approvals`; trang Bảo mật hiện có thêm form đổi mật khẩu.
