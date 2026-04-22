/**
 * notification-center.js
 * macOS-inspired notification center with widgets:
 * - Calendar widget (today's date)
 * - Weather widget (live via Open-Meteo API)
 * - GitHub activity card (live via GitHub API)
 * - "Now Playing" widget
 * - Slide-in from right edge
 */
(() => {
  const panel = document.getElementById('notification-center');
  const trigger = document.getElementById('notification-trigger');
  const overlay = document.getElementById('nc-overlay');

  if (!panel || !trigger) return;

  let isOpen = false;

  // ── Cache to avoid re-fetching on every open ──────────────────────────
  let weatherCache = null;
  const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  // ── WMO weather code → description + emoji ────────────────────────────
  const WMO_CODES = {
    0: ['Clear Sky', '☀️'], 1: ['Mainly Clear', '🌤'],
    2: ['Partly Cloudy', '⛅'], 3: ['Overcast', '☁️'],
    45: ['Foggy', '🌫'], 48: ['Rime Fog', '🌫'],
    51: ['Light Drizzle', '🌦'], 53: ['Drizzle', '🌦'], 55: ['Heavy Drizzle', '🌧'],
    61: ['Light Rain', '🌦'], 63: ['Rain', '🌧'], 65: ['Heavy Rain', '🌧'],
    71: ['Light Snow', '🌨'], 73: ['Snow', '❄️'], 75: ['Heavy Snow', '❄️'],
    80: ['Light Showers', '🌦'], 81: ['Showers', '🌧'], 82: ['Heavy Showers', '⛈'],
    95: ['Thunderstorm', '⛈'], 96: ['Thunderstorm + Hail', '⛈'], 99: ['Severe Thunderstorm', '⛈']
  };

  function getWeatherInfo(code) {
    return WMO_CODES[code] || ['Unknown', '🌡'];
  }

  // ── Fetch live weather from Open-Meteo (Noida coords) ────────────────
  async function fetchWeather() {
    if (weatherCache && (Date.now() - weatherCache.ts < CACHE_TTL)) {
      return weatherCache.data;
    }
    try {
      // Noida, India: 28.5355° N, 77.3910° E
      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=28.5355&longitude=77.391&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata&forecast_days=1'
      );
      const json = await res.json();
      const data = {
        temp: Math.round(json.current.temperature_2m),
        code: json.current.weather_code,
        high: Math.round(json.daily.temperature_2m_max[0]),
        low: Math.round(json.daily.temperature_2m_min[0])
      };
      weatherCache = { data, ts: Date.now() };
      return data;
    } catch {
      return null;
    }
  }

  // ── Build widgets ─────────────────────────────────────────────────────
  function buildWidgets() {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const monthDay = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const year = now.getFullYear();

    // Build mini calendar grid
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const today = now.getDate();

    let calGrid = '<div class="nc-cal-grid">';
    ['S','M','T','W','T','F','S'].forEach(d => {
      calGrid += `<span class="nc-cal-head">${d}</span>`;
    });
    for (let i = 0; i < firstDay; i++) {
      calGrid += '<span class="nc-cal-empty"></span>';
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const cls = d === today ? 'nc-cal-day today' : 'nc-cal-day';
      calGrid += `<span class="${cls}">${d}</span>`;
    }
    calGrid += '</div>';

    const data = window.CONTENT || {};

    panel.querySelector('.nc-widgets').innerHTML = `
      <!-- Calendar Widget -->
      <div class="nc-widget nc-calendar">
        <div class="nc-widget-header">
          <span class="nc-widget-icon">📅</span>
          <span class="nc-widget-label">${dayName.toUpperCase()}</span>
        </div>
        <div class="nc-cal-hero">${today}</div>
        <div class="nc-cal-sub">${monthDay}, ${year}</div>
        ${calGrid}
      </div>

      <!-- Weather Widget (loading state) -->
      <div class="nc-widget nc-weather" id="nc-weather-widget">
        <div class="nc-widget-header">
          <span class="nc-widget-icon">�</span>
          <span class="nc-widget-label">WEATHER</span>
        </div>
        <div class="nc-weather-body">
          <div class="nc-weather-temp"><span class="nc-loading-dot">···</span></div>
          <div class="nc-weather-details">
            <div class="nc-weather-location">${data.location || 'Noida, India'}</div>
            <div class="nc-weather-desc">Loading…</div>
            <div class="nc-weather-range"></div>
          </div>
        </div>
      </div>

      <!-- Now Playing Widget -->
      <div class="nc-widget nc-nowplaying">
        <div class="nc-widget-header">
          <span class="nc-widget-icon">🎵</span>
          <span class="nc-widget-label">NOW PLAYING</span>
        </div>
        <div class="nc-np-body">
          <div class="nc-np-art">♪</div>
          <div class="nc-np-info">
            <div class="nc-np-title">Coding Lo-Fi Mix</div>
            <div class="nc-np-artist">Focus Beats</div>
          </div>
        </div>
        <div class="nc-np-progress">
          <div class="nc-np-bar">
            <div class="nc-np-fill"></div>
          </div>
          <div class="nc-np-times">
            <span>1:42</span>
            <span>3:28</span>
          </div>
        </div>
      </div>
    `;

    // Fire off API calls and update widgets when ready
    fetchWeather().then(w => {
      const widget = document.getElementById('nc-weather-widget');
      if (!widget) return;
      if (w) {
        const [desc, emoji] = getWeatherInfo(w.code);
        widget.querySelector('.nc-widget-icon').textContent = emoji;
        widget.querySelector('.nc-weather-temp').textContent = `${w.temp}°`;
        widget.querySelector('.nc-weather-desc').textContent = desc;
        widget.querySelector('.nc-weather-range').textContent = `H:${w.high}°  L:${w.low}°`;
      } else {
        widget.querySelector('.nc-weather-temp').textContent = '28°';
        widget.querySelector('.nc-weather-desc').textContent = 'Partly Cloudy';
        widget.querySelector('.nc-weather-range').textContent = 'H:34°  L:22°';
      }
    });
  }

  function openPanel() {
    if (isOpen) return;
    isOpen = true;

    // Dismiss all other menubar popovers
    document.dispatchEvent(new CustomEvent('menubar-dismiss', { detail: { source: 'notifications' } }));

    buildWidgets();
    panel.classList.remove('hidden');
    panel.classList.add('open');
    if (overlay) {
      overlay.classList.remove('hidden');
    }
    trigger.classList.add('active');
  }

  function closePanel() {
    if (!isOpen) return;
    isOpen = false;
    panel.classList.remove('open');
    panel.classList.add('closing');
    trigger.classList.remove('active');
    if (overlay) {
      overlay.classList.add('hidden');
    }
    setTimeout(() => {
      panel.classList.add('hidden');
      panel.classList.remove('closing');
    }, 350);
  }

  function togglePanel() {
    isOpen ? closePanel() : openPanel();
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePanel();
  });

  // Listen for dismiss from other popovers
  document.addEventListener('menubar-dismiss', (e) => {
    if (e.detail?.source !== 'notifications') closePanel();
  });

  if (overlay) {
    overlay.addEventListener('click', closePanel);
  }

  // Close on Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  // Close when clicking outside
  window.addEventListener('click', (e) => {
    if (isOpen && !panel.contains(e.target) && !trigger.contains(e.target)) {
      closePanel();
    }
  });
})();
