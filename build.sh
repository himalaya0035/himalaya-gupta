#!/bin/bash
# Build script: bundles + minifies JS/CSS into single files, rewrites HTML
# Usage: bash build.sh

set -e

DIST="dist"

echo "Cleaning dist..."
rm -rf "$DIST"
mkdir -p "$DIST/assets"

# ── Bundle CSS (order matters) ───────────────────────────────
echo "Bundling CSS..."
cat css/style.css css/gui.css css/desktop.css > "$DIST/_bundle.css"
# Fix asset paths: ../assets/ → assets/ (CSS is now at root, not in css/)
sed -i 's|\.\./assets/|assets/|g' "$DIST/_bundle.css"
npx cleancss -o "$DIST/style.css" "$DIST/_bundle.css"
rm "$DIST/_bundle.css"

# ── Bundle JS (order matters — matches index.html load order) ─
# Critical path scripts (sync, must run first in order)
echo "Bundling JS..."
cat \
  js/pdf-viewer.js \
  js/content.js \
  js/commands.js \
  js/terminal.js \
  js/lockscreen.js \
  js/boot.js \
  js/gui-app.js \
  js/desktop.js \
  js/safari.js \
  js/wallpaper.js \
  js/menubar.js \
  js/battery.js \
  js/clock-popover.js \
  js/context-menu.js \
  js/notification-center.js \
  js/calculator.js \
  js/imessage.js \
  js/toasts.js \
  js/mission-control.js \
  js/github-stats.js \
  js/finder.js \
  js/sysprefs.js \
  js/guestbook.js \
  js/analytics.js \
  > "$DIST/_bundle.js"

npx terser "$DIST/_bundle.js" \
  --compress passes=2,drop_console=true \
  --mangle toplevel=false \
  --output "$DIST/app.js"
rm "$DIST/_bundle.js"

# ── Copy assets ──────────────────────────────────────────────
echo "Copying assets..."
cp -r assets/* "$DIST/assets/"

# ── Copy static files ───────────────────────────────────────
cp robots.txt "$DIST/" 2>/dev/null || true
cp sitemap.xml "$DIST/" 2>/dev/null || true
cp CNAME "$DIST/" 2>/dev/null || true
cp 404.html "$DIST/" 2>/dev/null || true

# ── Rewrite HTML: replace individual CSS/JS refs with bundles ─
echo "Processing HTML..."
node build-html.js

# ── Minify the rewritten HTML ────────────────────────────────
npx html-minifier-terser \
  --collapse-whitespace \
  --remove-comments \
  --remove-redundant-attributes \
  --remove-script-type-attributes \
  --remove-style-link-type-attributes \
  --minify-css true \
  --minify-js true \
  --output "$DIST/index.html" \
  "$DIST/_index.html"
rm "$DIST/_index.html"

echo ""
echo "Build complete! Output in $DIST/"

# Show size comparison
echo ""
echo "── Size comparison ──"
ORIG_JS=$(cat js/*.js | wc -c)
MINI_JS=$(wc -c < "$DIST/app.js")
ORIG_CSS=$(cat css/*.css | wc -c)
MINI_CSS=$(wc -c < "$DIST/style.css")
ORIG_HTML=$(wc -c < index.html)
MINI_HTML=$(wc -c < "$DIST/index.html")

echo "JS:   $(echo "scale=1; $ORIG_JS/1024" | bc)KB → $(echo "scale=1; $MINI_JS/1024" | bc)KB ($(echo "scale=0; 100-($MINI_JS*100/$ORIG_JS)" | bc)% smaller)"
echo "CSS:  $(echo "scale=1; $ORIG_CSS/1024" | bc)KB → $(echo "scale=1; $MINI_CSS/1024" | bc)KB ($(echo "scale=0; 100-($MINI_CSS*100/$ORIG_CSS)" | bc)% smaller)"
echo "HTML: $(echo "scale=1; $ORIG_HTML/1024" | bc)KB → $(echo "scale=1; $MINI_HTML/1024" | bc)KB ($(echo "scale=0; 100-($MINI_HTML*100/$ORIG_HTML)" | bc)% smaller)"
echo ""
echo "Files served: index.html, style.css, app.js + assets/"
