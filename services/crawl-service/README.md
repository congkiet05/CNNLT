# Crawl Service

Script Python để tạo và crawl dữ liệu công thức nấu ăn vào DB.

## Cài đặt

```bash
cd services/crawl-service

# Tạo virtual environment (khuyến nghị)
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Cài dependencies
pip install -r requirements.txt
```

> **Lưu ý:** Cần cài ODBC Driver 18 for SQL Server:
> - macOS: `brew install msodbcsql18`
> - Ubuntu: xem https://learn.microsoft.com/en-us/sql/connect/odbc/linux-mac/installing-the-microsoft-odbc-driver-for-sql-server

## Cấu hình `.env`

File `.env` đã có sẵn, kiểm tra lại các giá trị:

```env
DB_HOST=localhost
DB_PORT=1433
DB_NAME=food_recipe_db
DB_USER=sa
DB_PASSWORD=your_password
GEMINI_API_KEY=your_gemini_key
```

---

## Script 1: `generate_recipes.py` — Tạo công thức bằng Gemini AI

Dùng Gemini tạo công thức đa dạng từ 25 chủ đề ẩm thực Việt Nam.

### Cách chạy

```bash
# Tạo 150 công thức (mặc định)
python generate_recipes.py

# Tạo số lượng tùy chỉnh
python generate_recipes.py --count 50

# Dry run: chỉ xem JSON, không insert DB
python generate_recipes.py --dry-run
python generate_recipes.py --count 20 --dry-run
```

### Output

```
[INFO] Mục tiêu: 150 công thức từ 25 chủ đề
[1/25] Chủ đề: 'món xào từ thịt heo' — tạo 6 món...
  ✓ Nhận được 6 công thức
  ✓ Đã insert: 6 | Bỏ qua (trùng): 0
...
==================================================
[DONE] Đã insert: 147 công thức
[DONE] Bỏ qua (trùng tên): 3
```

Kết quả dry-run lưu vào `generated_recipes_preview.json`.

---

## Kiểm tra dữ liệu sau khi chạy

Kết nối SQL Server và chạy:

```sql
-- Đếm tổng số công thức
SELECT COUNT(*) FROM recipes;

-- Xem phân bố độ khó
SELECT difficulty, COUNT(*) as count
FROM recipes
GROUP BY difficulty;

-- Xem 5 công thức mới nhất
SELECT TOP 5 id, name, cook_time, difficulty, source_name, created_at
FROM recipes
ORDER BY created_at DESC;
```
