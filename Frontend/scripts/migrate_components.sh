#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

DEST="$ROOT_DIR/FE/src/components"
echo "Creating $DEST"
mkdir -p "$DEST"

if [ -d "$ROOT_DIR/components" ]; then
  echo "Copying components/... -> $DEST"
  cp -R "$ROOT_DIR/components/"* "$DEST/" || true
else
  echo "No components/ folder found in project root."
  exit 1
fi

if [ -d "$ROOT_DIR/components/ui" ]; then
  echo "Copying components/ui -> $DEST/ui"
  mkdir -p "$DEST/ui"
  cp -R "$ROOT_DIR/components/ui/"* "$DEST/ui/" || true
fi

echo "Also copying top-level component files (tsx/jsx/js) into $DEST"
shopt -s nullglob
for f in "$ROOT_DIR/components"/*.{tsx,ts,jsx,js}; do
  if [ -f "$f" ]; then
    cp "$f" "$DEST/"
  fi
done
shopt -u nullglob

echo "Migration copy complete."
echo "Next steps:"
echo " - Run: cd FE && pnpm install && pnpm dev"
echo " - Review imports in FE/src/components: replace 'next/link' with 'react-router-dom', replace 'next/image' with <img> or an Image wrapper."
echo " - Rename files to .jsx/.tsx as needed and adjust TypeScript configs if used."
