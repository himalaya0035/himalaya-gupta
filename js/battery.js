/**
 * battery.js
 * macOS-inspired battery popover:
 * - Simulated battery that drains over time
 * - Recharges when tab is hidden (user switched away)
 * - Session uptime counter
 * - Screen time tracker
 * - Glassmorphic popover on click
 */
(() => {
  const batteryIcon = document.getElementById('battery-status');
  const popover = document.getElementById('battery-popover');
  if (!batteryIcon || !popover) return;

  // ── State ─────────────────────────────────────────────────────────────
  const SESSION_START = Date.now();
  let batteryLevel = 100;
  let isCharging = false;
  let isPopoverOpen = false;
  let drainInterval = null;
  let uiInterval = null;

  // ── Battery simulation ────────────────────────────────────────────────
  // Drains ~1% every 30s while active, charges ~2% every 30s while hidden
  function startDrain() {
    if (drainInterval) return;
    drainInterval = setInterval(() => {
      if (isCharging) {
        batteryLevel = Math.min(100, batteryLevel + 2);
      } else {
        batteryLevel = Math.max(5, batteryLevel - 1); // Never fully dies
      }
      updateBatteryIcon();
      if (isPopoverOpen) updatePopoverContent();
    }, 30000); // every 30 seconds
  }

  // Tab visibility — charge when away
  document.addEventListener('visibilitychange', () => {
    isCharging = document.hidden;
    updateBatteryIcon();
    if (isPopoverOpen) updatePopoverContent();
  });

  // ── Format helpers ────────────────────────────────────────────────────
  function formatDuration(ms) {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  function getBatteryColor() {
    if (batteryLevel > 50) return '#30d158'; // green
    if (batteryLevel > 20) return '#ffd60a'; // yellow
    return '#ff453a'; // red
  }

  function getTimeRemaining() {
    // At 1% per 30s drain, estimate remaining
    const minutesLeft = Math.round((batteryLevel - 5) * 0.5);
    if (minutesLeft <= 0) return 'Calculating…';
    const h = Math.floor(minutesLeft / 60);
    const m = minutesLeft % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')} remaining`;
    return `${m} min remaining`;
  }

  // ── Update the menu bar icon ──────────────────────────────────────────
  function updateBatteryIcon() {
    const fillWidth = Math.round((batteryLevel / 100) * 14);
    const color = getBatteryColor();
    const chargingBolt = isCharging
      ? `<svg width="8" height="10" viewBox="0 0 8 10" fill="${color}" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)"><path d="M5 0L1 5.5h2.5L3 10l4-5.5H4.5z"/></svg>`
      : '';

    batteryIcon.innerHTML = `
      <span style="font-size: 11px; margin-right: 4px;">${batteryLevel}%</span>
      <span style="position:relative;display:inline-flex;align-items:center;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect>
          <line x1="23" y1="13" x2="23" y2="11"></line>
          <rect x="3" y="8" width="${fillWidth}" height="8" fill="${color}" rx="1"></rect>
        </svg>
        ${chargingBolt}
      </span>
    `;
  }

  // ── Popover content ───────────────────────────────────────────────────
  function updatePopoverContent() {
    const now = Date.now();
    const uptime = formatDuration(now - SESSION_START);
    const color = getBatteryColor();
    const fillPct = batteryLevel;

    popover.innerHTML = `
      <div class="bp-header">
        <span class="bp-title">Battery</span>
        <span class="bp-pct" style="color: ${color}">${batteryLevel}%</span>
      </div>

      <div class="bp-bar-container">
        <div class="bp-bar-track">
          <div class="bp-bar-fill" style="width: ${fillPct}%; background: ${color};"></div>
        </div>
      </div>

      <div class="bp-status">
        ${isCharging
          ? '<span class="bp-charging">⚡ Charging — Tab Inactive</span>'
          : `<span class="bp-remaining">${getTimeRemaining()}</span>`
        }
      </div>

      <div class="bp-divider"></div>

      <div class="bp-row">
        <span class="bp-label">Power Source</span>
        <span class="bp-value">${isCharging ? 'Power Adapter' : 'Battery'}</span>
      </div>

      <div class="bp-row">
        <span class="bp-label">Session Uptime</span>
        <span class="bp-value">${uptime}</span>
      </div>
    `;
  }

  // ── Popover toggle ────────────────────────────────────────────────────
  function openPopover() {
    if (isPopoverOpen) return;
    isPopoverOpen = true;
    updatePopoverContent();
    popover.classList.remove('hidden');

    // Position below the battery icon
    const rect = batteryIcon.getBoundingClientRect();
    popover.style.right = `${window.innerWidth - rect.right}px`;
    popover.style.top = `${rect.bottom + 6}px`;

    // Live-update uptime every second while open
    uiInterval = setInterval(() => {
      if (isPopoverOpen) updatePopoverContent();
    }, 1000);
  }

  function closePopover() {
    if (!isPopoverOpen) return;
    isPopoverOpen = false;
    popover.classList.add('hidden');
    if (uiInterval) {
      clearInterval(uiInterval);
      uiInterval = null;
    }
  }

  function togglePopover() {
    isPopoverOpen ? closePopover() : openPopover();
  }

  // ── Events ────────────────────────────────────────────────────────────
  batteryIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePopover();
  });

  window.addEventListener('click', (e) => {
    if (isPopoverOpen && !popover.contains(e.target) && !batteryIcon.contains(e.target)) {
      closePopover();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isPopoverOpen) closePopover();
  });

  // ── Init ──────────────────────────────────────────────────────────────
  updateBatteryIcon();
  startDrain();
})();
