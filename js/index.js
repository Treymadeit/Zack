// js/index.js
// Landing page logic: auth check, login, signup

document.addEventListener('DOMContentLoaded', async () => {

  // ── 1. If already signed in, go straight to dashboard ───
  const { data: { session } } = await db.auth.getSession();
  if (session) {
    window.location.replace('dashboard.html');
    return;
  }

  // ── 2. Reveal the page ───────────────────────────────────
  hideLoader();

  // ── 3. Tab switching (login / signup) ────────────────────
  const loginTab  = document.getElementById('tab-login');
  const signupTab = document.getElementById('tab-signup');
  const loginForm  = document.getElementById('form-login');
  const signupForm = document.getElementById('form-signup');

  function activateTab(tab) {
    if (tab === 'login') {
      loginTab.classList.add('active');
      signupTab.classList.remove('active');
      loginForm.style.display  = 'block';
      signupForm.style.display = 'none';
    } else {
      signupTab.classList.add('active');
      loginTab.classList.remove('active');
      signupForm.style.display = 'block';
      loginForm.style.display  = 'none';
    }
  }
  loginTab.addEventListener('click',  () => activateTab('login'));
  signupTab.addEventListener('click', () => activateTab('signup'));

  // ── 4. Password show/hide toggles ────────────────────────
  document.querySelectorAll('.input-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.input-wrapper').querySelector('.form-input');
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      btn.innerHTML = isText ? eyeIcon() : eyeOffIcon();
    });
  });

  function eyeIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>`;
  }
  function eyeOffIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>`;
  }

  // ── 5. LOGIN ─────────────────────────────────────────────
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn   = loginForm.querySelector('button[type="submit"]');
    const email = loginForm.querySelector('#login-email').value.trim();
    const pass  = loginForm.querySelector('#login-password').value;

    if (!email || !pass) return showToast('Please fill in all fields.', 'error');

    btn.classList.add('btn-loading');
    btn.textContent = '';

    const { data, error } = await db.auth.signInWithPassword({ email, password: pass });

    btn.classList.remove('btn-loading');
    btn.textContent = 'Sign In';

    if (error) {
      showToast(error.message || 'Login failed. Please try again.', 'error');
    } else {
      showToast('Welcome back! Redirecting…', 'success', 1500);
      setTimeout(() => window.location.replace('dashboard.html'), 1000);
    }
  });

  // ── 6. SIGNUP ────────────────────────────────────────────
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn   = signupForm.querySelector('button[type="submit"]');
    const email = signupForm.querySelector('#signup-email').value.trim();
    const pass  = signupForm.querySelector('#signup-password').value;
    const conf  = signupForm.querySelector('#signup-confirm').value;

    if (!email || !pass || !conf) return showToast('Please fill in all fields.', 'error');
    if (pass !== conf) return showToast('Passwords do not match.', 'error');
    if (pass.length < 6) return showToast('Password must be at least 6 characters.', 'error');

    btn.classList.add('btn-loading');
    btn.textContent = '';

    const { data, error } = await db.auth.signUp({ email, password: pass });

    btn.classList.remove('btn-loading');
    btn.textContent = 'Create Account';

    if (error) {
      showToast(error.message || 'Sign up failed. Please try again.', 'error');
    } else if (data?.user?.identities?.length === 0) {
      showToast('An account with that email already exists.', 'error');
    } else {
      showToast('Account created! Check your email to confirm, then sign in.', 'success', 6000);
      activateTab('login');
    }
  });

  // ── 7. Smooth scroll for anchor links ────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

});
