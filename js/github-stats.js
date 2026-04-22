/**
 * github-stats.js
 * GitHub Stats dashboard app:
 * - Profile info (avatar, bio, followers, repos)
 * - Contribution heatmap (last year)
 * - Top languages across repos
 * - Recent repositories
 * - All fetched live from GitHub APIs
 */
(() => {
  const container = document.getElementById('github-stats-root');
  if (!container) return;

  const USERNAME = 'himalaya0035';
  let hasLoaded = false;

  // ── Fetch helpers ─────────────────────────────────────────────────────
  async function fetchProfile() {
    const res = await fetch(`https://api.github.com/users/${USERNAME}`);
    return res.json();
  }

  async function fetchRepos() {
    const res = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`);
    return res.json();
  }

  async function fetchContributions() {
    try {
      const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`);
      const json = await res.json();
      return json.contributions || [];
    } catch {
      return [];
    }
  }

  // ── Contribution graph builder ────────────────────────────────────────
  function buildHeatmap(contributions) {
    if (!contributions.length) return '<div class="gs-empty">Could not load contributions</div>';

    const sorted = [...contributions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const last364 = sorted.slice(-364);
    const weeks = [];
    for (let i = 0; i < last364.length; i += 7) {
      weeks.push(last364.slice(i, i + 7));
    }

    const maxCount = Math.max(...last364.map(d => d.count), 1);
    const total = last364.reduce((s, d) => s + d.count, 0);

    function color(count) {
      if (count === 0) return 'rgba(255,255,255,0.04)';
      const i = count / maxCount;
      if (i < 0.25) return 'rgba(0, 255, 157, 0.2)';
      if (i < 0.5)  return 'rgba(0, 255, 157, 0.45)';
      if (i < 0.75) return 'rgba(0, 255, 157, 0.7)';
      return 'rgba(0, 255, 157, 1)';
    }

    const grid = weeks.map(w =>
      `<div class="gs-week">${w.map(d =>
        `<div class="gs-day" style="background:${color(d.count)}" title="${d.date}: ${d.count}"></div>`
      ).join('')}</div>`
    ).join('');

    return `
      <div class="gs-heatmap-header">${total.toLocaleString()} contributions in the last year</div>
      <div class="gs-heatmap-scroll">
        <div class="gs-heatmap">${grid}</div>
      </div>
    `;
  }

  // ── Language stats from repos ─────────────────────────────────────────
  function buildLanguages(repos) {
    const langCount = {};
    repos.forEach(r => {
      if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;
    });
    const sorted = Object.entries(langCount).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = sorted[0]?.[1] || 1;

    const colors = {
      JavaScript: '#f1e05a', TypeScript: '#3178c6', HTML: '#e34c26',
      CSS: '#563d7c', Python: '#3572A5', Shell: '#89e051',
      Go: '#00ADD8', Rust: '#dea584', Java: '#b07219', Ruby: '#701516'
    };

    return sorted.map(([lang, count]) => {
      const pct = Math.round((count / max) * 100);
      const c = colors[lang] || 'var(--acc, #00ff9d)';
      return `
        <div class="gs-lang-row">
          <span class="gs-lang-name"><span class="gs-lang-dot" style="background:${c}"></span>${lang}</span>
          <div class="gs-lang-bar"><div class="gs-lang-fill" style="width:${pct}%;background:${c}"></div></div>
          <span class="gs-lang-count">${count} repos</span>
        </div>
      `;
    }).join('');
  }

  // ── Recent repos ──────────────────────────────────────────────────────
  function buildRecentRepos(repos) {
    return repos.slice(0, 5).map(r => `
      <a href="${r.html_url}" target="_blank" class="gs-repo-card">
        <div class="gs-repo-name">${r.name}</div>
        <div class="gs-repo-desc">${r.description || 'No description'}</div>
        <div class="gs-repo-meta">
          ${r.language ? `<span class="gs-repo-lang"><span class="gs-lang-dot" style="background:${r.language === 'JavaScript' ? '#f1e05a' : r.language === 'TypeScript' ? '#3178c6' : 'var(--acc)'}"></span>${r.language}</span>` : ''}
          ${r.stargazers_count ? `<span>⭐ ${r.stargazers_count}</span>` : ''}
          ${r.forks_count ? `<span>🍴 ${r.forks_count}</span>` : ''}
        </div>
      </a>
    `).join('');
  }

  // ── Render dashboard ──────────────────────────────────────────────────
  async function render() {
    if (hasLoaded) return;
    hasLoaded = true;

    container.innerHTML = `
      <div class="gs-loading">
        <div class="spinner"></div>
        <p>Fetching GitHub data…</p>
      </div>
    `;

    try {
      const [profile, repos, contributions] = await Promise.all([
        fetchProfile(), fetchRepos(), fetchContributions()
      ]);

      const totalStars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
      const totalForks = repos.reduce((s, r) => s + (r.forks_count || 0), 0);

      container.innerHTML = `
        <!-- Profile Header -->
        <div class="gs-profile">
          <img src="${profile.avatar_url}" alt="${profile.login}" class="gs-avatar" />
          <div class="gs-profile-info">
            <div class="gs-profile-name">${profile.name || profile.login}</div>
            <div class="gs-profile-login">@${profile.login}</div>
            <div class="gs-profile-bio">${profile.bio || ''}</div>
            <a href="${profile.html_url}" target="_blank" class="gs-profile-link">View on GitHub →</a>
          </div>
        </div>

        <!-- Stats Row -->
        <div class="gs-stats-row">
          <div class="gs-stat-card">
            <div class="gs-stat-num">${profile.public_repos}</div>
            <div class="gs-stat-label">Repositories</div>
          </div>
          <div class="gs-stat-card">
            <div class="gs-stat-num">${totalStars}</div>
            <div class="gs-stat-label">Stars Earned</div>
          </div>
          <div class="gs-stat-card">
            <div class="gs-stat-num">${totalForks}</div>
            <div class="gs-stat-label">Forks</div>
          </div>
          <div class="gs-stat-card">
            <div class="gs-stat-num">${profile.followers}</div>
            <div class="gs-stat-label">Followers</div>
          </div>
        </div>

        <!-- Contribution Graph -->
        <div class="gs-section">
          <div class="gs-section-title">Contribution Activity</div>
          ${buildHeatmap(contributions)}
        </div>

        <!-- Two Column: Languages + Recent Repos -->
        <div class="gs-two-col">
          <div class="gs-section">
            <div class="gs-section-title">Top Languages</div>
            <div class="gs-languages">${buildLanguages(repos)}</div>
          </div>
          <div class="gs-section">
            <div class="gs-section-title">Recent Repositories</div>
            <div class="gs-repos">${buildRecentRepos(repos)}</div>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `
        <div class="gs-error">
          <p>Failed to load GitHub data. API rate limit may have been reached.</p>
          <a href="https://github.com/${USERNAME}" target="_blank" class="gs-fallback-link">View Profile on GitHub →</a>
        </div>
      `;
    }
  }

  // Load on first window open
  const win = document.getElementById('github-stats-window');
  if (win) {
    const observer = new MutationObserver(() => {
      if (!win.classList.contains('hidden')) {
        render();
        observer.disconnect();
      }
    });
    observer.observe(win, { attributes: true, attributeFilter: ['class'] });
  }
})();
