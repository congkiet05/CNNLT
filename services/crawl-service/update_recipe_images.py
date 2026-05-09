"""
update_recipe_images.py
────────────────────────────────────────────────────────────────
Tìm ảnh phù hợp cho từng công thức trong DB bằng cách search
DuckDuckGo Images theo tên món, lưu URL vào cột image_url.

Chạy:
    python update_recipe_images.py
    python update_recipe_images.py --limit 20   # chỉ update 20 món
    python update_recipe_images.py --dry-run    # xem kết quả, không update DB
"""

import argparse
import os
import sys
import time
import json
import re
import requests
import pyodbc
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "1433")
DB_NAME = os.getenv("DB_NAME", "food_recipe_db")
DB_USER = os.getenv("DB_USER", "sa")
DB_PASS = os.getenv("DB_PASSWORD", "")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

# ─── DB ──────────────────────────────────────────────────────────────────────

def get_connection():
    conn_str = (
        f"DRIVER={{ODBC Driver 18 for SQL Server}};"
        f"SERVER={DB_HOST},{DB_PORT};"
        f"DATABASE={DB_NAME};"
        f"UID={DB_USER};"
        f"PWD={DB_PASS};"
        f"TrustServerCertificate=yes;"
        f"Encrypt=no;"
    )
    return pyodbc.connect(conn_str)


# ─── Search ảnh DuckDuckGo ────────────────────────────────────────────────────

def search_image_duckduckgo(query: str) -> str | None:
    """
    Tìm ảnh từ DuckDuckGo Images.
    Trả về URL ảnh đầu tiên tìm được, hoặc None nếu thất bại.
    """
    try:
        # Bước 1: Lấy vqd token
        search_url = "https://duckduckgo.com/"
        params = {"q": query}
        resp = requests.get(search_url, params=params, headers=HEADERS, timeout=10)
        
        vqd_match = re.search(r'vqd=([\d-]+)', resp.text)
        if not vqd_match:
            return None
        vqd = vqd_match.group(1)

        # Bước 2: Gọi API ảnh
        img_url = "https://duckduckgo.com/i.js"
        img_params = {
            "l": "us-en",
            "o": "json",
            "q": query,
            "vqd": vqd,
            "f": ",,,",
            "p": "1",
        }
        img_resp = requests.get(img_url, params=img_params, headers=HEADERS, timeout=10)
        data = img_resp.json()

        results = data.get("results", [])
        if results:
            # Lấy ảnh đầu tiên có kích thước hợp lý
            for r in results[:5]:
                url = r.get("image", "")
                width = r.get("width", 0)
                height = r.get("height", 0)
                # Ưu tiên ảnh ngang, kích thước vừa phải
                if url and width >= 300 and height >= 200:
                    return url
            return results[0].get("image")
    except Exception as e:
        print(f"  [WARN] DuckDuckGo search lỗi: {e}")
        return None

def search_image_bing(query: str) -> str | None:
    """Tìm ảnh từ Bing Images — Đã sửa lỗi bốc nhầm script."""
    try:
        url = f"https://www.bing.com/images/search"
        # Thêm filter để tìm ảnh kích thước trung bình/lớn cho đẹp
        params = {"q": query, "qft": "+filterui:imagesize-medium", "form": "IRFLTR", "first": "1"}
        resp = requests.get(url, params=params, headers=HEADERS, timeout=12)
        
        # Regex này an toàn hơn, tập trung vào cấu trúc JSON m= của Bing
        matches = re.findall(r'm="({.*?})"', resp.text)
        for match in matches:
            try:
                # Giải mã HTML entities (như &quot;) trước khi load JSON
                import html
                clean_json = html.unescape(match)
                data = json.loads(clean_json)
                img_url = data.get("murl")
                
                # Kiểm tra xem có phải link ảnh thật không
                if img_url and img_url.startswith("http") and any(ext in img_url.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                    return img_url
            except:
                continue
                
    except Exception as e:
        print(f"  [WARN] Bing search lỗi: {e}")
    return None

def search_image_for_recipe(name: str) -> str | None:
    """Tìm ảnh cho tên món ăn Việt Nam — thử nhiều query."""
    queries = [
        f"{name} món ăn",
        f"{name} Vietnamese food",
        f"{name} recipe",
    ]
    for query in queries:
        # Thử Bing trước
        url = search_image_bing(query)
        if url:
            return url
        time.sleep(0.8)
        # Fallback DuckDuckGo
        url = search_image_duckduckgo(query)
        if url:
            return url
        time.sleep(0.8)
    return None


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Update recipe images from web search")
    parser.add_argument("--limit", type=int, default=0,
                        help="Số lượng recipe cần update (0 = tất cả)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Chỉ in kết quả, không update DB")
    parser.add_argument("--overwrite", action="store_true",
                        help="Update cả những recipe đã có image_url")
    args = parser.parse_args()

    try:
        conn = get_connection()
        print(f"[DB] Đã kết nối: {DB_HOST}:{DB_PORT}/{DB_NAME}")
    except Exception as e:
        print(f"[ERROR] Không thể kết nối DB: {e}")
        sys.exit(1)

    cursor = conn.cursor()

    # Lấy danh sách recipe cần update
    where = "WHERE is_active = 1"
    if not args.overwrite:
        where += " AND (image_url IS NULL OR image_url = '' OR image_url LIKE '%source.unsplash%' OR image_url LIKE '%picsum%')"

    limit_clause = f"TOP {args.limit}" if args.limit > 0 else ""
    cursor.execute(f"SELECT {limit_clause} id, name FROM recipes {where} ORDER BY id")
    recipes = cursor.fetchall()

    print(f"[INFO] Cần update ảnh cho {len(recipes)} công thức")

    updated = 0
    failed  = 0

    for recipe_id, name in recipes:
        print(f"  [{updated+failed+1}/{len(recipes)}] {name}...")
        
        image_url = search_image_for_recipe(name)
        
        if image_url:
            print(f"    ✓ {image_url[:80]}...")
            if not args.dry_run:
                cursor.execute(
                    "UPDATE recipes SET image_url = ? WHERE id = ?",
                    (image_url, recipe_id)
                )
                conn.commit()
            updated += 1
        else:
            print(f"    ✗ Không tìm được ảnh")
            failed += 1

        # Delay để tránh bị block
        time.sleep(2)

    print(f"\n{'='*50}")
    print(f"[DONE] Updated: {updated} | Failed: {failed}")
    conn.close()


if __name__ == "__main__":
    main()
