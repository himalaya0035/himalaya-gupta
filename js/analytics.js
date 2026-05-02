/**
 * analytics.js
 * Comprehensive GA4 event tracking for every portfolio interaction.
 */
(() => {
  function track(eventName, params) {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params);
    }
  }

  // ── Helper: track first open of any window ────────────────────────────
  const trackedWindows = new Set();
  function trackWindowOpen(winId) {
    const appName = winId.replace('-window', '');
    track('app_open', { app_id: winId, app_name: appName });
    if (!trackedWindows.has(winId)) {
      trackedWindows.add(winId);
      track('app_first_open', { app_id: winId, app_name: appName });
    }
  }

  // ── App open via custom event (dock, spotlight, desktop icons) ────────
  document.addEventListener('open-app', (e) => {
    trackWindowOpen(e.detail?.id || 'unknown');
  });

  // ── Dock clicks ───────────────────────────────────────────────────────
  document.querySelectorAll('.dock button.icon').forEach(btn => {
    btn.addEventListener('click', () => {
      track('dock_click', {
        app: btn.dataset.target || 'unknown',
        label: btn.dataset.title || 'unknown'
      });
    });
  });

  // ── Desktop icon double-clicks ────────────────────────────────────────
  document.querySelectorAll('.desktop-folder, .desktop-file').forEach(icon => {
    icon.addEventListener('dblclick', () => {
      track('desktop_icon_open', {
        target: icon.dataset.target || 'unknown'
      });
    });
  });

  // ── Terminal commands ─────────────────────────────────────────────────
  const cmdInput = document.getElementById('cmd-input');
  if (cmdInput) {
    cmdInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && cmdInput.value.trim()) {
        track('terminal_command', { command: cmdInput.value.trim() });
      }
    });
  }

  // ── Spotlight ─────────────────────────────────────────────────────────
  const spotlightInput = document.getElementById('spotlight-input');
  if (spotlightInput) {
    let debounce = null;
    spotlightInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const q = spotlightInput.value.trim();
        if (q.length >= 2) {
          track('spotlight_search', { query: q });
        }
      }, 800);
    });
  }

  // Track spotlight result clicks
  document.addEventListener('click', (e) => {
    const item = e.target.closest('.spotlight-result-item');
    if (item) {
      const name = item.querySelector('.result-name')?.textContent || 'unknown';
      const type = item.querySelector('.result-type, .result-subtitle')?.textContent || '';
      track('spotlight_select', { result_name: name, result_type: type });
    }
  });

  // ── Theme changes ─────────────────────────────────────────────────────
  const origApplyTheme = window.applyTheme;
  if (origApplyTheme) {
    window.applyTheme = function(name) {
      const prev = window.currentTheme ? window.currentTheme() : 'unknown';
      const result = origApplyTheme(name);
      if (result) track('theme_change', { from: prev, to: name });
      return result;
    };
  }

  // ── Wallpaper changes ─────────────────────────────────────────────────
  const origSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function(key, value) {
    origSetItem(key, value);
    if (key === 'desktopWallpaper') {
      track('wallpaper_change', { wallpaper: value });
    }
  };

  // ── iMessage ──────────────────────────────────────────────────────────
  const sendBtn = document.getElementById('imsg-send');
  const msgInput = document.getElementById('imsg-input');
  if (sendBtn && msgInput) {
    sendBtn.addEventListener('click', () => {
      if (msgInput.value.trim()) {
        track('message_sent', {
          length: msgInput.value.trim().length,
          text: msgInput.value.trim().substring(0, 100)
        });
      }
    });
    msgInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && msgInput.value.trim()) {
        track('message_sent', {
          length: msgInput.value.trim().length,
          text: msgInput.value.trim().substring(0, 100)
        });
      }
    });
  }

  // ── Calculator ────────────────────────────────────────────────────────
  document.addEventListener('click', (e) => {
    const calcBtn = e.target.closest('.calc-btn');
    if (calcBtn) {
      track('calculator_use', { button: calcBtn.textContent.trim() });
    }
  });

  // ── Finder ────────────────────────────────────────────────────────────
  document.addEventListener('click', (e) => {
    const sidebarItem = e.target.closest('#finder-sidebar .finder-sidebar-item');
    if (sidebarItem) {
      track('finder_navigate', {
        type: sidebarItem.dataset.type || 'link',
        name: sidebarItem.querySelector('.finder-item-name')?.textContent || 'unknown'
      });
    }
    const actionBtn = e.target.closest('#finder-main .finder-action-btn');
    if (actionBtn) {
      track('finder_link_click', {
        url: actionBtn.dataset.url || actionBtn.href || 'unknown',
        label: actionBtn.textContent.trim()
      });
    }
  });

  // ── System Preferences ────────────────────────────────────────────────
  document.addEventListener('click', (e) => {
    const paneCard = e.target.closest('.sp-pane-card');
    if (paneCard) {
      track('settings_pane_open', { pane: paneCard.dataset.pane || 'unknown' });
    }
    const wpItem = e.target.closest('.sp-wp-item');
    if (wpItem) {
      track('settings_wallpaper_select', { wallpaper: wpItem.dataset.path || 'unknown' });
    }
    const themeOpt = e.target.closest('.sp-theme-option');
    if (themeOpt) {
      track('settings_theme_select', { theme: themeOpt.dataset.theme || 'unknown' });
    }
  });

  // ── GitHub Stats ──────────────────────────────────────────────────────
  const ghWin = document.getElementById('github-stats-window');
  if (ghWin) {
    const obs = new MutationObserver(() => {
      if (!ghWin.classList.contains('hidden')) {
        track('github_stats_viewed', {});
        obs.disconnect();
      }
    });
    obs.observe(ghWin, { attributes: true, attributeFilter: ['class'] });
  }

  // Track repo card clicks inside GitHub Stats
  document.addEventListener('click', (e) => {
    const repoCard = e.target.closest('.gs-repo-card');
    if (repoCard) {
      track('github_repo_click', {
        repo: repoCard.querySelector('.gs-repo-name')?.textContent || 'unknown',
        url: repoCard.href || ''
      });
    }
  });

  // ── Resume ────────────────────────────────────────────────────────────
  const resumeWin = document.getElementById('resume-window');
  if (resumeWin) {
    const obs = new MutationObserver(() => {
      if (!resumeWin.classList.contains('hidden')) {
        track('resume_viewed', {});
        obs.disconnect();
      }
    });
    obs.observe(resumeWin, { attributes: true, attributeFilter: ['class'] });
  }

  const dlBtn = document.getElementById('download-resume-btn');
  if (dlBtn) {
    dlBtn.addEventListener('click', () => {
      track('resume_downloaded', { method: 'button' });
    });
  }
  const mobileResumeBtn = document.getElementById('mobile-open-resume');
  if (mobileResumeBtn) {
    mobileResumeBtn.addEventListener('click', () => {
      track('resume_downloaded', { method: 'mobile_open' });
    });
  }

  // ── About window ──────────────────────────────────────────────────────
  const aboutWin = document.getElementById('about-window');
  if (aboutWin) {
    const obs = new MutationObserver(() => {
      if (!aboutWin.classList.contains('hidden')) {
        track('about_viewed', {});
        obs.disconnect();
      }
    });
    obs.observe(aboutWin, { attributes: true, attributeFilter: ['class'] });
  }

  // Track about sidebar link clicks
  document.addEventListener('click', (e) => {
    const aboutLink = e.target.closest('#about-window .about-link');
    if (aboutLink) {
      track('about_link_click', { url: aboutLink.href || 'unknown' });
    }
  });

  // ── Safari / Portfolio ────────────────────────────────────────────────
  const portfolioWin = document.getElementById('portfolio-window');
  if (portfolioWin) {
    const obs = new MutationObserver(() => {
      if (!portfolioWin.classList.contains('hidden')) {
        track('portfolio_viewed', {});
        obs.disconnect();
      }
    });
    obs.observe(portfolioWin, { attributes: true, attributeFilter: ['class'] });
  }

  // ── Notification center ───────────────────────────────────────────────
  const ncTrigger = document.getElementById('notification-trigger');
  if (ncTrigger) {
    ncTrigger.addEventListener('click', () => {
      track('notification_center_toggle', {});
    });
  }

  // ── Toast clicks ──────────────────────────────────────────────────────
  document.addEventListener('click', (e) => {
    const toast = e.target.closest('.toast');
    if (toast) {
      const title = toast.querySelector('.toast-title')?.textContent || 'unknown';
      track('toast_click', { title: title });
    }
  });

  // ── Lock screen unlock ────────────────────────────────────────────────
  const lockForm = document.getElementById('lock-form');
  if (lockForm) {
    lockForm.addEventListener('submit', () => {
      track('lock_screen_unlock', {});
    });
  }

  // ── Fullscreen prompt ─────────────────────────────────────────────────
  const fsBtn = document.getElementById('go-fullscreen-btn');
  if (fsBtn) {
    fsBtn.addEventListener('click', () => {
      track('fullscreen_accepted', {});
    });
  }
  const fsClose = document.getElementById('close-fullscreen-prompt');
  if (fsClose) {
    fsClose.addEventListener('click', () => {
      track('fullscreen_dismissed', {});
    });
  }

  // ── Context menu ──────────────────────────────────────────────────────
  document.addEventListener('click', (e) => {
    const ctxItem = e.target.closest('.ctx-item:not(.disabled)');
    if (ctxItem) {
      track('context_menu_click', { label: ctxItem.textContent.trim() });
    }
  });

  // ── Menu bar dropdowns ────────────────────────────────────────────────
  document.addEventListener('click', (e) => {
    const menuItem = e.target.closest('.menu-dropdown .menu-item:not(.disabled):not(.divider)');
    if (menuItem) {
      track('menubar_action', { label: menuItem.querySelector('span')?.textContent || 'unknown' });
    }
  });

  // ── External link clicks (catch-all) ──────────────────────────────────
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[target="_blank"]');
    if (link) {
      track('external_link', { url: link.href });
    }
  });

  // ── Window snapping ───────────────────────────────────────────────────
  const snapObserver = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      const win = m.target;
      if (win.classList.contains('snapped-left')) track('window_snap', { direction: 'left', app: win.id });
      if (win.classList.contains('snapped-right')) track('window_snap', { direction: 'right', app: win.id });
    });
  });
  document.querySelectorAll('.os-window').forEach(win => {
    snapObserver.observe(win, { attributes: true, attributeFilter: ['class'] });
  });

  // ── Mission control ───────────────────────────────────────────────────
  const mcOverlay = document.getElementById('mission-control-overlay');
  if (mcOverlay) {
    const obs = new MutationObserver(() => {
      if (mcOverlay.classList.contains('active')) {
        track('mission_control_open', {});
      }
    });
    obs.observe(mcOverlay, { attributes: true, attributeFilter: ['class'] });
  }

  // ── Session timing ────────────────────────────────────────────────────
  const sessionStart = Date.now();

  // Track engagement milestones
  [30, 60, 120, 300].forEach(sec => {
    setTimeout(() => {
      track('engagement_milestone', { seconds: sec });
    }, sec * 1000);
  });

  window.addEventListener('beforeunload', () => {
    const duration = Math.round((Date.now() - sessionStart) / 1000);
    track('session_end', { duration_seconds: duration });
  });
})();
