# AGENTS.md

Hướng dẫn hành vi và quy tắc riêng cho dự án
 **Ellora — Nail Salon Booking Platform**.

Dự án này đi theo định hướng sản phẩm được mô tả trong `docs/product-spec.md`.

Tài liệu này dùng để giảm các lỗi thường gặp khi dùng LLM coding agent, giữ phạm vi dự án có kiểm soát, và giúp Codex làm việc nhất quán trong toàn bộ repository.

**Đánh đổi:** Các quy tắc này ưu tiên sự cẩn thận hơn tốc độ. Với các tác vụ rất nhỏ, hãy dùng phán đoán hợp lý.

---

## 1. Bối Cảnh Dự Án

Đây là dự án **Nền tảng đặt lịch nail salon** dành cho thị trường Việt Nam.

Hệ thống giúp người dùng tìm tiệm nail, xem thông tin salon, so sánh dịch vụ, đặt lịch hẹn và đánh giá salon sau khi sử dụng dịch vụ.

### Vai trò chính

- **Customer / Khách hàng**: tìm salon, xem chi tiết salon, đặt lịch, quản lý lịch hẹn và viết đánh giá.
- **Salon Owner / Business Account / Chủ salon**: quản lý hồ sơ salon, dịch vụ, giá, lịch hẹn, nhân viên và xác nhận booking.
- **Admin / Quản trị viên**: quản lý người dùng, salon, kiểm duyệt và dữ liệu hệ thống nếu cần.

### Định hướng sản phẩm

Đi theo định hướng trong `docs/product-spec.md`.

Định hướng chính của sản phẩm:

- Nền tảng tìm kiếm và đặt lịch salon dành cho khách hàng.
- Dashboard cho salon/chủ tiệm để quản lý lịch hẹn và dịch vụ.
- Tập trung vào thị trường Việt Nam.
- Ưu tiên trải nghiệm mobile-first.
- Làm MVP trước, tính năng mở rộng để sau.

---

## 2. Tech Stack

Sử dụng stack dưới đây trừ khi người dùng yêu cầu thay đổi rõ ràng.

### Frontend

- **Framework**: Angular
- **Ngôn ngữ**: TypeScript
- **Styling**: CSS / SCSS hoặc Tailwind CSS nếu dự án đã setup
- **UI Library**: Angular Material hoặc component tự viết; chỉ thêm UI library khi thật sự cần
- **HTTP Client**: Angular HttpClient
- **Form**: Reactive Forms
- **Routing**: Angular Router
- **State management**: Service + RxJS trước; chỉ dùng NgRx khi thật sự cần
- **Định hướng thiết kế**: mobile-first, responsive UI

### Backend

- **Framework**: Spring Boot
- **Ngôn ngữ**: Java
- **Kiểu API**: REST API
- **Persistence**: Spring Data JPA / Hibernate
- **Validation**: Jakarta Bean Validation
- **Authentication**: JWT có thể thêm sau khi CRUD cơ bản và logic booking đã ổn định

### Database

- **Database chính**: PostgreSQL
- **Cache / lock**: Redis chỉ dùng khi được yêu cầu rõ ràng cho caching hoặc khóa slot booking
- **Migration**: Flyway hoặc Liquibase nếu dự án đã có setup migration; nếu chưa, giữ SQL script đơn giản và rõ ràng

### Storage

- **Lưu ảnh**: Cloudinary cho ảnh salon, ảnh mẫu nail, avatar và ảnh review

### Deployment

- **Frontend**: Vercel, Netlify, Firebase Hosting hoặc hosting static phù hợp với Angular
- **Backend**: Railway, Render hoặc hosting tương thích Java
- **Database**: PostgreSQL trên Railway, Render, Supabase, Neon hoặc dịch vụ tương tự
- **CDN / DNS**: Cloudflare nếu cần

---

## 3. Cấu Trúc Repository Mong Muốn

Cấu trúc đề xuất:

```text
nail-salon-booking/
├── frontend/
├── backend/
├── database/
├── docs/
│   ├── product-spec.md
│   ├── use-case.md
│   ├── dfd.md
│   ├── erd.md
│   └── api-documentation.md
├── AGENTS.md
├── README.md
└── .gitignore
```

Ghi chú:

- Tách riêng frontend và backend.
- Tài liệu sản phẩm và sơ đồ để trong `docs/`.
- Script database để trong `database/`.
- Không commit secret vào repository.

---

## 4. Phạm Vi MVP

Không triển khai tính năng ngoài MVP nếu chưa được yêu cầu rõ ràng.

### Tính năng MVP

Tập trung vào:

- Authentication
- Quản lý tài khoản khách hàng
- Quản lý tài khoản chủ salon
- Quản lý hồ sơ salon
- Quản lý dịch vụ và bảng giá
- Tìm kiếm và lọc salon
- Trang chi tiết salon
- Luồng đặt lịch cơ bản
- Quản lý booking cho chủ salon
- Review và rating sau khi booking hoàn thành
- Admin moderation cơ bản chỉ khi được yêu cầu

### Tính năng mở rộng sau MVP

Các tính năng dưới đây là future enhancements. Có thể nhắc đến trong tài liệu nếu hữu ích, nhưng không code mặc định:

- AI recommendation
- Gợi ý mẫu nail bằng AI
- Google Maps integration
- Mapbox integration
- Online payment
- Đặt cọc / payment gateway
- Momo / VNPay / ZaloPay integration
- Zalo notification
- SMS notification
- Email automation
- Real-time chat
- Push notification
- Loyalty points
- Voucher system
- Flash deals
- Gói subscription cho khách hàng
- Mobile app
- Advanced analytics dashboard
- Multi-branch salon management

Khi không chắc một tính năng thuộc MVP hay future enhancement, hãy hỏi trước khi triển khai.

---

## 5. Suy Nghĩ Trước Khi Code

**Đừng tự đoán. Đừng giấu sự không chắc chắn. Hãy nêu rõ tradeoff.**

Trước khi triển khai:

- Nêu rõ giả định.
- Nếu chưa chắc, hãy hỏi lại.
- Nếu có nhiều cách hiểu, hãy trình bày các khả năng thay vì tự chọn một cách im lặng.
- Nếu có cách đơn giản hơn, hãy nói ra.
- Phản biện khi yêu cầu tạo ra độ phức tạp không cần thiết.
- Nếu có điểm chưa rõ, hãy dừng lại, nói rõ chỗ chưa rõ và hỏi.

Ví dụ:

```text
Tôi giả định API tạo booking chỉ tạo booking với trạng thái PENDING và không tự động xác nhận. Vui lòng xác nhận việc salon xác nhận booking có cần là API riêng không.
```

---

## 6. Ưu Tiên Sự Đơn Giản

**Viết lượng code tối thiểu để giải quyết đúng yêu cầu. Không thêm thứ suy đoán.**

Quy tắc:

- Không thêm tính năng ngoài yêu cầu.
- Không tạo abstraction cho trường hợp chỉ dùng một lần.
- Không dùng design pattern không cần thiết.
- Không thêm cấu hình linh hoạt nếu không được yêu cầu.
- Không xử lý lỗi cho các tình huống gần như không thể xảy ra.
- Ưu tiên code dễ đọc, dễ hiểu cho người mới.
- Nếu có thể giải quyết bằng 50 dòng, đừng viết thành 200 dòng.

Tự hỏi:

```text
Một senior engineer có nói giải pháp này đang bị overcomplicated không?
```

Nếu có, hãy đơn giản hóa.

---

## 7. Thay Đổi Có Kiểm Soát

**Chỉ sửa đúng phần cần sửa. Chỉ dọn phần do chính thay đổi của mình tạo ra.**

Khi chỉnh sửa code có sẵn:

- Không “cải thiện” code, comment hoặc format ở khu vực không liên quan.
- Không refactor phần không bị lỗi.
- Giữ style giống dự án hiện tại.
- Nếu thấy dead code không liên quan, hãy nhắc đến thay vì xóa.

Khi thay đổi của bạn tạo ra code thừa:

- Xóa import, biến hoặc function bị unused do chính thay đổi của bạn tạo ra.
- Không xóa dead code có sẵn nếu chưa được yêu cầu rõ ràng.

Bài test:

```text
Mỗi dòng thay đổi phải liên hệ trực tiếp với yêu cầu của người dùng.
```

---

## 8. Thực Hiện Theo Mục Tiêu Có Thể Kiểm Chứng

**Xác định tiêu chí hoàn thành. Lặp lại cho đến khi kiểm chứng được.**

Chuyển task thành mục tiêu có thể kiểm chứng:

```text
Thêm validation
→ Viết test hoặc kiểm tra thủ công cho input không hợp lệ
→ Triển khai validation
→ Xác nhận input hợp lệ vẫn hoạt động
```

```text
Sửa lỗi booking
→ Tái hiện lỗi
→ Sửa nguyên nhân
→ Xác nhận tạo booking hoạt động lại
```

Với task nhiều bước, hãy nêu kế hoạch ngắn:

```text
1. [Bước] → kiểm chứng: [cách kiểm tra]
2. [Bước] → kiểm chứng: [cách kiểm tra]
3. [Bước] → kiểm chứng: [cách kiểm tra]
```

Tránh tiêu chí mơ hồ như:

```text
Làm cho chạy được
```

Dùng tiêu chí cụ thể hơn:

```text
POST /api/bookings tạo booking với trạng thái PENDING và trả về booking id, salon id, service id, thời gian hẹn và status.
```

---

## 9. Quy Tắc Backend

Backend nên dùng cấu trúc phân lớp rõ ràng của Spring Boot:

```text
controller → service → repository → database
```

Cấu trúc backend đề xuất:

```text
backend/src/main/java/.../
├── controller/
├── service/
├── repository/
├── entity/
├── dto/
├── config/
├── exception/
└── security/
```

### Quy tắc backend

- Controller chỉ nhận request và trả response.
- Business logic đặt trong service.
- Truy cập database đặt trong repository.
- Dùng DTO cho request và response.
- Dùng validation annotation cho các field bắt buộc.
- Không expose dữ liệu nhạy cảm như password hash.
- Không trả entity trực tiếp nếu DTO phù hợp hơn.
- Giữ response API nhất quán.
- Không tự tạo endpoint mới nếu task không yêu cầu.
- Ưu tiên service method rõ ràng, dễ đọc hơn abstraction quá chung chung.

### Entity backend chính

Các entity core dự kiến:

- User
- Role
- Salon
- SalonHour
- Staff
- Service
- Booking
- Review
- Media

### Booking Status

Dùng booking status rõ ràng:

```text
PENDING
CONFIRMED
CANCELLED
COMPLETED
```

Quy tắc booking:

- Booking mới tạo phải bắt đầu với trạng thái `PENDING`.
- Chủ salon có thể xác nhận hoặc hủy booking.
- Khách hàng chỉ có thể review sau khi booking ở trạng thái `COMPLETED`.
- Tránh trùng booking cho cùng salon, staff, service, ngày và khung giờ.
- Redis locking chỉ thêm sau nếu được yêu cầu rõ ràng để xử lý race condition.

### Ghi chú Spring Boot

- Dùng `@RestController` cho REST controller.
- Dùng `@Service` cho business logic.
- Dùng `JpaRepository` cho repository.
- Dùng request DTO và response DTO.
- Dùng `@Valid` và validation annotations cho input validation.
- Dùng `@ControllerAdvice` để xử lý lỗi tập trung khi cần.
- Tránh đặt business logic trong controller.
- Tránh trả entity trực tiếp từ public API.

---

## 10. Quy Tắc Frontend

Frontend nên tập trung vào user flow rõ ràng và cấu trúc Angular sạch.

Cấu trúc frontend đề xuất:

```text
frontend/src/app/
├── core/
├── features/
├── shared/
├── models/
└── services/
```

### Ý nghĩa thư mục frontend

- `core/`: phần dùng một lần cho toàn app như guards, interceptors, app config, layout shell.
- `features/`: từng module/tính năng như auth, salons, bookings, owner-dashboard, admin.
- `shared/`: component, pipe, directive dùng lại nhiều nơi.
- `models/`: interface/type dùng chung như User, Salon, Service, Booking, Review.
- `services/`: service gọi API hoặc xử lý logic dùng chung.

### Quy tắc frontend

- Component chỉ nên tập trung vào UI logic.
- API call nên đưa vào service.
- Dùng strongly typed interface/model.
- Dùng Reactive Forms cho form phức tạp như login, register, booking, salon profile.
- Tránh duplicate CSS khi có thể tái sử dụng shared style hoặc shared component.
- Không hard-code backend URL ở nhiều component; dùng environment config.
- Không làm fake feature mà backend không hỗ trợ, trừ khi ghi rõ là mock/demo.
- Ưu tiên mobile-first responsive UI.
- Dùng Angular Router rõ ràng, route name dễ hiểu.
- Dùng route guard khi có authentication/authorization.
- Dùng interceptor cho JWT token khi auth đã ổn định.
- Dùng service + RxJS trước; không thêm NgRx nếu chưa thật sự cần.
- Form nên đơn giản và validate input rõ ràng.

### Trang chính trong MVP

MVP nên có:

- Home page
- Login page
- Register page
- Salon list page
- Salon detail page
- Booking page
- My bookings page
- Salon owner dashboard
- Salon service management page
- Review section

### Gợi ý cấu trúc feature

```text
frontend/src/app/features/
├── auth/
│   ├── login/
│   └── register/
├── salons/
│   ├── salon-list/
│   └── salon-detail/
├── bookings/
│   ├── booking-page/
│   └── my-bookings/
├── owner/
│   ├── dashboard/
│   └── service-management/
└── reviews/
```

---

## 11. Quy Tắc API

Dùng REST-style endpoints.

Ví dụ endpoint:

```http
POST /api/auth/register
POST /api/auth/login

GET /api/salons
GET /api/salons/{id}
POST /api/salons
PATCH /api/salons/{id}
DELETE /api/salons/{id}

GET /api/salons/{salonId}/services
POST /api/salons/{salonId}/services
PATCH /api/services/{id}
DELETE /api/services/{id}

POST /api/bookings
GET /api/bookings/my
GET /api/salon/bookings
PATCH /api/bookings/{id}/status

POST /api/reviews
GET /api/salons/{salonId}/reviews
```

### Quy tắc API

- Giữ tên endpoint nhất quán.
- Dùng danh từ số nhiều khi phù hợp.
- Dùng request DTO và response DTO.
- Validate các field bắt buộc.
- Trả lỗi có ý nghĩa.
- Không tự tạo endpoint mới nếu task không yêu cầu.
- Dùng pagination cho list endpoint khi dữ liệu có thể tăng, đặc biệt là salons, bookings và reviews.

---

## 12. Quy Tắc Database

Dùng PostgreSQL làm database chính.

Các bảng dự kiến:

```text
users
roles
salons
salon_hours
staff
services
bookings
reviews
media
```

Quy tắc database:

- Dùng tên bảng rõ ràng.
- Dùng foreign key cho quan hệ.
- Tránh lưu dữ liệu trùng lặp nếu không cần thiết.
- Không lưu password dạng plain text.
- Sample data nên thực tế nhưng đơn giản.
- Thêm index cho filter và lookup phổ biến khi cần.
- Không tối ưu quá sớm trước khi flow cơ bản chạy ổn.

Vị trí script database đề xuất:

```text
database/
├── schema.sql
└── sample-data.sql
```

Một số index hữu ích về sau:

- `salons(city, district)`
- `salons(rating_avg)`
- `services(salon_id)`
- `bookings(customer_id)`
- `bookings(salon_id)`
- `bookings(booking_date, start_time)`
- `reviews(salon_id)`

---

## 13. Quy Tắc Git Và Làm Việc Nhóm

Dùng branch name và commit message rõ ràng.

### Đặt tên branch

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

### Ví dụ commit message

```text
feat(auth): add login API
feat(salon): add salon profile CRUD
feat(booking): add booking creation API
fix(booking): prevent duplicate booking time
chore(config): update environment examples
```

### Quy tắc collaboration

- Không commit secret.
- Không commit file `.env` chứa thông tin thật.
- Pull code mới nhất trước khi bắt đầu làm.
- Dùng merge request / pull request để review nhóm.
- Không push trực tiếp vào protected branch nếu nhóm không cho phép.
- Giữ diff nhỏ và tập trung.

---

## 14. Quy Tắc Bảo Mật

Không bao giờ đưa giá trị nhạy cảm vào code hoặc tài liệu.

Không commit:

- Database password
- API key
- JWT secret
- GitHub/GitLab token
- Tài khoản admin thật
- Private production URL

Dùng environment variables hoặc local config file cho secret.

Với authentication:

- Hash password trước khi lưu.
- Không trả password field trong API response.
- Dùng role-based authorization khi triển khai security.
- JWT có thể thêm sau khi CRUD cơ bản và booking logic đã ổn định.
- Cấu hình CORS rõ ràng và theo environment.

---

## 15. Quy Tắc Tài Liệu

Tài liệu nên đơn giản và hữu ích.

Các file đề xuất:

```text
docs/
├── product-spec.md
├── use-case.md
├── dfd.md
├── erd.md
└── api-documentation.md
```

Không viết tài liệu theo kiểu khẳng định tính năng đã hoàn thành nếu thực tế chưa implement.

Tách rõ MVP đã implement và future enhancements.

Khi thay đổi tech stack, cập nhật tài liệu cho nhất quán.

---

## 16. Definition of Done

Một task chỉ được xem là hoàn thành khi:

- Tính năng được yêu cầu đã được triển khai.
- Thay đổi giới hạn đúng trong phạm vi task.
- Code compile hoặc chạy không có lỗi rõ ràng.
- Đã kiểm thử thủ công cơ bản.
- Code unused do thay đổi mới tạo ra đã được xóa.
- Không sửa file không liên quan.
- Kết quả khớp với scope dự án.
- Implementation đi đúng stack đã chọn: Angular + Spring Boot + PostgreSQL.

---

## 17. Nhắc Nhở Cuối

Các guideline này đang hoạt động tốt nếu:

- Diff nhỏ hơn và dễ review hơn.
- Ít tính năng không cần thiết bị thêm vào.
- Ít phải viết lại do làm quá phức tạp.
- Câu hỏi làm rõ xuất hiện trước khi implement sai.
- Dự án giữ đúng trọng tâm Nail Salon Booking MVP.
