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

  // ── command registry ──────────────────────────────────────────────────────
  window.COMMANDS = {

    help() {
      const rows = [
        ["whoami",        "Who I am — the short version"],
        ["about",         "Full bio and background"],
        ["skills",        "Tech stack and tools I work with"],
        ["projects",      "Things I've built"],
        ["experience",    "Work history and highlights"],
        ["education",     "Academic background"],
        ["contact",       "How to reach me"],
        ["ls",            "List available commands"],
        ["cat resume.pdf","Download my resume"],
        ["clear",         "Clear the terminal"],
      ];
      const lines = rows.map(([cmd, desc]) =>
        `  ${blu(cmd.padEnd(20))}${dim(desc)}`
      ).join("\n");
      return `\n${bold("AVAILABLE COMMANDS")}\n${"─".repeat(50)}\n${lines}\n`;
    },

    whoami() {
      const loc = C.location ? `  ${dim("location")}  ${C.location}` : "";
      return `
  ${acc(C.name)}
  ${C.title}
${loc}

  ${dim("Type")} ${blu("about")} ${dim("for my full bio, or")} ${blu("help")} ${dim("to explore.")}
`;
    },

    about() {
      return `\n${bold("ABOUT")}\n${"─".repeat(50)}\n  ${C.about.replace(/\n/g, "\n  ")}\n`;
    },

    skills() {
      const s = C.skills;
      const row = (label, items) => {
        if (!items || items.length === 0) return "";
        return `  ${dim(label.padEnd(12))}${items.map(acc).join(dim("  ·  "))}`;
      };
      return `
${bold("SKILLS")}
${"─".repeat(50)}
${row("Languages",  s.languages)}
${row("Frontend",   s.frontend)}
${row("Backend",    s.backend)}
${row("Databases",  s.databases)}
${row("DevOps",     s.devops)}
${row("Tools",      s.tools)}
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

      return `\n${bold("PROJECTS")}\n${"─".repeat(50)}${blocks.join("\n")}\n`;
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

      return `\n${bold("EXPERIENCE")}\n${"─".repeat(50)}${blocks.join("\n")}\n`;
    },

    education() {
      if (!C.education || C.education.length === 0)
        return err("\n  No education configured yet — edit js/content.js\n");
      const blocks = C.education.map(e =>
        `\n  ${blu(e.degree)}\n  ${dim(e.institution)}  ${dim(e.year)}`
      );
      return `\n${bold("EDUCATION")}\n${"─".repeat(50)}${blocks.join("\n")}\n`;
    },

    contact() {
      const ct = C.contact;
      const rows = [];
      if (ct.email)    rows.push([dim("email"),    link(`mailto:${ct.email}`, ct.email)]);
      if (ct.github)   rows.push([dim("github"),   link(ct.github, ct.github.replace("https://", ""))]);
      if (ct.linkedin) rows.push([dim("linkedin"), link(ct.linkedin, ct.linkedin.replace("https://", ""))]);
      if (ct.twitter)  rows.push([dim("twitter"),  link(ct.twitter, ct.twitter.replace("https://", ""))]);

      const lines = rows.map(([label, val]) => `  ${label.padEnd(20)}${val}`).join("\n");
      return `\n${bold("CONTACT")}\n${"─".repeat(50)}\n${lines}\n`;
    },

    ls() {
      const cmds = Object.keys(window.COMMANDS).filter(k => k !== "__noSuchCommand__");
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

    clear() {
      return "__CLEAR__";
    },

    __noSuchCommand__(cmd) {
      return err(`\n  bash: ${cmd}: command not found\n`) +
             `  ${dim("Type")} ${blu("help")} ${dim("to see available commands.")}\n`;
    }
  };
})();
