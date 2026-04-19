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
  const timeDisplay = document.getElementById('topbar-time');
  const appNameDisplay = document.getElementById('topbar-app-name');
  
  // 1. Clock updates
  function updateTime() {
    if (!timeDisplay) return;
    const now = new Date();
    const opts = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
    timeDisplay.textContent = now.toLocaleDateString('en-US', opts).replace(/,/g, '');
  }
  setInterval(updateTime, 1000);
  updateTime();
  
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
    
    // Window Controls
    const btnClose = win.querySelector('.dot-red');
    const btnMin = win.querySelector('.dot-yellow');
    const btnMax = win.querySelector('.dot-green');
    
    if (btnClose) btnClose.addEventListener('click', (e) => {
      e.stopPropagation();
      win.classList.add('hidden');
      win.classList.remove('active');
      
      // Remove indicator from dock
      const dockItem = document.querySelector(`.dock button.icon[data-target="${win.id}"]`);
      if (dockItem) {
        dockItem.classList.remove('active');
        const point = dockItem.querySelector('.point');
        if (point) point.classList.add('hidden');
      }
    });
    
    if (btnMin) btnMin.addEventListener('click', (e) => {
      e.stopPropagation();
      win.classList.add('minimized');
      win.classList.remove('active');
    });
    
    if (btnMax) btnMax.addEventListener('click', (e) => {
      e.stopPropagation();
      win.classList.toggle('maximized');
      bringToFront(win);
    });
  });
  
  // 3. Draggable Logic
  let isDragging = false;
  let dragTarget = null;
  let startX, startY, initialLeft, initialTop;
  
  document.addEventListener('mousedown', (e) => {
    // Only drag by title bar
    const titleBar = e.target.closest('.os-title-bar');
    if (!titleBar) return;
    
    // Don't drag if clicking buttons
    if (e.target.closest('.traffic-lights')) return;
    
    dragTarget = titleBar.closest('.os-window');
    if (!dragTarget || dragTarget.classList.contains('maximized')) return;
    
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
  });
  
  document.addEventListener('mouseup', () => {
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
      
      // If hidden or minimized, show it
      if (win.classList.contains('hidden') || win.classList.contains('minimized')) {
        win.classList.remove('hidden');
        win.classList.remove('minimized');
        bringToFront(win);
      } else {
        // If it's already active and in front, minimize it
        if (win.classList.contains('active')) {
          win.classList.add('minimized');
          win.classList.remove('active');
        } else {
          // Bring to front
          bringToFront(win);
        }
      }
    });

    // Slight bounce animation on click
    item.addEventListener('mousedown', () => {
      item.style.transform = 'scale(0.9)';
    });
    item.addEventListener('mouseup', () => {
      item.style.transform = '';
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
    });
  });

  function openIcon(icon) {
    const targetId = icon.dataset.target;
    const win = document.getElementById(targetId);
    if (!win) return;
    
    win.classList.remove('hidden');
    win.classList.remove('minimized');
    bringToFront(win);
    
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
