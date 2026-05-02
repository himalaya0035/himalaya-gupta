/**
 * sysprefs.js
 * macOS Ventura-style System Settings:
 * - Persistent sidebar navigation
 * - Appearance, Wallpaper, About panes
 * - Clean grouped rows like real macOS settings
 */
(() => {
  const root = document.getElementById('sysprefs-root');
  if (!root) return;

  const C = window.CONTENT || {};

  function escHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  const panes = [
    { id: 'appearance', icon: '🎨', label: 'Appearance' },
    { id: 'wallpaper', icon: '🖼️', label: 'Wallpaper' },
    { id: 'about', icon: 'ℹ️', label: 'About This Mac' },
  ];

  const wallpapers = [
    { name: 'Monterey', path: 'assets/background.webp' },
    { name: 'Ventura', path: 'assets/background2.jpg' },
    { name: 'Sonoma', path: 'assets/background3.jpg' },
    { name: 'Big Sur', path: 'assets/background4.jpg' },
    { name: 'Catalina', path: 'assets/background5.jpg' },
    { name: 'Mojave', path: 'assets/background6.jpg' },
    { name: 'High Sierra', path: 'assets/background7.jpg' },
    { name: 'Sierra', path: 'assets/background8.jpeg' },
  ];

  let activePane = 'appearance';

  // ── Shell ─────────────────────────────────────────────────────────────
  function renderShell() {
    const sidebarItems = panes.map(p => `
      <div class="ss-sidebar-item ${p.id === activePane ? 'active' : ''}" data-pane="${p.id}">
        <span class="ss-sidebar-icon">${p.icon}</span>
        <span class="ss-sidebar-label">${p.label}</span>
      </div>
    `).join('');

    root.innerHTML = `
      <div class="ss-layout">
        <div class="ss-sidebar">
          <div class="ss-sidebar-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search" class="ss-search-input" id="ss-search" spellcheck="false" autocomplete="off">
          </div>
          <div class="ss-sidebar-list">${sidebarItems}</div>
        </div>
        <div class="ss-main" id="ss-main"></div>
      </div>
    `;

    // Wire sidebar
    root.querySelectorAll('.ss-sidebar-item').forEach(item => {
      item.addEventListener('click', () => {
        activePane = item.dataset.pane;
        root.querySelectorAll('.ss-sidebar-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        renderPane();
      });
    });

    // Search filter
    const search = document.getElementById('ss-search');
    if (search) {
      search.addEventListener('input', () => {
        const val = search.value.toLowerCase();
        root.querySelectorAll('.ss-sidebar-item').forEach(item => {
          const label = item.querySelector('.ss-sidebar-label').textContent.toLowerCase();
          item.style.display = label.includes(val) ? '' : 'none';
        });
      });
    }

    renderPane();
  }

  function renderPane() {
    const main = document.getElementById('ss-main');
    if (!main) return;
    if (activePane === 'appearance') renderAppearance(main);
    else if (activePane === 'wallpaper') renderWallpaper(main);
    else if (activePane === 'about') renderAbout(main);
  }

  // ── Appearance ────────────────────────────────────────────────────────
  function renderAppearance(main) {
    const themes = window.THEMES || {};
    const cur = window.currentTheme ? window.currentTheme() : 'green';

    const dots = Object.entries(themes).map(([name, t]) => `
      <div class="ss-color-option ${name === cur ? 'active' : ''}" data-theme="${name}" title="${name}">
        <div class="ss-color-dot" style="background: ${t.acc}"></div>
      </div>
    `).join('');

    main.innerHTML = `
      <div class="ss-pane">
        <h1 class="ss-pane-heading">Appearance</h1>

        <div class="ss-group">
          <div class="ss-group-label">Accent Color</div>
          <div class="ss-card">
            <div class="ss-row">
              <span class="ss-row-label">Color</span>
              <div class="ss-color-picker">${dots}</div>
            </div>
            <div class="ss-row-divider"></div>
            <div class="ss-row">
              <span class="ss-row-label">Active Theme</span>
              <span class="ss-row-value" id="ss-active-theme">${cur.charAt(0).toUpperCase() + cur.slice(1)}</span>
            </div>
          </div>
        </div>

        <div class="ss-group">
          <div class="ss-group-label">Preview</div>
          <div class="ss-card ss-preview-card" id="ss-preview">
            <div class="ss-preview-titlebar"></div>
            <div class="ss-preview-body">
              <div class="ss-preview-line1">The quick brown fox jumps over the lazy dog.</div>
              <div class="ss-preview-line2">Accent color sample</div>
              <div class="ss-preview-btn-row">
                <div class="ss-preview-btn"></div>
                <div class="ss-preview-btn ss-preview-btn-acc"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    updatePreview(cur);

    main.querySelectorAll('.ss-color-option').forEach(el => {
      el.addEventListener('click', () => {
        const name = el.dataset.theme;
        if (window.applyTheme && window.applyTheme(name)) {
          main.querySelectorAll('.ss-color-option').forEach(o => o.classList.remove('active'));
          el.classList.add('active');
          document.getElementById('ss-active-theme').textContent = name.charAt(0).toUpperCase() + name.slice(1);
          updatePreview(name);
        }
      });
    });
  }

  function updatePreview(themeName) {
    const themes = window.THEMES || {};
    const t = themes[themeName];
    const box = document.getElementById('ss-preview');
    if (!box || !t) return;
    box.style.background = t.bg2;
    box.style.borderColor = t.border;
    box.querySelector('.ss-preview-titlebar').style.background = t.bg;
    box.querySelector('.ss-preview-line1').style.color = t.fg;
    box.querySelector('.ss-preview-line2').style.color = t.acc;
    box.querySelector('.ss-preview-btn-acc').style.background = t.acc;
  }

  // ── Wallpaper ─────────────────────────────────────────────────────────
  function renderWallpaper(main) {
    const currentPath = localStorage.getItem('desktopWallpaper') || 'assets/background2.jpg';
    const currentName = wallpapers.find(w => w.path === currentPath)?.name || 'Custom';

    const grid = wallpapers.map(wp => `
      <div class="ss-wp-item ${wp.path === currentPath ? 'active' : ''}" data-path="${wp.path}">
        <div class="ss-wp-thumb" style="background-image: url('${wp.path}')"></div>
        <div class="ss-wp-name">${wp.name}</div>
      </div>
    `).join('');

    main.innerHTML = `
      <div class="ss-pane">
        <h1 class="ss-pane-heading">Wallpaper</h1>

        <div class="ss-group">
          <div class="ss-group-label">Current Wallpaper</div>
          <div class="ss-card">
            <div class="ss-row">
              <span class="ss-row-label">Active</span>
              <span class="ss-row-value" id="ss-wp-active">${currentName}</span>
            </div>
          </div>
        </div>

        <div class="ss-group">
          <div class="ss-group-label">macOS Wallpapers</div>
          <div class="ss-wp-grid">${grid}</div>
        </div>
      </div>
    `;

    main.querySelectorAll('.ss-wp-item').forEach(el => {
      el.addEventListener('click', () => {
        const path = el.dataset.path;
        const desktop = document.getElementById('desktop-wallpaper');
        if (desktop) desktop.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${path}')`;
        localStorage.setItem('desktopWallpaper', path);
        const lockWp = document.querySelector('.lock-wallpaper');
        if (lockWp) lockWp.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('${path}')`;
        main.querySelectorAll('.ss-wp-item').forEach(i => i.classList.remove('active'));
        el.classList.add('active');
        const name = wallpapers.find(w => w.path === path)?.name || 'Custom';
        document.getElementById('ss-wp-active').textContent = name;
      });
    });
  }

  // ── About ─────────────────────────────────────────────────────────────
  function renderAbout(main) {
    main.innerHTML = `
      <div class="ss-pane">
        <h1 class="ss-pane-heading">About This Mac</h1>

        <div class="ss-about-hero">
          <div class="ss-about-icon">🖥️</div>
          <div class="ss-about-hero-name">${escHtml(C.name || 'Desktop OS')}</div>
          <div class="ss-about-hero-sub">Portfolio OS v1.0 · Vanilla JavaScript</div>
        </div>

        <div class="ss-group">
          <div class="ss-group-label">System Information</div>
          <div class="ss-card">
            <div class="ss-row"><span class="ss-row-label">Developer</span><span class="ss-row-value">${escHtml(C.name || '')}</span></div>
            <div class="ss-row-divider"></div>
            <div class="ss-row"><span class="ss-row-label">Role</span><span class="ss-row-value">${escHtml(C.title || '')}</span></div>
            <div class="ss-row-divider"></div>
            <div class="ss-row"><span class="ss-row-label">Location</span><span class="ss-row-value">${escHtml(C.location || '')}</span></div>
          </div>
        </div>

        <div class="ss-group">
          <div class="ss-group-label">Environment</div>
          <div class="ss-card">
            <div class="ss-row"><span class="ss-row-label">Shell</span><span class="ss-row-value">${escHtml(C.neofetch?.shell || 'bash')}</span></div>
            <div class="ss-row-divider"></div>
            <div class="ss-row"><span class="ss-row-label">Editor</span><span class="ss-row-value">${escHtml(C.neofetch?.editor || 'VS Code')}</span></div>
            <div class="ss-row-divider"></div>
            <div class="ss-row"><span class="ss-row-label">Uptime</span><span class="ss-row-value">${escHtml(C.neofetch?.uptime || '')}</span></div>
            <div class="ss-row-divider"></div>
            <div class="ss-row"><span class="ss-row-label">CPU</span><span class="ss-row-value">${escHtml(C.neofetch?.cpu || '')}</span></div>
            <div class="ss-row-divider"></div>
            <div class="ss-row"><span class="ss-row-label">Framework</span><span class="ss-row-value">Vanilla JS</span></div>
          </div>
        </div>
      </div>
    `;
  }

  // ── Init ──────────────────────────────────────────────────────────────
  const win = document.getElementById('sysprefs-window');
  if (win) {
    const observer = new MutationObserver(() => {
      if (!win.classList.contains('hidden')) {
        renderShell();
        observer.disconnect();
      }
    });
    observer.observe(win, { attributes: true, attributeFilter: ['class'] });
  }
})();
