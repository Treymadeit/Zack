// js/auth.js
// Auth helpers — used across all protected pages

/**
 * Checks if there's an active session.
 * If not, immediately redirects to index.html.
 * Returns the session object if authenticated.
 */
async function requireAuth() {
  const { data: { session }, error } = await db.auth.getSession();
  if (error || !session) {
    window.location.replace('index.html');
    return null;
  }
  return session;
}

/**
 * Returns the currently authenticated user, or null.
 */
async function getCurrentUser() {
  const { data: { user } } = await db.auth.getUser();
  return user || null;
}

/**
 * Signs the user out and redirects to the landing page.
 */
async function logout() {
  await db.auth.signOut();
  window.location.replace('index.html');
}

/**
 * Hides the page loader overlay (fades it out).
 */
function hideLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 450);
  }
}

/**
 * Shows the page loader overlay.
 */
function showLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) loader.classList.remove('hidden');
}

/* ─── Toast Notification System ─────────────────────── */
function showToast(msg, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✓', error: '✕', info: '◉' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-msg">${msg}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ─── Date Formatting ────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/* ─── Timestamp Seconds → MM:SS ─────────────────────── */
function fmtSec(sec) {
  if (sec === null || sec === undefined) return '??:??';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

/* ─── Status Badge HTML ──────────────────────────────── */
function statusBadge(status) {
  const s = (status || 'unknown').toLowerCase();
  const cls = ['queued','processing','done','failed'].includes(s) ? s : 'default';
  return `<span class="badge badge-${cls}">${status || 'unknown'}</span>`;
}

/* ─── Truncate URL for display ───────────────────────── */
function truncateUrl(url, max = 55) {
  if (!url) return '—';
  try {
    const u = new URL(url);
    const short = u.hostname + u.pathname;
    return short.length > max ? short.slice(0, max) + '…' : short;
  } catch {
    return url.length > max ? url.slice(0, max) + '…' : url;
  }
}

/* ─── Wire up logout button ──────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
});
