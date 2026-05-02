#!/bin/bash
# Build script: minifies JS, CSS, and HTML into a dist/ folder
# Usage: bash build.sh

set -e

DIST="dist"

echo "Cleaning dist..."
rm -rf "$DIST"
mkdir -p "$DIST/js" "$DIST/css" "$DIST/assets"

# ── Minify JS ────────────────────────────────────────────────
echo "Minifying JS..."
for f in js/*.js; do
  npx terser "$f" --compress --mangle --output "$DIST/$f"
done

# ── Minify CSS ───────────────────────────────────────────────
echo "Minifying CSS..."
for f in css/*.css; do
  npx cleancss -o "$DIST/$f" "$f"
done

# ── Copy assets (already optimized) ─────────────────────────
echo "Copying assets..."
cp -r assets/* "$DIST/assets/"

# ── Copy static files ───────────────────────────────────────
cp robots.txt "$DIST/" 2>/dev/null || true
cp sitemap.xml "$DIST/" 2>/dev/null || true
cp CNAME "$DIST/" 2>/dev/null || true
cp 404.html "$DIST/" 2>/dev/null || true

# ── Minify HTML ──────────────────────────────────────────────
echo "Minifying HTML..."
npx html-minifier-terser \
  --collapse-whitespace \
  --remove-comments \
  --remove-redundant-attributes \
  --remove-script-type-attributes \
  --remove-style-link-type-attributes \
  --minify-css true \
  --minify-js true \
  --output "$DIST/index.html" \
  index.html

echo ""
echo "Build complete! Output in $DIST/"

# Show size comparison
echo ""
echo "── Size comparison ──"
ORIG_JS=$(cat js/*.js | wc -c)
MINI_JS=$(cat "$DIST"/js/*.js | wc -c)
ORIG_CSS=$(cat css/*.css | wc -c)
MINI_CSS=$(cat "$DIST"/css/*.css | wc -c)
ORIG_HTML=$(wc -c < index.html)
MINI_HTML=$(wc -c < "$DIST/index.html")

echo "JS:   $(echo "scale=1; $ORIG_JS/1024" | bc)KB → $(echo "scale=1; $MINI_JS/1024" | bc)KB ($(echo "scale=0; 100-($MINI_JS*100/$ORIG_JS)" | bc)% smaller)"
echo "CSS:  $(echo "scale=1; $ORIG_CSS/1024" | bc)KB → $(echo "scale=1; $MINI_CSS/1024" | bc)KB ($(echo "scale=0; 100-($MINI_CSS*100/$ORIG_CSS)" | bc)% smaller)"
echo "HTML: $(echo "scale=1; $ORIG_HTML/1024" | bc)KB → $(echo "scale=1; $MINI_HTML/1024" | bc)KB ($(echo "scale=0; 100-($MINI_HTML*100/$ORIG_HTML)" | bc)% smaller)"
