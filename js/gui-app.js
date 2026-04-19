document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("gui-root");
  const wrapper = root?.parentElement; // .os-content
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
              ${proj.links.live ? `<a href="${proj.links.live}" onclick="window.safariNavigate('${proj.links.live}'); return false;">Live App →</a>` : ''}
              ${proj.links.view ? `<a href="${proj.links.view}" onclick="window.safariNavigate('${proj.links.view}'); return false;">View →</a>` : ''}
              ${proj.links.playground ? `<a href="${proj.links.playground}" onclick="window.safariNavigate('${proj.links.playground}'); return false;">Playground →</a>` : ''}
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
  root.innerHTML = `<div class="gui-wrapper">${heroHtml + experienceHtml + projectsHtml + skillsHtml}</div>`;

  // ── Interactivity ──

  // 1. Cursor Glow Tracking
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

  // 2. 3D Tilt Cards
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      // Mouse position within card
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate rotation (-10deg to 10deg)
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
      
      // Update glare target
      card.style.setProperty('--tgt-x', `${x}px`);
      card.style.setProperty('--tgt-y', `${y}px`);
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
      card.style.setProperty('--tgt-x', `-100px`);
      card.style.setProperty('--tgt-y', `-100px`);
    });
  });

  // 3. Navbar Scroll effects
  const navbar = document.querySelector('.navbar');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');

  if (wrapper && navbar) {
    wrapper.addEventListener('scroll', () => {
      // Shrink header
      if (wrapper.scrollTop > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      // Active link highlighting
      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (wrapper.scrollTop >= sectionTop) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
          link.classList.add('active');
        }
      });
    });
  }

  // 4. Fade-in observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, { threshold: 0.1 });

  sections.forEach(sec => {
    observer.observe(sec);
  });
});
