# Duyệt cập nhật hồ sơ salon

## Cài đặt

Với Supabase (`ddl-auto: none`), chạy toàn bộ `src/main/resources/db/salon-profile-changes.sql`
trong SQL Editor rồi khởi động lại backend. Script tạo bảng mới, không đổi thông tin salon hiện có.
Với môi trường Hibernate `ddl-auto: update`, bảng được tạo từ entity; script cũng bổ sung
unique index để bảo vệ một yêu cầu đang chờ duyệt trên mỗi salon.

## Sử dụng

- Chủ tiệm vào `/owner/profile`, sửa tên, giới thiệu, địa chỉ, tỉnh/thành, quận/huyện,
  số điện thoại hoặc email rồi chọn **Gửi Admin duyệt**.
- Thêm/xóa ảnh đại diện tại hồ sơ hoặc tổng quan, thêm/xóa ảnh bộ sưu tập tại
  `/owner/dashboard` cũng tạo yêu cầu duyệt. Ảnh dịch vụ và nhân viên vẫn theo luồng quản lý riêng.
- Mỗi tiệm có một yêu cầu chờ duyệt tại một thời điểm. Xử lý xong mới gửi yêu cầu tiếp theo.
- Admin vào `/profile/approvals` → **Yêu cầu cập nhật thông tin và ảnh**, xem trước–sau,
  chọn duyệt hoặc từ chối. Duyệt đăng ký salon mới vẫn ở cùng trang, phần bên dưới.
- Chờ duyệt hoặc từ chối không thay đổi hồ sơ công khai, quyền chủ tiệm hay trạng thái salon.
  Owner xem trạng thái gần nhất tại hồ sơ, kể cả sau khi tải lại trang.
- Nếu Admin sửa ảnh qua quản lý nội dung trong lúc yêu cầu đang chờ, yêu cầu ảnh cũ không
  thể ghi đè ảnh mới: từ chối yêu cầu cũ để tiệm gửi lại.

## API

- `PUT /owner/salon`: gửi thông tin, trả `SalonProfileChangeResponse` (không còn trả hồ sơ đã cập nhật).
- `GET /owner/salon/change-request`: yêu cầu gần nhất của tiệm thuộc JWT hiện tại, hoặc null.
- API ảnh owner giữ đường dẫn cũ; ảnh salon chỉ được lưu thành đề nghị, chưa công khai.
- `GET /admin/salon-changes?page=0`: danh sách chờ duyệt, 20 yêu cầu/trang.
- `POST /admin/salon-changes/{id}/approve` hoặc `/reject`: chỉ ADMIN.

Yêu cầu đã xử lý hoặc gửi khi đang có yêu cầu chờ trả 409. Nội dung đề nghị không thay đổi
sau khi gửi. Các thao tác gửi/duyệt khóa cùng hàng salon và xử lý trong transaction.
File ảnh được tải lên Cloudinary khi gửi; tham chiếu công khai chỉ đổi sau khi duyệt.
Tệp bị từ chối không tự xóa trên Cloudinary.

## Kiểm tra

Backend: `mvn test` (gồm kiểm tra không cập nhật trước duyệt, duyệt/từ chối,
ảnh cũ bị Admin sửa, quyết định lặp, quyền và danh tính JWT).

Frontend: `npm run build` và
`npm test -- --watch=false --ts-config=tsconfig.profile-management-test.json --include=src/app/services/profile-management.spec.ts --include=src/app/features/admin-approvals/salon-changes.component.spec.ts --include=src/app/features/customer/profile/profile.component.spec.ts --include=src/app/guards/role.guard.spec.ts`.

Sau khi áp dụng SQL, kiểm tra bằng hai tài khoản owner/admin: gửi đổi tên/ảnh,
kiểm tra trang khách vẫn thấy dữ liệu cũ, duyệt rồi tải lại để thấy dữ liệu mới.
Các unit test dùng repository mock, không thay thế bước kiểm tra kết nối PostgreSQL này.
