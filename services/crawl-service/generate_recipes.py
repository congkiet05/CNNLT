"""
generate_recipes.py
────────────────────────────────────────────────────────────────
Dùng Gemini AI để tạo ~150 công thức nấu ăn Việt Nam đa dạng
rồi insert vào bảng recipes (SQL Server).

Chạy:
    python generate_recipes.py
    python generate_recipes.py --count 50   # chỉ tạo 50 món
    python generate_recipes.py --dry-run    # in ra JSON, không insert DB
"""

import argparse
import json
import os
import re
import sys
import time
import pyodbc
from dotenv import load_dotenv
from google import genai

load_dotenv()

# ─── Config ──────────────────────────────────────────────────────────────────

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL   = "gemini-2.0-flash"

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "1433")
DB_NAME = os.getenv("DB_NAME", "food_recipe_db")
DB_USER = os.getenv("DB_USER", "sa")
DB_PASS = os.getenv("DB_PASSWORD", "")

# Số công thức mỗi batch gửi Gemini (tránh response quá lớn)
BATCH_SIZE = 10

# ─── Danh sách chủ đề để Gemini tạo đa dạng ─────────────────────────────────

TOPICS = [
    "món xào từ thịt heo",
    "món xào từ thịt bò",
    "món xào từ gà",
    "món xào từ hải sản (tôm, mực, cua)",
    "món canh rau củ",
    "món canh xương hầm",
    "món kho (cá kho, thịt kho, tôm kho)",
    "món hấp (cá hấp, tôm hấp, sườn hấp)",
    "món chiên (cá chiên, đậu hũ chiên, chả giò)",
    "món nướng (thịt nướng, cá nướng, mực nướng)",
    "món cơm (cơm chiên, cơm tấm, cơm gà)",
    "món bún (bún bò, bún riêu, bún mắm)",
    "món phở và hủ tiếu",
    "món mì (mì xào, mì nước)",
    "món gỏi và salad Việt",
    "món cuốn (gỏi cuốn, bánh tráng cuốn)",
    "món bánh mặn (bánh xèo, bánh cuốn, bánh bèo)",
    "món chay từ đậu hũ và nấm",
    "món trứng (trứng chiên, trứng hấp, trứng kho)",
    "món lẩu và súp",
    "món từ rau củ quả (bí đỏ, khoai tây, cà tím)",
    "món ăn sáng nhanh (bánh mì, xôi, cháo)",
    "món từ nguyên liệu đơn giản (cà chua, hành, tỏi)",
    "món từ tôm (tôm rang, tôm sốt, tôm hấp)",
    "món từ cá (cá sốt cà, cá om dưa, cá nấu canh)",
]


# ─── Prompt ──────────────────────────────────────────────────────────────────

def build_prompt(topic: str, count: int) -> str:
    return f"""Hãy tạo {count} công thức nấu ăn Việt Nam về chủ đề: "{topic}".

Trả về ĐÚNG định dạng JSON array sau, KHÔNG giải thích, KHÔNG markdown:
[
  {{
    "name": "Tên món ăn",
    "ingredients": [
      {{"ten_nguyen_lieu": "Thịt heo", "so_luong": 300, "don_vi": "gram"}},
      {{"ten_nguyen_lieu": "Tỏi", "so_luong": 3, "don_vi": "tép"}}
    ],
    "steps": [
      {{"buoc": 1, "mo_ta": "Sơ chế nguyên liệu..."}},
      {{"buoc": 2, "mo_ta": "Ướp thịt với..."}}
    ],
    "cook_time": "30 phút",
    "difficulty": "Dễ"
  }}
]

Quy tắc bắt buộc:
- difficulty chỉ được là: "Dễ", "Trung bình", hoặc "Khó"
- cook_time dạng: "X phút" hoặc "X giờ Y phút"
- ingredients: 4-12 nguyên liệu thực tế
- steps: 4-8 bước chi tiết
- Tên món phải khác nhau, không trùng lặp
- Chỉ trả về JSON array, không có text nào khác"""


# ─── DB Connection ────────────────────────────────────────────────────────────

def get_connection():
    conn_str = (
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={DB_HOST},{DB_PORT};"
        f"DATABASE={DB_NAME};"
        f"UID={DB_USER};"
        f"PWD={DB_PASS};"
        f"TrustServerCertificate=yes;"
        f"Encrypt=no;"
    )
    return pyodbc.connect(conn_str)


# ─── Insert recipes ───────────────────────────────────────────────────────────

def make_image_url(name: str) -> str:
    """Tạo Unsplash search URL theo tên món ăn."""
    # Dịch một số từ khóa phổ biến sang tiếng Anh để tìm ảnh tốt hơn
    keyword_map = {
        "xào": "stir fry", "kho": "braised", "hấp": "steamed",
        "chiên": "fried", "nướng": "grilled", "canh": "soup",
        "bún": "noodle soup", "phở": "pho", "cơm": "rice",
        "gà": "chicken", "bò": "beef", "heo": "pork",
        "tôm": "shrimp", "cá": "fish", "mực": "squid",
        "rau": "vegetable", "trứng": "egg", "đậu": "tofu",
        "lẩu": "hotpot", "gỏi": "salad", "cuốn": "spring roll",
    }
    words = name.lower().split()
    keywords = ["vietnamese food"]
    for word in words:
        if word in keyword_map:
            keywords.append(keyword_map[word])
    keyword_str = ",".join(keywords[:3])
    return f"https://source.unsplash.com/400x300/?{keyword_str}"


def insert_recipes(conn, recipes: list[dict], source_name: str = "Gemini Generate") -> tuple[int, int]:
    """Insert danh sách recipes vào DB. Trả về (inserted, skipped)."""
    cursor = conn.cursor()
    inserted = 0
    skipped  = 0

    for recipe in recipes:
        try:
            name        = recipe["name"].strip()
            ingredients = json.dumps(recipe["ingredients"], ensure_ascii=False)
            steps       = json.dumps(recipe["steps"], ensure_ascii=False)
            cook_time   = recipe.get("cook_time", "").strip() or None
            difficulty  = recipe.get("difficulty", "").strip()
            # Normalize difficulty - Gemini đôi khi trả về sai case
            difficulty_map = {
                "dễ": "Dễ", "de": "Dễ",
                "trung bình": "Trung bình", "trung binh": "Trung bình",
                "khó": "Khó", "kho": "Khó",
            }
            difficulty = difficulty_map.get(difficulty.lower(), None)

            # ingredients_text: tên nguyên liệu cách nhau dấu phẩy (tối đa 450 ký tự)
            ing_names = ", ".join(
                i.get("ten_nguyen_lieu", "") for i in recipe["ingredients"]
            )
            ingredients_text = ing_names[:450]

            # Tạo image_url từ tên món
            image_url = make_image_url(name)

            # Kiểm tra trùng tên (không dùng source_url vì Gemini không có URL)
            cursor.execute(
                "SELECT COUNT(*) FROM recipes WHERE name = ?", (name,)
            )
            if cursor.fetchone()[0] > 0:
                skipped += 1
                continue

            # Dùng tên món làm source_url để tránh UNIQUE NULL conflict
            source_url = f"generated://{name.lower().replace(' ', '-')}"

            cursor.execute(
                """
                INSERT INTO recipes
                    (name, ingredients, steps, cook_time, difficulty,
                     ingredients_text, source_name, image_url, is_active, source_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
                """,
                (name, ingredients, steps, cook_time, difficulty,
                 ingredients_text, source_name, image_url, source_url),
            )
            inserted += 1

        except Exception as e:
            print(f"  [WARN] Bỏ qua '{recipe.get('name', '?')}': {e}")
            skipped += 1

    conn.commit()
    return inserted, skipped


# ─── Log to crawl_logs ────────────────────────────────────────────────────────

def log_crawl(conn, source_name: str, status: str, message: str):
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO crawl_logs (source_name, status, message) VALUES (?, ?, ?)",
            (source_name, status, message),
        )
        conn.commit()
    except Exception:
        pass  # log thất bại không chặn luồng chính


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Generate recipes using Gemini AI")
    parser.add_argument("--count", type=int, default=150,
                        help="Tổng số công thức cần tạo (default: 150)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Chỉ in JSON ra màn hình, không insert DB")
    args = parser.parse_args()

    if not GEMINI_API_KEY:
        print("[ERROR] GEMINI_API_KEY chưa được set trong .env")
        sys.exit(1)

    # Tính số batch cần chạy
    total_target = args.count
    recipes_per_topic = max(1, total_target // len(TOPICS))
    # Điều chỉnh để tổng gần đúng target
    topic_list = TOPICS[:total_target] if total_target < len(TOPICS) else TOPICS

    print(f"[INFO] Mục tiêu: {total_target} công thức từ {len(topic_list)} chủ đề")
    print(f"[INFO] ~{recipes_per_topic} công thức/chủ đề")

    # Khởi tạo Gemini client
    client = genai.Client(api_key=GEMINI_API_KEY)

    # Kết nối DB (nếu không phải dry-run)
    conn = None
    if not args.dry_run:
        try:
            conn = get_connection()
            print(f"[DB] Đã kết nối SQL Server: {DB_HOST}:{DB_PORT}/{DB_NAME}")
        except Exception as e:
            print(f"[ERROR] Không thể kết nối DB: {e}")
            sys.exit(1)

    total_inserted = 0
    total_skipped  = 0
    all_recipes    = []

    for topic_idx, topic in enumerate(topic_list):
        # Số món cần tạo cho topic này
        remaining = total_target - total_inserted - len(all_recipes)
        if remaining <= 0:
            break

        count_this_topic = min(recipes_per_topic, BATCH_SIZE, remaining)
        print(f"\n[{topic_idx+1}/{len(topic_list)}] Chủ đề: '{topic}' — tạo {count_this_topic} món...")

        try:
            prompt = build_prompt(topic, count_this_topic)

            # Retry tối đa 3 lần nếu bị rate limit
            raw_text = None
            for attempt in range(3):
                try:
                    response = client.models.generate_content(
                        model=GEMINI_MODEL,
                        contents=prompt,
                    )
                    raw_text = response.text.strip()
                    break
                except Exception as e:
                    err_str = str(e)
                    # Tìm retryDelay trong message
                    match = re.search(r"retryDelay.*?(\d+)s", err_str)
                    wait = int(match.group(1)) + 2 if match else 60
                    if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                        print(f"  [RATE LIMIT] Chờ {wait}s rồi thử lại (lần {attempt+1}/3)...")
                        time.sleep(wait)
                    else:
                        raise

            if raw_text is None:
                raise Exception("Hết số lần retry do rate limit")

            # Làm sạch markdown nếu có
            cleaned = (
                raw_text
                .replace("```json", "")
                .replace("```", "")
                .strip()
            )

            recipes = json.loads(cleaned)
            if not isinstance(recipes, list):
                raise ValueError("Response không phải JSON array")

            print(f"  ✓ Nhận được {len(recipes)} công thức")

            if args.dry_run:
                all_recipes.extend(recipes)
                for r in recipes:
                    print(f"    - {r.get('name', '?')} ({r.get('difficulty', '?')}, {r.get('cook_time', '?')})")
            else:
                ins, skip = insert_recipes(conn, recipes)
                total_inserted += ins
                total_skipped  += skip
                log_crawl(conn, "Gemini Generate", "success",
                          f"Topic: {topic} | inserted: {ins} | skipped: {skip}")
                print(f"  ✓ Đã insert: {ins} | Bỏ qua (trùng): {skip}")

        except json.JSONDecodeError as e:
            msg = f"JSON parse error cho topic '{topic}': {e}"
            print(f"  [ERROR] {msg}")
            if conn:
                log_crawl(conn, "Gemini Generate", "error", msg)

        except Exception as e:
            msg = f"Lỗi topic '{topic}': {e}"
            print(f"  [ERROR] {msg}")
            if conn:
                log_crawl(conn, "Gemini Generate", "error", msg)

        # Delay nhỏ tránh rate limit
        time.sleep(3)

    # ─── Kết quả ─────────────────────────────────────────────
    print("\n" + "="*50)
    if args.dry_run:
        print(f"[DRY RUN] Tổng công thức tạo được: {len(all_recipes)}")
        # Xuất ra file JSON để xem
        out_file = "generated_recipes_preview.json"
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(all_recipes, f, ensure_ascii=False, indent=2)
        print(f"[DRY RUN] Đã lưu preview vào: {out_file}")
    else:
        print(f"[DONE] Đã insert: {total_inserted} công thức")
        print(f"[DONE] Bỏ qua (trùng tên): {total_skipped}")
        if conn:
            conn.close()


if __name__ == "__main__":
    main()
