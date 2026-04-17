// js/job.js
// Job detail page — shows video info + clip candidates

document.addEventListener('DOMContentLoaded', async () => {

  // ── 1. Auth guard ────────────────────────────────────────
  const session = await requireAuth();
  if (!session) return;
  const user = session.user;

  // ── 2. Parse video ID from query string ──────────────────
  const params  = new URLSearchParams(window.location.search);
  const videoId = params.get('id');

  if (!videoId) {
    showToast('No video ID provided.', 'error');
    setTimeout(() => window.location.replace('dashboard.html'), 2000);
    return;
  }

  // ── 3. Show user email ────────────────────────────────────
  const emailEl = document.getElementById('user-email');
  if (emailEl) emailEl.textContent = user.email;

  // ── 4. Load video + candidates in parallel ────────────────
  const [videoRes, candidatesRes] = await Promise.all([
    db.from('videos').select('*').eq('id', videoId).single(),
    db.from('clip_candidates').select('*').eq('video_id', videoId).order('rank', { ascending: true }).limit(20)
  ]);

  hideLoader();

  // ── 5. Render video details ───────────────────────────────
  const video = videoRes.data;
  if (videoRes.error || !video) {
    document.getElementById('job-content').innerHTML = `<div class="empty-state">
      <span class="empty-state-icon">⚠</span>
      <p class="empty-state-title">Job not found</p>
      <p class="empty-state-body">This job doesn't exist or you don't have access to it.</p>
      <a href="dashboard.html" class="btn btn-ghost btn-sm mt-16">← Back to Dashboard</a>
    </div>`;
    return;
  }

  // Set dynamic page title
  document.title = `Job — ${truncateUrl(video.source_url, 40)} · Zack`;

  // Fill in detail grid
  document.getElementById('job-status').innerHTML    = statusBadge(video.status);
  document.getElementById('job-created').textContent = formatDateTime(video.created_at);
  document.getElementById('job-id').textContent      = video.id;
  document.getElementById('job-url').innerHTML = `
    <a href="${video.source_url}" target="_blank" rel="noopener" class="url-chip">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
      ${video.source_url}
    </a>
  `;

  // Clips link
  const clipsBtn = document.getElementById('clips-btn');
  if (clipsBtn) clipsBtn.href = `clips.html?id=${videoId}`;

  // ── 6. Render clip candidates ─────────────────────────────
  const candidatesEl = document.getElementById('candidates-list');
  const candidates   = candidatesRes.data || [];

  // Update count label
  const countEl = document.getElementById('candidates-count');
  if (countEl) countEl.textContent = `${candidates.length} moments found`;

  if (!candidates.length) {
    candidatesEl.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <span class="empty-state-icon">🔍</span>
      <p class="empty-state-title">No clip candidates yet</p>
      <p class="empty-state-body">Zack is still analyzing your video. Check back in a moment.</p>
    </div>`;
  } else {
    candidatesEl.innerHTML = '';
    candidates.forEach((c, i) => {
      const scorePct = Math.min(100, Math.max(0, Math.round((c.score || 0) * 100)));
      const card = document.createElement('div');
      card.className = 'candidate-card';
      card.style.animationDelay = `${i * 0.04}s`;
      card.innerHTML = `
        <div class="candidate-rank">RANK <span>#${c.rank || i + 1}</span></div>
        <div class="candidate-score">${typeof c.score === 'number' ? c.score.toFixed(2) : '—'}</div>
        <div class="score-bar"><div class="score-bar-fill" style="width:0%" data-target="${scorePct}%"></div></div>
        <h3 class="candidate-title mt-16">${c.title || 'Untitled Clip'}</h3>
        <p class="candidate-reason">${c.reason || 'No reason provided.'}</p>
        <div>
          <span class="candidate-times">
            ▶ ${fmtSec(c.start_sec)} — ${fmtSec(c.end_sec)}
            ${c.duration_sec ? ` · ${c.duration_sec}s` : ''}
          </span>
        </div>
      `;
      candidatesEl.appendChild(card);
    });

    // Animate score bars after a short delay
    setTimeout(() => {
      document.querySelectorAll('.score-bar-fill[data-target]').forEach(bar => {
        bar.style.width = bar.dataset.target;
      });
    }, 300);
  }

});
