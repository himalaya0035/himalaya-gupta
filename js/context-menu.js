/**
 * context-menu.js
 * macOS-inspired right-click context menus:
 * - Desktop context menu (Change Wallpaper, Get Info, etc.)
 * - Window-specific context menus
 * - Glassmorphic styling matching the OS theme
 */
(() => {
  const menu = document.getElementById('context-menu');
  if (!menu) return;

  let currentTarget = null;

  function showMenu(x, y, items) {
    menu.innerHTML = '';
    items.forEach(item => {
      if (item.type === 'divider') {
        const div = document.createElement('div');
        div.className = 'ctx-divider';
        menu.appendChild(div);
      } else {
        const el = document.createElement('div');
        el.className = 'ctx-item';
        if (item.disabled) el.classList.add('disabled');
        el.innerHTML = `
          <span>${item.label}</span>
          ${item.shortcut ? `<span class="ctx-shortcut">${item.shortcut}</span>` : ''}
        `;
        if (item.action && !item.disabled) {
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            hideMenu();
            item.action();
          });
        }
        menu.appendChild(el);
      }
    });

    // Position with boundary checks
    menu.style.left = '0px';
    menu.style.top = '0px';
    menu.classList.remove('hidden');

    const rect = menu.getBoundingClientRect();
    let finalX = x;
    let finalY = y;

    if (x + rect.width > window.innerWidth) {
      finalX = window.innerWidth - rect.width - 8;
    }
    if (y + rect.height > window.innerHeight) {
      finalY = window.innerHeight - rect.height - 8;
    }

    menu.style.left = `${finalX}px`;
    menu.style.top = `${finalY}px`;
  }

  function hideMenu() {
    menu.classList.add('hidden');
    currentTarget = null;
  }

  // ── Desktop context menu items ──────────────────────────────────────
  function getDesktopMenuItems() {
    return [
      {
        label: 'New Folder',
        shortcut: '⇧⌘N',
        disabled: true
      },
      { type: 'divider' },
      {
        label: 'Get Info',
        shortcut: '⌘I',
        action: () => {
          alert('Himalaya Gupta — Desktop OS\nVersion 2.0.4\nVanilla JS • CSS3 • HTML5');
        }
      },
      {
        label: 'Change Wallpaper…',
        action: () => {
          const win = document.getElementById('wallpaper-window');
          if (win) {
            win.classList.remove('hidden');
            win.classList.remove('minimized');
            const event = new CustomEvent('open-app', { detail: { id: 'wallpaper-window' } });
            document.dispatchEvent(event);
          }
        }
      },
      { type: 'divider' },
      {
        label: 'Sort By',
        disabled: true
      },
      {
        label: 'Clean Up',
        disabled: true
      },
      { type: 'divider' },
      {
        label: 'Open Terminal',
        action: () => {
          const win = document.getElementById('terminal-window');
          if (win) {
            win.classList.remove('hidden');
            win.classList.remove('minimized');
            const event = new CustomEvent('open-app', { detail: { id: 'terminal-window' } });
            document.dispatchEvent(event);
          }
        }
      },
      {
        label: 'Mission Control',
        shortcut: '⌃↑',
        action: () => {
          if (window.MissionControl) window.MissionControl.toggle();
        }
      },
      {
        label: 'Lock Screen',
        shortcut: '⌃⌘Q',
        disabled: true
      }
    ];
  }

  // ── File icon context menu ──────────────────────────────────────────
  function getFileMenuItems(fileEl) {
    const fileName = fileEl.querySelector('span')?.textContent || 'File';
    return [
      {
        label: `Open "${fileName}"`,
        action: () => {
          const targetId = fileEl.dataset.target;
          const win = document.getElementById(targetId);
          if (win) {
            win.classList.remove('hidden');
            win.classList.remove('minimized');
            const event = new CustomEvent('open-app', { detail: { id: targetId } });
            document.dispatchEvent(event);
          }
        }
      },
      { type: 'divider' },
      {
        label: 'Get Info',
        shortcut: '⌘I',
        action: () => {
          alert(`${fileName}\nType: PDF Document\nSize: 142 KB`);
        }
      },
      {
        label: 'Quick Look',
        shortcut: 'Space',
        action: () => {
          const targetId = fileEl.dataset.target;
          const win = document.getElementById(targetId);
          if (win) {
            win.classList.remove('hidden');
            win.classList.remove('minimized');
            const event = new CustomEvent('open-app', { detail: { id: targetId } });
            document.dispatchEvent(event);
          }
        }
      },
      { type: 'divider' },
      {
        label: 'Download',
        action: () => {
          const link = document.createElement('a');
          link.href = 'assets/resume.pdf';
          link.download = 'Himalaya_Gupta_Resume.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      },
      { type: 'divider' },
      {
        label: 'Move to Trash',
        disabled: true
      }
    ];
  }

  // ── Dock icon context menu ──────────────────────────────────────────
  function getDockMenuItems(dockBtn) {
    const appName = dockBtn.dataset.title || 'App';
    const targetId = dockBtn.dataset.target;
    const win = targetId ? document.getElementById(targetId) : null;
    const isOpen = win && !win.classList.contains('hidden');

    return [
      {
        label: isOpen ? `Show ${appName}` : `Open ${appName}`,
        action: () => {
          if (win) {
            win.classList.remove('hidden');
            win.classList.remove('minimized');
            const event = new CustomEvent('open-app', { detail: { id: targetId } });
            document.dispatchEvent(event);
          }
        }
      },
      { type: 'divider' },
      {
        label: isOpen ? 'Close Window' : 'Close',
        action: () => {
          if (win && isOpen) {
            win.classList.add('hidden');
            win.classList.remove('active');
            const dockItem = document.querySelector(`.dock button.icon[data-target="${targetId}"]`);
            if (dockItem) {
              dockItem.classList.remove('active');
              const point = dockItem.querySelector('.point');
              if (point) point.classList.add('hidden');
            }
          }
        },
        disabled: !isOpen
      },
      {
        label: 'Keep in Dock',
        disabled: true
      }
    ];
  }

  // ── Event listeners ─────────────────────────────────────────────────
  document.addEventListener('contextmenu', (e) => {
    // Don't override context menu inside terminal or iframes
    if (e.target.closest('#terminal') || e.target.closest('iframe')) return;

    e.preventDefault();

    const fileEl = e.target.closest('.desktop-file, .desktop-folder');
    const dockBtn = e.target.closest('.dock button.icon');

    if (fileEl) {
      showMenu(e.clientX, e.clientY, getFileMenuItems(fileEl));
    } else if (dockBtn) {
      showMenu(e.clientX, e.clientY, getDockMenuItems(dockBtn));
    } else if (e.target.closest('#desktop-wallpaper') || e.target.closest('#desktop-grid') || e.target === document.body) {
      showMenu(e.clientX, e.clientY, getDesktopMenuItems());
    }
  });

  // Hide on click or Escape
  document.addEventListener('click', hideMenu);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideMenu();
  });
  window.addEventListener('blur', hideMenu);
})();
