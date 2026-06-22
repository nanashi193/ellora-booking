#!/bin/bash

ENV_FILE=".env.supabase"

if [ ! -f "$ENV_FILE" ]; then
    echo "Lỗi: Không tìm thấy file $ENV_FILE!"
    echo "Vui lòng copy file .env.supabase.example thành .env.supabase và điền thông tin."
    exit 1
fi

# Đọc các biến môi trường từ file .env.supabase
export $(grep -v '^#' "$ENV_FILE" | xargs)

# Kiểm tra xem các biến quan trọng đã có chưa
if [ -z "$SUPABASE_DB_URL" ] || [ -z "$SUPABASE_DB_USERNAME" ] || [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo "Lỗi: Cần cấu hình đầy đủ SUPABASE_DB_URL, SUPABASE_DB_USERNAME, SUPABASE_DB_PASSWORD trong file $ENV_FILE"
    exit 1
fi

export SPRING_PROFILES_ACTIVE="supabase"
export SPRING_DEVTOOLS_RESTART_ENABLED="false"

echo "Đang khởi động Spring Boot backend với profile 'supabase'..."
mvn spring-boot:run
