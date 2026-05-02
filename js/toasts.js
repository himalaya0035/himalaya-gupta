/**
 * toasts.js
 * macOS-style notification toast system:
 * - Slide-in from right with stacking
 * - Auto-dismiss after timeout
 * - Click to dismiss or trigger action
 * - Welcome / contextual notifications on load
 */
(() => {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const TOAST_DURATION = 5000; // ms before auto-dismiss
  const TOAST_STAGGER = 2000;  // ms between sequential toasts
  const MAX_TOASTS = 3;       // max visible at once

  /**
   * Show a toast notification.
   * @param {Object} opts
   * @param {string} opts.icon - Emoji or short text for the icon
   * @param {string} opts.app - App name label (e.g. "Terminal", "System")
   * @param {string} opts.title - Bold title text
   * @param {string} opts.message - Body message
   * @param {Function} [opts.onClick] - Optional click handler
   * @param {number} [opts.duration] - Override auto-dismiss time (ms)
   */
  function showToast(opts) {
    const toast = document.createElement('div');
    toast.className = 'toast';

    const escHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    toast.innerHTML = `
      <div class="toast-icon">${opts.icon || '🔔'}</div>
      <div class="toast-body">
        <div class="toast-app">${escHtml(opts.app || 'System')}</div>
        <div class="toast-title">${escHtml(opts.title || '')}</div>
        <div class="toast-message">${escHtml(opts.message || '')}</div>
      </div>
      <div class="toast-time">now</div>
    `;

    // Click to dismiss (and optionally trigger action)
    toast.addEventListener('click', () => {
      dismissToast(toast);
      if (typeof opts.onClick === 'function') opts.onClick();
    });

    container.appendChild(toast);

    // Enforce max visible toasts — dismiss oldest if over limit
    const visible = container.querySelectorAll('.toast:not(.dismissing)');
    if (visible.length > MAX_TOASTS) {
      dismissToast(visible[0]);
    }

    // Auto-dismiss
    const duration = opts.duration || TOAST_DURATION;
    setTimeout(() => dismissToast(toast), duration);
  }

  function dismissToast(toast) {
    if (toast.classList.contains('dismissing')) return;
    toast.classList.add('dismissing');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }

  // Expose globally
  window.showToast = showToast;

  // ── Welcome Toasts on First Load ──────────────────────────────────────
  function showWelcomeToasts() {
    const C = window.CONTENT || {};
    const hasSeenWelcome = localStorage.getItem('welcomeToastsShown');
    if (hasSeenWelcome) return;
    localStorage.setItem('welcomeToastsShown', '1');

    const toasts = [
      {
        icon: '👋',
        app: 'System',
        title: `Welcome to ${C.name || 'my'}'s Desktop`,
        message: 'Explore the dock, open apps, or use Ctrl+K to search anything.',
      },
      {
        icon: '⌨️',
        app: 'Terminal',
        title: 'Open Terminal',
        message: 'Type "help" to explore my skills, experience & projects.',
        onClick: () => {
          const win = document.getElementById('terminal-window');
          if (win) {
            win.classList.remove('hidden', 'minimized');
            document.dispatchEvent(new CustomEvent('open-app', { detail: { id: 'terminal-window' } }));
          }
        }
      },
      {
        icon: '💬',
        app: 'Messages',
        title: 'Send me a message',
        message: 'Ask me about my work, stack, or anything — I reply instantly.',
        onClick: () => {
          const win = document.getElementById('imessage-window');
          if (win) {
            win.classList.remove('hidden', 'minimized');
            document.dispatchEvent(new CustomEvent('open-app', { detail: { id: 'imessage-window' } }));
          }
        }
      }
    ];

    // Stagger the toasts: first at 1.5s, then +2s each
    toasts.forEach((t, i) => {
      setTimeout(() => showToast(t), 1500 + i * TOAST_STAGGER);
    });
  }

  // Wait for lock screen to dismiss, then show toasts within 1s
  function waitForBootThenShow() {
    const lockScreen = document.getElementById('lock-screen');
    if (lockScreen && !lockScreen.classList.contains('hidden')) {
      const observer = new MutationObserver(() => {
        if (lockScreen.classList.contains('hidden')) {
          observer.disconnect();
          setTimeout(showWelcomeToasts, 400);
        }
      });
      observer.observe(lockScreen, { attributes: true, attributeFilter: ['class'] });
    } else {
      // No lock screen — show almost immediately
      setTimeout(showWelcomeToasts, 600);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForBootThenShow);
  } else {
    waitForBootThenShow();
  }
})();
