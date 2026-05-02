/**
 * build-html.js
 * Rewrites index.html to replace individual CSS/JS references
 * with single bundled files (style.css, app.js).
 */
const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// ── Replace 3 CSS links with single bundled stylesheet ──────
html = html.replace(
  /\s*<link rel="stylesheet" href="css\/style\.css"[^>]*>\s*<link rel="stylesheet" href="css\/gui\.css"[^>]*>\s*<link rel="stylesheet" href="css\/desktop\.css"[^>]*>/,
  '\n  <link rel="stylesheet" href="style.css" />'
);

// ── Remove all individual <script src="js/..."> tags ────────
html = html.replace(/\s*<script src="js\/[^"]+\.js"[^>]*><\/script>/g, '');

// ── Remove the analytics script tag too ─────────────────────
html = html.replace(/\s*<script src="js\/analytics\.js"><\/script>/g, '');

// ── Insert single bundled script before </body> ─────────────
html = html.replace(
  '</body>',
  '  <script src="app.js"></script>\n</body>'
);

// ── Fix asset paths in CSS references (no more css/ subfolder) ──
// The bundled CSS is at root level, so ../assets/ becomes assets/
// This is handled by clean-css automatically since we output to dist/

fs.writeFileSync('dist/_index.html', html);
console.log('HTML rewritten with bundled references.');
