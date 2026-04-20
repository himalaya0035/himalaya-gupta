/**
 * imessage.js
 * macOS Messages-style contact form:
 * - Chat bubble UI with pre-loaded conversation
 * - User can type and "send" messages
 * - Messages stored in localStorage
 * - Simulated auto-replies
 */
(() => {
  const chatBody = document.getElementById('imsg-chat-body');
  const chatInput = document.getElementById('imsg-input');
  const sendBtn = document.getElementById('imsg-send-btn');
  if (!chatBody || !chatInput) return;

  const STORAGE_KEY = 'imessage-history';
  const data = window.CONTENT || {};

  // ── Pre-loaded conversation ───────────────────────────────────────────
  const DEFAULT_MESSAGES = [
    { from: 'them', text: "Hey! Welcome to my portfolio 👋", time: '10:00 AM' },
    { from: 'them', text: "I'm Himalaya — a Senior Software Engineer specializing in Node.js, React, and cloud-native architecture.", time: '10:00 AM' },
    { from: 'them', text: "Feel free to drop a message here. I'd love to chat about projects, roles, or just tech in general.", time: '10:01 AM' },
  ];

  const AUTO_REPLIES = [
    { keywords: ['hi', 'hello', 'hey', 'sup', 'yo', 'hola', 'greetings'], reply: "Hey there! Great to have you here. What brings you to my portfolio?" },
    { keywords: ['hire', 'job', 'role', 'position', 'opportunity', 'opening', 'vacancy'], reply: "I'm always open to exciting opportunities! Drop me an email at guptahimalaya2@gmail.com and let's talk details 🚀" },
    { keywords: ['project', 'collaborate', 'build', 'freelance', 'contract', 'gig', 'partnership'], reply: "I love building things! Tell me more about what you have in mind — I'm all ears." },
    { keywords: ['stack', 'tech', 'node', 'react', 'javascript', 'typescript', 'language'], reply: "My core stack is Node.js + React + PostgreSQL/MongoDB, with AWS for infra. I'm also deep into Kafka, Redis, and event-driven architecture." },
    { keywords: ['experience', 'background', 'resume', 'cv', 'career', 'history'], reply: "3+ years as a Senior Engineer at Lumiq, scaling platforms to 200K+ users. You can check my resume — it's on the desktop as Resume.pdf!" },
    { keywords: ['github', 'code', 'repo', 'open source', 'oss'], reply: "Check out github.com/himalaya0035 — I've got GitPilot, a React JSON Editor with 2K+ npm downloads, and more." },
    { keywords: ['contact', 'email', 'reach', 'connect', 'linkedin', 'socials', 'twitter'], reply: "Best way to reach me: guptahimalaya2@gmail.com or linkedin.com/in/himalayagupta03. I usually respond within a day!" },
    { keywords: ['portfolio', 'site', 'website', 'cool', 'awesome', 'amazing', 'nice', 'great', 'love', 'impressive', 'wow', 'insane', 'sick', 'dope', 'fire'], reply: "Thanks! I built this entire desktop OS from scratch with vanilla JS — no frameworks. Glad you're enjoying it 😊" },
    { keywords: ['salary', 'pay', 'compensation', 'ctc', 'package', 'money'], reply: "Happy to discuss compensation details over email — let's first see if there's a good fit! guptahimalaya2@gmail.com" },
    { keywords: ['available', 'when', 'start', 'notice', 'join', 'timeline'], reply: "I'm open to discussing timelines. Let's connect over email and work out the details — guptahimalaya2@gmail.com" },
    { keywords: ['aws', 'cloud', 'devops', 'docker', 'kubernetes', 'k8s', 'ci/cd', 'deploy'], reply: "I'm AWS Certified (Developer Associate). I work with EC2, S3, CloudWatch, Docker, and CI/CD pipelines daily. Infrastructure as code is my jam." },
    { keywords: ['kafka', 'redis', 'queue', 'event', 'microservice', 'pub/sub', 'stream'], reply: "At Lumiq I engineered event-driven services with Kafka and Redis — handling high-throughput data pipelines for insurance platforms." },
    { keywords: ['database', 'mongo', 'postgres', 'sql', 'db', 'schema', 'migration'], reply: "I work with both MongoDB and PostgreSQL. Schema design, query optimization, migrations — I've handled it all in production at scale." },
    { keywords: ['api', 'rest', 'graphql', 'endpoint', 'backend', 'server', 'express'], reply: "Backend is my bread and butter — Node.js + Express, RESTful API design, OAuth 2.0, WebSockets. I've built APIs serving 400K+ users." },
    { keywords: ['frontend', 'ui', 'ux', 'design', 'css', 'tailwind', 'component'], reply: "While I'm backend-focused, I'm solid with React, Next.js, Tailwind, and Shadcn. This portfolio itself is proof I care about UI/UX!" },
    { keywords: ['ai', 'llm', 'gpt', 'machine learning', 'ml', 'prompt', 'automation', 'mistral'], reply: "I've integrated LLMs into production apps — ApplyPilot uses Mistral AI for intelligent job applications. Prompt engineering is a real skill." },
    { keywords: ['testing', 'test', 'jest', 'unit', 'integration', 'qa', 'quality'], reply: "I believe in shipping reliable software. Unit tests, integration tests, and SonarQube for code quality — I've resolved 15K+ issues at Lumiq." },
    { keywords: ['team', 'lead', 'manage', 'mentor', 'leadership'], reply: "I lead a team of 4 engineers at Lumiq, own 20+ features end-to-end, and drive architecture decisions. I enjoy mentoring junior devs too." },
    { keywords: ['education', 'college', 'degree', 'university', 'btech', 'jiit'], reply: "B.Tech in Computer Science from JIIT Noida (2019-2023). Built a strong foundation in DSA, system design, and software engineering." },
    { keywords: ['achievement', 'award', 'hackathon', 'leetcode', 'competitive'], reply: "Spot Award at Lumiq, 10+ client appreciations, hackathon wins, and 500+ LeetCode problems solved. I love a good challenge!" },
    { keywords: ['remote', 'wfh', 'hybrid', 'onsite', 'office', 'location', 'relocate'], reply: "I'm based in Noida, India. Open to remote, hybrid, or relocation depending on the opportunity. Let's discuss!" },
    { keywords: ['gitpilot', 'git', 'workflow', 'pipeline', 'automation tool'], reply: "GitPilot is my visual Git workflow automation platform — drag-and-drop pipeline design with real-time WebSocket execution. Check it out in the dock!" },
    { keywords: ['json', 'editor', 'npm', 'library', 'package', 'open source library'], reply: "My React JSON Editor has 2K+ npm downloads — modular, inline editing, dynamic type rendering, and JSON path validations. It's in the dock too!" },
    { keywords: ['applypilot', 'apply', 'job application', 'naukri', 'instahyre'], reply: "ApplyPilot automates job applications across Naukri, LinkedIn, and Instahyre using Mistral AI. It's a full production-grade platform." },
    { keywords: ['how', 'built', 'made', 'create', 'develop', 'vanilla'], reply: "This portfolio is 100% vanilla JS, CSS, and HTML — no React, no frameworks. Every window, animation, and interaction is hand-crafted." },
    { keywords: ['security', 'oauth', 'auth', 'encryption', 'rsa', 'sso'], reply: "I implemented OAuth 2.0 SSO and RSA encryption at Lumiq, securing 400K+ users. Security isn't an afterthought for me." },
    { keywords: ['bye', 'goodbye', 'later', 'see you', 'thanks', 'thank', 'cheers'], reply: "Thanks for stopping by! Don't hesitate to reach out — guptahimalaya2@gmail.com. Have a great day! 👋" },
    { keywords: ['what', 'who', 'tell me about', 'about you', 'yourself', 'intro'], reply: "I'm Himalaya Gupta — Senior Software Engineer with 3+ years building high-traffic platforms. Node.js, React, AWS, and a passion for clean architecture." },
    { keywords: ['fun', 'hobby', 'interest', 'outside work', 'free time'], reply: "Outside of coding, I enjoy competitive programming, exploring new tech, and building side projects like this desktop OS portfolio!" },
    { keywords: ['startup', 'founder', 'entrepreneur', 'idea', 'mvp'], reply: "I love the startup energy! If you're building an MVP or need a technical co-founder type, let's chat — guptahimalaya2@gmail.com" },
  ];

  const FALLBACK_REPLIES = [
    "That's interesting! Want to discuss further over email? guptahimalaya2@gmail.com",
    "I'd love to chat more about that. Feel free to reach out on LinkedIn — himalayagupta03!",
    "Thanks for the message! I'll get back to you — drop me a line at guptahimalaya2@gmail.com for a quicker response.",
    "Good question! Let's take this conversation to email — guptahimalaya2@gmail.com. I can go into more detail there.",
    "Appreciate you reaching out! For a detailed response, email me at guptahimalaya2@gmail.com 🙌",
  ];

  function getSmartReply(userMsg) {
    const lower = userMsg.toLowerCase();
    for (const entry of AUTO_REPLIES) {
      if (entry.keywords.some(kw => lower.includes(kw))) {
        return entry.reply;
      }
    }
    return FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
  }

  let messages = [];

  function loadMessages() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { messages = JSON.parse(saved); } catch { messages = [...DEFAULT_MESSAGES]; }
    } else {
      messages = [...DEFAULT_MESSAGES];
    }
  }

  function saveMessages() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }

  function getTimeNow() {
    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  function renderMessages() {
    chatBody.innerHTML = messages.map((msg, i) => {
      const isMe = msg.from === 'me';
      // Show time if first message or different sender or 2+ min gap
      const showTime = i === 0 || messages[i - 1].from !== msg.from;
      return `
        ${showTime ? `<div class="imsg-time">${msg.time}</div>` : ''}
        <div class="imsg-bubble ${isMe ? 'imsg-me' : 'imsg-them'}">
          ${escapeHtml(msg.text)}
        </div>
      `;
    }).join('');

    // Scroll to bottom
    requestAnimationFrame(() => {
      chatBody.scrollTop = chatBody.scrollHeight;
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    messages.push({ from: 'me', text, time: getTimeNow() });
    chatInput.value = '';
    saveMessages();
    renderMessages();

    // Simulate typing indicator then auto-reply
    setTimeout(() => {
      const typing = document.createElement('div');
      typing.className = 'imsg-bubble imsg-them imsg-typing';
      typing.innerHTML = '<span class="imsg-dot"></span><span class="imsg-dot"></span><span class="imsg-dot"></span>';
      chatBody.appendChild(typing);
      chatBody.scrollTop = chatBody.scrollHeight;

      setTimeout(() => {
        typing.remove();
        const reply = getSmartReply(text);
        messages.push({ from: 'them', text: reply, time: getTimeNow() });
        saveMessages();
        renderMessages();
      }, 1500 + Math.random() * 1000);
    }, 600);
  }

  // ── Events ────────────────────────────────────────────────────────────
  if (sendBtn) {
    sendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sendMessage();
    });
  }

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // ── Init ──────────────────────────────────────────────────────────────
  loadMessages();
  renderMessages();
})();
