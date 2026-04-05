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

  // ── theme definitions ────────────────────────────────────────────────────
  const THEMES = {
    green:  { bg:"#0d1117",bg2:"#161b22",fg:"#e6edf3",dim:"#6e7681",acc:"#00ff9d",blu:"#58a6ff",border:"#30363d",ok:"#3fb950",err:"#f85149" },
    amber:  { bg:"#100c00",bg2:"#1a1400",fg:"#ffe4a0",dim:"#7a6a3a",acc:"#ffd700",blu:"#ff8c00",border:"#3a2e00",ok:"#ffa500",err:"#ff4040" },
    purple: { bg:"#0e0e1a",bg2:"#161626",fg:"#e2e0ff",dim:"#6c6a8a",acc:"#bd93f9",blu:"#ff79c6",border:"#2a2a40",ok:"#50fa7b",err:"#ff5555" }
  };

  function applyTheme(name) {
    const t = THEMES[name];
    if (!t) return false;
    const r = document.documentElement.style;
    Object.entries(t).forEach(([k, v]) => r.setProperty("--" + k, v));
    localStorage.setItem("theme", name);
    return true;
  }

  function currentTheme() {
    return localStorage.getItem("theme") || "green";
  }

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
      const rows = [
        ["whoami",          "Who I am — the short version"],
        ["about",           "Full bio and background"],
        ["skills",          "Tech stack and tools I work with"],
        ["projects",        "Things I've built"],
        ["experience",      "Work history and highlights"],
        ["education",       "Academic background"],
        ["achievements",    "Awards, certifications, and wins"],
        ["contact",         "How to reach me"],
        ["github",          "Open my GitHub profile"],
        ["linkedin",        "Open my LinkedIn profile"],
        ["neofetch",        "System info — the engineer edition"],
        ["theme <name>",    "Switch color theme (green/amber/purple)"],
        ["history",         "Show command history"],
        ["ls",              "List available commands"],
        ["cat resume.pdf",  "Download my resume"],
        ["clear",           "Clear the terminal"],
      ];
      const lines = rows.map(([cmd, desc]) =>
        `  ${blu(cmd.padEnd(20))}${dim(desc)}`
      ).join("\n");
      return `\n${bold("AVAILABLE COMMANDS")}\n${"─".repeat(55)}\n${lines}\n`;
    },

    whoami() {
      const loc = C.location ? `  ${dim("location")}  ${C.location}` : "";
      return `
  ${acc(C.name)}
  ${C.title}
${loc}

  ${dim("Type")} ${blu("about")} ${dim("for my full bio, or")} ${blu("neofetch")} ${dim("for the quick rundown.")}
`;
    },

    about() {
      return `\n${bold("ABOUT")}\n${"─".repeat(55)}\n  ${C.about.replace(/\n/g, "\n  ")}\n`;
    },

    skills() {
      const s = C.skills;
      const row = (label, items) => {
        if (!items || items.length === 0) return "";
        return `  ${dim(label.padEnd(12))}${items.map(acc).join(dim("  ·  "))}`;
      };
      return `
${bold("SKILLS")}
${"─".repeat(55)}
${row("Languages",  s.languages)}
${row("Backend",    s.backend)}
${row("Frontend",   s.frontend)}
${row("Databases",  s.databases)}
${row("AI/Auto",    s["ai/auto"])}
${row("DevOps",     s.devops)}
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

      return `\n${bold("PROJECTS")}\n${"─".repeat(55)}${blocks.join("\n")}\n`;
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

      return `\n${bold("EXPERIENCE")}\n${"─".repeat(55)}${blocks.join("\n")}\n`;
    },

    education() {
      if (!C.education || C.education.length === 0)
        return err("\n  No education configured yet — edit js/content.js\n");
      const blocks = C.education.map(e =>
        `\n  ${blu(e.degree)}\n  ${dim(e.institution)}  ${dim(e.year)}`
      );
      return `\n${bold("EDUCATION")}\n${"─".repeat(55)}${blocks.join("\n")}\n`;
    },

    achievements() {
      if (!C.achievements || C.achievements.length === 0)
        return err("\n  No achievements configured yet — edit js/content.js\n");
      const lines = C.achievements.map(a => `  ${acc("★")} ${a}`).join("\n");
      return `\n${bold("ACHIEVEMENTS")}\n${"─".repeat(55)}\n${lines}\n`;
    },

    contact() {
      const ct = C.contact;
      const rows = [];
      if (ct.email)    rows.push([dim("email"),    link(`mailto:${ct.email}`, ct.email)]);
      if (ct.github)   rows.push([dim("github"),   link(ct.github, ct.github.replace("https://", ""))]);
      if (ct.linkedin) rows.push([dim("linkedin"), link(ct.linkedin, ct.linkedin.replace("https://", ""))]);
      if (ct.twitter)  rows.push([dim("twitter"),  link(ct.twitter, ct.twitter.replace("https://", ""))]);

      const lines = rows.map(([label, val]) => `  ${label.padEnd(20)}${val}`).join("\n");
      return `\n${bold("CONTACT")}\n${"─".repeat(55)}\n${lines}\n`;
    },

    github() {
      if (C.contact.github) {
        window.open(C.contact.github, "_blank");
        return ok(`\n  Opening ${C.contact.github} ...\n`);
      }
      return err("\n  GitHub URL not configured — edit js/content.js\n");
    },

    linkedin() {
      if (C.contact.linkedin) {
        window.open(C.contact.linkedin, "_blank");
        return ok(`\n  Opening ${C.contact.linkedin} ...\n`);
      }
      return err("\n  LinkedIn URL not configured — edit js/content.js\n");
    },

    neofetch() {
      const nf = C.neofetch || {};
      const allSkills = [
        ...C.skills.languages || [],
        ...C.skills.backend?.slice(0, 3) || [],
        ...C.skills.frontend?.slice(0, 2) || []
      ].join(" · ");

      const dbLine = (C.skills.databases || []).join(" · ");

      const infoLines = [
        `${acc(C.name.toLowerCase().replace(/\s+/g, ""))}${dim("@")}${blu("dev")}`,
        dim("─".repeat(20)),
        `${dim("OS".padEnd(12))}${C.title}`,
        `${dim("Uptime".padEnd(12))}${nf.uptime || "N/A"}`,
        `${dim("Packages".padEnd(12))}${allSkills}`,
        `${dim("Shell".padEnd(12))}${nf.shell || "bash"}`,
        `${dim("Terminal".padEnd(12))}${nf.terminal || "himalaya.dev"}`,
        `${dim("Editor".padEnd(12))}${nf.editor || "VS Code"}`,
        `${dim("CPU".padEnd(12))}${nf.cpu || "Fueled by caffeine"}`,
        `${dim("Memory".padEnd(12))}${dbLine}`,
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
      const hist = Terminal.getHistory();
      if (hist.length === 0) return dim("\n  No commands in history yet.\n");
      const lines = hist.reverse().map((cmd, i) =>
        `  ${dim(String(i + 1).padStart(4))}  ${cmd}`
      ).join("\n");
      return `\n${lines}\n`;
    },

    ls() {
      const cmds = Object.keys(window.COMMANDS).filter(
        k => !k.startsWith("__") && !k.startsWith("rm ") && k !== "exit" && k !== "man himalaya" && k !== "sudo hire me"
      );
      return "\n  " + cmds.map(blu).join("  ") + "\n";
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

    "sudo hire me"() {
      return `
  ${acc("[ sudo ] password for recruiter:")} ${dim("••••••••••••")}

  ${ok("Access granted.")}

  Deploying ${blu("Himalaya Gupta")} to your engineering team...
  ${dim("████████████████████")} ${acc("100%")} ${ok("[DONE]")}

  Congratulations. You have excellent taste.
  Reach me at: ${link("mailto:" + C.contact.email, C.contact.email)}
`;
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
  ${dim("Connection to himalaya.dev closed.")}

  ${acc("...")}

  ${dim("Nice try. You can check out any time, but you can never leave.")}
  ${dim("Type")} ${blu("help")} ${dim("to continue exploring.")}
`;
    },

    "man himalaya"() {
      const skillList = Object.entries(C.skills)
        .filter(([, v]) => v && v.length)
        .map(([cat, items]) => `  ${dim(cat.padEnd(12))}${items.join(", ")}`)
        .join("\n");

      return `
${bold("HIMALAYA(1)")}${" ".repeat(20)}${dim("User Manual")}${" ".repeat(20)}${bold("HIMALAYA(1)")}

${bold("NAME")}
  ${C.name} — ${C.title}

${bold("SYNOPSIS")}
  ${acc("himalaya")} [${dim("--build")}] [${dim("--ship")}] [${dim("--mentor")}] [${dim("--repeat")}]

${bold("DESCRIPTION")}
  ${C.about.replace(/\n/g, "\n  ")}

${bold("OPTIONS")}
${skillList}

${bold("SEE ALSO")}
  ${blu("projects")}, ${blu("experience")}, ${blu("contact")}

${bold("BUGS")}
  ${dim("Occasional over-engineering. Working on it.")}

${dim(C.name.padEnd(40))}${dim(new Date().getFullYear().toString())}
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
      const cur = currentTheme();
      const list = Object.keys(THEMES).map(t =>
        t === cur
          ? `  ${acc("● " + t)}  ${dim("(active)")}`
          : `  ${dim("○")} ${blu(t)}`
      ).join("\n");
      return `\n${bold("THEMES")}\n${"─".repeat(30)}\n${list}\n\n  ${dim("Usage:")} ${blu("theme <name>")}\n`;
    }

    if (applyTheme(name)) {
      return ok(`\n  Theme switched to ${name}.\n`);
    }
    return err(`\n  Unknown theme: ${name}\n`) +
           `  ${dim("Available:")} ${Object.keys(THEMES).map(blu).join(dim(", "))}\n`;
  };
})();
