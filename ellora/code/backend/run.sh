#!/bin/bash

if [ ! -f .env ]; then
    echo "Lỗi: Không tìm thấy file .env!"
    echo "Vui lòng copy file .env.example thành .env và điền thông tin database của bạn."
    exit 1
fi

# Đọc các biến môi trường từ file .env
export $(grep -v '^#' .env | xargs)

# Kiểm tra xem các biến quan trọng đã có chưa
if [ -z "$DATABASE_URL" ] || [ -z "$DATABASE_USERNAME" ] || [ -z "$DATABASE_PASSWORD" ]; then
    echo "Lỗi: Cần cấu hình đầy đủ DATABASE_URL, DATABASE_USERNAME, DATABASE_PASSWORD trong file .env"
    exit 1
fi

echo "Đang khởi động Spring Boot backend..."
mvn spring-boot:run
