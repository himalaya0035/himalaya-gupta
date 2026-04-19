document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("gui-root");
  if (!root || !window.CONTENT) return;

  const data = window.CONTENT;

  // 1. Hero Section
  const heroHtml = `
    <section class="hero" id="about">
      <h1>${data.name}</h1>
      <h2>${data.title}</h2>
      <div class="hero-content">${data.about}</div>
      <div class="hero-actions">
        ${data.contact.github ? `<a href="${data.contact.github}" target="_blank" class="btn btn-secondary">GitHub</a>` : ''}
        ${data.contact.linkedin ? `<a href="${data.contact.linkedin}" target="_blank" class="btn btn-secondary">LinkedIn</a>` : ''}
        ${data.contact.email ? `<a href="mailto:${data.contact.email}" class="btn btn-primary">Contact Me</a>` : ''}
      </div>
    </section>
  `;

  // 2. Experience Section
  const experienceHtml = `
    <section id="experience">
      <h2 class="section-title">Experience</h2>
      <div class="grid">
        ${data.experience.map((job, idx) => `
          <div class="timeline-item" style="animation-delay: ${idx * 0.1 + 0.2}s">
            <div class="exp-header">
              <h3>${job.company}</h3>
              <span class="period">${job.period}</span>
            </div>
            <div class="exp-role">${job.role}</div>
            <ul class="exp-highlights">
              ${job.highlights.map(h => `<li>${h}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    </section>
  `;

  // 3. Projects Section
  const projectsHtml = `
    <section id="projects">
      <h2 class="section-title">Featured Projects</h2>
      <div class="grid projects-grid">
        ${data.projects.map((proj, idx) => `
          <div class="card" style="animation-delay: ${idx * 0.1 + 0.2}s">
            <h3>${proj.name}</h3>
            <p>${proj.description}</p>
            <div class="tags">
              ${proj.tech.map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
            <div class="card-links">
              ${proj.links.github ? `<a href="${proj.links.github}" target="_blank">GitHub →</a>` : ''}
              ${proj.links.live ? `<a href="${proj.links.live}" target="_blank">Live App →</a>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;

  // 4. Skills Section
  let skillsContent = "";
  for (const [category, items] of Object.entries(data.skills)) {
    skillsContent += `
      <div class="skill-category">
        <h4>${category.replace('/', ' / ')}</h4>
        <ul>
          ${items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  const skillsHtml = `
    <section id="skills">
      <h2 class="section-title">Skills & Technologies</h2>
      <div class="skills-container">
        ${skillsContent}
      </div>
    </section>
  `;

  // Mount to DOM
  root.innerHTML = heroHtml + experienceHtml + projectsHtml + skillsHtml;

  // Fade-in observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('section').forEach(sec => {
    observer.observe(sec);
  });
});
