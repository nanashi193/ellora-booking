# Plan: Cập nhật UI section "Tìm kiếm tiệm nail thật dễ dàng"

1.  **Mục tiêu**: Bọc section "Tìm kiếm tiệm nail thật dễ dàng" (gồm header và 3 cards) trong một container có background màu kem (`#FBF7F1`), bo góc lớn (như hình 1). Các card bên trong sẽ có background màu trắng (`#FFFFFF`) để nổi bật trên nền kem.
2.  **Các bước thực hiện**:
    *   Sửa đổi file `home.component.html`.
    *   Bọc nội dung của `<section class="w-full px-6 py-20 md:py-24">` bằng một div mới có class `max-w-7xl mx-auto bg-[#FBF7F1] rounded-[2.5rem] px-6 py-16 md:py-24`.
    *   Thay đổi background của 3 card bên trong từ `bg-[#FBF7F1]` thành `bg-[#FFFFFF]`.
    *   Thêm `max-w-6xl mx-auto` vào thẻ div grid chứa 3 card để canh giữa.
3.  **Tình trạng**: Đã hoàn thành các bước thay đổi code.
