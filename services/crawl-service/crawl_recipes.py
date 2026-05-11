"""
crawl_recipes.py
────────────────────────────────────────────────────────────────
Crawl công thức nấu ăn từ các website Việt Nam.
Hỗ trợ: monngonmoingay.com (API + HTML scraping), bepgiadinh.com

Chạy:
    python crawl_recipes.py --source monngon --limit 100
    python crawl_recipes.py --source bepgiadinh --limit 100
    python crawl_recipes.py --dry-run --limit 5
"""

import argparse
import json
import os
import re
import sys
import time
import pyodbc
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()

# ─── API Constants ──────────────────────────────────────────────────────────────

API_BASE = "https://monngonmoingay.com/wp-json/wp/v2"
MONAN_ENDPOINT = f"{API_BASE}/monan"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
}

SESSION = requests.Session()
SESSION.headers.update(HEADERS)


# ─── DB ──────────────────────────────────────────────────────────────────────

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "1433")
DB_NAME = os.getenv("DB_NAME", "food_recipe_db")
DB_USER = os.getenv("DB_USER", "sa")
DB_PASS = os.getenv("DB_PASSWORD", "")

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


def insert_recipe(conn, recipe: dict) -> bool:
    """Insert 1 recipe. Trả về True nếu insert thành công, False nếu trùng."""
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM recipes WHERE source_url = ?", (recipe["source_url"],))
        if cursor.fetchone()[0] > 0:
            return False

        cursor.execute("SELECT COUNT(*) FROM recipes WHERE name = ?", (recipe["name"],))
        if cursor.fetchone()[0] > 0:
            return False

        ingredients_json = json.dumps(recipe["ingredients"], ensure_ascii=False)
        steps_json = json.dumps(recipe["steps"], ensure_ascii=False)
        ing_text = ", ".join(i["ten_nguyen_lieu"] for i in recipe["ingredients"])[:450]

        cursor.execute(
            """
            INSERT INTO recipes
                (name, ingredients, steps, cook_time, difficulty,
                 ingredients_text, source_url, source_name, image_url, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            """,
            (
                recipe["name"],
                ingredients_json,
                steps_json,
                recipe.get("cook_time"),
                recipe.get("difficulty"),
                ing_text,
                recipe["source_url"],
                recipe["source_name"],
                recipe.get("image_url"),
            ),
        )
        conn.commit()
        return True
    except Exception as e:
        print(f"    [DB ERROR] {e}")
        conn.rollback()
        return False


# ─── Helper ───────────────────────────────────────────────────────────────────

def fetch(url: str, timeout: int = 30, json_response: bool = False):
    try:
        resp = SESSION.get(url, timeout=timeout, verify=False)
        resp.raise_for_status()
        resp.encoding = "utf-8"
        if json_response:
            return resp.json()
        return BeautifulSoup(resp.text, "html.parser")
    except Exception as e:
        print(f"  [FETCH ERROR] {url}: {e}")
        return None


def clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip() if text else ""


# ─── Source 1: monngonmoingay.com (API for recipe list + HTML scraping for details) ────

def get_recipe_links_from_api(limit: int = 100) -> list:
    """Lấy danh sách recipe từ API monan"""
    links = []
    page = 1
    per_page = min(100, limit)  # API max 100 per page

    while len(links) < limit:
        url = f"{MONAN_ENDPOINT}?per_page={per_page}&page={page}&_embed"
        try:
            data = fetch(url, json_response=True)
            if not data:
                break

            for item in data:
                if len(links) >= limit:
                    break
                links.append((item['link'], item['id']))  # Store URL and ID

            page += 1
            time.sleep(1)  # Rate limiting

        except Exception as e:
            print(f"[API ERROR] Page {page}: {e}")
            break

    return links[:limit]


def parse_recipe_from_webpage(url: str) -> dict | None:
    """Parse recipe from the actual webpage (HTML scraping)"""
    try:
        # Fetch the HTML page
        soup = fetch(url)
        if not soup:
            return None

        # Extract title
        title_el = soup.select_one("h1, [class*='title']")
        if not title_el:
            return None
        title = clean_text(title_el.get_text())

        # Extract image
        image_url = None
        img = soup.select_one("img[alt], .post-thumbnail img, article img")
        if img:
            image_url = img.get("src") or img.get("data-src")

        # Get all text content
        content_text = soup.get_text('\n')
        lines = content_text.split('\n')
        
        # Parse ingredients - look for "Nguyên Liệu:" section
        ingredients = []
        in_ingredients = False
        for i, line in enumerate(lines):
            line_clean = clean_text(line)
            if not line_clean:
                continue
            
            # Start of ingredients
            if 'nguyên liệu' in line_clean.lower() and ':' in line_clean:
                in_ingredients = True
                continue
            
            # End of ingredients section
            if in_ingredients and any(kw in line_clean.lower() for kw in ['sơ chế', 'thực hiện', 'cách dùng', 'mách nhỏ']):
                in_ingredients = False
                break
            
            # Parse ingredient lines - must have quantity/unit
            if in_ingredients:
                # Skip header lines
                if any(kw in line_clean.lower() for kw in ['muỗng', 'gram', 'gia vị', 'm:']):
                    continue
                
                # Look for ingredient pattern (ingredient name + amount + unit)
                if any(unit in line_clean for unit in ['g', 'ml', 'M', 'm', 'cái', 'quả', 'chiếc', 'củ', 'lít', 'thìa', 'tách', 'bộ', 'bụi']):
                    if len(line_clean) > 5 and len(line_clean) < 200 and not line_clean.isupper():
                        ingredients.append({
                            "ten_nguyen_lieu": line_clean,
                            "so_luong": 1,
                            "don_vi": "phần"
                        })
                        if len(ingredients) >= 30:
                            break

        # Parse steps - look for "Thực hiện:" or "Cách làm:" section
        steps = []
        in_steps = False
        step_num = 0
        
        for line in lines:
            line_clean = clean_text(line)
            if not line_clean:
                continue
            
            # Start of steps
            if any(kw in line_clean.lower() for kw in ['thực hiện:', 'cách làm:', 'hướng dẫn:', 'các bước:']):
                in_steps = True
                continue
            
            # End of steps
            if in_steps and any(kw in line_clean.lower() for kw in ['cách dùng', 'mách nhỏ', 'lưu ý']):
                in_steps = False
                break
            
            # Collect step content
            if in_steps and len(line_clean) > 10 and len(line_clean) < 300:
                # Skip numbering/headers
                if not any(kw in line_clean.lower() for kw in ['bước', 'step']):
                    step_num += 1
                    steps.append({
                        "buoc": step_num,
                        "mo_ta": line_clean
                    })
                    if step_num >= 15:
                        break

        if not ingredients or not steps:
            return None

        return {
            "name": title,
            "ingredients": ingredients[:20],
            "steps": steps,
            "cook_time": None,
            "difficulty": "Dễ",
            "image_url": image_url,
            "source_url": url,
            "source_name": "MonNgonMoiNgay",
        }

    except Exception as e:
        print(f"[PARSE ERROR] {url}: {e}")
        return None


# ─── Source 2: bepgiadinh.com ────────────────────────────────────────────────

BEPGIADINH_CATEGORIES = [
    "https://bepgiadinh.com/mon-xao/",
    "https://bepgiadinh.com/mon-kho/",
    "https://bepgiadinh.com/mon-canh/",
    "https://bepgiadinh.com/mon-chien/",
    "https://bepgiadinh.com/mon-nuong/",
    "https://bepgiadinh.com/mon-hap/",
]


def get_recipe_links_bepgiadinh(category_url: str, max_pages: int = 3) -> list:
    links = []
    for page in range(1, max_pages + 1):
        url = category_url if page == 1 else f"{category_url}page/{page}/"
        soup = fetch(url)
        if not soup:
            break
        articles = soup.select("h2.entry-title a, .post-title a, article h2 a")
        page_links = [a["href"] for a in articles if a.get("href") and "bepgiadinh.com" in a.get("href", "")]
        if not page_links:
            break
        links.extend(page_links)
        time.sleep(1)
    return list(set(links))


def parse_recipe_bepgiadinh(url: str) -> dict | None:
    soup = fetch(url)
    if not soup:
        return None

    try:
        title_el = soup.select_one("h1.entry-title, h1.post-title, h1")
        if not title_el:
            return None
        name = clean_text(title_el.text)

        image_url = None
        img = soup.select_one(".entry-content img, .post-thumbnail img, article img")
        if img:
            image_url = img.get("src") or img.get("data-src")

        ingredients = []
        content = soup.select_one(".entry-content, .post-content")
        if content:
            headings = content.find_all(["h2", "h3", "h4", "strong"])
            for h in headings:
                if "nguyên liệu" in h.text.lower():
                    ul = h.find_next("ul")
                    if ul:
                        for li in ul.find_all("li"):
                            text = clean_text(li.text)
                            if text:
                                ingredients.append({
                                    "ten_nguyen_lieu": text,
                                    "so_luong": 1,
                                    "don_vi": "phần"
                            })
                    break

        if not ingredients:
            return None

        steps = []
        if content:
            headings = content.find_all(["h2", "h3", "h4", "strong"])
            for h in headings:
                if any(kw in h.text.lower() for kw in ["cách làm", "thực hiện", "hướng dẫn", "các bước"]):
                    ol = h.find_next("ol")
                    if ol:
                        for i, li in enumerate(ol.find_all("li"), 1):
                            steps.append({"buoc": i, "mo_ta": clean_text(li.text)})
                    else:
                        for i, p in enumerate(h.find_next_siblings("p")[:8], 1):
                            text = clean_text(p.text)
                            if text and len(text) > 20:
                                steps.append({"buoc": i, "mo_ta": text})
                    break

        if not steps and content:
            paras = [clean_text(p.text) for p in content.find_all("p") if len(clean_text(p.text)) > 30]
            steps = [{"buoc": i+1, "mo_ta": p} for i, p in enumerate(paras[:8])]

        if not steps:
            return None

        return {
            "name": name,
            "ingredients": ingredients,
            "steps": steps,
            "cook_time": None,
            "difficulty": "Dễ",
            "image_url": image_url,
            "source_url": url,
            "source_name": "BepGiaDinh",
        }
    except Exception as e:
        print(f"  [PARSE ERROR] {url}: {e}")
        return None


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    # Tắt warning SSL
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    parser = argparse.ArgumentParser(description="Crawl recipes from Vietnamese cooking websites")
    parser.add_argument("--source", choices=["monngon", "bepgiadinh", "all"], default="all")
    parser.add_argument("--limit", type=int, default=100)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    conn = None
    if not args.dry_run:
        try:
            conn = get_connection()
            print(f"[DB] Đã kết nối: {DB_HOST}:{DB_PORT}/{DB_NAME}")
        except Exception as e:
            print(f"[ERROR] Không thể kết nối DB: {e}")
            sys.exit(1)

    all_links = []

    print("\n[1/2] Thu thập danh sách URL công thức...")
    
    if args.source in ("monngon", "all"):
        print(f"  MonNgonMoiNgay (API)")
        links = get_recipe_links_from_api(args.limit)
        all_links.extend([(url, "MonNgonMoiNgay") for url, _ in links])
        print(f"    → {len(links)} links")

    if args.source in ("bepgiadinh", "all"):
        for cat_url in BEPGIADINH_CATEGORIES:
            if len(all_links) >= args.limit * 2:
                break
            print(f"  {cat_url}")
            links = get_recipe_links_bepgiadinh(cat_url, max_pages=2)
            all_links.extend([(url, "BepGiaDinh") for url in links])
            print(f"    → {len(links)} links")
            time.sleep(1)

    # Remove duplicates while preserving order
    seen = set()
    unique_links = []
    for url, source in all_links:
        if url not in seen:
            seen.add(url)
            unique_links.append((url, source))
    
    all_links = unique_links[:args.limit]
    print(f"\n[INFO] Tổng {len(all_links)} URL cần crawl")

    total_inserted = 0
    total_skipped  = 0
    total_failed   = 0

    parse_fns = {
        "MonNgonMoiNgay": parse_recipe_from_webpage,
        "BepGiaDinh": parse_recipe_bepgiadinh,
    }

    print("\n[2/2] Crawl chi tiết công thức...")
    for i, (url, source_name) in enumerate(all_links):
        print(f"  [{i+1}/{len(all_links)}] {url[:70]}...")
        recipe = parse_fns[source_name](url)

        if not recipe:
            print(f"    ✗ Không parse được")
            total_failed += 1
        elif args.dry_run:
            print(f"    ✓ {recipe['name']} | {len(recipe['ingredients'])} nguyên liệu | {len(recipe['steps'])} bước")
            total_inserted += 1
        else:
            ok = insert_recipe(conn, recipe)
            if ok:
                print(f"    ✓ {recipe['name']}")
                total_inserted += 1
            else:
                print(f"    ~ Trùng: {recipe['name']}")
                total_skipped += 1

        time.sleep(1.5)

    print(f"\n{'='*50}")
    print(f"[DONE] Inserted: {total_inserted} | Skipped: {total_skipped} | Failed: {total_failed}")
    if conn:
        conn.close()


if __name__ == "__main__":
    main()
