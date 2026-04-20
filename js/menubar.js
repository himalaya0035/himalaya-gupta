/**
 * menubar.js
 * Manages the macOS-inspired top menu bar:
 * - Dynamic app menus
 * - Dropdown interactions
 * - Spotlight search functionality
 */

document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById('global-menu-dropdown');
  const spotlightOverlay = document.getElementById('spotlight-overlay');
  const spotlightInput = document.getElementById('spotlight-input');
  const spotlightResults = document.getElementById('spotlight-results');
  const appNameDisplay = document.querySelector('.active-app-name');
  
  // ── Helper: get active window ────────────────────────────────────────
  function getActiveWindow() {
    const name = appNameDisplay?.textContent;
    if (!name) return null;
    return document.querySelector('.os-window.active') || 
           document.querySelector(`.os-window[data-app-title="${name}"]`);
  }

  function closeActiveWindow() {
    const win = getActiveWindow();
    if (!win) return;
    win.classList.add('hidden');
    win.classList.remove('active');
    const dockItem = document.querySelector(`.dock button.icon[data-target="${win.id}"]`);
    if (dockItem) {
      dockItem.classList.remove('active');
      const point = dockItem.querySelector('.point');
      if (point) point.classList.add('hidden');
    }
  }

  function minimizeActiveWindow() {
    const win = getActiveWindow();
    if (!win) return;
    win.classList.add('minimized');
    win.classList.remove('active');
  }

  function maximizeActiveWindow() {
    const win = getActiveWindow();
    if (!win) return;
    win.classList.toggle('maximized');
  }

  function clearTerminal() {
    const output = document.getElementById('output');
    if (output) output.innerHTML = '';
  }

  // ── Menu Data Definitions ──────────────────────────────────────────────
  const appMenus = {
    'Terminal': {
      file: [
        { label: 'Close Window', shortcut: '⌘W', action: closeActiveWindow }
      ],
      window: [
        { label: 'Minimize', shortcut: '⌘M', action: minimizeActiveWindow },
        { label: 'Zoom', action: maximizeActiveWindow },
        { type: 'divider' },
        { label: 'Clear Terminal', shortcut: '⌘K', action: clearTerminal }
      ],
      help: [
        { label: 'Type "help" in Terminal', action: () => {
          const input = document.getElementById('cmd-input');
          if (input) { input.value = 'help'; input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })); }
        }}
      ]
    },
    'Safari': {
      file: [
        { label: 'Close Window', shortcut: '⌘W', action: closeActiveWindow }
      ],
      window: [
        { label: 'Minimize', shortcut: '⌘M', action: minimizeActiveWindow },
        { label: 'Zoom', action: maximizeActiveWindow }
      ],
      help: [
        { label: 'About Safari', action: () => {
          const win = document.getElementById('about-window');
          if (win) { win.classList.remove('hidden'); win.classList.remove('minimized'); document.dispatchEvent(new CustomEvent('open-app', { detail: { id: 'about-window' } })); }
        }}
      ]
    },
    'Preview': {
      file: [
        { label: 'Download PDF', action: () => {
          const link = document.createElement('a');
          link.href = 'assets/resume.pdf';
          link.download = 'Himalaya_Gupta_Resume.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }},
        { type: 'divider' },
        { label: 'Close Window', shortcut: '⌘W', action: closeActiveWindow }
      ],
      window: [
        { label: 'Minimize', shortcut: '⌘M', action: minimizeActiveWindow },
        { label: 'Zoom', action: maximizeActiveWindow }
      ],
      help: [
        { label: 'Preview Help', disabled: true }
      ]
    },
    'GitPilot': {
      file: [
        { label: 'Close Window', shortcut: '⌘W', action: closeActiveWindow }
      ],
      window: [
        { label: 'Minimize', shortcut: '⌘M', action: minimizeActiveWindow },
        { label: 'Zoom', action: maximizeActiveWindow }
      ],
      help: [
        { label: 'View on GitHub', action: () => window.open('https://github.com/himalaya0035/GitPilot', '_blank') }
      ]
    },
    'JSON Editor': {
      file: [
        { label: 'Close Window', shortcut: '⌘W', action: closeActiveWindow }
      ],
      window: [
        { label: 'Minimize', shortcut: '⌘M', action: minimizeActiveWindow },
        { label: 'Zoom', action: maximizeActiveWindow }
      ],
      help: [
        { label: 'View on GitHub', action: () => window.open('https://github.com/himalaya0035/react-json-editor-alt', '_blank') }
      ]
    },
    'Wallpapers': {
      file: [
        { label: 'Close Window', shortcut: '⌘W', action: closeActiveWindow }
      ],
      window: [
        { label: 'Minimize', shortcut: '⌘M', action: minimizeActiveWindow },
        { label: 'Zoom', action: maximizeActiveWindow }
      ],
      help: [
        { label: 'Wallpapers Help', disabled: true }
      ]
    },
    'Calculator': {
      file: [
        { label: 'Close Window', shortcut: '⌘W', action: closeActiveWindow }
      ],
      window: [
        { label: 'Minimize', shortcut: '⌘M', action: minimizeActiveWindow }
      ],
      help: [
        { label: 'Keyboard shortcuts: 0-9, +, -, *, /, Enter, Esc', disabled: true }
      ]
    },
    'Messages': {
      file: [
        { label: 'Clear Chat History', action: () => {
          localStorage.removeItem('imessage-history');
          window.location.reload();
        }},
        { type: 'divider' },
        { label: 'Close Window', shortcut: '⌘W', action: closeActiveWindow }
      ],
      window: [
        { label: 'Minimize', shortcut: '⌘M', action: minimizeActiveWindow },
        { label: 'Zoom', action: maximizeActiveWindow }
      ],
      help: [
        { label: 'Messages Help', disabled: true }
      ]
    }
  };

  function getHgMenu() {
    return [
      { label: 'About the Developer', action: () => {
        const win = document.getElementById('about-window');
        if (win) {
          win.classList.remove('hidden');
          win.classList.remove('minimized');
          const event = new CustomEvent('open-app', { detail: { id: 'about-window' } });
          document.dispatchEvent(event);
        }
      }},
      { type: 'divider' },
      { label: 'Wallpaper…', action: () => {
        const win = document.getElementById('wallpaper-window');
        if (win) {
           win.classList.remove('hidden');
           win.classList.remove('minimized');
           const event = new CustomEvent('open-app', { detail: { id: 'wallpaper-window' } });
           document.dispatchEvent(event);
        }
      }},
      { label: 'Mission Control', shortcut: '⌃↑', action: () => {
        if (window.MissionControl) window.MissionControl.toggle();
      }},
      { type: 'divider' },
      { label: document.fullscreenElement ? 'Exit Full Screen' : 'Enter Full Screen', shortcut: '⌃⌘F', action: () => {
        if (window.toggleFullScreen) window.toggleFullScreen();
      }},
      { label: 'Lock Screen', shortcut: '⌃⌥Q', action: () => {
        if (window.LockScreen) window.LockScreen.show();
      }},
      { label: 'Restart…', action: () => window.location.reload() }
    ];
  }

  // ── Menu Logic ──────────────────────────────────────────────────────────
  let activeMenuTrigger = null;

  function renderAppearancePopover() {
    const themes = window.THEMES || {};
    const cur = window.currentTheme ? window.currentTheme() : 'green';
    const check = `<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

    const themeDots = Object.keys(themes).map(name => {
      const isActive = name === cur;
      return `
        <div class="appearance-dot-wrapper ${isActive ? 'active' : ''}" data-theme="${name}">
          <div class="appearance-dot" style="background: ${themes[name].acc}">
            ${isActive ? check : ''}
          </div>
        </div>
      `;
    }).join('');

    // Get the currently selected wallpaper path from localStorage
    const savedWallpaper = localStorage.getItem('desktopWallpaper') || 'assets/background.webp';
    // Try to determine the wallpaper name from the path
    const wallpaperNames = {
      'assets/background.webp': 'Monterey',
      'assets/background2.jpg': 'Ventura',
      'assets/background3.jpg': 'Sonoma',
      'assets/background4.jpg': 'Big Sur',
      'assets/background5.jpg': 'Catalina',
      'assets/background6.jpg': 'Mojave',
      'assets/background7.jpg': 'High Sierra',
      'assets/background8.jpeg': 'Sierra'
    };
    const wallpaperName = wallpaperNames[savedWallpaper] || 'Custom';

    return `
      <div class="appearance-popover">
        <div class="appearance-section">
          <div class="section-label">System Color</div>
          <div class="appearance-colors">${themeDots}</div>
        </div>

        <div class="appearance-section clickable" id="open-wallpapers-btn">
          <div style="display:flex; gap:14px; align-items:center;">
             <div class="appearance-wallpaper-thumb" style="background-image:url('${savedWallpaper}')"></div>
             <div>
                <div class="section-title" style="font-size:0.95rem; font-weight:600; letter-spacing:-0.01em;">${wallpaperName}</div>
                <div class="section-subtitle" style="font-size:0.75rem; color:rgba(255,255,255,0.45); margin-top:3px;">Dynamic Wallpaper &rsaquo;</div>
             </div>
          </div>
        </div>
      </div>
    `;
  }

  function initAppearanceListeners() {
    document.querySelectorAll('.appearance-dot-wrapper').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const t = el.getAttribute('data-theme');
        if (window.applyTheme(t)) {
          dropdown.innerHTML = renderAppearancePopover();
          initAppearanceListeners();
        }
      });
    });

    // Wallpaper card opens the Wallpapers window
    const wpBtn = document.getElementById('open-wallpapers-btn');
    if (wpBtn) {
      wpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeDropdown();
        const win = document.getElementById('wallpaper-window');
        if (win) {
          win.classList.remove('hidden');
          win.classList.remove('minimized');
          // Re-init wallpaper grid in case it's stale
          if (typeof initWallpaperApp === 'function') initWallpaperApp();
        }
      });
    }
  }

  function toggleDropdown(trigger, contentItems, align = 'left', isAppearance = false) {

    if (activeMenuTrigger === trigger) {
      closeDropdown();
      return;
    }

    // Dismiss all other menubar popovers
    document.dispatchEvent(new CustomEvent('menubar-dismiss', { detail: { source: 'dropdown' } }));

    activeMenuTrigger = trigger;
    document.querySelectorAll('.topbar-item').forEach(el => el.classList.remove('active'));
    trigger.classList.add('active');

    // Populate dropdown
    dropdown.innerHTML = '';
    if (isAppearance) {
      dropdown.className = 'menu-dropdown appearance-mode';
      dropdown.innerHTML = renderAppearancePopover();
      initAppearanceListeners();
    } else {
      dropdown.className = 'menu-dropdown';
      contentItems.forEach(item => {
      const el = document.createElement('div');
      if (item.type === 'divider') {
        el.className = 'menu-item divider';
      } else {
        el.className = 'menu-item' + (item.disabled ? ' disabled' : '');
        el.innerHTML = `<span>${item.label}</span>${item.shortcut ? `<span class="shortcut">${item.shortcut}</span>` : ''}`;
        if (item.action && !item.disabled) {
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            item.action();
            closeDropdown();
          });
        } else if (!item.disabled) {
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            closeDropdown();
          });
        }
      }
      dropdown.appendChild(el);
    });
  }

  // Position dropdown
    const rect = trigger.getBoundingClientRect();
    dropdown.style.left = align === 'left' ? `${rect.left}px` : 'auto';
    dropdown.style.right = align === 'right' ? `${window.innerWidth - rect.right}px` : 'auto';
    dropdown.classList.remove('hidden');
  }

  function closeDropdown() {
    activeMenuTrigger = null;
    dropdown.classList.add('hidden');
    document.querySelectorAll('.topbar-item').forEach(el => el.classList.remove('active'));
  }

  // Listen for dismiss from other popovers
  document.addEventListener('menubar-dismiss', (e) => {
    if (e.detail?.source !== 'dropdown') closeDropdown();
  });

  // ── Event Observers ───────────────────────────────────────────────────
  document.getElementById('hg-menu-trigger').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown(e.currentTarget, getHgMenu());
  });

  document.getElementById('appearance-trigger').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown(e.currentTarget, [], 'right', true);
  });

  document.querySelectorAll('.menu-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const menuType = trigger.dataset.menu;
      let menuContent;
      
      const appName = appNameDisplay.textContent;
      menuContent = (appMenus[appName] && appMenus[appName][menuType]) || [{ label: 'No Options' }];
      
      toggleDropdown(trigger, menuContent);
    });
  });

  // Close menus on outside click
  window.addEventListener('click', closeDropdown);

  // ── Spotlight Logic ───────────────────────────────────────────────────
  const searchableItems = [
    { name: 'Terminal', type: 'Application', id: 'terminal-window', icon: '>_' },
    { name: 'Safari', type: 'Application', id: 'portfolio-window', icon: 'S' },
    { name: 'GitPilot', type: 'Application', id: 'gitpilot-window', icon: 'GP' },
    { name: 'JSON Editor', type: 'Application', id: 'json-editor-window', icon: '{ }' },
    { name: 'Wallpapers', type: 'Application', id: 'wallpaper-window', icon: '📷' },
    { name: 'About Me', type: 'Application', id: 'about-window', icon: 'HG' },
    { name: 'Calculator', type: 'Application', id: 'calculator-window', icon: '÷' },
    { name: 'Messages', type: 'Application', id: 'imessage-window', icon: '💬' },
    { name: 'Resume', type: 'File', id: 'resume-window', icon: 'PDF' },
    { name: 'Help', type: 'Action', action: () => {
      const win = document.getElementById('terminal-window');
      if (win) { win.classList.remove('hidden'); win.classList.remove('minimized'); document.dispatchEvent(new CustomEvent('open-app', { detail: { id: 'terminal-window' } })); }
    }, icon: '?' },
    { name: 'Restart', type: 'Action', action: () => window.location.reload(), icon: 'R' }
  ];

  function openSpotlight() {
    document.dispatchEvent(new CustomEvent('menubar-dismiss', { detail: { source: 'spotlight' } }));
    spotlightOverlay.classList.remove('hidden');
    spotlightInput.value = '';
    spotlightInput.focus();
    renderSpotlightResults([]);
  }

  function closeSpotlight() {
    spotlightOverlay.classList.add('hidden');
    spotlightResults.style.display = 'none';
  }

  function renderSpotlightResults(results) {
    if (!spotlightInput.value.trim()) {
      spotlightResults.classList.add('hidden');
      spotlightResults.style.display = 'none';
      return;
    }

    spotlightResults.innerHTML = '';
    spotlightResults.classList.remove('hidden');
    spotlightResults.style.display = 'block';

    if (results.length === 0) {
      spotlightResults.innerHTML = '<div style="padding: 20px; color: rgba(255,255,255,0.4); text-align: center;">No results found</div>';
      return;
    }

    results.forEach((item, index) => {
      const el = document.createElement('div');
      el.className = `spotlight-result-item ${index === 0 ? 'selected' : ''}`;
      el.innerHTML = `
        <div class="result-icon">${item.icon}</div>
        <div class="result-info">
          <span class="result-name">${item.name}</span>
          <span class="result-type">${item.type}</span>
        </div>
      `;
      el.addEventListener('click', () => {
        handleSpotlightSelect(item);
      });
      spotlightResults.appendChild(el);
    });
  }

  function handleSpotlightSelect(item) {
    closeSpotlight();
    if (item.action) {
      item.action();
    } else if (item.id) {
      const win = document.getElementById(item.id);
      if (win) {
        win.classList.remove('hidden');
        win.classList.remove('minimized');
        // We'll rely on desktop.js to handle bringToFront if needed
        // or trigger a custom event
        const event = new CustomEvent('open-app', { detail: { id: item.id } });
        document.dispatchEvent(event);
      }
    }
  }

  document.getElementById('spotlight-trigger').addEventListener('click', (e) => {
    e.stopPropagation();
    openSpotlight();
  });

  spotlightInput.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    if (!val) {
      renderSpotlightResults([]);
      return;
    }
    const filtered = searchableItems.filter(i => i.name.toLowerCase().includes(val));
    renderSpotlightResults(filtered);
  });

  spotlightOverlay.addEventListener('click', (e) => {
    if (e.target === spotlightOverlay) closeSpotlight();
  });

  // Shortcuts
  window.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + Space for Spotlight
    if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
      e.preventDefault();
      openSpotlight();
    }

    // Esc to close anything
    if (e.key === 'Escape') {
      closeSpotlight();
      closeDropdown();
    }

    // Spotlight navigation
    if (!spotlightOverlay.classList.contains('hidden')) {
      const results = Array.from(document.querySelectorAll('.spotlight-result-item'));
      const selected = document.querySelector('.spotlight-result-item.selected');
      let index = results.indexOf(selected);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        results[index].classList.remove('selected');
        index = (index + 1) % results.length;
        results[index].classList.add('selected');
        results[index].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        results[index].classList.remove('selected');
        index = (index - 1 + results.length) % results.length;
        results[index].classList.add('selected');
        results[index].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selected) {
          const itemName = selected.querySelector('.result-name').textContent;
          const item = searchableItems.find(i => i.name === itemName);
          if (item) handleSpotlightSelect(item);
        }
      }
    }
  });

  // ── Clock & Status Logic ────────────────────────────────────────────────
  const timeDisplay = document.getElementById('topbar-time');

  function updateTime() {
    if (!timeDisplay) return;
    const now = new Date();
    const opts = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
    timeDisplay.textContent = now.toLocaleDateString('en-US', opts).replace(/,/g, '');
  }

  setInterval(updateTime, 1000);
  updateTime();
});
