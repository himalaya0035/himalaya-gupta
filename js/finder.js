/**
 * finder.js
 * macOS Finder-style project showcase:
 * - Sidebar with project list
 * - Main panel with project details, tech stack, links
 * - Reads from window.CONTENT.projects
 */
(() => {
  const sidebar = document.getElementById('finder-sidebar');
  const main = document.getElementById('finder-main');
  if (!sidebar || !main) return;

  const C = window.CONTENT || {};
  const projects = C.projects || [];
  const experience = C.experience || [];

  function escHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ── Build sidebar ─────────────────────────────────────────────────────
  function buildSidebar() {
    let html = '<div class="finder-sidebar-section">';
    html += '<div class="finder-sidebar-label">Projects</div>';
    projects.forEach((p, i) => {
      html += `
        <div class="finder-sidebar-item ${i === 0 ? 'active' : ''}" data-type="project" data-index="${i}">
          <span class="finder-item-icon">📁</span>
          <span class="finder-item-name">${escHtml(p.name)}</span>
        </div>
      `;
    });
    html += '</div>';

    html += '<div class="finder-sidebar-section">';
    html += '<div class="finder-sidebar-label">Experience</div>';
    experience.forEach((e, i) => {
      html += `
        <div class="finder-sidebar-item" data-type="experience" data-index="${i}">
          <span class="finder-item-icon">💼</span>
          <span class="finder-item-name">${escHtml(e.company)}</span>
        </div>
      `;
    });
    html += '</div>';

    // Quick links
    html += '<div class="finder-sidebar-section">';
    html += '<div class="finder-sidebar-label">Quick Links</div>';
    if (C.contact?.github) {
      html += `<a href="${C.contact.github}" target="_blank" class="finder-sidebar-item finder-link"><span class="finder-item-icon">🐙</span><span class="finder-item-name">GitHub</span></a>`;
    }
    if (C.contact?.linkedin) {
      html += `<a href="${C.contact.linkedin}" target="_blank" class="finder-sidebar-item finder-link"><span class="finder-item-icon">🔗</span><span class="finder-item-name">LinkedIn</span></a>`;
    }
    if (C.contact?.email) {
      html += `<a href="mailto:${C.contact.email}" class="finder-sidebar-item finder-link"><span class="finder-item-icon">✉️</span><span class="finder-item-name">Email</span></a>`;
    }
    html += '</div>';

    sidebar.innerHTML = html;
  }

  // ── Render project detail ─────────────────────────────────────────────
  function renderProject(idx) {
    const p = projects[idx];
    if (!p) return;

    const techPills = (p.tech || []).map(t => `<span class="finder-tech-pill">${escHtml(t)}</span>`).join('');

    const links = [];
    if (p.links?.live) links.push({ url: p.links.live, label: '🌐 Live Demo' });
    if (p.links?.view) links.push({ url: p.links.view, label: '🌐 View' });
    if (p.links?.playground) links.push({ url: p.links.playground, label: '🎮 Playground' });
    if (p.links?.github) links.push({ url: p.links.github, label: '🐙 GitHub' });

    const linkBtns = links.map(l =>
      `<button class="finder-action-btn" data-url="${escHtml(l.url)}">${l.label}</button>`
    ).join('');

    main.innerHTML = `
      <div class="finder-detail">
        <div class="finder-detail-icon">📁</div>
        <h2 class="finder-detail-name">${escHtml(p.name)}</h2>
        <p class="finder-detail-desc">${escHtml(p.description)}</p>
        <div class="finder-detail-section">
          <div class="finder-detail-label">Tech Stack</div>
          <div class="finder-tech-pills">${techPills}</div>
        </div>
        ${links.length ? `
        <div class="finder-detail-section">
          <div class="finder-detail-label">Links</div>
          <div class="finder-action-btns">${linkBtns}</div>
        </div>` : ''}
      </div>
    `;

    // Open links inside Safari window (GitHub opens externally since it blocks iframes)
    main.querySelectorAll('.finder-action-btn[data-url]').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.dataset.url;
        if (url.includes('github.com')) {
          window.open(url, '_blank');
          return;
        }
        const safariWin = document.getElementById('portfolio-window');
        if (safariWin) {
          safariWin.classList.remove('hidden', 'minimized');
          document.dispatchEvent(new CustomEvent('open-app', { detail: { id: 'portfolio-window' } }));
        }
        setTimeout(() => {
          if (window.safariNavigate) window.safariNavigate(url);
        }, 150);
      });
    });
  }

  // ── Render experience detail ──────────────────────────────────────────
  function renderExperience(idx) {
    const e = experience[idx];
    if (!e) return;

    const highlights = (e.highlights || []).map(h => `<li>${escHtml(h)}</li>`).join('');

    main.innerHTML = `
      <div class="finder-detail">
        <div class="finder-detail-icon">💼</div>
        <h2 class="finder-detail-name">${escHtml(e.role)}</h2>
        <p class="finder-detail-desc">${escHtml(e.company)} · ${escHtml(e.period)}</p>
        <div class="finder-detail-section">
          <div class="finder-detail-label">Highlights</div>
          <ul class="finder-highlights">${highlights}</ul>
        </div>
      </div>
    `;
  }

  // ── Init ──────────────────────────────────────────────────────────────
  buildSidebar();
  if (projects.length) renderProject(0);

  sidebar.addEventListener('click', (e) => {
    const item = e.target.closest('.finder-sidebar-item');
    if (!item || item.classList.contains('finder-link')) return;

    sidebar.querySelectorAll('.finder-sidebar-item').forEach(el => el.classList.remove('active'));
    item.classList.add('active');

    const type = item.dataset.type;
    const idx = parseInt(item.dataset.index, 10);

    if (type === 'project') renderProject(idx);
    else if (type === 'experience') renderExperience(idx);
  });
})();
