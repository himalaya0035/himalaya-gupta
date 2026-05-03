/**
 * guestbook.js
 * Guest Book app — message wall style.
 * All messages visible as a scrollable feed with a compose bar at the bottom.
 * Enter sends, Shift+Enter for newline.
 * Uses JSONBin.io for cloud persistence with localStorage as cache/fallback.
 */
(() => {
  const root = document.getElementById('guestbook-root');
  if (!root) return;

  // ── JSONBin config ────────────────────────────────────────────────────
  const BIN_ID = '69f78748aaba882197686aef';
  const ACCESS_KEY = '$2a$10$tijhUoRWvJneXBvBu6KxyurB.NrNdEORUmn8xmu9sVKWWzvVqa4Q.';
  const API_BASE = 'https://api.jsonbin.io/v3/b/' + BIN_ID;

  const STORAGE_KEY = 'guestbook-entries';
  const MAX_NAME = 40;
  const MAX_MSG = 200;
  const MAX_ENTRIES = 100;

  // In-memory cache of entries (source of truth after first load)
  let cachedEntries = null;

  function escHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function timeAgo(ts) {
    var diff = Date.now() - ts;
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    var days = Math.floor(hrs / 24);
    if (days < 30) return days + 'd ago';
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function getInitials(name) {
    return name.split(/\s+/).map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
  }

  var AVATAR_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  function nameColor(name) {
    var hash = 0;
    for (var i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  // ── localStorage helpers (cache / fallback) ───────────────────────────
  function getLocalEntries() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch(e) { return []; }
  }

  function saveLocalEntries(entries) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES))); }
    catch(e) { /* quota exceeded — ignore */ }
  }

  // ── JSONBin API ───────────────────────────────────────────────────────
  function fetchEntries() {
    return fetch(API_BASE + '/latest', {
      method: 'GET',
      headers: { 'X-Access-Key': ACCESS_KEY }
    })
    .then(function(res) {
      if (!res.ok) throw new Error('JSONBin read failed: ' + res.status);
      return res.json();
    })
    .then(function(data) {
      var entries = (data.record && data.record.entries) || [];
      cachedEntries = entries;
      saveLocalEntries(entries);
      return entries;
    });
  }

  function pushEntry(newEntry) {
    // Optimistic: use cached entries if available, otherwise local
    var entries = cachedEntries ? cachedEntries.slice() : getLocalEntries();
    entries.unshift(newEntry);
    entries = entries.slice(0, MAX_ENTRIES);

    return fetch(API_BASE, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': ACCESS_KEY
      },
      body: JSON.stringify({ entries: entries })
    })
    .then(function(res) {
      if (!res.ok) throw new Error('JSONBin update failed: ' + res.status);
      return res.json();
    })
    .then(function(data) {
      var saved = (data.record && data.record.entries) || entries;
      cachedEntries = saved;
      saveLocalEntries(saved);
      return saved;
    });
  }

  // ── Render ────────────────────────────────────────────────────────────
  function render(entries, isLoading) {
    var feedHtml = '';

    if (isLoading) {
      feedHtml = '<div class="gb-empty">Loading messages…</div>';
    } else if (entries.length === 0) {
      feedHtml = '<div class="gb-empty">No messages yet. Be the first to leave one.</div>';
    } else {
      feedHtml = entries.map(function(e) {
        var color = nameColor(e.name);
        var initials = getInitials(e.name);
        var msgHtml = escHtml(e.message).replace(/\n/g, '<br>');
        return '<div class="gb-card">' +
          '<div class="gb-card-avatar" style="background:' + color + '">' + initials + '</div>' +
          '<div class="gb-card-body">' +
            '<div class="gb-card-top">' +
              '<span class="gb-card-name">' + escHtml(e.name) + '</span>' +
              '<span class="gb-card-time">' + timeAgo(e.timestamp) + '</span>' +
            '</div>' +
            '<div class="gb-card-msg">' + msgHtml + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    root.innerHTML =
      '<div class="gb-layout">' +
        '<div class="gb-header">' +
          '<span class="gb-header-title">Guest Book</span>' +
          '<span class="gb-header-count">' + (isLoading ? '' : entries.length + ' message' + (entries.length !== 1 ? 's' : '')) + '</span>' +
        '</div>' +
        '<div class="gb-feed" id="gb-feed">' + feedHtml + '</div>' +
        '<div class="gb-warning hidden" id="gb-warning">Keep it respectful. Your message was not sent.</div>' +
        '<div class="gb-compose" id="gb-compose">' +
          '<input type="text" class="gb-compose-name" id="gb-name" placeholder="Name (optional)" maxlength="' + MAX_NAME + '" autocomplete="name">' +
          '<div class="gb-compose-row">' +
            '<textarea class="gb-compose-msg" id="gb-message" placeholder="Leave a message..." maxlength="' + MAX_MSG + '" rows="1"></textarea>' +
            '<button type="button" class="gb-compose-send" id="gb-submit" aria-label="Send message">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    wireEvents();
  }

  function wireEvents() {
    var msgInput = document.getElementById('gb-message');
    var btn = document.getElementById('gb-submit');

    msgInput.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 80) + 'px';
    });

    msgInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    });

    btn.addEventListener('click', function() {
      handleSubmit();
    });
  }

  function showWarning() {
    var warning = document.getElementById('gb-warning');
    if (!warning) return;
    warning.classList.remove('hidden');
    setTimeout(function() {
      warning.classList.add('hidden');
    }, 3000);
  }

  function showError() {
    var warning = document.getElementById('gb-warning');
    if (!warning) return;
    warning.textContent = 'Something went wrong. Please try again.';
    warning.classList.remove('hidden');
    setTimeout(function() {
      warning.textContent = 'Keep it respectful. Your message was not sent.';
      warning.classList.add('hidden');
    }, 3000);
  }

  function handleSubmit() {
    var nameEl = document.getElementById('gb-name');
    var msgEl = document.getElementById('gb-message');
    var btn = document.getElementById('gb-submit');

    var name = nameEl.value.trim() || 'Anonymous';
    var message = msgEl.value.trim();
    if (!message) return;

    // Profanity check
    if (window.profanityFilter) {
      if (window.profanityFilter.isAbusive(name) || window.profanityFilter.isAbusive(message)) {
        showWarning();
        return;
      }
    }

    btn.disabled = true;

    var entry = { name: name, message: message, timestamp: Date.now() };

    // Dispatch analytics event
    document.dispatchEvent(new CustomEvent('guestbook-sign', {
      detail: { name: name, messageLength: message.length }
    }));

    // Push to JSONBin, fall back to localStorage on failure
    pushEntry(entry)
      .then(function(entries) {
        render(entries, false);
      })
      .catch(function() {
        // Fallback: save locally and re-render
        var entries = getLocalEntries();
        entries.unshift(entry);
        entries = entries.slice(0, MAX_ENTRIES);
        saveLocalEntries(entries);
        cachedEntries = entries;
        render(entries, false);
        showError();
      });
  }

  // ── Initial load ──────────────────────────────────────────────────────
  function loadAndRender() {
    // Show local cache immediately, then refresh from JSONBin
    var local = getLocalEntries();
    render(local.length ? local : [], local.length === 0);

    fetchEntries()
      .then(function(entries) {
        render(entries, false);
      })
      .catch(function() {
        // JSONBin unreachable — stick with local cache
        if (local.length === 0) {
          render([], false);
        }
      });
  }

  var win = document.getElementById('guestbook-window');
  if (win) {
    var observer = new MutationObserver(function() {
      if (!win.classList.contains('hidden')) {
        loadAndRender();
        observer.disconnect();
      }
    });
    observer.observe(win, { attributes: true, attributeFilter: ['class'] });
  }
})();
