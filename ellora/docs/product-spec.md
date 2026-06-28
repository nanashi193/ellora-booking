# Ellora Product Spec

## Tổng Quan

**Tên dự án:** Ellora
**Loại sản phẩm:** Website trung gian đặt lịch nail salon
**Thị trường:** Việt Nam
**Đối tượng chính:** Khách hàng cá nhân và chủ tiệm nail
**Định hướng:** Mobile-first, MVP trước, mở rộng theo v1/v2 sau khi luồng booking cốt lõi ổn định.

Ellora giúp khách hàng tìm salon, xem dịch vụ, đặt lịch và đánh giá sau khi sử dụng dịch vụ. Chủ salon dùng dashboard để quản lý hồ sơ, menu dịch vụ và lịch hẹn.

---

## 1. Vấn Đề Cần Giải Quyết

Khách hàng muốn làm nail thường phải:
- Tự tìm salon qua Google, Facebook, TikTok hoặc giới thiệu cá nhân.
- Xem review rải rác ở nhiều nơi, khó kiểm chứng.
- Nhắn tin đặt lịch thủ công qua Messenger/Zalo.
- Chờ salon xác nhận, dễ nhầm lịch hoặc bị bỏ sót.

Chủ salon thường gặp khó khăn khi:
- Quản lý lịch bằng tin nhắn, sổ tay hoặc bảng tính rời rạc.
- Trả lời lặp lại về giá, dịch vụ, giờ trống.
- Khó thu hút khách mới ngoài mạng xã hội cá nhân.
- Thiếu dữ liệu cơ bản về booking, dịch vụ phổ biến và review.

---

## 2. Mục Tiêu Sản Phẩm

Ellora tạo một website tập trung để:
- Khách hàng tìm salon theo khu vực, xem thông tin rõ ràng và đặt lịch trong một luồng liền mạch.
- Salon quản lý hồ sơ, dịch vụ, lịch hẹn và review qua một dashboard duy nhất.
- Dữ liệu booking và review được chuẩn hóa để giảm nhầm lịch, fake review và thao tác thủ công.

Tham khảo UX/product flow từ Fresha, nhưng ưu tiên thị trường Việt Nam, tiếng Việt, salon nail nhỏ đến vừa và stack kỹ thuật Angular + Spring Boot.

---

## 3. Người Dùng Mục Tiêu

### 3.1 Khách Hàng
- Nữ giới 18-45 tuổi, dùng điện thoại là chính.
- Làm nail định kỳ 2-4 tuần/lần.
- Quan tâm đến giá, hình ảnh mẫu nail, review thật, vị trí gần nhà/công ty và giờ trống.

### 3.2 Chủ Salon
- Tiệm nail quy mô nhỏ đến vừa, khoảng 1-10 kỹ thuật viên.
- Cần thêm khách mới, giảm đặt lịch thủ công và quản lý lịch rõ ràng hơn.
- Có thể chưa quen công cụ phức tạp, nên dashboard cần đơn giản và dễ dùng.

### 3.3 Admin
- Quản lý dữ liệu nền tảng khi cần.
- Kiểm duyệt salon, nội dung và review ở mức cơ bản trong v1, không phải trọng tâm MVP.

---

## 4. Phạm Vi MVP

MVP tập trung vào luồng cơ bản: tìm salon, xem chi tiết, đặt lịch, salon xác nhận booking và khách review sau khi hoàn thành.

### 4.1 Customer-facing
- Đăng ký, đăng nhập và quản lý phiên đăng nhập cơ bản.
- Xem danh sách salon, tìm/lọc theo thành phố, quận, tên salon hoặc loại dịch vụ.
- Xem trang chi tiết salon: ảnh, địa chỉ, giờ mở cửa, số điện thoại, dịch vụ, giá và review.
- Tạo booking cơ bản: chọn salon, dịch vụ, ngày, giờ và ghi chú tùy chọn.
- Xem danh sách booking cá nhân.
- Hủy booking khi booking chưa hoàn thành.
- Viết review 1-5 sao và bình luận sau khi booking có trạng thái `COMPLETED`.

### 4.2 Salon Dashboard
- Đăng ký tài khoản chủ salon.
- Tạo và chỉnh sửa hồ sơ salon: tên, mô tả, địa chỉ, số điện thoại, giờ làm việc, ảnh đại diện.
- Quản lý menu dịch vụ: thêm, sửa, xóa mềm hoặc tắt hiển thị dịch vụ.
- Xem danh sách booking theo ngày hoặc trạng thái.
- Xác nhận, hủy hoặc đánh dấu hoàn thành booking.
- Xem rating trung bình và số lượng review ở mức cơ bản.

### 4.3 MVP Không Bao Gồm Mặc Định
- SMS/Zalo OTP hoặc Zalo notification.
- Thanh toán online, đặt cọc, Momo/VNPay/ZaloPay.
- Google Maps hoặc Mapbox interactive map.
- Redis lock/caching nâng cao.
- AI recommendation, gợi ý mẫu nail, smart scheduling.
- Mobile app.
- Advanced analytics dashboard.
- Multi-branch salon management.

---

## 5. Roadmap Theo Phase

### 5.1 MVP
- Auth cơ bản cho customer và salon owner.
- Salon list/detail.
- Salon profile management.
- Service management.
- Booking cơ bản với trạng thái `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`.
- Owner booking management.
- Review sau completed booking.
- Email xác nhận booking cơ bản.

### 5.2 v1
- Google Maps integration để hiển thị vị trí và chỉ đường.
- Quản lý staff và phân công lịch cho kỹ thuật viên.
- Dashboard thống kê cơ bản: booking theo tuần/tháng, dịch vụ phổ biến, doanh thu ước tính.
- So sánh salon theo giá, rating, khoảng cách và dịch vụ.
- Admin moderation: duyệt salon, quản lý nội dung và review.
- Zalo notification cho booking/reminder.

### 5.3 v2
- Thanh toán đặt cọc qua Momo, VNPay hoặc ZaloPay.
- Redis cache/lock khi cần xử lý tải cao hoặc race condition booking.
- AI recommendation theo lịch sử booking, vị trí và sở thích.
- Nail style suggestion từ ảnh tham khảo.
- Loyalty points, voucher và flash deal.
- Mobile app iOS/Android, có thể dùng React Native nếu quyết định làm app riêng.
- Zalo Mini App nếu kênh Zalo chứng minh được hiệu quả.

---

## 6. Luồng Người Dùng Chính

### 6.1 Luồng Đặt Lịch MVP

```text
Khách truy cập website
  -> Tìm kiếm hoặc lọc salon
  -> Mở trang chi tiết salon
  -> Chọn dịch vụ
  -> Chọn ngày và giờ
  -> Đăng nhập hoặc đăng ký nếu chưa có tài khoản
  -> Xác nhận booking
  -> Booking được tạo với trạng thái PENDING
  -> Salon xác nhận hoặc hủy booking
  -> Khách đến salon sử dụng dịch vụ
  -> Salon đánh dấu booking COMPLETED
  -> Khách viết review
```

### 6.2 Luồng Salon Onboarding MVP

```text
Chủ salon đăng ký tài khoản
  -> Tạo hồ sơ salon
  -> Nhập địa chỉ, số điện thoại và giờ làm việc
  -> Upload ảnh salon
  -> Thêm menu dịch vụ và giá
  -> Salon xuất hiện trong danh sách tìm kiếm
  -> Chủ salon bắt đầu nhận booking
```

---

## 7. Tech Stack

### 7.1 Frontend
- **Framework:** Angular
- **Ngôn ngữ:** TypeScript
- **Routing:** Angular Router
- **HTTP Client:** Angular HttpClient
- **Form:** Reactive Forms
- **State management:** Service + RxJS trước; chỉ dùng NgRx khi thật sự cần.
- **Styling:** CSS/SCSS; có thể dùng Tailwind CSS nếu dự án đã setup.
- **UI:** Angular Material hoặc component tự viết; chỉ thêm UI library khi thật sự cần.
- **Thiết kế:** Mobile-first, responsive UI.

### 7.2 Backend
- **Framework:** Spring Boot
- **Ngôn ngữ:** Java
- **API:** REST API
- **Persistence:** Spring Data JPA / Hibernate
- **Validation:** Jakarta Bean Validation
- **Auth:** JWT có thể thêm sau khi CRUD cơ bản và booking logic ổn định.
- **Architecture:** Controller -> Service -> Repository -> Database.

### 7.3 Database Và Storage
- **Database chính:** PostgreSQL
- **Migration:** Flyway hoặc Liquibase nếu dự án đã setup; nếu chưa, dùng SQL script rõ ràng.
- **Cache/lock:** Redis chỉ thêm sau khi có nhu cầu rõ ràng về cache hoặc tránh race condition ở booking.
- **Storage ảnh:** Cloudinary cho ảnh salon, ảnh mẫu nail, avatar và ảnh review.

### 7.4 Deployment
- **Frontend:** Cloudflare Pages / Cloudflare Hosting.
- **Backend:** Render.
- **Database:** PostgreSQL trên Render, Supabase, Neon hoặc dịch vụ tương tự.
- **CDN/DNS:** Cloudflare.
- **CI/CD:** GitHub Actions.

---

## 8. Dữ Liệu Và Entity Chính

Các entity core dự kiến:

```text
User
Role
Salon
SalonHour
Staff
Service
Booking
Review
Media
```

Schema định hướng:

```sql
users (
  id, name, email, phone, password_hash, avatar_url, role_id, created_at, updated_at
)

roles (
  id, name
)

salons (
  id, owner_id, name, description, address, district, city,
  latitude, longitude, phone, email, cover_image_url,
  rating_avg, review_count, is_verified, is_active, created_at, updated_at
)

salon_hours (
  id, salon_id, day_of_week, open_time, close_time, is_closed
)

staff (
  id, salon_id, name, avatar_url, bio, is_active
)

services (
  id, salon_id, category, name, description, duration_mins, price, image_url, is_active
)

bookings (
  id, customer_id, salon_id, staff_id, service_id,
  booking_date, start_time, end_time, status, note, created_at, updated_at
)

reviews (
  id, booking_id, customer_id, salon_id, rating, comment, created_at, updated_at
)

media (
  id, owner_type, owner_id, url, media_type, created_at
)
```

Booking status dùng thống nhất:

```text
PENDING
CONFIRMED
CANCELLED
COMPLETED
```

Quy tắc dữ liệu quan trọng:
- Không lưu password dạng plain text.
- Không trả `password_hash` trong API response.
- Review chỉ được tạo cho booking đã `COMPLETED`.
- Booking mới bắt đầu với trạng thái `PENDING`.
- Tránh trùng booking cho cùng salon/staff/ngày/khung giờ bằng validation ở service/database trước; Redis lock chỉ thêm khi cần.

---

## 9. API Định Hướng

REST endpoints cốt lõi cho MVP:

```http
POST /api/auth/register
POST /api/auth/login

GET /api/salons
GET /api/salons/{id}
POST /api/salons
PATCH /api/salons/{id}

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

Quy tắc API:
- Dùng DTO cho request và response.
- Validate field bắt buộc bằng Jakarta Bean Validation.
- Dùng pagination cho list endpoint như salons, bookings và reviews.
- Giữ response lỗi rõ ràng, không expose dữ liệu nhạy cảm.
- Không thêm endpoint ngoài scope khi chưa có yêu cầu.

---

## 10. Mô Hình Kinh Doanh

### Phase 1 - Freemium
- Salon đăng ký miễn phí.
- Có thể giới hạn số booking/tháng ở gói Free.
- Profile cơ bản được hiển thị trong kết quả tìm kiếm.

### Phase 2 - Subscription

| Gói | Giá tham khảo | Tính năng |
|-----|---------------|-----------|
| Free | 0đ | Booking giới hạn, profile cơ bản |
| Basic | 299K/tháng | Unlimited bookings, thống kê cơ bản, ưu tiên hiển thị |
| Pro | 599K/tháng | Tất cả Basic, quản lý staff, notification nâng cao |

### Phase 3 - Commission
- Có thể thu phí nhỏ trên booking được xác nhận nếu thanh toán online đã ổn định.
- Không áp dụng trong MVP.

---

## 11. Competitive Landscape

| Tiêu chí | Ellora | Fresha | Booksy |
|----------|--------|--------|--------|
| Thị trường mục tiêu | Việt Nam, local-first | Toàn cầu | Toàn cầu |
| Ngôn ngữ chính | Tiếng Việt | Đa ngôn ngữ | Đa ngôn ngữ |
| Tập trung nail salon | Có | Beauty rộng | Beauty rộng |
| Tích hợp Zalo | v1/v2 | Không phải trọng tâm | Không phải trọng tâm |
| Thanh toán nội địa VN | v2 | Không phải trọng tâm | Không phải trọng tâm |
| Phù hợp salon nhỏ tại VN | Trọng tâm | Không chuyên biệt | Không chuyên biệt |

Lợi thế cạnh tranh của Ellora là tập trung vào salon nail tại Việt Nam, trải nghiệm tiếng Việt, tích hợp kênh nội địa theo phase và sản phẩm đủ đơn giản cho salon nhỏ.

---

## 12. Rủi Ro Và Giải Pháp

| Rủi ro | Giải pháp |
|--------|-----------|
| Salon không chịu onboard | Free tier, hồ sơ dễ tạo, hỗ trợ nhập dữ liệu ban đầu |
| Khách đặt lịch rồi không đến | Email nhắc lịch trong MVP; đặt cọc và Zalo/SMS reminder ở v1/v2 |
| Fake review | Chỉ cho phép review sau booking `COMPLETED` |
| Double booking | Validate ở service/database trong MVP; Redis lock khi có nhu cầu thực tế |
| Scope creep | Tách rõ MVP/v1/v2 và không code future feature khi chưa được yêu cầu |
| Dashboard quá phức tạp | Bắt đầu bằng danh sách booking và service management đơn giản |

---

## 13. Checklist Phát Triển

### MVP
- [ ] Auth: đăng ký/đăng nhập customer và salon owner
- [ ] Salon list với tìm kiếm/lọc cơ bản
- [ ] Salon detail với thông tin, dịch vụ, giá và review
- [ ] Salon profile management
- [ ] Service management
- [ ] Booking creation với trạng thái `PENDING`
- [ ] Owner booking management: xác nhận, hủy, hoàn thành
- [ ] My bookings cho khách hàng
- [ ] Review sau booking `COMPLETED`
- [ ] Email xác nhận booking cơ bản

### v1
- [ ] Google Maps integration
- [ ] Staff management và phân công lịch
- [ ] Dashboard thống kê cơ bản
- [ ] So sánh salon
- [ ] Admin moderation
- [ ] Zalo notification

### v2
- [ ] Thanh toán đặt cọc
- [ ] Redis cache/lock nâng cao
- [ ] AI recommendation
- [ ] Nail style suggestion
- [ ] Loyalty points và voucher
- [ ] Flash deal
- [ ] Mobile app
- [ ] Zalo Mini App

---

## 14. Tech Stack Tóm Tắt

```text
Frontend:   Angular + TypeScript + Angular Router + HttpClient + Reactive Forms
State:      Service + RxJS
Styling:    CSS/SCSS hoặc Tailwind CSS nếu đã setup
Backend:    Spring Boot + Java + Spring Data JPA / Hibernate
API:        REST + DTO + Jakarta Bean Validation
Database:   PostgreSQL
Cache:      Redis chỉ khi cần cache/lock nâng cao
Storage:    Cloudinary
Notify:     Email trong MVP; Zalo/SMS ở v1/v2
Payment:    Momo / VNPay / ZaloPay ở v2
Deploy:     Cloudflare FE + Render BE
```

---

*Tài liệu này dùng để định hướng sản phẩm và phạm vi phát triển Ellora. Khi có mâu thuẫn, ưu tiên MVP rõ ràng, stack Angular + Spring Boot + PostgreSQL, và không triển khai future feature nếu chưa được yêu cầu.*
