#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC_APP_DIR="$ROOT_DIR/app"
DEST_PAGES_DIR="$ROOT_DIR/FE/src/pages"

if [ ! -d "$SRC_APP_DIR" ]; then
  echo "No app/ directory found at $SRC_APP_DIR"
  exit 1
fi

echo "Creating $DEST_PAGES_DIR"
mkdir -p "$DEST_PAGES_DIR"

echo "Copying app/ -> FE/src/pages (preserving structure)"
rsync -a --exclude=node_modules "$SRC_APP_DIR/" "$DEST_PAGES_DIR/"

echo "Applying basic transforms to remove Next.js specifics"
# Remove 'use client' directives
find "$DEST_PAGES_DIR" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -print0 | while IFS= read -r -d '' file; do
  # remove `use client` line
  sed -i '' "/^\s*'use client'\s*;\?\|^\s*\"use client\"\s*;\?/d" "$file" 2>/dev/null || true

  # replace next/link imports with react-router-dom Link
  sed -i '' "s/from 'next\/link'/from 'react-router-dom'/g" "$file" 2>/dev/null || true
  sed -i '' "s/from \"next\/link\"/from \"react-router-dom\"/g" "$file" 2>/dev/null || true

  # convert Link href= to to=
  sed -i '' "s/Link\s\+href=/Link to=/g" "$file" 2>/dev/null || true
  sed -i '' "s/Link\s*href=/Link to=/g" "$file" 2>/dev/null || true

  # remove next/image imports
  sed -i '' "s/import\s\+Image\s\+from\s\+['\"]next\/image['\"]\s*;//g" "$file" 2>/dev/null || true
  sed -i '' "s/import\s*{[^}]*}.*next\/image.*;//g" "$file" 2>/dev/null || true

  # replace <Image ... /> with <img ... /> (simple heuristic)
  sed -i '' "s/<Image\b/<img/g" "$file" 2>/dev/null || true
  sed -i '' "s/\/>/ \/>/g" "$file" 2>/dev/null || true

  # remove export const metadata = ... (single-line or block starting with export const metadata)
  sed -i '' "/^export const metadata =/,/^[[:space:]]*$/d" "$file" 2>/dev/null || true

done

echo "Pages copied to $DEST_PAGES_DIR with basic Next->React transforms."
echo "Manual steps you should perform after running this script:"
echo " - Inspect each page for TypeScript-specific exports and server-only code."
echo " - Replace Next.js layouts and metadata handling with React components and react-helmet if needed."
echo " - Update imports that reference Next.js helpers or app-specific conventions."
