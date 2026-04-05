(() => {
  const output      = document.getElementById("output");
  const inputEl     = document.getElementById("cmd-input");
  const displayEl   = document.getElementById("cmd-display");
  const cursorEl    = document.getElementById("cursor");
  const promptRow   = document.getElementById("prompt-row");

  let history = [];
  let histIdx  = -1;
  let inputBuf = "";

  // ── render helpers ────────────────────────────────────────────────────────
  function appendOutput(html) {
    const div = document.createElement("div");
    div.className = "output-block";
    div.innerHTML = html;
    output.appendChild(div);
    scrollBottom();
  }

  function echoCommand(cmd) {
    const div = document.createElement("div");
    div.className = "output-block echo-line";
    div.innerHTML =
      `<span class="prompt-label"><span class="user">guest</span>` +
      `<span class="at">@</span><span class="host">himalaya.dev</span>` +
      `<span class="sep">:~$</span></span> <span class="cmd-text">${escapeHtml(cmd)}</span>`;
    output.appendChild(div);
  }

  function scrollBottom() {
    requestAnimationFrame(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // ── execute ───────────────────────────────────────────────────────────────
  function execute(raw) {
    const cmd = raw.trim();
    if (!cmd) return;

    echoCommand(cmd);

    // push to history (avoid consecutive duplicates)
    if (history[0] !== cmd) history.unshift(cmd);
    histIdx = -1;
    inputBuf = "";

    let result;
    if (typeof COMMANDS[cmd] === "function") {
      result = COMMANDS[cmd]();
    } else if (cmd.startsWith("theme")) {
      // parameterized command: theme <name>
      result = THEME_HANDLER(cmd.slice(5));
    } else {
      result = COMMANDS.__noSuchCommand__(cmd);
    }

    if (result === "__CLEAR__") {
      output.innerHTML = "";
      scrollBottom();
    } else {
      appendOutput(result);
    }

    inputEl.value = "";
    displayEl.textContent = "";
  }

  // ── tab autocomplete ──────────────────────────────────────────────────────
  function autocomplete(partial) {
    const allCmds = Object.keys(COMMANDS).filter(
      k => !k.startsWith("__")
    );
    allCmds.push("theme");
    // dedupe
    const cmdSet = [...new Set(allCmds)];
    const matches = cmdSet.filter(c => c.startsWith(partial));

    if (matches.length === 0) return;

    if (matches.length === 1) {
      inputEl.value = matches[0];
      displayEl.textContent = matches[0];
    } else {
      // show all matches as output
      appendOutput(
        `\n  ${matches.map(m => `<span class="blu">${m}</span>`).join("  ")}\n`
      );
      // fill longest common prefix
      const lcp = longestCommonPrefix(matches);
      if (lcp.length > partial.length) {
        inputEl.value = lcp;
        displayEl.textContent = lcp;
      }
    }
  }

  function longestCommonPrefix(strs) {
    if (!strs.length) return "";
    let prefix = strs[0];
    for (let i = 1; i < strs.length; i++) {
      while (!strs[i].startsWith(prefix)) {
        prefix = prefix.slice(0, -1);
        if (!prefix) return "";
      }
    }
    return prefix;
  }

  // ── keydown handler ───────────────────────────────────────────────────────
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      execute(inputEl.value);
    } else if (e.key === "Tab") {
      e.preventDefault();
      autocomplete(inputEl.value);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (histIdx < history.length - 1) {
        if (histIdx === -1) inputBuf = inputEl.value;
        histIdx++;
        inputEl.value = history[histIdx];
        displayEl.textContent = history[histIdx];
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx > 0) {
        histIdx--;
        inputEl.value = history[histIdx];
        displayEl.textContent = history[histIdx];
      } else if (histIdx === 0) {
        histIdx = -1;
        inputEl.value = inputBuf;
        displayEl.textContent = inputBuf;
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      execute("clear");
    } else {
      // sync display after next render tick
      requestAnimationFrame(() => {
        displayEl.textContent = inputEl.value;
      });
    }
  });

  // keep display in sync for paste events too
  inputEl.addEventListener("input", () => {
    displayEl.textContent = inputEl.value;
  });

  // click anywhere → focus input
  document.addEventListener("click", () => inputEl.focus());

  // ── expose for boot.js ────────────────────────────────────────────────────
  window.Terminal = {
    appendOutput,
    execute,
    focusInput: () => inputEl.focus(),
    getHistory: () => [...history],
    enablePrompt() {
      promptRow.classList.remove("hidden");
      inputEl.focus();
      scrollBottom();
    }
  };
})();
