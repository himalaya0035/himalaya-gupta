(() => {
  const BANNER = `
  ██╗  ██╗██╗███╗   ███╗ █████╗ ██╗      █████╗ ██╗   ██╗ █████╗      ██████╗ ██╗   ██╗██████╗ ████████╗ █████╗ 
  ██║  ██║██║████╗ ████║██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝██╔══██╗    ██╔════╝ ██║   ██║██╔══██╗╚══██╔══╝██╔══██╗
  ███████║██║██╔████╔██║███████║██║     ███████║ ╚████╔╝ ███████║    ██║  ███╗██║   ██║██████╔╝   ██║   ███████║
  ██╔══██║██║██║╚██╔╝██║██╔══██║██║     ██╔══██║  ╚██╔╝  ██╔══██║    ██║   ██║██║   ██║██╔═══╝    ██║   ██╔══██║
  ██║  ██║██║██║ ╚═╝ ██║██║  ██║███████╗██║  ██║   ██║   ██║  ██║    ╚██████╔╝╚██████╔╝██║        ██║   ██║  ██║
  ╚═╝  ╚═╝╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝     ╚═════╝  ╚═════╝ ╚═╝        ╚═╝   ╚═╝  ╚═╝`;


  const BOOT_LINES = [
    { text: "Initializing system",               delay: 30  },
    { text: `Loading profile: ${CONTENT.name}`,  delay: 40  },
    { text: "Mounting file system",              delay: 35  },
    { text: "Establishing secure connection",    delay: 50  },
    { text: "Running diagnostics",               delay: 55  },
  ];

  const WELCOME = `
  <span class="acc">${CONTENT.title}</span>
  <span class="dim">──────────────────────────────────────────────</span>
  Type <span class="blu">help</span> to see available commands.
  Type <span class="blu">neofetch</span> for the quick rundown.
`;

  const output = document.getElementById("output");
  const sleep  = (ms) => new Promise(r => setTimeout(r, ms));

  // ── last login ────────────────────────────────────────────────────────────
  function getLastLoginLine() {
    const prev = localStorage.getItem("lastLogin");
    const now  = new Date();
    localStorage.setItem("lastLogin", now.toISOString());

    if (prev) {
      const d = new Date(prev);
      const formatted = d.toLocaleString("en-US", {
        weekday: "short", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
      });
      return `<span class="dim">Last login: ${formatted}</span>`;
    }
    return `<span class="dim">Welcome! First time here? Type</span> <span class="blu">help</span> <span class="dim">to get started.</span>`;
  }

  // ── helpers ───────────────────────────────────────────────────────────────
  function appendRaw(html) {
    const div = document.createElement("div");
    div.className = "output-block";
    div.innerHTML = html;
    output.appendChild(div);
    requestAnimationFrame(() => window.scrollTo(0, document.documentElement.scrollHeight));
  }

  async function typewriter(el, text, speed = 14) {
    el.textContent = "";
    for (const ch of text) {
      el.textContent += ch;
      await sleep(speed);
    }
  }

  function escBanner(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // ── full boot (first visit in session) ────────────────────────────────────
  async function runFullBoot() {
    await sleep(100);

    for (const line of BOOT_LINES) {
      const row = document.createElement("div");
      row.className = "output-block boot-line";
      const textSpan   = document.createElement("span");
      textSpan.className = "boot-text";
      const statusSpan = document.createElement("span");
      statusSpan.className = "boot-status";
      row.appendChild(textSpan);
      row.appendChild(statusSpan);
      output.appendChild(row);
      requestAnimationFrame(() => window.scrollTo(0, document.documentElement.scrollHeight));

      await typewriter(textSpan, line.text, 10);
      await sleep(line.delay);
      statusSpan.innerHTML = `<span class="ok">[  OK  ]</span>`;
      await sleep(30);
    }

    await sleep(150);

    // Initial output for full boot
    appendRaw(`<pre class="banner">${escBanner(BANNER)}</pre>`);
    appendRaw(getLastLoginLine());
    appendRaw(WELCOME);

    sessionStorage.setItem("booted", "1");
    Terminal.enablePrompt();

    // Wait 1 second before showing system notice
    await sleep(1000);

    // System announce message
    appendRaw(`
<div style="border-left: 2px solid var(--acc); padding: 12px 16px; margin: 24px 0; background: rgba(var(--acc-rgb), 0.05); border-radius: 0 6px 6px 0;">
  <div style="color: var(--acc); font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">[ System Notice ]</div>
  <div style="color: var(--fg); margin-bottom: 4px;">Welcome! You have been selected for the automated profile tour.</div>
  <div style="color: var(--dim);">Sit back and relax. The tour will begin in <span class="tour-timer" style="color: var(--acc); font-weight: bold;">5</span> seconds...</div>
  <div style="color: var(--dim); font-size: 11px; margin-top: 8px; opacity: 0.8;">(Press any key to take manual control)</div>
</div>`);

    // Live countdown timer logic
    for (let i = 5; i > 0; i--) {
      const timers = document.querySelectorAll('.tour-timer');
      const timerEl = timers[timers.length - 1];
      if (timerEl) timerEl.textContent = i;
      
      // Wait 1 second, checking for aborts frequently
      for (let j = 0; j < 10; j++) {
        if (Terminal.isTourAborted()) break;
        await sleep(100);
      }
      
      if (Terminal.isTourAborted()) {
        if (timerEl) {
          timerEl.parentElement.innerHTML = `<span style="color: var(--err);">Tour aborted. Manual control engaged.</span>`;
        }
        break;
      }
    }

    // Start automated ghost-typing tour (chained to halt if aborted)
    if (await Terminal.typeAndExecute("clear", 500)) {
      if (await Terminal.typeAndExecute("whoami", 2000)) {
        if (await Terminal.typeAndExecute("about", 5000)) {
          if (await Terminal.typeAndExecute("experience", 5000)) {
            if (await Terminal.typeAndExecute("projects", 3000)) {
              if (await Terminal.typeAndExecute("skills", 3000)) {
                await Terminal.typeAndExecute("contact", 2000);
              }
            }
          }
        }
      }
    }

    Terminal.showQuickActions();
  }

  // ── instant boot (revisit in same session) ────────────────────────────────
  function runInstantBoot() {
    appendRaw(`<pre class="banner">${escBanner(BANNER)}</pre>`);
    appendRaw(getLastLoginLine());
    appendRaw(WELCOME);

    sessionStorage.setItem("booted", "1");
    Terminal.enablePrompt();
    Terminal.showQuickActions();
  }

  // ── entry point ───────────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", () => {
    if (sessionStorage.getItem("booted")) {
      runInstantBoot();
    } else {
      runFullBoot();
    }
  });
})();
