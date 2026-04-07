(() => {
  const output      = document.getElementById("output");
  const inputEl     = document.getElementById("cmd-input");
  const displayEl   = document.getElementById("cmd-display");
  const promptRow   = document.getElementById("prompt-row");
  const ghostHint   = document.getElementById("ghost-hint");
  const tabBadge    = document.getElementById("tab-badge");

  let history = [];
  let histIdx  = -1;
  let inputBuf = "";
  let isTyping = false;
  let tourAborted = false;

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
      `<span class="at">@</span><span class="host">terminal.himalayagupta.com</span>` +
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
    if (isTyping) { 
      e.preventDefault(); 
      Terminal.abortTour();
      return; 
    }

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
    if (tourAborted) return false;
    isTyping = true;
    for (let c of commandText) {
      if (tourAborted) { Terminal.abortTour(); return false; }
      inputEl.value += c;
      displayEl.textContent += c;
      updateGhost(inputEl.value);
      playTick(); 
      await sleep(40 + Math.random() * 50); 
    }
    if (tourAborted) { Terminal.abortTour(); return false; }
    await sleep(300); 
    if (tourAborted) { Terminal.abortTour(); return false; }
    await execute(inputEl.value); 
    
    isTyping = false;
    
    let elapsed = 0;
    while (elapsed < viewingDelay) {
      if (tourAborted) return false;
      await sleep(100);
      elapsed += 100;
    }
    return true;
  }

  // click anywhere → focus input
  document.addEventListener("click", (e) => {
    if (isTyping) { 
      return; // Do not abort on click, just ignore (so user can scroll/copy)
    }
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
    runTour: async () => {
      tourAborted = false;
      inputEl.value = "";
      displayEl.textContent = "";
      updateGhost("");
      
      // System announce message
      appendOutput(`
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
        
        for (let j = 0; j < 10; j++) {
          if (tourAborted) break;
          await sleep(100);
        }
        
        if (tourAborted) {
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

      window.Terminal.showQuickActions();
    },
    isTourAborted: () => tourAborted,
    abortTour: () => {
      tourAborted = true;
      isTyping = false;
      inputEl.value = "";
      displayEl.textContent = "";
      updateGhost("");
    },
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
