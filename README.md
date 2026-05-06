# AI Food Recipe Suggestion

Hệ thống gợi ý món ăn từ ảnh nguyên liệu sử dụng Gemini AI.

## Kiến trúc

```
Frontend (Next.js :3000)
    ↓
API Gateway (Nginx :80)
    ├── /api/auth/*       → auth-service (:3001)
    └── /api/ingredients/* → ingredient-service (:3002)
         ↓
    SQL Server (:1433)
```

## Cài đặt & Chạy

### 1. Cấu hình biến môi trường

Sao chép và chỉnh sửa file `.env`:

```bash
cp .env .env.local
```

Cập nhật các giá trị bắt buộc:
- `DB_PASSWORD` — mật khẩu SQL Server (tối thiểu 8 ký tự, có chữ hoa, số, ký tự đặc biệt)
- `JWT_SECRET` — chuỗi ngẫu nhiên dài ≥32 ký tự
- `GEMINI_API_KEY` — lấy tại https://aistudio.google.com/app/apikey

### 2. Chạy với Docker Compose

```bash
docker-compose up --build
```

Lần đầu SQL Server khởi động mất ~30 giây. Sau đó chạy schema:

```bash
docker exec -it food_sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "$DB_PASSWORD" \
  -i /docker-entrypoint-initdb.d/init.sql
```

### 3. Truy cập

- Frontend: http://localhost:3000
- API Gateway: http://localhost/api
- Auth Service (direct): http://localhost:3001
- Ingredient Service (direct): http://localhost:3002

## API Endpoints

### Auth Service

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/refresh` | Làm mới access token |
| POST | `/api/auth/logout` | Đăng xuất |
| GET  | `/api/auth/me` | Thông tin user hiện tại |

**Register body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "display_name": "Nguyễn Văn A"
}
```

**Login response:**
```json
{
  "success": true,
  "access_token": "eyJ...",
  "refresh_token": "uuid-v4",
  "user": { "id": 1, "email": "...", "display_name": "...", "role": "user" }
}
```

### Ingredient Service

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/ingredients/recognize` | Nhận diện nguyên liệu từ ảnh |

**Request:** `multipart/form-data`, field `images[]` (1-3 files, JPEG/PNG/WEBP, ≤10MB mỗi file)

**Response:**
```json
{
  "success": true,
  "ingredients": [
    { "ten_nguyen_lieu": "Cà chua", "so_luong": 2, "don_vi": "quả" }
  ],
  "count": 1
}
```

## Phát triển local (không Docker)

```bash
# Auth Service
cd services/auth-service
npm install
npm run dev

# Ingredient Service
cd services/ingredient-service
npm install
npm run dev

# Frontend
cd Frontend
pnpm install
pnpm dev
```

Tạo file `.env` trong mỗi service folder với các biến tương ứng.
