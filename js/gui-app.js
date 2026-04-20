document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("gui-root");
  const wrapper = root?.parentElement; // .os-content
  if (!root || !window.CONTENT) return;

  const data = window.CONTENT;

  // ── Utils ───────────────────────────────────────────────────────────
  const createTile = (content, className = "") => `
    <div class="bento-tile ${className}">
      ${content}
    </div>
  `;

  // ── 1. Hero Section ────────────────────────────────────────────────
  const heroHtml = `
    <section class="hero" id="about">
      <h1>${data.name}</h1>
      <h2>${data.title}</h2>
      <div class="hero-content">Senior Software Engineer building and scaling high-traffic platforms with Node.js and cloud-native architecture.</div>
      <div class="hero-actions">
        ${data.contact.email ? `<a href="mailto:${data.contact.email}" class="btn btn-primary">Let's Connect</a>` : ''}
        ${data.contact.github ? `<a href="${data.contact.github}" target="_blank" class="btn btn-secondary">GitHub</a>` : ''}
      </div>
    </section>
  `;

  // ── 2. Bento Grid Construction ─────────────────────────────────────
  
  // Card 1: Experience (Large 2x2)
  const jobHistoryBox = `
    <h2 class="section-title" style="margin-bottom: 24px; font-size: 1rem; color: var(--dim); text-transform: uppercase; letter-spacing: 0.05em;">Professional Experience</h2>
    <div class="experience-content">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
        <div>
          <div style="font-size: 1.4rem; font-weight: 800; color: #fff; line-height: 1.2;">${data.experience[0].role}</div>
          <div style="font-size: 1.1rem; color: var(--acc); font-weight: 600; margin-top: 4px;">${data.experience[0].company}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.85rem; color: var(--dim); font-weight: 500; font-family: monospace;">${data.experience[0].period}</div>
          <div style="font-size: 0.7rem; color: var(--acc); text-transform: uppercase; margin-top: 4px; font-weight: 700; letter-spacing: 1px;">3+ Years Exp</div>
        </div>
      </div>
      
      <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 14px;">
        <li style="display: flex; gap: 12px; font-size: 0.95rem; color: var(--dim); line-height: 1.5;">
          <span style="color: var(--acc); font-weight: bold;">•</span>
          <span>Scaled ISNP insurance platform supporting <b>200K+ applications</b> and Rs 40–50 Cr annual revenue.</span>
        </li>
        <li style="display: flex; gap: 12px; font-size: 0.95rem; color: var(--dim); line-height: 1.5;">
          <span style="color: var(--acc); font-weight: bold;">•</span>
          <span>Led a team of <b>4 engineers</b>, delivering 50+ client requests and owning 20+ features end-to-end.</span>
        </li>
        <li style="display: flex; gap: 12px; font-size: 0.95rem; color: var(--dim); line-height: 1.5;">
          <span style="color: var(--acc); font-weight: bold;">•</span>
          <span>Implemented <b>OAuth 2.0 SSO</b> and RSA encryption securing over 400K+ users.</span>
        </li>
        <li style="display: flex; gap: 12px; font-size: 0.95rem; color: var(--dim); line-height: 1.5;">
          <span style="color: var(--acc); font-weight: bold;">•</span>
          <span>Engineered event-driven services using <b>Kafka & Redis</b> for high-performance cloud systems.</span>
        </li>
        <li style="display: flex; gap: 12px; font-size: 0.95rem; color: var(--dim); line-height: 1.5;">
          <span style="color: var(--acc); font-weight: bold;">•</span>
          <span>Led <b>Node.js v14 → v20 migration</b>, eliminating 15K+ lines of legacy code and resolving 15K+ SonarQube issues.</span>
        </li>
      </ul>
    </div>
  `;

  // Card 2: Production Stats (2x1)
  const productionStatsBox = `
    <div style="display: flex; align-items: center; gap: 32px; height: 100%; padding: 10px 0;">
       <div class="stat-value" style="font-size: 4.8rem; line-height: 1; background: linear-gradient(to bottom, #fff, var(--dim)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; font-family: 'Outfit'; font-weight: 900;">3+</div>
       <div style="text-align: left; max-width: 200px;">
         <div style="font-size: 1.1rem; color: #fff; font-weight: 700; line-height: 1.3;">Years crafting production-ready apps</div>
         <div style="font-size: 0.85rem; color: var(--dim); margin-top: 8px; line-height: 1.4;">Engineering high-traffic cloud systems.</div>
       </div>
    </div>
  `;

  // Card 3: Technologies & Skills (Large 2x2)
  const skillsBox = `
    <h3 class="section-title" style="margin-bottom: 20px; font-size: 1.2rem;">Technologies & Skills</h3>
    <div style="display: flex; flex-direction: column; gap: 14px; overflow-y: auto; max-height: 380px;">
      ${Object.entries(data.skills).map(([cat, skills]) => `
        <div class="skill-category">
          <h4 style="font-size: 0.7rem; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; opacity: 0.7;">${cat}</h4>
          <div class="skill-pills" style="margin-top: 0; gap: 6px;">
            ${skills.slice(0, 8).map(s => `<span class="skill-pill" style="font-size: 0.65rem; padding: 2px 8px;">${s}</span>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Card 4: GitPilot (2x1)
  const gitPilotBox = `
    <span class="stat-label">Featured Project</span>
    <h3 style="margin: 4px 0;">GitPilot</h3>
    <div class="skill-pills" style="gap: 6px; margin: 8px 0;">
      <span class="skill-pill" style="font-size: 0.6rem; padding: 1px 6px;">Node.js</span>
      <span class="skill-pill" style="font-size: 0.6rem; padding: 1px 6px;">Socket.IO</span>
      <span class="skill-pill" style="font-size: 0.6rem; padding: 1px 6px;">React Flow</span>
    </div>
    <p style="font-size: 0.85rem; color: var(--dim); margin-top: 4px;">Visual Git workflow automation & pipeline execution.</p>
    <div class="card-links" style="margin-top: auto;"><a href="#" onclick="window.safariNavigate('https://himalaya0035.github.io/GitPilot/'); return false;">Launch Platform →</a></div>
  `;

  // Card 5: ApplyPilot (2x1)
  const applyPilotBox = `
    <span class="stat-label">AI Automation</span>
    <h3 style="margin: 4px 0;">ApplyPilot</h3>
    <div class="skill-pills" style="gap: 6px; margin: 8px 0;">
      <span class="skill-pill" style="font-size: 0.6rem; padding: 1px 6px; border-color: var(--acc);">Mistral AI</span>
      <span class="skill-pill" style="font-size: 0.6rem; padding: 1px 6px;">Playwright</span>
      <span class="skill-pill" style="font-size: 0.6rem; padding: 1px 6px;">MongoDB</span>
    </div>
    <p style="font-size: 0.85rem; color: var(--dim); margin-top: 4px;">Intelligent job application platform using LLMs.</p>
    <div class="card-links" style="margin-top: auto;"><a href="#" onclick="window.safariNavigate('https://himalaya0035.github.io/ApplyAI-LandingPage/'); return false;">Demo App →</a></div>
  `;

  // Card 6: React JSON Editor (2x1)
  const jsonEditorBox = `
    <span class="stat-label">Open Source Library</span>
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 8px;">
      <div>
        <h3 style="font-size: 1.4rem; margin: 0; line-height: 1.2;">React JSON Editor</h3>
        <div class="skill-pills" style="gap: 6px; margin: 8px 0;">
          <span class="skill-pill" style="font-size: 0.6rem; padding: 1px 6px;">React.js</span>
          <span class="skill-pill" style="font-size: 0.6rem; padding: 1px 6px;">TypeScript</span>
        </div>
      </div>
      <div style="text-align: right; background: rgba(56, 189, 248, 0.05); padding: 10px; border-radius: 14px; border: 1px solid rgba(56, 189, 248, 0.2); box-shadow: 0 0 20px rgba(56, 189, 248, 0.15); display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 90px;">
        <div class="stat-value" style="font-size: 1.6rem; line-height: 1; font-family: 'Outfit'; background: linear-gradient(135deg, #fff 0%, var(--acc) 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">2K+</div>
        <div style="font-size: 0.5rem; color: var(--acc); text-transform: uppercase; font-weight: 900; letter-spacing: 0.5px; margin-top: 4px;">npm downloads</div>
      </div>
    </div>
    <p style="font-size: 0.85rem; color: var(--dim); margin-top: 6px;">Modular library for dynamic JSON schemas with inline validation.</p>
    <div class="card-links" style="margin-top: auto;"><a href="#" onclick="window.safariNavigate('https://himalaya0035.github.io/react-json-editor-alt/'); return false;">View Library →</a></div>
  `;

  const gridHtml = `
    <section id="experience" class="bento-grid">
      ${createTile(jobHistoryBox, "tile-2x2")}
      ${createTile(skillsBox, "tile-2x2")}
      ${createTile(productionStatsBox, "tile-2x1")}
      ${createTile(gitPilotBox, "tile-2x1")}
      ${createTile(applyPilotBox, "tile-2x1")}
      ${createTile(jsonEditorBox, "tile-2x1")}
    </section>
  `;

  // ── Final Mount ────────────────────────────────────────────────────
  root.innerHTML = `
    <div class="gui-wrapper">
      <div style="height: 40px;"></div>
      ${heroHtml}
      ${gridHtml}
      
      <section class="cta-section">
        <div class="cta-card">
          <h2>Let's Build Something Great</h2>
          <p>Always open to discussing new projects, senior engineering roles, or interesting collaborations.</p>
          <a href="mailto:${data.contact.email}" class="btn btn-primary">Get in touch →</a>
        </div>
      </section>

      <footer class="footer">
        <div class="footer-content">
          <p>Built with ❤️ by <strong>Himalaya Gupta</strong></p>
          <div class="footer-links">
            <a href="${data.contact.github}" target="_blank">GitHub</a>
            <a href="${data.contact.linkedin}" target="_blank">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  `;

  // ── Interactivity & Polish ─────────────────────────────────────────

  // 1. Mouse Glow
  const guiWrapper = document.querySelector('.gui-wrapper');
  if (wrapper && guiWrapper) {
    wrapper.addEventListener("mousemove", (e) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      guiWrapper.style.setProperty('--mouse-x', `${x}px`);
      guiWrapper.style.setProperty('--mouse-y', `${y}px`);
    });
  }

  // 2. Intersection Observer for Scroll Animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('section, .bento-tile').forEach(el => {
    observer.observe(el);
  });

  // 3. Navbar logic
  const navbar = document.querySelector('.navbar');
  if (wrapper && navbar) {
    wrapper.addEventListener('scroll', () => {
      if (wrapper.scrollTop > 50) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    });
  }
});
