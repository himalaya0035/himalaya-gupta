/**
 * desktop.js
 * Manages the macOS-like desktop environment:
 * - Window dragging
 * - Top-level window z-index management
 * - Dock interactions (launching, minimizing)
 * - Window controls (close, minimize, maximize)
 */

document.addEventListener("DOMContentLoaded", () => {
  let highestZ = 100;

  // ── Star field for wallpaper text ────────────────────────────────────────
  (function buildStarField() {
    const W = 400, H = 400;
    const count = 50; // Balanced density for full background
    let circles = '';
    for (let i = 0; i < count; i++) {
      const x       = (Math.random() * W).toFixed(1);
      const y       = (Math.random() * H).toFixed(1);
      const r       = (Math.random() * 0.9 + 0.3).toFixed(2);
      const opacity = (Math.random() * 0.4 + 0.1).toFixed(2);
      circles += `<circle cx="${x}" cy="${y}" r="${r}" fill="white" opacity="${opacity}"/>`;
    }
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}'>`
              + `<rect width='${W}' height='${H}' fill='transparent'/>`
              + circles
              + `</svg>`;
    const encoded = svg.replace(/#/g, '%23').replace(/"/g, "'");
    const url = `url("data:image/svg+xml,${encoded}")`;
    document.documentElement.style.setProperty('--star-field-url', url);
  })();
  
  const windows = document.querySelectorAll('.os-window');
  const dockItems = document.querySelectorAll('.dock button.icon');
  const appNameDisplay = document.querySelector('.active-app-name');
  
  // Clock logic moved to menubar.js

  // ── Animated Window Helpers ──────────────────────────────────────────
  function animateOpen(win) {
    win.classList.remove('hidden', 'minimized', 'win-closing', 'win-minimizing');
    win.style.display = '';
    win.classList.add('win-opening');
    win.addEventListener('animationend', function handler() {
      win.classList.remove('win-opening');
      win.removeEventListener('animationend', handler);
    });
  }

  function animateClose(win) {
    win.classList.remove('active', 'win-opening', 'win-restoring');
    win.classList.add('win-closing');
    win.addEventListener('animationend', function handler() {
      win.classList.remove('win-closing');
      win.classList.add('hidden');
      win.removeEventListener('animationend', handler);
    });
    // Remove dock indicator
    const dockItem = document.querySelector(`.dock button.icon[data-target="${win.id}"]`);
    if (dockItem) {
      dockItem.classList.remove('active');
      const point = dockItem.querySelector('.point');
      if (point) point.classList.add('hidden');
    }
  }

  function animateMinimize(win) {
    win.classList.remove('active', 'win-opening', 'win-restoring');
    win.classList.add('win-minimizing');
    win.addEventListener('animationend', function handler() {
      win.classList.remove('win-minimizing');
      win.classList.add('minimized');
      win.removeEventListener('animationend', handler);
    });
  }

  function animateRestore(win) {
    win.classList.remove('hidden', 'minimized', 'win-closing', 'win-minimizing');
    win.style.display = '';
    win.classList.add('win-restoring');
    win.addEventListener('animationend', function handler() {
      win.classList.remove('win-restoring');
      win.removeEventListener('animationend', handler);
    });
  }
  
  // 2. Bring window to front
  function bringToFront(win) {
    highestZ += 10;
    win.style.zIndex = highestZ;
    const appName = win.dataset.appTitle || 'App';
    if(appNameDisplay) appNameDisplay.textContent = appName;
    
    // Update active state
    windows.forEach(w => w.classList.remove('active'));
    win.classList.add('active');
    
    // Update dock indicators
    const appId = win.id;
    dockItems.forEach(item => {
      if (item.dataset.target === appId) {
        item.classList.add('active');
        const point = item.querySelector('.point');
        if (point) point.classList.remove('hidden');
      }
    });
  }
  
  // Initialize window z-indices and make them clickable
  windows.forEach((win, idx) => {
    win.style.zIndex = highestZ + idx;
    highestZ = highestZ + idx;
    
    win.addEventListener('mousedown', () => bringToFront(win));
    win.addEventListener('touchstart', () => bringToFront(win), { passive: true });
    
    // Window Controls
    const btnClose = win.querySelector('.dot-red');
    const btnMin = win.querySelector('.dot-yellow');
    const btnMax = win.querySelector('.dot-green');
    
    if (btnClose) btnClose.addEventListener('click', (e) => {
      e.stopPropagation();
      animateClose(win);
    });
    
    if (btnMin) btnMin.addEventListener('click', (e) => {
      e.stopPropagation();
      animateMinimize(win);
    });
    
    if (btnMax) btnMax.addEventListener('click', (e) => {
      e.stopPropagation();
      win.classList.toggle('maximized');
      bringToFront(win);
    });
  });
  
  // 3. Draggable Logic with Window Snapping
  let isDragging = false;
  let dragTarget = null;
  let startX, startY, initialLeft, initialTop;
  const snapPreview = document.getElementById('snap-preview');
  const SNAP_EDGE = 12; // px from edge to trigger snap

  function getSnapZone(x, y) {
    const w = window.innerWidth;
    if (y <= 5) return 'top';           // drag to very top → maximize
    if (x <= SNAP_EDGE) return 'left';  // drag to left edge → snap left
    if (x >= w - SNAP_EDGE) return 'right'; // drag to right edge → snap right
    return null;
  }

  function showSnapPreview(zone) {
    if (!snapPreview) return;
    snapPreview.className = zone ? `visible snap-${zone}` : '';
  }

  function clearSnap(win) {
    win.classList.remove('snapped-left', 'snapped-right');
  }
  
  document.addEventListener('mousedown', (e) => {
    // Only drag by title bar
    const titleBar = e.target.closest('.os-title-bar');
    if (!titleBar) return;
    
    // Don't drag if clicking buttons
    if (e.target.closest('.traffic-lights')) return;
    
    dragTarget = titleBar.closest('.os-window');
    if (!dragTarget) return;

    // If window is maximized or snapped, un-snap on drag start
    if (dragTarget.classList.contains('maximized') || dragTarget.classList.contains('snapped-left') || dragTarget.classList.contains('snapped-right')) {
      dragTarget.classList.remove('maximized', 'snapped-left', 'snapped-right');
      // Re-center window under cursor
      const winWidth = 900;
      const winHeight = Math.round(window.innerHeight * 0.65);
      dragTarget.style.width = Math.min(winWidth, window.innerWidth * 0.9) + 'px';
      dragTarget.style.height = winHeight + 'px';
      dragTarget.style.left = (e.clientX - Math.min(winWidth, window.innerWidth * 0.9) / 2) + 'px';
      dragTarget.style.top = e.clientY + 'px';
    }
    
    isDragging = true;
    bringToFront(dragTarget);
    
    // Get initial exact px rect instead of percentages
    const rect = dragTarget.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;
    startX = e.clientX;
    startY = e.clientY;
    
    // Set position absolute properly mapped to top/left pixels for dragging
    dragTarget.style.transform = 'none';
    dragTarget.style.margin = '0';
    dragTarget.style.left = initialLeft + 'px';
    dragTarget.style.top = initialTop + 'px';
    
    // Prevent text selection
    document.body.style.userSelect = 'none';
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging || !dragTarget) return;
    
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    let newLeft = initialLeft + dx;
    let newTop = initialTop + dy;
    
    // Prevent dragging off top screen (under menu bar)
    if (newTop < 32) newTop = 32;
    
    dragTarget.style.left = newLeft + 'px';
    dragTarget.style.top = newTop + 'px';

    // Show snap preview
    const zone = getSnapZone(e.clientX, e.clientY);
    showSnapPreview(zone);
  });
  
  document.addEventListener('mouseup', (e) => {
    if (isDragging && dragTarget) {
      const zone = getSnapZone(e.clientX, e.clientY);
      if (zone === 'left') {
        clearSnap(dragTarget);
        dragTarget.classList.add('snapped-left');
        dragTarget.style.left = '';
        dragTarget.style.top = '';
        dragTarget.style.width = '';
        dragTarget.style.height = '';
      } else if (zone === 'right') {
        clearSnap(dragTarget);
        dragTarget.classList.add('snapped-right');
        dragTarget.style.left = '';
        dragTarget.style.top = '';
        dragTarget.style.width = '';
        dragTarget.style.height = '';
      } else if (zone === 'top') {
        clearSnap(dragTarget);
        dragTarget.classList.add('maximized');
      }
    }
    showSnapPreview(null);
    isDragging = false;
    dragTarget = null;
    document.body.style.userSelect = '';
  });

  // ── Touch-based window dragging ──────────────────────────────────────
  document.addEventListener('touchstart', (e) => {
    const titleBar = e.target.closest('.os-title-bar');
    if (!titleBar) return;
    if (e.target.closest('.traffic-lights')) return;

    dragTarget = titleBar.closest('.os-window');
    if (!dragTarget) return;

    // Un-snap if needed
    if (dragTarget.classList.contains('maximized') || dragTarget.classList.contains('snapped-left') || dragTarget.classList.contains('snapped-right')) {
      dragTarget.classList.remove('maximized', 'snapped-left', 'snapped-right');
      const touch = e.touches[0];
      const winWidth = Math.min(900, window.innerWidth * 0.9);
      const winHeight = Math.round(window.innerHeight * 0.65);
      dragTarget.style.width = winWidth + 'px';
      dragTarget.style.height = winHeight + 'px';
      dragTarget.style.left = (touch.clientX - winWidth / 2) + 'px';
      dragTarget.style.top = touch.clientY + 'px';
    }

    isDragging = true;
    bringToFront(dragTarget);

    const touch = e.touches[0];
    const rect = dragTarget.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;
    startX = touch.clientX;
    startY = touch.clientY;

    dragTarget.style.transform = 'none';
    dragTarget.style.margin = '0';
    dragTarget.style.left = initialLeft + 'px';
    dragTarget.style.top = initialTop + 'px';
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging || !dragTarget) return;

    const touch = e.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    let newLeft = initialLeft + dx;
    let newTop = initialTop + dy;
    if (newTop < 32) newTop = 32;

    dragTarget.style.left = newLeft + 'px';
    dragTarget.style.top = newTop + 'px';

    // Prevent page scroll while dragging a window
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchend', () => {
    if (isDragging && dragTarget) {
      // No snap on touch — just drop in place
    }
    showSnapPreview(null);
    isDragging = false;
    dragTarget = null;
    document.body.style.userSelect = '';
  });
  
  // 4. Dock Logic
  dockItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetId = item.dataset.target;
      if (!targetId) return;
      
      const win = document.getElementById(targetId);
      if (!win) return;
      
      if (win.classList.contains('hidden')) {
        animateOpen(win);
        bringToFront(win);
        lazyLoadIframe(win);
      } else if (win.classList.contains('minimized')) {
        animateRestore(win);
        bringToFront(win);
        lazyLoadIframe(win);
      } else {
        // If it's already active and in front, minimize it
        if (win.classList.contains('active')) {
          animateMinimize(win);
        } else {
          bringToFront(win);
        }
      }
    });
  });

  function openIcon(icon) {
    const targetId = icon.dataset.target;
    const win = document.getElementById(targetId);
    if (!win) return;
    
    if (win.classList.contains('minimized')) {
      animateRestore(win);
    } else if (win.classList.contains('hidden')) {
      animateOpen(win);
    }
    bringToFront(win);
    lazyLoadIframe(win);
    
    // If it's a folder targeting a section in Safari (the portfolio window)
    if (icon.classList.contains('desktop-folder') && targetId === 'portfolio-window') {
      const targetSection = icon.dataset.targetSection;
      setTimeout(() => {
        const osContent = win.querySelector('.os-content');
        const sectionEl = win.querySelector(`#${targetSection}`);
        if (sectionEl && osContent) {
           osContent.scrollTo({
             top: sectionEl.offsetTop - 60, // offset for navbar
             behavior: 'smooth'
           });
        }
      }, 100);
    }
  }

  // 5. Desktop Icons (Folders & Files)
  const desktopIcons = document.querySelectorAll('.desktop-folder, .desktop-file');
  desktopIcons.forEach(icon => {
    // Desktop: Double Click
    icon.addEventListener('dblclick', () => openIcon(icon));

    // Mobile/Touch: Single tap support
    icon.addEventListener('click', (e) => {
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      if (isTouch) enableIconTap(icon);
    });

    function enableIconTap(icon) {
      openIcon(icon);
    }

    icon.addEventListener('mousedown', (e) => {
      e.preventDefault(); // Prevents text selection
      desktopIcons.forEach(f => f.style.background = '');
      icon.style.background = 'rgba(255, 255, 255, 0.2)';
      e.stopPropagation();
    });
  });

  // Listen for apps opened via Spotlight
  document.addEventListener('open-app', (e) => {
    const win = document.getElementById(e.detail.id);
    if (win) {
      if (win.classList.contains('minimized')) {
        animateRestore(win);
      } else if (win.classList.contains('hidden')) {
        animateOpen(win);
      }
      bringToFront(win);
      lazyLoadIframe(win);
    }
  });

  // Lazy-load iframes on first window open
  function lazyLoadIframe(win) {
    const iframe = win.querySelector('.lazy-iframe');
    if (iframe && !iframe.src && iframe.dataset.src) {
      iframe.src = iframe.dataset.src;
      iframe.classList.remove('lazy-iframe');
    }
  }

  // 6. Resume Download Logic
  const downloadBtn = document.getElementById('download-resume-btn');
  const mobileOpenBtn = document.getElementById('mobile-open-resume');
  
  function downloadResume() {
    const link = document.createElement('a');
    link.href = 'assets/resume.pdf';
    link.download = 'Himalaya_Gupta_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      downloadResume();
    });
  }

  if (mobileOpenBtn) {
    mobileOpenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.open('assets/resume.pdf', '_blank');
    });
  }

  // Click desktop to deselect icons
  document.body.addEventListener('mousedown', (e) => {
    if (!e.target.closest('.desktop-folder') && !e.target.closest('.desktop-file')) {
      desktopIcons.forEach(f => f.style.background = '');
    }
  });

  // We can position the portfolio window slightly offset
  const guiWin = document.getElementById('portfolio-window');
  if (guiWin) {
    guiWin.style.transform = 'none';
    guiWin.style.left = '10%';
    guiWin.style.top = '10%';
  }
});
