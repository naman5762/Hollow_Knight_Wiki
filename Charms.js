(function () {
  const canvas = document.getElementById('hk-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const types = [
    { color:[180,210,255], glow:[120,160,255], sizeRange:[2,5],   speedRange:[0.3,0.9],  wobble:0.6 },
    { color:[140,160,220], glow:[80,110,200],  sizeRange:[1,2.5], speedRange:[0.1,0.4],  wobble:0.3 },
    { color:[200,180,255], glow:[160,130,255], sizeRange:[1.5,3], speedRange:[0.2,0.6],  wobble:1.0 },
    { color:[100,200,200], glow:[60,180,180],  sizeRange:[2,4],   speedRange:[0.15,0.5], wobble:1.5 },
  ];

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      const t = types[Math.floor(Math.random() * types.length)];
      this.t = t;
      this.x = Math.random() * canvas.width;
      this.y = init ? Math.random() * canvas.height : canvas.height + 10;
      this.size  = t.sizeRange[0]  + Math.random() * (t.sizeRange[1]  - t.sizeRange[0]);
      this.speed = t.speedRange[0] + Math.random() * (t.speedRange[1] - t.speedRange[0]);
      this.wA = (Math.random() - 0.5) * t.wobble;
      this.wF = 0.005 + Math.random() * 0.015;
      this.wP = Math.random() * Math.PI * 2;
      this.drift = (Math.random() - 0.5) * 0.3;
      this.alpha = 0;
      this.tAlpha = 0.3 + Math.random() * 0.55;
      this.life = 0;
      this.maxLife = 200 + Math.random() * 300;
      this.pulse = Math.random() * Math.PI * 2;
      this.pSpeed = 0.02 + Math.random() * 0.04;
      this.fadeIn  = true;
      this.fadeOut = false;
    }
    update(f) {
      this.y -= this.speed;
      this.x += this.wA * Math.sin(f * this.wF + this.wP) + this.drift;
      this.pulse += this.pSpeed;
      this.life++;
      if (this.fadeIn) {
        this.alpha = Math.min(this.tAlpha, this.alpha + 0.012);
        if (this.alpha >= this.tAlpha) this.fadeIn = false;
      }
      if (this.life > this.maxLife * 0.75) this.fadeOut = true;
      if (this.fadeOut) this.alpha -= 0.008;
      if (this.alpha <= 0 || this.y < -20 || this.x < -40 || this.x > canvas.width + 40) this.reset();
    }
    draw() {
      const r = this.size * (1 + 0.12 * Math.sin(this.pulse));
      const [cr, cg, cb] = this.t.color;
      const [gr, gg, gb] = this.t.glow;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r * 3.5);
      g.addColorStop(0,    `rgba(${cr},${cg},${cb},1)`);
      g.addColorStop(0.35, `rgba(${cr},${cg},${cb},0.6)`);
      g.addColorStop(0.7,  `rgba(${gr},${gg},${gb},0.2)`);
      g.addColorStop(1,    `rgba(${gr},${gg},${gb},0)`);
      ctx.beginPath(); ctx.arc(this.x, this.y, r * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); ctx.arc(this.x, this.y, r * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(240,245,255,0.85)'; ctx.fill();
      ctx.restore();
    }
  }

  const particles = Array.from({ length: 80 }, () => new Particle());
  let frame = 0;
  (function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;
    for (const p of particles) { p.update(frame); p.draw(); }
    requestAnimationFrame(loop);
  })();
})();

(function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const delay = parseInt(el.dataset.delay || 0);
        setTimeout(() => el.classList.add('visible'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  // Stagger grid children
  document.querySelectorAll('.charms-grid').forEach(grid => {
    grid.querySelectorAll('.charm-card').forEach((card, i) => {
      card.dataset.delay = i * 90;
    });
  });

  document.querySelectorAll('.charm-card, .section-divider').forEach(el => observer.observe(el));
})();


(function () {
  const tabs = document.querySelectorAll('.tab-btn');

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      document.querySelectorAll('.charm-card, .section-divider, .lore-callout').forEach(el => {
        const cat = el.dataset.category;
        if (filter === 'all' || cat === filter) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      });

      document.querySelectorAll('.charms-grid').forEach(grid => {
        const group = grid.dataset.group;
        if (filter !== 'all' && group && group !== filter) {
          grid.classList.add('hidden');
        } else {
          grid.classList.remove('hidden');
        }
      });
    });
  });
})();

const overlay    = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const panelLogin = document.getElementById('panel-login');
const panelReg   = document.getElementById('panel-register');
const navRight   = document.getElementById('nav-right');

function openModal(panel) {
  clearMessages();
  if (panel === 'login') {
    panelLogin.classList.remove('hidden');
    panelReg.classList.add('hidden');
  } else {
    panelReg.classList.remove('hidden');
    panelLogin.classList.add('hidden');
  }
  overlay.classList.add('open');
}

function closeModal() {
  overlay.classList.remove('open');
  clearMessages();
}

function clearMessages() {
  document.querySelectorAll('.form-error, .form-success')
    .forEach(el => el.textContent = '');
}

overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
modalClose.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

document.getElementById('go-register').addEventListener('click', () => openModal('register'));
document.getElementById('go-login').addEventListener('click',    () => openModal('login'));

function getUsers()           { return JSON.parse(localStorage.getItem('hk_users') || '{}'); }
function saveUsers(u)         { localStorage.setItem('hk_users', JSON.stringify(u)); }
function getSession()         { return localStorage.getItem('hk_session') || null; }
function setSession(username) { localStorage.setItem('hk_session', username); }
function clearSession()       { localStorage.removeItem('hk_session'); }

function renderNav() {
  const user = getSession();
  if (!user) {
    navRight.innerHTML = `
      <button class="nav-btn-login" id="nav-login-btn">Sign In</button>
      <button class="nav-btn-register" id="nav-reg-btn">Register</button>
    `;
    document.getElementById('nav-login-btn').addEventListener('click', () => openModal('login'));
    document.getElementById('nav-reg-btn').addEventListener('click',   () => openModal('register'));
  } else {
    const initials = user.slice(0, 2).toUpperCase();
    navRight.innerHTML = `
      <div class="nav-user">
        <div class="nav-avatar">${initials}</div>
        <span class="nav-username">${user}</span>
        <button class="nav-btn-logout" id="nav-logout-btn">Sign Out</button>
      </div>
    `;
    document.getElementById('nav-logout-btn').addEventListener('click', () => {
      clearSession();
      renderNav();
    });
  }
}

document.getElementById('btn-register').addEventListener('click', () => {
  const username = document.getElementById('reg-username').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm  = document.getElementById('reg-confirm').value;
  const errEl    = document.getElementById('reg-error');
  const okEl     = document.getElementById('reg-success');
  errEl.textContent = ''; okEl.textContent = '';

  if (!username || !email || !password || !confirm) { errEl.textContent = 'Please fill in all fields.'; return; }
  if (username.length < 3) { errEl.textContent = 'Username must be at least 3 characters.'; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errEl.textContent = 'Please enter a valid email.'; return; }
  if (password.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; return; }
  if (password !== confirm) { errEl.textContent = 'Passwords do not match.'; return; }

  const users = getUsers();
  if (users[username.toLowerCase()]) { errEl.textContent = 'That username is already taken.'; return; }

  users[username.toLowerCase()] = { username, email, password };
  saveUsers(users);
  okEl.textContent = 'Account created! Signing you in…';
  setTimeout(() => { setSession(username); renderNav(); closeModal(); }, 1200);
});

document.getElementById('btn-login').addEventListener('click', () => {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');
  errEl.textContent = '';

  if (!username || !password) { errEl.textContent = 'Please enter your username and password.'; return; }

  const users = getUsers();
  const user  = users[username.toLowerCase()];
  if (!user || user.password !== password) { errEl.textContent = 'Incorrect username or password.'; return; }

  setSession(user.username);
  renderNav();
  closeModal();
});

document.getElementById('login-password').addEventListener('keydown', (e) => { if (e.key === 'Enter') document.getElementById('btn-login').click(); });
document.getElementById('reg-confirm').addEventListener('keydown',    (e) => { if (e.key === 'Enter') document.getElementById('btn-register').click(); });

renderNav();