/**
 * clock-popover.js
 * macOS-inspired clock dropdown:
 * - Large analog clock (SVG, ticking live)
 * - Digital time display
 * - Full calendar with month navigation
 * - World clocks (Noida, San Francisco, London, Tokyo)
 */
(() => {
  const trigger = document.getElementById('topbar-time');
  const popover = document.getElementById('clock-popover');
  if (!trigger || !popover) return;

  let isOpen = false;
  let tickInterval = null;
  let calYear, calMonth; // currently viewed month

  // ── Timezone helpers ──────────────────────────────────────────────────
  const WORLD_CLOCKS = [
    { city: 'Noida',         tz: 'Asia/Kolkata',        flag: '🇮🇳' },
    { city: 'San Francisco', tz: 'America/Los_Angeles',  flag: '🇺🇸' },
    { city: 'London',        tz: 'Europe/London',        flag: '🇬🇧' },
    { city: 'Tokyo',         tz: 'Asia/Tokyo',           flag: '🇯🇵' }
  ];

  function getTimeInTZ(tz) {
    return new Date().toLocaleTimeString('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }

  function getOffsetLabel(tz) {
    const now = new Date();
    const local = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const remote = new Date(now.toLocaleString('en-US', { timeZone: tz }));
    const diffH = Math.round((remote - local) / 3600000);
    if (diffH === 0) return 'Local';
    const sign = diffH > 0 ? '+' : '';
    return `${sign}${diffH}h`;
  }

  // ── Analog clock SVG ──────────────────────────────────────────────────
  function buildAnalogClock() {
    const now = new Date();
    const sec = now.getSeconds();
    const min = now.getMinutes() + sec / 60;
    const hr = (now.getHours() % 12) + min / 60;

    const secAngle = sec * 6;
    const minAngle = min * 6;
    const hrAngle = hr * 30;

    // Hour markers
    let markers = '';
    for (let i = 0; i < 12; i++) {
      const angle = i * 30;
      const isQuarter = i % 3 === 0;
      const len = isQuarter ? 8 : 4;
      const w = isQuarter ? 2 : 1;
      markers += `<line x1="50" y1="${10}" x2="50" y2="${10 + len}" 
        stroke="rgba(255,255,255,${isQuarter ? 0.7 : 0.3})" stroke-width="${w}" stroke-linecap="round"
        transform="rotate(${angle} 50 50)"/>`;
    }

    return `
      <svg viewBox="0 0 100 100" class="cp-analog-clock">
        <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        ${markers}
        <!-- Hour hand -->
        <line x1="50" y1="50" x2="50" y2="24" stroke="rgba(255,255,255,0.9)" stroke-width="3" stroke-linecap="round"
          transform="rotate(${hrAngle} 50 50)"/>
        <!-- Minute hand -->
        <line x1="50" y1="50" x2="50" y2="16" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round"
          transform="rotate(${minAngle} 50 50)"/>
        <!-- Second hand -->
        <line x1="50" y1="55" x2="50" y2="14" stroke="var(--acc, #00ff9d)" stroke-width="1" stroke-linecap="round"
          transform="rotate(${secAngle} 50 50)"/>
        <!-- Center dot -->
        <circle cx="50" cy="50" r="2.5" fill="var(--acc, #00ff9d)"/>
      </svg>
    `;
  }

  // ── Calendar grid ─────────────────────────────────────────────────────
  function buildCalendar(year, month) {
    const now = new Date();
    const today = now.getDate();
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    let grid = '';
    ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d => {
      grid += `<span class="cp-cal-head">${d}</span>`;
    });
    for (let i = 0; i < firstDay; i++) {
      grid += '<span class="cp-cal-empty"></span>';
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const cls = (isCurrentMonth && d === today) ? 'cp-cal-day today' : 'cp-cal-day';
      grid += `<span class="${cls}">${d}</span>`;
    }

    return `
      <div class="cp-cal-nav">
        <button class="cp-cal-arrow" id="cp-prev-month">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="cp-cal-month">${monthName}</span>
        <button class="cp-cal-arrow" id="cp-next-month">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div class="cp-cal-grid">${grid}</div>
    `;
  }

  // ── World clocks ──────────────────────────────────────────────────────
  function buildWorldClocks() {
    return WORLD_CLOCKS.map(wc => `
      <div class="cp-wc-row">
        <span class="cp-wc-city">${wc.flag} ${wc.city}</span>
        <span class="cp-wc-offset">${getOffsetLabel(wc.tz)}</span>
        <span class="cp-wc-time">${getTimeInTZ(wc.tz)}</span>
      </div>
    `).join('');
  }

  // ── Render full popover ───────────────────────────────────────────────
  function render() {
    const now = new Date();
    const digitalTime = now.toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
    });
    const digitalDate = now.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });

    popover.innerHTML = `
      <div class="cp-clock-section">
        ${buildAnalogClock()}
        <div class="cp-digital-time">${digitalTime}</div>
        <div class="cp-digital-date">${digitalDate}</div>
      </div>

      <div class="cp-divider"></div>

      <div class="cp-calendar-section">
        ${buildCalendar(calYear, calMonth)}
      </div>

      <div class="cp-divider"></div>

      <div class="cp-world-section">
        <div class="cp-section-label">WORLD CLOCK</div>
        ${buildWorldClocks()}
      </div>
    `;

    // Wire up month navigation
    const prev = document.getElementById('cp-prev-month');
    const next = document.getElementById('cp-next-month');
    if (prev) prev.addEventListener('click', (e) => {
      e.stopPropagation();
      calMonth--;
      if (calMonth < 0) { calMonth = 11; calYear--; }
      render();
    });
    if (next) next.addEventListener('click', (e) => {
      e.stopPropagation();
      calMonth++;
      if (calMonth > 11) { calMonth = 0; calYear++; }
      render();
    });
  }

  // ── Open / Close ──────────────────────────────────────────────────────
  function openPopover() {
    if (isOpen) return;
    isOpen = true;

    // Dismiss all other menubar popovers
    document.dispatchEvent(new CustomEvent('menubar-dismiss', { detail: { source: 'clock' } }));

    const now = new Date();
    calYear = now.getFullYear();
    calMonth = now.getMonth();

    render();
    popover.classList.remove('hidden');

    // Position below the time display, aligned right
    const rect = trigger.getBoundingClientRect();
    popover.style.right = `${window.innerWidth - rect.right}px`;
    popover.style.top = `${rect.bottom + 6}px`;

    // Tick every second for live clock
    tickInterval = setInterval(render, 1000);
  }

  function closePopover() {
    if (!isOpen) return;
    isOpen = false;
    popover.classList.add('hidden');
    if (tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
    }
  }

  function toggle() {
    isOpen ? closePopover() : openPopover();
  }

  // ── Events ────────────────────────────────────────────────────────────
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle();
  });

  // Listen for dismiss from other popovers
  document.addEventListener('menubar-dismiss', (e) => {
    if (e.detail?.source !== 'clock') closePopover();
  });

  window.addEventListener('click', (e) => {
    if (isOpen && !popover.contains(e.target) && !trigger.contains(e.target)) {
      closePopover();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closePopover();
  });
})();
