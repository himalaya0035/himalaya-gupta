/**
 * guestbook.js
 * Guest Book app — visitors leave a name + message.
 * Uses Firebase Firestore for persistence.
 * Falls back to localStorage if Firebase is not configured.
 */
(() => {
  const root = document.getElementById('guestbook-root');
  if (!root) return;

  const STORAGE_KEY = 'guestbook-entries';
  const MAX_NAME = 40;
  const MAX_MSG = 200;

  // ── Firebase config (replace with your own) ───────────────────────────
  // To enable Firebase:
  // 1. Add Firebase SDK scripts to index.html (before this script)
  // 2. Fill in your config below
  // 3. Set USE_FIREBASE = true
  const USE_FIREBASE = false;
  const FIREBASE_CONFIG = {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  };

  let db = null;
  if (USE_FIREBASE && FIREBASE_CONFIG.apiKey && typeof firebase !== 'undefined') {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.firestore();
  }

  function escHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function timeAgo(ts) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function getInitials(name) {
    return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  // ── Avatar colors based on name hash ──────────────────────────────────
  const AVATAR_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  function nameColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  // ── Local storage fallback ────────────────────────────────────────────
  function getLocalEntries() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch { return []; }
  }

  function saveLocalEntry(entry) {
    const entries = getLocalEntries();
    entries.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 100)));
  }

  // ── Render ────────────────────────────────────────────────────────────
  function render(entries) {
    const count = entries.length;

    // Sidebar: list of entries as preview cards
    const sidebarItems = entries.map((e, i) => {
      const preview = e.message.length > 50 ? e.message.substring(0, 50) + '…' : e.message;
      return `
        <div class="gb-sidebar-item ${i === 0 ? 'active' : ''}" data-index="${i}">
          <div class="gb-sidebar-name">${escHtml(e.name)}</div>
          <div class="gb-sidebar-preview">${escHtml(preview)}</div>
          <div class="gb-sidebar-time">${timeAgo(e.timestamp)}</div>
        </div>
      `;
    }).join('');

    root.innerHTML = `
      <div class="gb-layout">
        <div class="gb-sidebar">
          <div class="gb-sidebar-header">
            <span class="gb-sidebar-title">Messages</span>
            <span class="gb-sidebar-count">${count}</span>
          </div>
          <div class="gb-sidebar-list" id="gb-sidebar-list">
            <!-- New entry card (always first) -->
            <div class="gb-sidebar-item gb-new-item active" data-index="-1">
              <div class="gb-sidebar-name">✏️ New Message</div>
              <div class="gb-sidebar-preview">Leave a public message</div>
            </div>
            ${sidebarItems}
          </div>
        </div>
        <div class="gb-main" id="gb-main">
          <!-- Default: show form -->
          <div class="gb-form-view" id="gb-form-view">
            <div class="gb-form-header">
              <span class="gb-form-date">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <form class="gb-form" id="gb-form">
              <input type="text" id="gb-name" class="gb-input-mac" placeholder="Your name (optional)" maxlength="${MAX_NAME}" spellcheck="false" autocomplete="name">
              <div class="gb-textarea-wrap">
                <textarea id="gb-message" class="gb-textarea-mac" placeholder="Leave a public message for Himalaya..." maxlength="${MAX_MSG}" required rows="5" spellcheck="false"></textarea>
                <span class="gb-char-count-mac"><span id="gb-char">0</span>/${MAX_MSG}</span>
              </div>
              <div class="gb-form-actions">
                <button type="submit" class="gb-submit-mac" id="gb-submit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Send Message
                </button>
              </div>
            </form>
          </div>
          <!-- Detail view for reading entries -->
          <div class="gb-detail-view hidden" id="gb-detail-view"></div>
        </div>
      </div>
    `;

    // Wire form
    const form = document.getElementById('gb-form');
    const msgInput = document.getElementById('gb-message');
    const charCount = document.getElementById('gb-char');

    msgInput.addEventListener('input', () => {
      charCount.textContent = msgInput.value.length;
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSubmit();
    });

    // Wire sidebar clicks
    const sidebarList = document.getElementById('gb-sidebar-list');
    const formView = document.getElementById('gb-form-view');
    const detailView = document.getElementById('gb-detail-view');

    sidebarList.addEventListener('click', (e) => {
      const item = e.target.closest('.gb-sidebar-item');
      if (!item) return;

      sidebarList.querySelectorAll('.gb-sidebar-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');

      const idx = parseInt(item.dataset.index, 10);
      if (idx === -1) {
        // Show form
        formView.classList.remove('hidden');
        detailView.classList.add('hidden');
      } else {
        // Show entry detail
        const entry = entries[idx];
        if (!entry) return;
        const color = nameColor(entry.name);
        const initials = getInitials(entry.name);
        const date = new Date(entry.timestamp).toLocaleDateString('en-US', {
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
          hour: 'numeric', minute: '2-digit'
        });

        detailView.innerHTML = `
          <div class="gb-detail-date">${date}</div>
          <div class="gb-detail-card">
            <div class="gb-detail-avatar" style="background: ${color}">${initials}</div>
            <div class="gb-detail-name">${escHtml(entry.name)}</div>
            <div class="gb-detail-msg">${escHtml(entry.message)}</div>
          </div>
        `;
        formView.classList.add('hidden');
        detailView.classList.remove('hidden');
      }
    });
  }

  async function handleSubmit() {
    const nameEl = document.getElementById('gb-name');
    const msgEl = document.getElementById('gb-message');
    const btn = document.getElementById('gb-submit');

    const name = nameEl.value.trim() || 'Anonymous';
    const message = msgEl.value.trim();
    if (!message) return;

    // Profanity check (uses shared filter from imessage.js)
    if (window.profanityFilter) {
      if (window.profanityFilter.isAbusive(name) || window.profanityFilter.isAbusive(message)) {
        btn.textContent = 'Keep it respectful ✋';
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = 'Send Message';
          btn.disabled = false;
        }, 2000);
        return;
      }
    }

    btn.disabled = true;
    btn.textContent = 'Sending...';

    const entry = {
      name,
      message,
      timestamp: Date.now()
    };

    if (db) {
      try {
        await db.collection('guestbook').add(entry);
      } catch (err) {
        console.error('Firestore write failed:', err);
        saveLocalEntry(entry);
      }
    } else {
      saveLocalEntry(entry);
    }

    // Track in analytics
    document.dispatchEvent(new CustomEvent('guestbook-sign', {
      detail: { name, messageLength: message.length }
    }));

    // Re-render
    loadAndRender();
  }

  async function loadAndRender() {
    let entries = [];

    if (db) {
      try {
        const snap = await db.collection('guestbook')
          .orderBy('timestamp', 'desc')
          .limit(50)
          .get();
        entries = snap.docs.map(d => d.data());
      } catch {
        entries = getLocalEntries();
      }
    } else {
      entries = getLocalEntries();
    }

    render(entries);
  }

  // ── Init on first open ────────────────────────────────────────────────
  const win = document.getElementById('guestbook-window');
  if (win) {
    const observer = new MutationObserver(() => {
      if (!win.classList.contains('hidden')) {
        loadAndRender();
        observer.disconnect();
      }
    });
    observer.observe(win, { attributes: true, attributeFilter: ['class'] });
  }
})();
