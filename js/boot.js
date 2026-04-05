(() => {
  const BANNER = `
  ██╗  ██╗██╗███╗   ███╗ █████╗ ██╗      █████╗ ██╗   ██╗ █████╗
  ██║  ██║██║████╗ ████║██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝██╔══██╗
  ███████║██║██╔████╔██║███████║██║     ███████║ ╚████╔╝ ███████║
  ██╔══██║██║██║╚██╔╝██║██╔══██║██║     ██╔══██║  ╚██╔╝  ██╔══██║
  ██║  ██║██║██║ ╚═╝ ██║██║  ██║███████╗██║  ██║   ██║   ██║  ██║
  ╚═╝  ╚═╝╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝`;

  const BOOT_LINES = [
    { text: "Initializing system",               status: "OK",   delay: 60  },
    { text: `Loading profile: ${CONTENT.name}`,  status: "OK",   delay: 80  },
    { text: "Mounting file system",              status: "OK",   delay: 70  },
    { text: "Establishing secure connection",    status: "OK",   delay: 100 },
    { text: "Compiling experience",              status: "OK",   delay: 90  },
    { text: "Running diagnostics",               status: "OK",   delay: 110 },
  ];

  const WELCOME = `
  <span class="acc">${CONTENT.title}</span>
  <span class="dim">──────────────────────────────────────────────</span>
  Type <span class="blu">help</span> to see available commands.
  Type <span class="blu">whoami</span> for a quick intro.
`;

  // ── utilities ─────────────────────────────────────────────────────────────
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  function appendRaw(html) {
    const div = document.createElement("div");
    div.className = "output-block";
    div.innerHTML = html;
    document.getElementById("output").appendChild(div);
    window.scrollTo(0, document.body.scrollHeight);
  }

  // typewriter: reveal text char by char into an existing element
  async function typewriter(el, text, speed = 18) {
    el.textContent = "";
    for (const ch of text) {
      el.textContent += ch;
      await sleep(speed);
    }
  }

  // ── boot sequence ─────────────────────────────────────────────────────────
  async function runBoot() {
    await sleep(200);

    for (const line of BOOT_LINES) {
      const row = document.createElement("div");
      row.className = "output-block boot-line";
      const textSpan = document.createElement("span");
      textSpan.className = "boot-text";
      const statusSpan = document.createElement("span");
      statusSpan.className = "boot-status";
      row.appendChild(textSpan);
      row.appendChild(statusSpan);
      document.getElementById("output").appendChild(row);
      window.scrollTo(0, document.body.scrollHeight);

      await typewriter(textSpan, line.text, 22);
      await sleep(line.delay);
      statusSpan.innerHTML = `<span class="ok">[  OK  ]</span>`;
      await sleep(60);
    }

    await sleep(300);

    // ASCII banner
    appendRaw(`<pre class="banner">${escBanner(BANNER)}</pre>`);
    await sleep(150);

    // welcome message
    appendRaw(WELCOME);

    Terminal.enablePrompt();
  }

  function escBanner(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  document.addEventListener("DOMContentLoaded", runBoot);
})();
