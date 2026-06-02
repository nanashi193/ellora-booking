$env:SPRING_PROFILES_ACTIVE = "supabase"

# Copy values from backend/.env.supabase.example and replace the placeholders below.
$env:SUPABASE_DB_URL = "jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require"
$env:SUPABASE_DB_USERNAME = "postgres.YOUR_PROJECT_REF"
$env:SUPABASE_DB_PASSWORD = "YOUR_DATABASE_PASSWORD"

# Optional but recommended before deploying.
# $env:JWT_SECRET = "replace-with-a-long-random-secret-at-least-32-characters"

mvn spring-boot:run
