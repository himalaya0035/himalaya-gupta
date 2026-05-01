/**
 * sysprefs.js
 * macOS-style System Preferences:
 * - Icon grid home screen
 * - Theme / Accent Color panel
 * - Wallpaper panel
 * - About panel (system info)
 */
(() => {
  const root = document.getElementById('sysprefs-root');
  if (!root) return;

  const C = window.CONTENT || {};

  function escHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ── Pane definitions ──────────────────────────────────────────────────
  const panes = [
    { id: 'appearance', icon: '🎨', label: 'Appearance' },
    { id: 'wallpaper', icon: '🖼️', label: 'Wallpaper' },
    { id: 'about', icon: 'ℹ️', label: 'About' },
  ];

  const wallpapers = [
    { id: 'monterey', name: 'Monterey', path: 'assets/background.webp' },
    { id: 'ventura', name: 'Ventura', path: 'assets/background2.jpg' },
    { id: 'sonoma', name: 'Sonoma', path: 'assets/background3.jpg' },
    { id: 'bigsur', name: 'Big Sur', path: 'assets/background4.jpg' },
    { id: 'catalina', name: 'Catalina', path: 'assets/background5.jpg' },
    { id: 'mojave', name: 'Mojave', path: 'assets/background6.jpg' },
    { id: 'highsierra', name: 'High Sierra', path: 'assets/background7.jpg' },
    { id: 'sierra', name: 'Sierra', path: 'assets/background8.jpeg' },
  ];

  // ── Render home grid ──────────────────────────────────────────────────
  function renderHome() {
    root.innerHTML = `
      <div class="sp-home">
        <div class="sp-search-bar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search Settings" class="sp-search-input" id="sp-search" spellcheck="false" autocomplete="off">
        </div>
        <div class="sp-grid">
          ${panes.map(p => `
            <div class="sp-pane-card" data-pane="${p.id}">
              <div class="sp-pane-icon">${p.icon}</div>
              <div class="sp-pane-label">${p.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    root.querySelectorAll('.sp-pane-card').forEach(card => {
      card.addEventListener('click', () => {
        const paneId = card.dataset.pane;
        if (paneId === 'appearance') renderAppearance();
        else if (paneId === 'wallpaper') renderWallpaper();
        else if (paneId === 'about') renderAbout();
      });
    });

    const search = document.getElementById('sp-search');
    if (search) {
      search.addEventListener('input', () => {
        const val = search.value.toLowerCase();
        root.querySelectorAll('.sp-pane-card').forEach(card => {
          const label = card.querySelector('.sp-pane-label').textContent.toLowerCase();
          card.style.display = label.includes(val) ? '' : 'none';
        });
      });
    }
  }

  // ── Back button helper ────────────────────────────────────────────────
  function backBtn() {
    return `<button class="sp-back-btn" id="sp-back">← All Settings</button>`;
  }

  function bindBack() {
    const btn = document.getElementById('sp-back');
    if (btn) btn.addEventListener('click', renderHome);
  }

  // ── Appearance pane ───────────────────────────────────────────────────
  function renderAppearance() {
    const themes = window.THEMES || {};
    const cur = window.currentTheme ? window.currentTheme() : 'green';

    const dots = Object.entries(themes).map(([name, t]) => `
      <div class="sp-theme-option ${name === cur ? 'active' : ''}" data-theme="${name}">
        <div class="sp-theme-dot" style="background: ${t.acc}"></div>
        <span class="sp-theme-name">${name.charAt(0).toUpperCase() + name.slice(1)}</span>
      </div>
    `).join('');

    root.innerHTML = `
      <div class="sp-pane">
        ${backBtn()}
        <h2 class="sp-pane-title">🎨 Appearance</h2>
        <div class="sp-section">
          <div class="sp-section-label">Accent Color</div>
          <div class="sp-theme-grid">${dots}</div>
        </div>
        <div class="sp-section">
          <div class="sp-section-label">Preview</div>
          <div class="sp-preview-box" id="sp-preview">
            <div class="sp-preview-bar"></div>
            <div class="sp-preview-content">
              <div class="sp-preview-text">The quick brown fox jumps over the lazy dog.</div>
              <div class="sp-preview-accent">Accent color sample text</div>
            </div>
          </div>
        </div>
      </div>
    `;

    bindBack();
    updatePreview(cur);

    root.querySelectorAll('.sp-theme-option').forEach(el => {
      el.addEventListener('click', () => {
        const name = el.dataset.theme;
        if (window.applyTheme && window.applyTheme(name)) {
          root.querySelectorAll('.sp-theme-option').forEach(o => o.classList.remove('active'));
          el.classList.add('active');
          updatePreview(name);
        }
      });
    });
  }

  function updatePreview(themeName) {
    const themes = window.THEMES || {};
    const t = themes[themeName];
    const box = document.getElementById('sp-preview');
    if (!box || !t) return;
    box.style.background = t.bg2;
    box.style.borderColor = t.border;
    box.querySelector('.sp-preview-bar').style.background = t.bg;
    box.querySelector('.sp-preview-text').style.color = t.fg;
    box.querySelector('.sp-preview-accent').style.color = t.acc;
  }

  // ── Wallpaper pane ────────────────────────────────────────────────────
  function renderWallpaper() {
    const currentPath = localStorage.getItem('desktopWallpaper') || 'assets/background2.jpg';

    const grid = wallpapers.map(wp => `
      <div class="sp-wp-item ${wp.path === currentPath ? 'active' : ''}" data-path="${wp.path}">
        <div class="sp-wp-thumb" style="background-image: url('${wp.path}')"></div>
        <div class="sp-wp-name">${wp.name}</div>
      </div>
    `).join('');

    root.innerHTML = `
      <div class="sp-pane">
        ${backBtn()}
        <h2 class="sp-pane-title">🖼️ Wallpaper</h2>
        <div class="sp-wp-grid">${grid}</div>
      </div>
    `;

    bindBack();

    root.querySelectorAll('.sp-wp-item').forEach(el => {
      el.addEventListener('click', () => {
        const path = el.dataset.path;
        // Apply wallpaper
        const desktop = document.getElementById('desktop-wallpaper');
        if (desktop) {
          desktop.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${path}')`;
        }
        localStorage.setItem('desktopWallpaper', path);

        // Update lock screen wallpaper too
        const lockWp = document.querySelector('.lock-wallpaper');
        if (lockWp) {
          lockWp.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('${path}')`;
        }

        root.querySelectorAll('.sp-wp-item').forEach(i => i.classList.remove('active'));
        el.classList.add('active');
      });
    });
  }

  // ── About pane ────────────────────────────────────────────────────────
  function renderAbout() {
    root.innerHTML = `
      <div class="sp-pane">
        ${backBtn()}
        <h2 class="sp-pane-title">ℹ️ About This Mac</h2>
        <div class="sp-about-card">
          <div class="sp-about-logo">🖥️</div>
          <div class="sp-about-name">${escHtml(C.name || 'Desktop OS')}</div>
          <div class="sp-about-version">Portfolio OS v1.0</div>
          <div class="sp-about-divider"></div>
          <div class="sp-about-row"><span class="sp-about-label">Developer</span><span class="sp-about-value">${escHtml(C.name || 'Unknown')}</span></div>
          <div class="sp-about-row"><span class="sp-about-label">Role</span><span class="sp-about-value">${escHtml(C.title || '')}</span></div>
          <div class="sp-about-row"><span class="sp-about-label">Location</span><span class="sp-about-value">${escHtml(C.location || '')}</span></div>
          <div class="sp-about-row"><span class="sp-about-label">Shell</span><span class="sp-about-value">${escHtml(C.neofetch?.shell || 'bash')}</span></div>
          <div class="sp-about-row"><span class="sp-about-label">Editor</span><span class="sp-about-value">${escHtml(C.neofetch?.editor || 'VS Code')}</span></div>
          <div class="sp-about-row"><span class="sp-about-label">Uptime</span><span class="sp-about-value">${escHtml(C.neofetch?.uptime || '')}</span></div>
          <div class="sp-about-row"><span class="sp-about-label">CPU</span><span class="sp-about-value">${escHtml(C.neofetch?.cpu || '')}</span></div>
          <div class="sp-about-row"><span class="sp-about-label">Framework</span><span class="sp-about-value">Vanilla JS — No frameworks</span></div>
        </div>
      </div>
    `;

    bindBack();
  }

  // ── Init: render home on first open ───────────────────────────────────
  const win = document.getElementById('sysprefs-window');
  if (win) {
    const observer = new MutationObserver(() => {
      if (!win.classList.contains('hidden')) {
        renderHome();
        observer.disconnect();
      }
    });
    observer.observe(win, { attributes: true, attributeFilter: ['class'] });
  }
})();
