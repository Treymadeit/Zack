// js/clips.js
// Rendered clips gallery — protected page

document.addEventListener('DOMContentLoaded', async () => {

  // ── 1. Auth guard ────────────────────────────────────────
  const session = await requireAuth();
  if (!session) return;
  const user = session.user;

  // ── 2. Parse video ID ────────────────────────────────────
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

  // Wire up job link
  const jobLink = document.getElementById('job-link');
  if (jobLink) jobLink.href = `job.html?id=${videoId}`;

  // ── 4. Fetch rendered clips ───────────────────────────────
  const { data: clips, error } = await db
    .from('rendered_clips')
    .select('*')
    .eq('video_id', videoId)
    .order('created_at', { ascending: false });

  hideLoader();

  const gallery = document.getElementById('clips-gallery');

  if (error) {
    gallery.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <span class="empty-state-icon">⚠</span>
      <p class="empty-state-title">Failed to load clips</p>
      <p class="empty-state-body">${error.message}</p>
    </div>`;
    return;
  }

  // Update count
  const countEl = document.getElementById('clips-count');
  if (countEl) countEl.textContent = clips.length ? `${clips.length} clips ready` : '';

  if (!clips || clips.length === 0) {
    gallery.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <span class="empty-state-icon">⏳</span>
      <p class="empty-state-title">Your clips are still being prepared</p>
      <p class="empty-state-body">Zack is rendering your top-ranked moments. This usually takes a few minutes — check back soon.</p>
      <a href="job.html?id=${videoId}" class="btn btn-ghost btn-sm mt-16">← View Job Status</a>
    </div>`;
    return;
  }

  gallery.innerHTML = '';
  clips.forEach((clip, i) => {
    const card = document.createElement('div');
    card.className = 'clip-card';
    card.style.animationDelay = `${i * 0.06}s`;

    const thumbHtml = clip.thumbnail_url
      ? `<img class="clip-thumb" src="${clip.thumbnail_url}" alt="Clip thumbnail" loading="lazy" onerror="this.replaceWith(makePlaceholder())">`
      : `<div class="clip-thumb-placeholder">🎞</div>`;

    card.innerHTML = `
      ${thumbHtml}
      <div class="clip-body">
        <div class="clip-meta">
          ${statusBadge(clip.status)}
          <span>${formatDate(clip.created_at)}</span>
        </div>
        ${clip.candidate_id ? `<div style="font-size:0.72rem;color:var(--text-2);margin-bottom:6px;">Candidate ID: <span style="color:var(--text-1)">${clip.candidate_id}</span></div>` : ''}
        <div class="clip-actions">
          ${clip.file_url
            ? `<a href="${clip.file_url}" target="_blank" rel="noopener" class="btn btn-primary btn-sm btn-full">
                 Open Clip ↗
               </a>`
            : `<span class="btn btn-ghost btn-sm btn-full" style="opacity:.4;pointer-events:none;cursor:default;">
                 Rendering…
               </span>`
          }
        </div>
      </div>
    `;
    gallery.appendChild(card);
  });

});

// Helper used in onerror
function makePlaceholder() {
  const div = document.createElement('div');
  div.className = 'clip-thumb-placeholder';
  div.textContent = '🎞';
  return div;
}
