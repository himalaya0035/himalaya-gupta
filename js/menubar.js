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
    },
    'Finder': {
      file: [
        { label: 'Close Window', shortcut: '⌘W', action: closeActiveWindow }
      ],
      window: [
        { label: 'Minimize', shortcut: '⌘M', action: minimizeActiveWindow },
        { label: 'Zoom', action: maximizeActiveWindow }
      ],
      help: [
        { label: 'Browse projects and experience', disabled: true }
      ]
    },
    'Guest Book': {
      file: [
        { label: 'Close Window', shortcut: '⌘W', action: closeActiveWindow }
      ],
      window: [
        { label: 'Minimize', shortcut: '⌘M', action: minimizeActiveWindow },
        { label: 'Zoom', action: maximizeActiveWindow }
      ],
      help: [
        { label: 'Sign the guest book!', disabled: true }
      ]
    },
    'Settings': {
      file: [
        { label: 'Close Window', shortcut: '⌘W', action: closeActiveWindow }
      ],
      window: [
        { label: 'Minimize', shortcut: '⌘M', action: minimizeActiveWindow },
        { label: 'Zoom', action: maximizeActiveWindow }
      ],
      help: [
        { label: 'Change themes, wallpapers & more', disabled: true }
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
    const savedWallpaper = localStorage.getItem('desktopWallpaper') || 'assets/background2.jpg';
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

  // ── Spotlight Logic (Enhanced Universal Search) ─────────────────────────
  function buildSearchIndex() {
    const C = window.CONTENT || {};
    const items = [];

    // Applications
    const apps = [
      { name: 'Terminal', type: 'Application', id: 'terminal-window', icon: '>_', iconClass: 'icon-app' },
      { name: 'Safari', type: 'Application', id: 'portfolio-window', icon: '🧭', iconClass: 'icon-app' },
      { name: 'GitPilot', type: 'Application', id: 'gitpilot-window', icon: 'GP', iconClass: 'icon-app' },
      { name: 'JSON Editor', type: 'Application', id: 'json-editor-window', icon: '{ }', iconClass: 'icon-app' },
      { name: 'Wallpapers', type: 'Application', id: 'wallpaper-window', icon: '📷', iconClass: 'icon-app' },
      { name: 'About Me', type: 'Application', id: 'about-window', icon: '👤', iconClass: 'icon-app' },
      { name: 'Calculator', type: 'Application', id: 'calculator-window', icon: '🧮', iconClass: 'icon-app' },
      { name: 'Messages', type: 'Application', id: 'imessage-window', icon: '💬', iconClass: 'icon-app' },
      { name: 'GitHub Stats', type: 'Application', id: 'github-stats-window', icon: '🐙', iconClass: 'icon-app' },
      { name: 'Resume', type: 'File', id: 'resume-window', icon: '📄', iconClass: 'icon-app' },
      { name: 'Finder', type: 'Application', id: 'finder-window', icon: '📂', iconClass: 'icon-app' },
      { name: 'System Preferences', type: 'Application', id: 'sysprefs-window', icon: '⚙️', iconClass: 'icon-app' },
      { name: 'Settings', type: 'Application', id: 'sysprefs-window', icon: '⚙️', iconClass: 'icon-app' },
      { name: 'Guest Book', type: 'Application', id: 'guestbook-window', icon: '📝', iconClass: 'icon-app' },
    ];
    items.push(...apps);

    // Terminal commands
    const commands = window.COMMANDS || {};
    Object.keys(commands).forEach(cmd => {
      items.push({
        name: cmd,
        type: 'Terminal Command',
        subtitle: `Run "${cmd}" in terminal`,
        icon: '>_',
        iconClass: 'icon-command',
        action: () => {
          const win = document.getElementById('terminal-window');
          if (win) {
            win.classList.remove('hidden', 'minimized');
            document.dispatchEvent(new CustomEvent('open-app', { detail: { id: 'terminal-window' } }));
          }
          // Execute the command
          setTimeout(() => {
            const input = document.getElementById('cmd-input');
            if (input && window.Terminal) {
              input.value = cmd;
              input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            }
          }, 200);
        }
      });
    });

    // Skills
    if (C.skills) {
      Object.entries(C.skills).forEach(([category, skillList]) => {
        skillList.forEach(skill => {
          items.push({
            name: skill,
            type: 'Skill',
            subtitle: category,
            icon: '⚡',
            iconClass: 'icon-skill',
            id: 'about-window'
          });
        });
      });
    }

    // Projects
    if (C.projects) {
      C.projects.forEach(proj => {
        items.push({
          name: proj.name,
          type: 'Project',
          subtitle: proj.tech ? proj.tech.join(', ') : proj.description,
          icon: '🚀',
          iconClass: 'icon-project',
          action: () => {
            // Open the first available link
            const link = proj.links?.live || proj.links?.view || proj.links?.playground || proj.links?.github;
            if (link) window.open(link, '_blank');
          }
        });
      });
    }

    // Experience
    if (C.experience) {
      C.experience.forEach(exp => {
        items.push({
          name: `${exp.role} at ${exp.company}`,
          type: 'Experience',
          subtitle: exp.period,
          icon: '💼',
          iconClass: 'icon-info',
          id: 'about-window'
        });
      });
    }

    // Contact
    if (C.contact) {
      if (C.contact.email) {
        items.push({
          name: C.contact.email,
          type: 'Contact',
          subtitle: 'Email',
          icon: '✉️',
          iconClass: 'icon-contact',
          action: () => window.open(`mailto:${C.contact.email}`)
        });
      }
      if (C.contact.github) {
        items.push({
          name: 'GitHub Profile',
          type: 'Contact',
          subtitle: C.contact.github,
          icon: '🐙',
          iconClass: 'icon-contact',
          action: () => window.open(C.contact.github, '_blank')
        });
      }
      if (C.contact.linkedin) {
        items.push({
          name: 'LinkedIn Profile',
          type: 'Contact',
          subtitle: C.contact.linkedin,
          icon: '🔗',
          iconClass: 'icon-contact',
          action: () => window.open(C.contact.linkedin, '_blank')
        });
      }
    }

    // Achievements
    if (C.achievements) {
      C.achievements.forEach(ach => {
        items.push({
          name: ach,
          type: 'Achievement',
          subtitle: '',
          icon: '🏆',
          iconClass: 'icon-info',
          id: 'about-window'
        });
      });
    }

    // System actions
    items.push(
      { name: 'Help', type: 'Action', icon: '❓', iconClass: 'icon-command', action: () => {
        const win = document.getElementById('terminal-window');
        if (win) { win.classList.remove('hidden', 'minimized'); document.dispatchEvent(new CustomEvent('open-app', { detail: { id: 'terminal-window' } })); }
      }},
      { name: 'Restart', type: 'Action', icon: '🔄', iconClass: 'icon-command', action: () => window.location.reload() },
      { name: 'Lock Screen', type: 'Action', icon: '🔒', iconClass: 'icon-command', action: () => { if (window.LockScreen) window.LockScreen.show(); } },
      { name: 'Mission Control', type: 'Action', icon: '🪟', iconClass: 'icon-command', action: () => { if (window.MissionControl) window.MissionControl.toggle(); } },
      { name: 'Toggle Full Screen', type: 'Action', icon: '⛶', iconClass: 'icon-command', action: () => { if (window.toggleFullScreen) window.toggleFullScreen(); } }
    );

    return items;
  }

  const searchableItems = buildSearchIndex();

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

  function toggleSpotlight() {
    if (spotlightOverlay.classList.contains('hidden')) {
      openSpotlight();
    } else {
      closeSpotlight();
    }
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

    // Group results by type
    const groups = {};
    results.forEach(item => {
      const type = item.type || 'Other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(item);
    });

    // Priority order for categories
    const order = ['Application', 'Terminal Command', 'Project', 'Skill', 'Experience', 'Contact', 'Achievement', 'Action', 'File'];
    const sortedTypes = Object.keys(groups).sort((a, b) => {
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

    let globalIndex = 0;
    sortedTypes.forEach(type => {
      // Category header
      const header = document.createElement('div');
      header.className = 'spotlight-category-header';
      header.textContent = type;
      spotlightResults.appendChild(header);

      groups[type].forEach(item => {
        const el = document.createElement('div');
        el.className = `spotlight-result-item ${globalIndex === 0 ? 'selected' : ''}`;
        el.dataset.index = globalIndex;
        el._spotlightItem = item; // Store reference for keyboard selection
        el.innerHTML = `
          <div class="result-icon ${item.iconClass || ''}">${item.icon || '•'}</div>
          <div class="result-info">
            <span class="result-name">${escHtml(item.name)}</span>
            ${item.subtitle ? `<span class="result-subtitle">${escHtml(item.subtitle)}</span>` : `<span class="result-type">${escHtml(item.type)}</span>`}
          </div>
        `;
        el.addEventListener('click', () => handleSpotlightSelect(item));
        spotlightResults.appendChild(el);
        globalIndex++;
      });
    });
  }

  function escHtml(s) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
        const event = new CustomEvent('open-app', { detail: { id: item.id } });
        document.dispatchEvent(event);
      }
    }
  }

  document.getElementById('spotlight-trigger').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSpotlight();
  });

  spotlightInput.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase().trim();
    if (!val) {
      renderSpotlightResults([]);
      return;
    }
    // Fuzzy match: search name, subtitle, and type
    const filtered = searchableItems.filter(i => {
      const haystack = [i.name, i.subtitle || '', i.type].join(' ').toLowerCase();
      // Support multi-word queries: all words must match
      const words = val.split(/\s+/);
      return words.every(w => haystack.includes(w));
    });
    // Limit to 15 results to keep it snappy
    renderSpotlightResults(filtered.slice(0, 15));
  });

  spotlightOverlay.addEventListener('click', (e) => {
    if (e.target === spotlightOverlay) closeSpotlight();
  });

  // Shortcuts
  window.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + Space for Spotlight
    if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
      e.preventDefault();
      toggleSpotlight();
    }

    // Cmd/Ctrl + K for Spotlight (alternative)
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      toggleSpotlight();
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
          const item = selected._spotlightItem;
          if (item) {
            handleSpotlightSelect(item);
          } else {
            // Fallback: find by name
            const itemName = selected.querySelector('.result-name').textContent;
            const found = searchableItems.find(i => i.name === itemName);
            if (found) handleSpotlightSelect(found);
          }
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
