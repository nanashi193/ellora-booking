# Workflow Guidelines

Tài liệu này quy định cách thức làm việc nhóm, quản lý source code (Git), viết tài liệu và định nghĩa hoàn thành công việc (DoD) trong dự án Ellora.

## 1. Quy Tắc Git Và Làm Việc Nhóm

Dùng branch name và commit message rõ ràng.

### 1.1. Đặt tên branch
Ví dụ:
```text
feature/auth-login
feature/salon-list
feature/salon-crud
feature/booking-api
fix/register-validation
fix/booking-duplicate-slot
chore/update-gitignore
```

### 1.2. Commit message
Ví dụ:
```text
feat(auth): add login API
feat(salon): add salon profile CRUD
feat(booking): add booking creation API
fix(booking): prevent duplicate booking time
chore(config): update environment examples
```

### 1.3. Quy tắc collaboration
- Không commit secret.
- Không commit file `.env` chứa thông tin thật.
- Pull code mới nhất trước khi bắt đầu làm.
- Dùng merge request / pull request để review nhóm.
- Không push trực tiếp vào protected branch nếu nhóm không cho phép.
- Giữ diff nhỏ và tập trung.

---

## 2. Quy Tắc Tài Liệu

Tài liệu nên đơn giản và hữu ích.

Các file đề xuất trong `docs/`:
- `product-spec.md`
- `architecture-and-stack.md`
- `frontend-guidelines.md`
- `backend-guidelines.md`
- `api-database-guidelines.md`

Nguyên tắc cập nhật tài liệu:
- Không viết tài liệu theo kiểu khẳng định tính năng đã hoàn thành nếu thực tế chưa implement.
- Tách rõ MVP đã implement và future enhancements.
- Khi thay đổi tech stack, cập nhật tài liệu cho nhất quán.

---

## 3. Definition of Done (DoD)

Một task chỉ được xem là hoàn thành khi:
- Tính năng được yêu cầu đã được triển khai.
- Thay đổi giới hạn đúng trong phạm vi task.
- Code compile hoặc chạy không có lỗi rõ ràng.
- Đã kiểm thử thủ công cơ bản.
- Code unused do thay đổi mới tạo ra đã được xóa.
- Không sửa file không liên quan.
- Kết quả khớp với scope dự án.
- Implementation đi đúng stack đã chọn: Angular + Spring Boot + PostgreSQL.
