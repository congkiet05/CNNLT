# AI Food Recipe Suggestion

Hệ thống gợi ý món ăn từ ảnh nguyên liệu sử dụng Gemini AI.

## Kiến trúc

```
Frontend (Next.js :3000)
    ↓
API Gateway (Nginx :80)  ← Docker only
    ├── /api/auth/*         → auth-service (:3001)
    └── /api/ingredients/*  → ingredient-service (:3002)
         ↓
    SQL Server (:1433)
```

## Cài đặt

### 1. Cấu hình biến môi trường

```bash
cp .env.example .env
```

Điền các giá trị bắt buộc:
- `DB_PASSWORD` — mật khẩu SQL Server
- `JWT_SECRET` — chuỗi ngẫu nhiên ≥32 ký tự
- `GEMINI_API_KEY` — lấy tại https://aistudio.google.com/app/apikey

### 2. Khởi tạo database

Chạy `database/init.sql` trên SQL Server instance của bạn.

Tài khoản mặc định sau khi seed:
- Admin: `admin@cooksmart.ai` / `Admin@123`
- User: `user@cooksmart.ai` / `User@123`

### 3. Chạy local (không Docker)

Tạo `.env` trong mỗi service folder, sau đó:

```bash
# Terminal 1
cd services/auth-service && npm install && node src/index.js

# Terminal 2
cd services/ingredient-service && npm install && node src/index.js

# Terminal 3
cd Frontend && pnpm install && pnpm dev
```

Tạo `Frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=/api
```

### 4. Chạy với Docker Compose

```bash
docker-compose up --build
```

Sau đó chạy schema:
```bash
docker exec -it food_sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "$DB_PASSWORD" -C -i /tmp/init.sql
```

## API Endpoints

### Auth Service (:3001)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/refresh` | Làm mới token |
| POST | `/api/auth/logout` | Đăng xuất |
| GET  | `/api/auth/me` | Thông tin user |

### Ingredient Service (:3002)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/ingredients/recognize` | Nhận diện nguyên liệu từ ảnh |
| POST | `/api/ingredients/sessions` | Lưu scan session |
| GET  | `/api/ingredients/sessions` | Lịch sử scan |
| GET  | `/api/ingredients/sessions/:id` | Chi tiết session |

## Tài khoản test

| Email | Mật khẩu | Vai trò |
|-------|----------|---------|
| admin@cooksmart.ai | Admin@123 | Admin |
| user@cooksmart.ai | User@123 | User |
