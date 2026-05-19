# CookSmart AI - API Documentation

Hệ thống API của CookSmart AI được định tuyến qua **API Gateway (Nginx)** chạy ở cổng mặc định `80`.

- **Base URL:** `http://localhost/api` (khi chạy local qua Docker)
- **Định dạng dữ liệu:** `application/json`

---

## Danh Sách Các Dịch Vụ (Microservices)

| Dịch vụ | Cổng nội bộ | Tiền tố Gateway | Mô tả |
| :--- | :--- | :--- | :--- |
| **Auth Service** | `3001` | `/api/auth` | Quản lý đăng ký, đăng nhập, phân quyền và JWT. |
| **Ingredient Service** | `3002` | `/api/ingredients` | Nhận diện nguyên liệu bằng ảnh (Gemini AI) & Lịch sử quét. |
| **Recipe Service** | `3003` | `/api/recipes` | Quản lý và gợi ý công thức món ăn & tích hợp video YouTube. |
| **Weather Service** | `3004` | `/api/weather` | Gợi ý món ăn thông minh theo thời tiết địa phương. |

---

## 1. Auth Service (`/api/auth`)

### 1.1 Đăng Ký Tài Khoản
Tạo tài khoản mới cho người dùng.

- **Endpoint:** `POST /api/auth/register`
- **Xác thực:** Không (Public)
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "display_name": "Nguyễn Văn A"
  }
  ```
- **Response (Thành công - `201 Created`):**
  ```json
  {
    "success": true,
    "message": "Đăng ký thành công",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "display_name": "Nguyễn Văn A",
      "role": "user"
    }
  }
  ```

### 1.2 Đăng Nhập
Xác thực tài khoản và cấp JWT Tokens.

- **Endpoint:** `POST /api/auth/login`
- **Xác thực:** Không (Public)
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response (Thành công - `200 OK`):**
  ```json
  {
    "success": true,
    "access_token": "eyJhbGciOi...",
    "refresh_token": "12345678-abcd-...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "display_name": "Nguyễn Văn A",
      "role": "user"
    }
  }
  ```

### 1.3 Làm Mới Token (Refresh Token)
Cấp lại Access Token mới khi token cũ hết hạn (1 giờ).

- **Endpoint:** `POST /api/auth/refresh`
- **Xác thực:** Không (Public)
- **Request Body:**
  ```json
  {
    "refresh_token": "12345678-abcd-..."
  }
  ```
- **Response (Thành công - `200 OK`):**
  ```json
  {
    "success": true,
    "access_token": "eyJhbGciOi..."
  }
  ```

### 1.4 Đăng Xuất
Hủy Refresh Token ở database và đăng xuất thiết bị.

- **Endpoint:** `POST /api/auth/logout`
- **Xác thực:** Không (Public)
- **Request Body:**
  ```json
  {
    "refresh_token": "12345678-abcd-..."
  }
  ```
- **Response (Thành công - `200 OK`):**
  ```json
  {
    "success": true,
    "message": "Đăng xuất thành công"
  }
  ```

### 1.5 Lấy Thông Tin Người Dùng Hiện Tại
Lấy thông tin profile của user từ Token.

- **Endpoint:** `GET /api/auth/me`
- **Xác thực:** **Bắt buộc** (Header `Authorization: Bearer <access_token>`)
- **Response (Thành công - `200 OK`):**
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "email": "user@example.com",
      "display_name": "Nguyễn Văn A",
      "role": "user",
      "avatar_url": "https://..."
    }
  }
  ```

### 1.6 Cập Nhật Tên Hiển Thị
Chỉnh sửa thông tin cá nhân.

- **Endpoint:** `PUT /api/auth/me`
- **Xác thực:** **Bắt buộc** (Header `Authorization: Bearer <access_token>`)
- **Request Body:**
  ```json
  {
    "display_name": "Nguyễn Văn B"
  }
  ```
- **Response (Thành công - `200 OK`):**
  ```json
  {
    "success": true,
    "message": "Cập nhật hồ sơ thành công"
  }
  ```

---

## 2. Ingredient Service (`/api/ingredients`)

### 2.1 Nhận Diện Nguyên Liệu Từ Ảnh (Gemini AI)
Tải lên 1-3 ảnh nguyên liệu, AI sẽ phân tích và trả về danh sách kèm số lượng, đơn vị ước lượng.

- **Endpoint:** `POST /api/ingredients/recognize`
- **Xác thực:** **Bắt buộc** (Header `Authorization: Bearer <access_token>`)
- **Content-Type:** `multipart/form-data`
- **Request Body (Form data):**
  - `images`: File ảnh (tối đa 3 file, hỗ trợ `.jpg`, `.jpeg`, `.png`, v.v.)
- **Response (Thành công - `200 OK`):**
  ```json
  {
    "success": true,
    "ingredients": [
      { "ten_nguyen_lieu": "Cà chua", "so_luong": 2, "don_vi": "quả" },
      { "ten_nguyen_lieu": "Trứng gà", "so_luong": 3, "don_vi": "quả" }
    ],
    "count": 2
  }
  ```

### 2.2 Lưu Phiên Quét Ảnh (Scan Session)
Lưu trữ danh sách nguyên liệu đã chốt từ quá trình quét ảnh.

- **Endpoint:** `POST /api/ingredients/sessions`
- **Xác thực:** **Bắt buộc** (Header `Authorization: Bearer <access_token>`)
- **Request Body:**
  ```json
  {
    "ingredient_list": [
      { "ten_nguyen_lieu": "Cà chua", "so_luong": 2, "don_vi": "quả" },
      { "ten_nguyen_lieu": "Trứng gà", "so_luong": 3, "don_vi": "quả" }
    ]
  }
  ```
- **Response (Thành công - `201 Created`):**
  ```json
  {
    "success": true,
    "message": "Đã lưu danh sách nguyên liệu",
    "session_id": 42,
    "created_at": "2026-05-19T14:00:00.000Z"
  }
  ```

### 2.3 Lấy Lịch Sử Quét Ảnh (Có phân trang)
Lấy danh sách các phiên quét cũ của người dùng (tối đa giữ lại 50 phiên gần nhất).

- **Endpoint:** `GET /api/ingredients/sessions`
- **Xác thực:** **Bắt buộc** (Header `Authorization: Bearer <access_token>`)
- **Query Parameters:**
  - `page`: Trang hiện tại (mặc định: `1`)
  - `limit`: Số bản ghi mỗi trang (mặc định: `10`, tối đa: `50`)
- **Response (Thành công - `200 OK`):**
  ```json
  {
    "success": true,
    "sessions": [
      {
        "id": 42,
        "status": "ingredient_confirmed",
        "ingredient_list": [
          { "ten_nguyen_lieu": "Cà chua", "so_luong": 2, "don_vi": "quả" }
        ],
        "dish_name": null,
        "created_at": "2026-05-19T14:00:00.000Z",
        "updated_at": "2026-05-19T14:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "total_pages": 1
    }
  }
  ```

### 2.4 Lấy Chi Tiết Một Phiên Quét
Lấy chi tiết danh sách nguyên liệu và kết quả công thức, video liên quan của phiên quét cụ thể.

- **Endpoint:** `GET /api/ingredients/sessions/:id`
- **Xác thực:** **Bắt buộc** (Header `Authorization: Bearer <access_token>`)
- **Response (Thành công - `200 OK`):**
  ```json
  {
    "success": true,
    "session": {
      "id": 42,
      "status": "ingredient_confirmed",
      "ingredient_list": [
        { "ten_nguyen_lieu": "Cà chua", "so_luong": 2, "don_vi": "quả" }
      ],
      "recipes_result": null,
      "video_results": null,
      "dish_name": null,
      "created_at": "2026-05-19T14:00:00.000Z",
      "updated_at": "2026-05-19T14:00:00.000Z"
    }
  }
  ```

---

## 3. Recipe Service (`/api/recipes`)

### 3.1 Gợi Ý Công Thức Theo Nguyên Liệu
Tìm các món ăn trong hệ thống chứa ít nhất một nguyên liệu người dùng đang có. Sắp xếp theo tỷ lệ phần trăm tương thích (`matchPercentage`) giảm dần.

- **Endpoint:** `GET /api/recipes/suggest`
- **Xác thực:** **Bắt buộc** (Header `Authorization: Bearer <access_token>`)
- **Query Parameters:**
  - `ingredients`: Danh sách nguyên liệu, ngăn cách bằng dấu phẩy. (VD: `tôm,tỏi,sả`)
  - `limit`: Số kết quả gợi ý tối đa (mặc định: `12`, tối đa: `20`)
- **Response (Thành công - `200 OK`):**
  ```json
  {
    "success": true,
    "recipes": [
      {
        "id": 15,
        "name": "Tôm chiên tỏi",
        "cook_time": "20 phút",
        "difficulty": "Dễ",
        "image_url": "https://...",
        "matchPercentage": 100,
        "missingIngredients": [],
        "ingredients": [
          { "ten_nguyen_lieu": "Tôm", "so_luong": 300, "don_vi": "g" },
          { "ten_nguyen_lieu": "Tỏi", "so_luong": 1, "don_vi": "củ" }
        ],
        "steps": [
          { "buoc": 1, "mo_ta": "Băm tỏi và làm sạch tôm..." }
        ]
      }
    ],
    "total": 1
  }
  ```

### 3.2 Lấy Danh Sách Công Thức (Có phân trang & Tìm kiếm)
Lấy toàn bộ công thức món ăn đang kích hoạt. Hỗ trợ tìm kiếm theo tên hoặc nguyên liệu.

- **Endpoint:** `GET /api/recipes`
- **Xác thực:** Không (Public)
- **Query Parameters:**
  - `page`: Trang hiện tại (mặc định: `1`)
  - `limit`: Số bản ghi mỗi trang (mặc định: `12`, tối đa: `200`)
  - `search`: Từ khóa tìm kiếm theo tên món hoặc nguyên liệu (mặc định: rỗng)
- **Response (Thành công - `200 OK`):**
  ```json
  {
    "success": true,
    "recipes": [
      {
        "id": 15,
        "name": "Tôm chiên tỏi",
        "cook_time": "20 phút",
        "difficulty": "Dễ",
        "ingredients_text": "Tôm, Tỏi, Dầu ăn",
        "image_url": "https://...",
        "created_at": "2026-05-19T14:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 1,
      "total_pages": 1
    }
  }
  ```

### 3.3 Lấy Chi Tiết Công Thức
- **Endpoint:** `GET /api/recipes/:id`
- **Xác thực:** Không (Public)
- **Response (Thành công - `200 OK`):**
  ```json
  {
    "success": true,
    "recipe": {
      "id": 15,
      "name": "Tôm chiên tỏi",
      "ingredients": [
        { "ten_nguyen_lieu": "Tôm", "so_luong": 300, "don_vi": "g" }
      ],
      "steps": [
        { "buoc": 1, "mo_ta": "Băm tỏi và làm sạch tôm..." }
      ],
      "cook_time": "20 phút",
      "difficulty": "Dễ",
      "source_url": "https://...",
      "source_name": "Cookpad",
      "image_url": "https://...",
      "created_at": "2026-05-19T14:00:00.000Z"
    }
  }
  ```

### 3.4 Lấy Video Hướng Dẫn Nấu Ăn (YouTube API)
Tìm kiếm 3 video hướng dẫn nấu ăn trên YouTube dựa theo tên công thức.

- **Endpoint:** `GET /api/recipes/:id/videos`
- **Xác thực:** Không (Public)
- **Response (Thành công - `200 OK`):**
  ```json
  {
    "success": true,
    "videos": [
      {
        "video_id": "dQw4w9WgXcQ",
        "title": "Cách làm Tôm Chiên Tỏi siêu ngon...",
        "thumbnail": "https://img.youtube.com/...",
        "channel": "Bếp Trưởng Review",
        "embed_url": "https://www.youtube.com/embed/dQw4w9WgXcQ"
      }
    ],
    "recipe_name": "Tôm chiên tỏi"
  }
  ```

---

## 4. Weather Service (`/api/weather`)

### 4.1 Gợi Ý Món Ăn Theo Thời Tiết
Lấy thời tiết hiện tại qua kinh độ/vĩ độ (Open-Meteo API) và đề xuất 4 món ăn ngẫu nhiên phù hợp với kiểu thời tiết đó (ví dụ: món ấm, nóng cho trời mưa/lạnh; món thanh mát cho trời nắng nóng).

- **Endpoint:** `GET /api/weather/suggest`
- **Xác thực:** Không (Public)
- **Query Parameters:**
  - `lat`: Vĩ độ (Latitude) - *Bắt buộc*
  - `lon`: Kinh độ (Longitude) - *Bắt buộc*
- **Response (Thành công - `200 OK`):**
  ```json
  {
    "success": true,
    "weather": {
      "temp": 28.5,
      "code": 3,
      "condition": {
        "type": "mild",
        "label": "Thời tiết mát mẻ",
        "message": "Thời tiết lý tưởng cho các món chiên xào hoặc nướng đậm vị!",
        "keywords": ["xào", "chiên", "nướng", "ram", "rim"],
        "icon": "⛅"
      }
    },
    "recipes": [
      {
        "id": 8,
        "name": "Mực xào chua ngọt",
        "cook_time": "15 phút",
        "difficulty": "Trung bình",
        "image_url": "https://..."
      }
    ]
  }
  ```

---

## Mã Trạng Thái HTTP (Status Codes) Thường Gặp

- `200 OK`: Yêu cầu thành công, dữ liệu được trả về.
- `201 Created`: Tạo mới dữ liệu thành công (Đăng ký, Lưu session).
- `400 Bad Request`: Tham số gửi lên bị thiếu hoặc sai định dạng.
- `401 Unauthorized`: Token không hợp lệ, hết hạn hoặc không được cung cấp.
- `404 Not Found`: Không tìm thấy dữ liệu yêu cầu.
- `422 Unprocessable Entity`: Nghiệp vụ không xử lý được (ví dụ: Gemini không đọc được gì từ ảnh).
- `429 Too Many Requests`: Vượt quá số lượng request cho phép hoặc quota Gemini API bị giới hạn.
- `500 Internal Server Error`: Lỗi hệ thống Backend.
