/**
 * mission-control.js
 * macOS Mission Control:
 * - Ctrl+Up to toggle
 * - Zooms out all visible windows into a tiled overview
 * - Click a window to focus it and exit
 * - Click empty space to exit
 * - Uses transparent click-catcher overlays on each window
 */
(() => {
  const overlay = document.getElementById('mission-control-overlay');
  if (!overlay) return;

  let isActive = false;
  let savedStates = [];
  let clickCatchers = [];

  function getVisibleWindows() {
    return Array.from(document.querySelectorAll('.os-window')).filter(w =>
      !w.classList.contains('hidden') && !w.classList.contains('minimized')
    );
  }

  function activate() {
    if (isActive) return;
    isActive = true;

    const wins = getVisibleWindows();
    if (wins.length === 0) { isActive = false; return; }

    // Save current state
    savedStates = wins.map(w => ({
      el: w,
      left: w.style.left,
      top: w.style.top,
      width: w.style.width,
      height: w.style.height,
      transform: w.style.transform,
      zIndex: w.style.zIndex,
      transition: w.style.transition,
      maxWidth: w.style.maxWidth,
      maxHeight: w.style.maxHeight,
      pointerEvents: w.style.pointerEvents
    }));

    // Show overlay
    overlay.classList.remove('hidden');
    // Force reflow before adding active class for transition
    overlay.offsetHeight;
    overlay.classList.add('active');

    // Calculate grid layout
    const count = wins.length;
    const cols = count <= 2 ? count : count <= 4 ? 2 : 3;
    const rows = Math.ceil(count / cols);

    const menuBarH = 32;
    const dockH = 80;
    const padding = 40;
    const gap = 24;

    const availW = window.innerWidth - padding * 2;
    const availH = window.innerHeight - menuBarH - dockH - padding * 2;

    const cellW = (availW - gap * (cols - 1)) / cols;
    const cellH = (availH - gap * (rows - 1)) / rows;

    wins.forEach((w, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const itemsInRow = row === rows - 1 ? count - row * cols : cols;
      const rowOffset = (availW - (itemsInRow * cellW + (itemsInRow - 1) * gap)) / 2;

      const x = padding + rowOffset + col * (cellW + gap);
      const y = menuBarH + padding + row * (cellH + gap);

      if (w.classList.contains('maximized')) {
        w.classList.remove('maximized');
        w.dataset.wasMaximized = 'true';
      }

      // Disable pointer events on the actual window so desktop.js doesn't interfere
      w.style.pointerEvents = 'none';

      w.style.transition = 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
      w.style.left = `${x}px`;
      w.style.top = `${y}px`;
      w.style.width = `${cellW}px`;
      w.style.height = `${cellH}px`;
      w.style.maxWidth = 'none';
      w.style.maxHeight = 'none';
      w.style.transform = 'none';
      w.style.zIndex = '500001';
      w.style.borderRadius = '12px';
      w.classList.add('mission-control-item');

      // Create a transparent click-catcher on top of each window
      const catcher = document.createElement('div');
      catcher.className = 'mc-click-catcher';
      catcher.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: ${cellW}px;
        height: ${cellH}px;
        z-index: 500002;
        cursor: pointer;
        border-radius: 12px;
        border: 2px solid transparent;
        transition: border-color 0.2s, box-shadow 0.2s;
      `;
      catcher.addEventListener('mouseenter', () => {
        catcher.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        catcher.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.1)';
      });
      catcher.addEventListener('mouseleave', () => {
        catcher.style.borderColor = 'transparent';
        catcher.style.boxShadow = 'none';
      });
      catcher.addEventListener('click', (e) => {
        e.stopPropagation();
        deactivate(w);
      });

      // Show app title label
      const label = document.createElement('div');
      label.className = 'mc-window-label';
      label.textContent = w.dataset.appTitle || 'Window';
      catcher.appendChild(label);

      document.body.appendChild(catcher);
      clickCatchers.push(catcher);
    });
  }

  function deactivate(focusWin) {
    if (!isActive) return;
    isActive = false;

    overlay.classList.remove('active');

    // Remove all click catchers
    clickCatchers.forEach(c => c.remove());
    clickCatchers = [];

    // Restore all windows
    savedStates.forEach(s => {
      s.el.style.pointerEvents = s.pointerEvents || '';
      s.el.style.transition = 'all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)';
      s.el.style.left = s.left;
      s.el.style.top = s.top;
      s.el.style.width = s.width;
      s.el.style.height = s.height;
      s.el.style.transform = s.transform;
      s.el.style.zIndex = s.zIndex;
      s.el.style.maxWidth = s.maxWidth;
      s.el.style.maxHeight = s.maxHeight;
      s.el.classList.remove('mission-control-item');

      if (s.el.dataset.wasMaximized === 'true') {
        s.el.classList.add('maximized');
        delete s.el.dataset.wasMaximized;
      }
    });

    // Focus the clicked window
    if (focusWin) {
      const event = new CustomEvent('open-app', { detail: { id: focusWin.id } });
      document.dispatchEvent(event);
    }

    // Clean up transitions after animation
    setTimeout(() => {
      savedStates.forEach(s => {
        s.el.style.transition = s.transition || '';
      });
      overlay.classList.add('hidden');
      savedStates = [];
    }, 400);
  }

  function toggle() {
    isActive ? deactivate() : activate();
  }

  // Expose globally for menus
  window.MissionControl = { toggle };

  // Click empty space on overlay to exit
  overlay.addEventListener('click', () => {
    if (isActive) deactivate();
  });

  // Keyboard
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'ArrowUp') {
      e.preventDefault();
      toggle();
    }
    if (e.key === 'Escape' && isActive) {
      deactivate();
    }
  });
})();
