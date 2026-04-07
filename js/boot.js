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
  Type <span class="blu">tour</span> to start the automated profile tour.
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

    // Wait 1 second before showing system notice
    await sleep(500);

    // Call the centralized tour runner
    await Terminal.runTour();
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
