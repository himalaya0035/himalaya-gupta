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
  let githubCache = null;
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

  // ── Fetch GitHub stats ────────────────────────────────────────────────
  async function fetchGitHub() {
    if (githubCache && (Date.now() - githubCache.ts < CACHE_TTL)) {
      return githubCache.data;
    }
    try {
      const res = await fetch('https://api.github.com/users/himalaya0035');
      const json = await res.json();
      const data = {
        repos: json.public_repos,
        followers: json.followers,
        profileUrl: json.html_url,
        avatar: json.avatar_url
      };
      githubCache = { data, ts: Date.now() };
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

      <!-- GitHub Widget (loading state) -->
      <div class="nc-widget nc-github" id="nc-github-widget">
        <div class="nc-widget-header">
          <span class="nc-widget-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </span>
          <span class="nc-widget-label">GITHUB</span>
        </div>
        <div class="nc-github-body">
          <div class="nc-github-stat">
            <span class="nc-github-num">···</span>
            <span class="nc-github-desc">Repositories</span>
          </div>
          <div class="nc-github-stat">
            <span class="nc-github-num">···</span>
            <span class="nc-github-desc">Followers</span>
          </div>
          <div class="nc-github-stat">
            <span class="nc-github-num">⭐ 50+</span>
            <span class="nc-github-desc">Stars Earned</span>
          </div>
        </div>
        <a href="${data.contact?.github || '#'}" target="_blank" class="nc-github-link">View Profile →</a>
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

    fetchGitHub().then(gh => {
      const widget = document.getElementById('nc-github-widget');
      if (!widget) return;
      const stats = widget.querySelectorAll('.nc-github-num');
      if (gh) {
        stats[0].textContent = `${gh.repos}`;
        stats[1].textContent = `${gh.followers}`;
      } else {
        // Fallback to static
        stats[0].textContent = '50+';
        stats[1].textContent = '200+';
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
