(() => {
  const C = window.CONTENT;

  // ── helpers ──────────────────────────────────────────────────────────────
  const acc  = (t) => `<span class="acc">${t}</span>`;
  const blu  = (t) => `<span class="blu">${t}</span>`;
  const dim  = (t) => `<span class="dim">${t}</span>`;
  const err  = (t) => `<span class="err">${t}</span>`;
  const ok   = (t) => `<span class="ok">${t}</span>`;
  const bold = (t) => `<span class="bold">${t}</span>`;
  const link = (href, label) =>
    `<a href="${href}" target="_blank" rel="noopener">${label || href}</a>`;
  const esc  = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const cmd  = (text, execCmd) => `<span class="cmd-link" data-cmd="${esc(execCmd !== undefined ? execCmd : text.split(' ')[0])}">${esc(text)}</span>`;

  // ── responsive helpers ───────────────────────────────────────────────────
  const isMobile = () => window.innerWidth <= 768;
  const sep = (n) => "─".repeat(isMobile() ? Math.min(n, 30) : n);
  const pad = (str, n) => str.padEnd(isMobile() ? Math.min(n, 14) : n);

  // ── theme definitions ────────────────────────────────────────────────────
  // ── theme definitions ────────────────────────────────────────────────────
  window.THEMES = {
    green:  { bg:"#0d1117",bg2:"#161b22",fg:"#e6edf3",dim:"#6e7681",acc:"#00ff9d",acc_rgb:"0, 255, 157",blu:"#58a6ff",border:"#30363d",ok:"#3fb950",err:"#f85149" },
    amber:  { bg:"#100c00",bg2:"#1a1400",fg:"#ffe4a0",dim:"#7a6a3a",acc:"#ffd700",acc_rgb:"255, 215, 0",blu:"#ff8c00",border:"#3a2e00",ok:"#ffa500",err:"#ff4040" },
    purple: { bg:"#0e0e1a",bg2:"#161626",fg:"#e2e0ff",dim:"#6c6a8a",acc:"#bd93f9",acc_rgb:"189, 147, 249",blu:"#ff79c6",border:"#2a2a40",ok:"#50fa7b",err:"#ff5555" },
    pure:   { bg:"#000000",bg2:"#0a0a0a",fg:"#ffffff",dim:"#555555",acc:"#ffffff",acc_rgb:"255, 255, 255",blu:"#ffffff",border:"#222222",ok:"#ffffff",err:"#ff0000" },
    crimson:{ bg:"#1a0505",bg2:"#2d0a0a",fg:"#ffebeb",dim:"#8c5a5a",acc:"#ff3e3e",acc_rgb:"255, 62, 62",blu:"#ff7b72",border:"#4a1a1a",ok:"#ff3e3e",err:"#ffffff" }
  };

  window.applyTheme = function(name) {
    const t = window.THEMES[name];
    if (!t) return false;
    const r = document.documentElement.style;
    Object.entries(t).forEach(([k, v]) => {
      r.setProperty("--" + k, v);
      if (k === "acc_rgb") r.setProperty("--acc-rgb", v);
    });
    localStorage.setItem("theme", name);
    return true;
  };

  window.currentTheme = function() {
    return localStorage.getItem("theme") || "green";
  };

  // ── neofetch ASCII art (compact "HG" monogram) ───────────────────────────
  const NEOFETCH_ART = [
    " ██╗  ██╗ ██████╗ ",
    " ██║  ██║██╔════╝ ",
    " ███████║██║  ███╗",
    " ██╔══██║██║   ██║",
    " ██║  ██║╚██████╔╝",
    " ╚═╝  ╚═╝ ╚═════╝ ",
  ];

  // ── command registry ──────────────────────────────────────────────────────
  window.COMMANDS = {

    help() {
      const main = [
        ["whoami",        "Identity summary"],
        ["about",         "Full bio & background"],
        ["experience",    "Work history"],
        ["projects",      "Featured work"],
        ["skills",        "Tech stack & tools"],
        ["education",     "Academic background"],
        ["contact",       "All contact links"],
        ["linkedin",      "Open LinkedIn profile"],
        ["github",        "Open GitHub profile"],
        ["email",         "Compose email"],
        ["resume",        "Download CV (PDF)"],
      ];
      const geeky = [
        ["neofetch",      "System info summary"],
        ["theme <name>",  "Change colors"],
        ["ls",            "List all hidden commands"],
        ["history",       "Command history"],
        ["clear",         "Clear screen"],
      ];

      const renderRows = (rows) => rows.map(([c, desc]) => {
        const paddedCmd = pad(c, 20);
        return `  ${cmd(paddedCmd)}${dim(desc)}`;
      }).join("\n");

      return `
${bold("MAIN COMMANDS")}
${dim(sep(50))}
${renderRows(main)}

${bold("GEEKY")}
${dim(sep(50))}
${renderRows(geeky)}

  ${dim("Tip: Click any command above or use 'Tab' to autocomplete.")}
`;
    },


    whoami() {
      const loc = C.location ? `  ${dim("location")}  ${C.location}` : "";
      return `
  ${acc(C.name)}
  ${C.title}
${loc}
`;
    },

    about() {
      return `\n${bold("ABOUT")}\n${sep(55)}\n  ${C.about.replace(/\n/g, "\n  ")}\n`;
    },

    skills() {
      const s = C.skills;
      const row = (label, items) => {
        if (!items || items.length === 0) return "";
        return `  ${dim(pad(label, 20))}${items.map(acc).join(dim("  ·  "))}`;
      };
      
      const skillRows = Object.entries(s)
        .map(([cat, items]) => row(cat, items))
        .filter(r => r !== "")
        .join("\n");

      return `
${bold("SKILLS")}
${sep(55)}
${skillRows}
`;
    },

    projects() {
      if (!C.projects || C.projects.length === 0)
        return err("\n  No projects configured yet — edit js/content.js\n");

      const blocks = C.projects.map(p => {
        const techLine = p.tech && p.tech.length
          ? `\n  ${dim("stack")}     ${p.tech.map(t => acc(t)).join(dim(" · "))}`
          : "";
        const lineParts = [];
        if (p.links.github) lineParts.push(`${dim("gh")} ${link(p.links.github, "github")}`);
        if (p.links.live)   lineParts.push(`${dim("→")}  ${link(p.links.live, "live site")}`);
        const linkLine = lineParts.length
          ? `\n  ${dim("links")}     ${lineParts.join("   ")}`
          : "";

        return `
  ${blu("▸ " + p.name)}
  ${p.description}${techLine}${linkLine}`;
      });

      return `\n${bold("PROJECTS")}\n${sep(55)}${blocks.join("\n")}\n`;
    },

    experience() {
      if (!C.experience || C.experience.length === 0)
        return err("\n  No experience configured yet — edit js/content.js\n");

      const blocks = C.experience.map(e => {
        const bullets = e.highlights.map(h => `    ${dim("·")} ${h}`).join("\n");
        return `
  ${acc(e.role)} ${dim("@")} ${blu(e.company)}
  ${dim(e.period)}
${bullets}`;
      });

      return `\n${bold("EXPERIENCE")}\n${sep(55)}${blocks.join("\n")}\n`;
    },

    education() {
      if (!C.education || C.education.length === 0)
        return err("\n  No education configured yet — edit js/content.js\n");
      const blocks = C.education.map(e =>
        `\n  ${blu(e.degree)}\n  ${dim(e.institution)}  ${dim(e.year)}`
      );
      return `\n${bold("EDUCATION")}\n${sep(55)}${blocks.join("\n")}\n`;
    },

    achievements() {
      if (!C.achievements || C.achievements.length === 0)
        return err("\n  No achievements configured yet — edit js/content.js\n");
      const lines = C.achievements.map(a => `  ${acc("★")} ${a}`).join("\n");
      return `\n${bold("ACHIEVEMENTS")}\n${sep(55)}\n${lines}\n`;
    },

    contact() {
      const ct = C.contact;
      const rows = [];
      if (ct.email)    rows.push([dim("email"),    link(`mailto:${ct.email}`, ct.email)]);
      if (ct.github)   rows.push([dim("github"),   link(ct.github, ct.github.replace("https://", ""))]);
      if (ct.linkedin) rows.push([dim("linkedin"), link(ct.linkedin, ct.linkedin.replace("https://", ""))]);
      if (ct.twitter)  rows.push([dim("twitter"),  link(ct.twitter, ct.twitter.replace("https://", ""))]);

      const lines = rows.map(([label, val]) => `  ${label.padEnd(isMobile() ? 14 : 20)}${val}`).join("\n");
      
      const cta = `
  ${dim(sep(55))}
  ${bold(acc("Ready to build something great?"))}
  Try running ${cmd("sudo hire me", "sudo hire me")} to initiate the hiring protocol.`;

      return `\n${bold("CONTACT")}\n${sep(55)}\n${lines}\n${cta}\n`;
    },

    linkedin() {
      if (C.contact.linkedin) {
        window.open(C.contact.linkedin, "_blank");
        return ok(`\n  Opening LinkedIn ...\n`);
      }
      return err("\n  LinkedIn URL not configured\n");
    },

    github() {
      if (C.contact.github) {
        window.open(C.contact.github, "_blank");
        return ok(`\n  Opening GitHub ...\n`);
      }
      return err("\n  GitHub URL not configured\n");
    },

    email() {
      if (C.contact.email) {
        window.open(`mailto:${C.contact.email}`, "_blank");
        return ok(`\n  Opening mail client ...\n`);
      }
      return err("\n  Email not configured\n");
    },

    resume() {
      return this["cat resume.pdf"]();
    },

    neofetch() {
      const nf = C.neofetch || {};
      const allSkills = Object.values(C.skills).flat().join(" · ");
      const dbLine = (C.skills["Databases & Caching"] || []).join(" · ");

      const infoLines = [
        `${acc(C.name.toLowerCase().replace(/\s+/g, ""))}${dim("@")}${blu("dev")}`,
        dim(sep(20)),
        `${dim(pad("OS", 12))}${C.title}`,
        `${dim(pad("Uptime", 12))}${nf.uptime || "N/A"}`,
        `${dim(pad("Packages", 12))}${allSkills}`,
        `${dim(pad("Shell", 12))}${nf.shell || "bash"}`,
        `${dim(pad("Terminal", 12))}${nf.terminal || "terminal.himalayagupta.dev"}`,
        `${dim(pad("Editor", 12))}${nf.editor || "VS Code"}`,
        `${dim(pad("CPU", 12))}${nf.cpu || "Fueled by caffeine"}`,
        `${dim(pad("Memory", 12))}${dbLine}`,
        "",
        `<span class="neofetch-palette">`
          + `<span style="background:#f85149"></span>`
          + `<span style="background:#ffd700"></span>`
          + `<span style="background:#3fb950"></span>`
          + `<span style="background:#58a6ff"></span>`
          + `<span style="background:#bd93f9"></span>`
          + `<span style="background:#ff79c6"></span>`
          + `<span style="background:#00ff9d"></span>`
          + `<span style="background:#e6edf3"></span>`
        + `</span>`,
      ];

      // Pad art lines to match info lines count
      const artPadded = [];
      const maxArtLen = Math.max(...NEOFETCH_ART.map(l => l.length));
      for (let i = 0; i < Math.max(NEOFETCH_ART.length, infoLines.length); i++) {
        const artLine  = (NEOFETCH_ART[i] || "").padEnd(maxArtLen);
        const infoLine = infoLines[i] || "";
        artPadded.push(artLine);
      }

      return `
<div class="neofetch-grid"><pre class="neofetch-art">${artPadded.join("\n")}</pre><div class="neofetch-info">${infoLines.join("\n")}</div></div>
`;
    },

    history() {
      const mainCmds = ["whoami", "about", "experience", "projects", "skills", "contact", "linkedin", "github", "email", "resume"];
      const hist = Terminal.getHistory().filter(c => mainCmds.includes(c.split(' ')[0]));
      
      if (hist.length === 0) return dim("\n  No main commands in history yet.\n");
      const lines = hist.map((cmd, i) =>
        `  ${dim(String(i + 1).padStart(4))}  ${cmd}`
      ).join("\n");
      return `\n${bold("ESSENTIAL HISTORY")}\n${dim(sep(30))}\n${lines}\n`;
    },

    ls() {
      const cmds = Object.keys(window.COMMANDS).filter(
        k => !k.startsWith("__") && !k.startsWith("rm ") && k !== "exit" && k !== "man himalaya" && k !== "sudo hire me"
      );
      return "\n  " + cmds.map(c => cmd(c, c)).join("  ") + "\n";
    },

    "cat resume.pdf"() {
      const a = document.createElement("a");
      a.href = "assets/resume.pdf";
      a.download = "himalaya-gupta-resume.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return ok("\n  Downloading resume.pdf ...\n");
    },

    // ── hidden / easter egg commands ──────────────────────────────────────

    async "sudo hire me"() {
      window.Terminal.appendOutput(`
  ${acc("[ sudo ] password for recruiter:")} ${dim("••••••••••••")}

  ${ok("Access granted.")}

  Deploying ${blu("Himalaya Gupta")} to your engineering team...`);

      const pBarId = "pbar-" + Math.random().toString(36).substr(2, 9);
      window.Terminal.appendOutput(`  <span id="${pBarId}"></span>`);

      const pBarContainer = document.getElementById(pBarId);
      for (let i = 0; i <= 20; i++) {
        if (pBarContainer) {
          pBarContainer.innerHTML = `${dim("█".repeat(i) + "▒".repeat(20 - i))} ${acc((i * 5) + "%")}`;
        }
        await new Promise(r => setTimeout(r, 100)); // 20 steps * 100ms = 2 seconds
      }

      if (pBarContainer) {
        pBarContainer.innerHTML += ` ${ok("[DONE]")}`;
      }

      return `\n  Congratulations. You have excellent taste.
  Reach me at: ${link("mailto:" + C.contact.email, C.contact.email)}\n`;
    },

    "rm -rf /"() {
      return `
  ${err("rm: it is dangerous to operate recursively on '/'")}
  ${err("rm: cannot remove '/': Operation not permitted")}

  ${dim("...did you really just try that on my portfolio?")}
  ${dim("Nice try.")} ${acc("Everything is fine.")} ${dim("Probably.")}
`;
    },

    exit() {
      return `
  ${dim("logout")}
  ${dim("Connection to terminal.himalayagupta.dev closed.")}

  ${acc("...")}

  ${dim("Nice try. You can check out any time, but you can never leave.")}
  ${dim("Type")} ${blu("help")} ${dim("to continue exploring.")}
`;
    },

    "man himalaya"() {
      const skillList = Object.entries(C.skills)
        .filter(([, v]) => v && v.length)
        .map(([cat, items]) => `         ${acc(cat)}\n                ${dim(items.join(", "))}`)
        .join("\n\n");

      const achievements = (C.achievements || [])
        .map(a => `         ${ok("✓")}  ${a}`)
        .join("\n");

      return `
${bold("HIMALAYA(1)")}              ${dim("General Commands Manual")}              ${bold("HIMALAYA(1)")}

${bold("NAME")}
         ${acc("himalaya")} ${dim("--")} Himalaya Gupta, Senior Software Engineer

${bold("SYNOPSIS")}
         ${acc("himalaya")} [${dim("--build")} <system>] [${dim("--scale")} <users>] [${dim("--ship")} <feature>]
                  [${dim("--mentor")} <team>] [${dim("--debug")} <production>] [${dim("--repeat")}]

${bold("DESCRIPTION")}
         Himalaya Gupta is a Senior Software Engineer with 3+ years of
         experience designing and scaling high-traffic production systems.

         Specializes in Node.js backend architecture, event-driven systems,
         and cloud-native infrastructure. Has a strong bias toward shipping
         reliable software over perfect software, and believes the best
         code is the code that doesn't need to be written.

         Currently based in Noida, India. Open to remote and hybrid roles.

${bold("OPTIONS")}
         ${dim("--build")} <system>
                  Designs and implements scalable backend systems. Preferred
                  stack: Node.js, Express, PostgreSQL/MongoDB, Redis, Kafka.

         ${dim("--scale")} <users>
                  Has scaled platforms to 200K+ concurrent users. Comfortable
                  with load balancing, caching strategies, and DB optimization.

         ${dim("--secure")} <surface>
                  Implements OAuth 2.0 SSO, RSA encryption, JWT, and UIDAI
                  integrations. Has secured systems serving 400K+ users.

         ${dim("--automate")} <workflow>
                  Builds automation tools using Playwright, Puppeteer, and
                  LLM integrations. See: ApplyPilot, GitPilot.

         ${dim("--mentor")} <team>
                  Has led teams of 4 engineers. Conducts code reviews, drives
                  architecture decisions, and unblocks junior developers.

         ${dim("--open-source")}
                  Maintains public projects with 2K+ npm downloads and 20+
                  GitHub stars. Believes in giving back to the ecosystem.

${bold("TECHNICAL SKILLS")}
${skillList}

${bold("ACHIEVEMENTS")}
${achievements}

${bold("ENVIRONMENT")}
         ${dim("EDITOR")}          VS Code + Vim keybindings
         ${dim("SHELL")}           bash / zsh
         ${dim("COFFEE")}          Required. Non-negotiable.
         ${dim("DEADLINE")}        Respected. Usually.

${bold("EXIT STATUS")}
         ${ok("0")}        Successfully shipped feature
         ${err("1")}        Merge conflict (rare, but happens)
         ${err("2")}        Production incident (rarer, handled calmly)

${bold("SEE ALSO")}
         ${link(C.contact.github, "github")}(1), ${link(C.contact.linkedin, "linkedin")}(1), ${blu("projects")}(1), ${blu("experience")}(1)

${bold("BUGS")}
         ${dim("Occasional over-engineering. Actively working on it.")}
         ${dim("Known to refactor working code at 2am. Handle with care.")}

${bold("AUTHOR")}
         Written by Himalaya Gupta <${link("mailto:" + C.contact.email, C.contact.email)}>.
         This portfolio was hand-crafted in vanilla JavaScript. No frameworks
         were harmed in the making of this OS.

${dim("Himalaya Gupta")}${" ".repeat(24)}${dim(new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }))}
`;
    },

    clear() {
      return "__CLEAR__";
    },

    // ── fallback ────────────────────────────────────────────────────────────
    __noSuchCommand__(cmd) {
      return err(`\n  bash: ${cmd}: command not found\n`) +
             `  ${dim("Type")} ${blu("help")} ${dim("to see available commands.")}\n`;
    }
  };

  // ── theme command handler (needs argument parsing) ────────────────────────
  // We override execute to handle "theme <name>" which is a parameterized command.
  // Registered as a prefix handler on the terminal side.
  window.THEME_HANDLER = function(args) {
    const name = args.trim().toLowerCase();

    if (!name) {
      const cur = window.currentTheme();
      const list = Object.keys(window.THEMES).map(t =>
        t === cur
          ? `  ${acc("● " + t)}  ${dim("(active)")}`
          : `  ${dim("○")} ${blu(t)}`
      ).join("\n");
      return `\n${bold("THEMES")}\n${sep(30)}\n${list}\n\n  ${dim("Usage:")} ${blu("theme <name>")}\n`;
    }

    if (window.applyTheme(name)) {
      return ok(`\n  Theme switched to ${name}.\n`);
    }
    return err(`\n  Unknown theme: ${name}\n`) +
           `  ${dim("Available:")} ${Object.keys(THEMES).map(blu).join(dim(", "))}\n`;
  };
})();
