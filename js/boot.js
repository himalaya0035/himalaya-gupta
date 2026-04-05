(() => {
  const BANNER = `
  ██╗  ██╗██╗███╗   ███╗ █████╗ ██╗      █████╗ ██╗   ██╗ █████╗      ██████╗ ██╗   ██╗██████╗ ████████╗ █████╗ 
  ██║  ██║██║████╗ ████║██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝██╔══██╗    ██╔════╝ ██║   ██║██╔══██╗╚══██╔══╝██╔══██╗
  ███████║██║██╔████╔██║███████║██║     ███████║ ╚████╔╝ ███████║    ██║  ███╗██║   ██║██████╔╝   ██║   ███████║
  ██╔══██║██║██║╚██╔╝██║██╔══██║██║     ██╔══██║  ╚██╔╝  ██╔══██║    ██║   ██║██║   ██║██╔═══╝    ██║   ██╔══██║
  ██║  ██║██║██║ ╚═╝ ██║██║  ██║███████╗██║  ██║   ██║   ██║  ██║    ╚██████╔╝╚██████╔╝██║        ██║   ██║  ██║
  ╚═╝  ╚═╝╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝     ╚═════╝  ╚═════╝ ╚═╝        ╚═╝   ╚═╝  ╚═╝`;


  const BOOT_LINES = [
    { text: "Initializing system",               delay: 60  },
    { text: `Loading profile: ${CONTENT.name}`,  delay: 80  },
    { text: "Mounting file system",              delay: 70  },
    { text: "Establishing secure connection",    delay: 100 },
    { text: "Compiling experience",              delay: 90  },
    { text: "Running diagnostics",               delay: 110 },
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
      return `<span class="dim">Last login: ${formatted} on ttys001</span>`;
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

  async function typewriter(el, text, speed = 18) {
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
    await sleep(200);

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

      await typewriter(textSpan, line.text, 22);
      await sleep(line.delay);
      statusSpan.innerHTML = `<span class="ok">[  OK  ]</span>`;
      await sleep(60);
    }

    await sleep(300);
    finishBoot();
  }

  // ── instant boot (revisit in same session) ────────────────────────────────
  function runInstantBoot() {
    finishBoot();
  }

  // ── shared finish ─────────────────────────────────────────────────────────
  function finishBoot() {
    appendRaw(`<pre class="banner">${escBanner(BANNER)}</pre>`);
    appendRaw(getLastLoginLine());
    appendRaw(WELCOME);

    sessionStorage.setItem("booted", "1");
    Terminal.enablePrompt();
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
