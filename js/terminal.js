(() => {
  const output      = document.getElementById("output");
  const inputEl     = document.getElementById("cmd-input");
  const displayEl   = document.getElementById("cmd-display");
  const cursorEl    = document.getElementById("cursor");
  const promptRow   = document.getElementById("prompt-row");
  const ghostHint   = document.getElementById("ghost-hint");
  const tabBadge    = document.getElementById("tab-badge");

  let history = [];
  let histIdx  = -1;
  let inputBuf = "";
  let isTyping = false;

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // Small base64 tick sound
  const TICK_SND = new Audio("data:audio/wav;base64,UkGRlQAAAFpXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTQAAACAgICAgICAgICAgICAgICAgICAhYeHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eH=");
  TICK_SND.volume = 0.2;

  function playTick() {
    TICK_SND.currentTime = 0;
    TICK_SND.play().catch(() => {}); // ignore autoplay blocks
  }

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

  // ── ghost autocomplete hint ───────────────────────────────────────────────
  function getAllCmds() {
    const cmds = Object.keys(COMMANDS).filter(k => !k.startsWith("__"));
    cmds.push("theme");
    return [...new Set(cmds)];
  }

  function updateGhost(val) {
    if (!val) {
      ghostHint.textContent = "";
      tabBadge.classList.add("hidden");
      positionCursor();
      return;
    }
    const match = getAllCmds().find(c => c.startsWith(val) && c !== val);
    if (match) {
      ghostHint.textContent = match.slice(val.length);
      tabBadge.classList.remove("hidden");
    } else {
      ghostHint.textContent = "";
      tabBadge.classList.add("hidden");
    }
    positionCursor();
  }

  function positionCursor() {
    // Place cursor right after the typed text (overlapping first ghost char)
    const left = displayEl.offsetLeft + displayEl.offsetWidth;
    cursorEl.style.left = left + "px";
  }

  // ── execute ───────────────────────────────────────────────────────────────
  async function execute(raw) {
    const cmd = raw.trim();
    if (!cmd) return;

    echoCommand(cmd);

    // push to history (avoid consecutive duplicates)
    if (history[0] !== cmd) history.unshift(cmd);
    histIdx = -1;
    inputBuf = "";

    let result;
    if (typeof COMMANDS[cmd] === "function") {
      result = await COMMANDS[cmd]();
    } else if (cmd.startsWith("theme")) {
      result = THEME_HANDLER(cmd.slice(5));
    } else {
      result = COMMANDS.__noSuchCommand__(cmd);
    }

    if (result === "__CLEAR__") {
      output.innerHTML = "";
    } else if (result) {
      appendOutput(result);
    }

    inputEl.value = "";
    displayEl.textContent = "";
    updateGhost("");
    positionCursor();
    scrollBottom();
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
      updateGhost(matches[0]);
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

  // ── input events ──────────────────────────────────────────────────────────
  inputEl.addEventListener("keydown", async (e) => {
    if (isTyping) { e.preventDefault(); return; }

    if (e.key === "Enter") {
      await execute(inputEl.value);
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
        updateGhost(history[histIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx > 0) {
        histIdx--;
        inputEl.value = history[histIdx];
        displayEl.textContent = history[histIdx];
        updateGhost(history[histIdx]);
      } else if (histIdx === 0) {
        histIdx = -1;
        inputEl.value = inputBuf;
        displayEl.textContent = inputBuf;
        updateGhost(inputBuf);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      await execute("clear");
    } else {
      // sync display after next render tick
      requestAnimationFrame(() => {
        displayEl.textContent = inputEl.value;
        updateGhost(inputEl.value);
      });
    }
  });

  // keep display in sync for paste events too
  inputEl.addEventListener("input", () => {
    displayEl.textContent = inputEl.value;
    updateGhost(inputEl.value);
  });

  async function typeAndExecute(commandText, viewingDelay) {
    isTyping = true;
    for (let c of commandText) {
      inputEl.value += c;
      displayEl.textContent += c;
      updateGhost(inputEl.value);
      positionCursor();
      playTick(); // sound effect
      await sleep(40 + Math.random() * 50); // human typing speed
    }
    await sleep(300); // pause before hitting enter
    await execute(inputEl.value); 
    await sleep(viewingDelay); // read time
    isTyping = false;
  }

  // click anywhere → focus input
  document.addEventListener("click", (e) => {
    if (isTyping) return; // Ignore clicks if auto-typing
    // If it's a command link or action-chip, execute it
    const cmdLink = e.target.closest(".cmd-link");
    const actionChip = e.target.closest(".action-chip");
    
    if (cmdLink || actionChip) {
      const command = (cmdLink || actionChip).dataset.cmd;
      execute(command);
      return;
    }
    inputEl.focus();
  });

  window.Terminal = {
    appendOutput,
    execute,
    typeAndExecute,
    focusInput: () => { if (!isTyping) inputEl.focus(); },
    getHistory: () => [...history],
    enablePrompt() {
      promptRow.classList.remove("hidden");
      inputEl.focus();
      scrollBottom();
    },
    showQuickActions() {
      document.getElementById("quick-actions").classList.remove("hidden");
    }
  };
})();
