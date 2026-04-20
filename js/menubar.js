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
  
  // ── Menu Data Definitions ──────────────────────────────────────────────
  const appMenus = {
    'Terminal': {
      file: [
        { label: 'New Window', shortcut: '⌘N' },
        { label: 'New Tab', shortcut: '⌘T' },
        { label: 'Open...', shortcut: '⌘O' },
        { type: 'divider' },
        { label: 'Save Output...', shortcut: '⌘S' },
        { type: 'divider' },
        { label: 'Close Window', shortcut: '⌘W' }
      ],
      edit: [
        { label: 'Copy', shortcut: '⌘C' },
        { label: 'Paste', shortcut: '⌘V' },
        { label: 'Clear Scrollback', shortcut: '⌘K' },
        { type: 'divider' },
        { label: 'Find...', shortcut: '⌘F' }
      ],
      view: [
        { label: 'Show Inspector', shortcut: '⌥⌘I' },
        { label: 'Enter Full Screen', shortcut: '⌃⌘F' }
      ],
      window: [
        { label: 'Minimize', shortcut: '⌘M' },
        { label: 'Zoom' },
        { type: 'divider' },
        { label: 'Bring All to Front' }
      ],
      help: [
        { label: 'Terminal Help' },
        { label: 'About Shell' }
      ]
    },
    'Safari': {
      file: [
        { label: 'New Window', shortcut: '⌘N' },
        { label: 'New Private Window', shortcut: '⇧⌘N' },
        { label: 'Open Location...', shortcut: '⌘L' },
        { type: 'divider' },
        { label: 'Close Tab', shortcut: '⌘W' }
      ],
      edit: [
        { label: 'Undo', shortcut: '⌘Z' },
        { label: 'Redo', shortcut: '⇧⌘Z' },
        { type: 'divider' },
        { label: 'Cut', shortcut: '⌘X' },
        { label: 'Copy', shortcut: '⌘C' },
        { label: 'Paste', shortcut: '⌘V' }
      ],
      view: [
        { label: 'Reload Page', shortcut: '⌘R' },
        { label: 'Stop', shortcut: '⌘.' },
        { type: 'divider' },
        { label: 'Enter Full Screen', shortcut: '⌃⌘F' }
      ],
      window: [
        { label: 'Minimize', shortcut: '⌘M' },
        { label: 'Zoom' }
      ],
      help: [
        { label: 'Safari Help' }
      ]
    },
    'Preview': {
      file: [
        { label: 'Open...', shortcut: '⌘O' },
        { label: 'Export as PDF...' },
        { type: 'divider' },
        { label: 'Print...', shortcut: '⌘P' }
      ],
      edit: [
        { label: 'Copy', shortcut: '⌘C' }
      ],
      view: [
        { label: 'Zoom In', shortcut: '⌘+' },
        { label: 'Zoom Out', shortcut: '⌘-' },
        { label: 'Actual Size', shortcut: '⌘0' }
      ],
      window: [
        { label: 'Minimize', shortcut: '⌘M' }
      ],
      help: [
        { label: 'Preview Help' }
      ]
    },
    'GitPilot': {
      file: [{ label: 'New Repository' }, { label: 'Clone...' }],
      edit: [{ label: 'Copy Commit SHA' }],
      view: [{ label: 'Refresh' }],
      window: [{ label: 'Minimize' }],
      help: [{ label: 'Git Documentation' }]
    },
    'JSON Editor': {
      file: [{ label: 'Import JSON' }, { label: 'Export JSON' }],
      edit: [{ label: 'Format' }, { label: 'Minify' }],
      view: [{ label: 'Tree View' }, { label: 'Code View' }],
      window: [{ label: 'Minimize' }],
      help: [{ label: 'JSON Schema Help' }]
    }
  };

  const hgMenu = [
    { label: 'About This Portfolio', action: () => alert('Himalaya Gupta — Senior Full-Stack Engineer\nVersion 2.0.4\nMacOS Inspired OS') },
    { label: 'System Settings...', shortcut: '⌘,' },
    { type: 'divider' },
    { label: 'Sleep' },
    { label: 'Restart...', action: () => window.location.reload() },
    { label: 'Shut Down...' },
    { type: 'divider' },
    { label: 'Lock Screen', shortcut: '⌃⌘Q' }
  ];

  const controlCenterMenu = [
    { label: 'Dark Mode', shortcut: 'On', action: () => document.body.classList.toggle('light-mode') },
    { label: 'Bluetooth', shortcut: 'Off' },
    { label: 'WiFi', shortcut: 'Connected' },
    { type: 'divider' },
    { label: 'AirDrop', shortcut: 'Contacts Only' },
    { type: 'divider' },
    { label: 'Sound', shortcut: '80%' },
    { label: 'Display', shortcut: '100%' }
  ];

  // ── Menu Logic ──────────────────────────────────────────────────────────
  let activeMenuTrigger = null;

  function toggleDropdown(trigger, contentItems, align = 'left') {
    if (activeMenuTrigger === trigger) {
      closeDropdown();
      return;
    }

    activeMenuTrigger = trigger;
    document.querySelectorAll('.topbar-item').forEach(el => el.classList.remove('active'));
    trigger.classList.add('active');

    // Populate dropdown
    dropdown.innerHTML = '';
    contentItems.forEach(item => {
      const el = document.createElement('div');
      if (item.type === 'divider') {
        el.className = 'menu-item divider';
      } else {
        el.className = 'menu-item';
        el.innerHTML = `<span>${item.label}</span>${item.shortcut ? `<span class="shortcut">${item.shortcut}</span>` : ''}`;
        if (item.action) {
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            item.action();
            closeDropdown();
          });
        } else {
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            closeDropdown();
          });
        }
      }
      dropdown.appendChild(el);
    });

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

  // ── Event Observers ───────────────────────────────────────────────────
  document.getElementById('hg-menu-trigger').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown(e.currentTarget, hgMenu);
  });

  document.getElementById('control-center-trigger').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown(e.currentTarget, controlCenterMenu, 'right');
  });

  document.querySelectorAll('.menu-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const appName = appNameDisplay.textContent;
      const menuType = trigger.dataset.menu;
      const menuContent = (appMenus[appName] && appMenus[appName][menuType]) || [{ label: 'No Options' }];
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
    { name: 'Resume', type: 'File', id: 'resume-window', icon: 'PDF' },
    { name: 'Help', type: 'Action', action: () => alert('Showing help...'), icon: '?' },
    { name: 'Restart', type: 'Action', action: () => window.location.reload(), icon: 'R' }
  ];

  function openSpotlight() {
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
  const batteryDisplay = document.getElementById('battery-status');

  function updateTime() {
    if (!timeDisplay) return;
    const now = new Date();
    const opts = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
    timeDisplay.textContent = now.toLocaleDateString('en-US', opts).replace(/,/g, '');
  }

  function updateBattery() {
    if (!batteryDisplay) return;
    // Simulate battery percentage
    const level = 100; 
    batteryDisplay.innerHTML = `
      <span style="font-size: 11px; margin-right: 4px;">${level}%</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect><line x1="23" y1="13" x2="23" y2="11"></line><rect x="3" y="8" width="14" height="8" fill="currentColor"></rect></svg>
    `;
  }

  setInterval(updateTime, 1000);
  updateTime();
  updateBattery();
});
