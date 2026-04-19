// Login.js  (works on every page)
(function () {

  /* ── helpers ─────────────────────────────────────── */
  const $ = id => document.getElementById(id);

  function getUsers()        { return JSON.parse(localStorage.getItem('hk_users')  || '{}'); }
  function saveUsers(u)      { localStorage.setItem('hk_users', JSON.stringify(u)); }
  function getSession()      { return localStorage.getItem('hk_session'); }
  function saveSession(user) { localStorage.setItem('hk_session', user); }
  function clearSession()    { localStorage.removeItem('hk_session'); }

  /* ── nav rendering ───────────────────────────────── */
  function renderNav() {
    const user = getSession();

    // Pages like Home.html use a dynamic #nav-right div
    const navRight = $('nav-right');
    if (navRight) {
      navRight.innerHTML = user
        ? `<span class="nav-user">&#9670; ${user}</span>
           <button class="nav-btn outline" id="btn-logout">Sign Out</button>`
        : `<button class="nav-btn outline" id="btn-open-signin">Sign In</button>
           <button class="nav-btn solid"  id="btn-open-register">Register</button>`;
    }

    // Pages like Lore.html have hardcoded buttons — hide/show them
    const btnSignIn   = $('btn-open-signin');
    const btnRegister = $('btn-open-register');
    if (btnSignIn)   btnSignIn.style.display   = user ? 'none' : '';
    if (btnRegister) btnRegister.style.display = user ? 'none' : '';

    // If logged in, inject a greeting + sign-out next to hardcoded buttons
    const hardcodedNavRight = document.querySelector('header .nav-right');
    if (hardcodedNavRight && user) {
      // avoid duplicating
      if (!hardcodedNavRight.querySelector('.nav-user')) {
        const span = document.createElement('span');
        span.className = 'nav-user';
        span.textContent = `◆ ${user}`;
        const out = document.createElement('button');
        out.className = 'nav-btn outline';
        out.id = 'btn-logout';
        out.textContent = 'Sign Out';
        hardcodedNavRight.appendChild(span);
        hardcodedNavRight.appendChild(out);
      }
    }

    // wire logout wherever it ended up
    const btnLogout = $('btn-logout');
    if (btnLogout) btnLogout.addEventListener('click', () => {
      clearSession();
      renderNav();
    });
  }

  /* ── modal open/close ────────────────────────────── */
  function openModal(panel) {
    const overlay = $('modal-overlay');
    if (!overlay) return;
    overlay.classList.add('open');   // ← was 'active', CSS uses 'open'
    $('panel-login').classList.toggle   ('hidden', panel !== 'login');
    $('panel-register').classList.toggle('hidden', panel !== 'register');
  }
  function closeModal() {
    const overlay = $('modal-overlay');
    if (overlay) overlay.classList.remove('open');  // ← was 'active'
  }

  /* ── event wiring ─────────────────────────────────── */
  document.addEventListener('click', e => {
    const id = e.target.id;
    if (id === 'btn-open-signin')   openModal('login');
    if (id === 'btn-open-register') openModal('register');
    if (id === 'modal-close')       closeModal();
    if (e.target === $('modal-overlay')) closeModal(); // click outside
    if (id === 'go-register') { closeModal(); openModal('register'); }
    if (id === 'go-login')    { closeModal(); openModal('login');    }
  });

  /* ── login ───────────────────────────────────────── */
  document.addEventListener('click', e => {
    if (e.target.id !== 'btn-login') return;
    const username = $('login-username')?.value.trim();
    const password = $('login-password')?.value;
    const errEl    = $('login-error');
    const users    = getUsers();

    if (!users[username] || users[username].password !== password) {
      if (errEl) errEl.textContent = 'Invalid username or password.';
      return;
    }
    if (errEl) errEl.textContent = '';
    saveSession(username);
    closeModal();
    renderNav();
  });

  /* ── register ────────────────────────────────────── */
  document.addEventListener('click', e => {
    if (e.target.id !== 'btn-register') return;
    const username = $('reg-username')?.value.trim();
    const email    = $('reg-email')?.value.trim();
    const password = $('reg-password')?.value;
    const confirm  = $('reg-confirm')?.value;
    const errEl    = $('reg-error');
    const okEl     = $('reg-success');
    const users    = getUsers();

    if (!username || !email || !password) {
      if (errEl) errEl.textContent = 'All fields are required.'; return;
    }
    if (password !== confirm) {
      if (errEl) errEl.textContent = 'Passwords do not match.'; return;
    }
    if (users[username]) {
      if (errEl) errEl.textContent = 'Username already taken.'; return;
    }
    users[username] = { email, password };
    saveUsers(users);
    if (errEl) errEl.textContent = '';
    if (okEl)  okEl.textContent  = 'Account created! You can now sign in.';
  });

  /* ── init ─────────────────────────────────────────── */
  renderNav();

})();