// js/dashboard.js
// Dashboard — protected, shows stats, job list, URL submission

document.addEventListener('DOMContentLoaded', async () => {

  // ── 1. Auth guard ────────────────────────────────────────
  const session = await requireAuth();
  if (!session) return;
  const user = session.user;

  // ── 2. Show user email in navbar ─────────────────────────
  const emailEl = document.getElementById('user-email');
  if (emailEl) emailEl.textContent = user.email;

  // ── 3. Hide page loader ───────────────────────────────────
  hideLoader();

  // ── 4. Load everything ───────────────────────────────────
  await Promise.all([loadStats(), loadJobs()]);

  // ── 5. Submit new video job ──────────────────────────────
  const form    = document.getElementById('submit-form');
  const urlInput = document.getElementById('video-url');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return showToast('Please paste a video URL.', 'error');

    // Basic URL validation
    try { new URL(url); } catch { return showToast('That doesn\'t look like a valid URL.', 'error'); }

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.classList.add('btn-loading');
    btn.innerHTML = '';

    const { data, error } = await db
      .from('videos')
      .insert({ user_id: user.id, source_url: url, status: 'queued' })
      .select()
      .single();

    btn.classList.remove('btn-loading');
    btn.innerHTML = originalText;

    if (error) {
      showToast('Failed to submit job: ' + (error.message || 'Unknown error'), 'error');
    } else {
      showToast('Job queued! Zack is on it.', 'success');
      urlInput.value = '';
      await Promise.all([loadStats(), loadJobs()]);
    }
  });

});

// ── Load stat cards ──────────────────────────────────────────
async function loadStats() {
  const { data: videos, error } = await db
    .from('videos')
    .select('status');

  if (error || !videos) return;

  const total      = videos.length;
  const queued     = videos.filter(v => v.status === 'queued').length;
  const processing = videos.filter(v => v.status === 'processing').length;
  const done       = videos.filter(v => v.status === 'done').length;

  animateNumber('stat-total',      total);
  animateNumber('stat-queued',     queued);
  animateNumber('stat-processing', processing);
  animateNumber('stat-done',       done);
}

function animateNumber(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let cur = 0;
  const step = Math.max(1, Math.floor(target / 20));
  const timer = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur;
    if (cur >= target) clearInterval(timer);
  }, 40);
}

// ── Load jobs list ───────────────────────────────────────────
async function loadJobs() {
  const container = document.getElementById('jobs-list');
  if (!container) return;

  container.innerHTML = `<div style="text-align:center;padding:40px 0"><div class="spinner"></div></div>`;

  const { data: jobs, error } = await db
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    container.innerHTML = `<div class="empty-state">
      <span class="empty-state-icon">⚠</span>
      <p class="empty-state-title">Failed to load jobs</p>
      <p class="empty-state-body">${error.message}</p>
    </div>`;
    return;
  }

  if (!jobs || jobs.length === 0) {
    container.innerHTML = `<div class="empty-state">
      <span class="empty-state-icon">🎬</span>
      <p class="empty-state-title">No jobs yet</p>
      <p class="empty-state-body">Paste a video URL above and Zack will start finding your best moments.</p>
    </div>`;
    return;
  }

  container.innerHTML = '';
  jobs.forEach((job, i) => {
    const card = document.createElement('div');
    card.className = 'job-card';
    card.style.animationDelay = `${i * 0.05}s`;
    card.innerHTML = `
      <div class="job-card-icon">🎬</div>
      <div class="job-card-body">
        <div class="job-card-url">${job.source_url || '—'}</div>
        <div class="job-card-meta">
          ${statusBadge(job.status)}
          <span>Submitted ${formatDate(job.created_at)}</span>
        </div>
      </div>
      <div class="job-card-actions">
        <a href="job.html?id=${job.id}" class="btn btn-ghost btn-sm">
          View Job →
        </a>
      </div>
    `;
    card.addEventListener('click', (e) => {
      if (!e.target.closest('a')) window.location.href = `job.html?id=${job.id}`;
    });
    container.appendChild(card);
  });
}
