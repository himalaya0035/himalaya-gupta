/**
 * lockscreen.js
 * macOS-inspired lock screen:
 * - Blurred wallpaper background
 * - Clock, avatar, password field
 * - Any password unlocks
 * - Triggered from HG menu or Ctrl+Alt+Q
 */
(() => {
  const lockScreen = document.getElementById('lock-screen');
  if (!lockScreen) return;

  let clockInterval = null;

  function updateClock() {
    const timeEl = document.getElementById('lock-time');
    const dateEl = document.getElementById('lock-date');
    if (!timeEl || !dateEl) return;
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  function show() {
    lockScreen.classList.remove('hidden');
    lockScreen.classList.remove('unlock-animation');
    updateClock();
    clockInterval = setInterval(updateClock, 1000);

    // Sync wallpaper
    const saved = localStorage.getItem('desktopWallpaper') || 'assets/background.webp';
    const wp = lockScreen.querySelector('.lock-wallpaper');
    if (wp) wp.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('${saved}')`;

    setTimeout(() => {
      const input = document.getElementById('lock-password');
      if (input) { input.value = ''; input.focus(); }
    }, 300);
  }

  function hide() {
    lockScreen.classList.add('unlock-animation');
    if (clockInterval) clearInterval(clockInterval);
    setTimeout(() => {
      lockScreen.classList.add('hidden');
      lockScreen.classList.remove('unlock-animation');
    }, 600);
  }

  // Form submit
  const form = document.getElementById('lock-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('lock-password');
      if (!input.value.trim()) {
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
        return;
      }
      hide();
    });
  }

  // Keyboard shortcut
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey && e.altKey && e.key === 'q') || (e.ctrlKey && e.metaKey && e.key === 'q')) {
      e.preventDefault();
      show();
    }
  });

  window.LockScreen = { show, hide, isVisible: () => !lockScreen.classList.contains('hidden') };
})();
