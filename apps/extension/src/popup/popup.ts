/**
 * Popup logic — standalone, zero backendu.
 */

import {
  getGroups,
  upsertGroups,
  getPosts,
  savePost,
  deletePost,
  duplicatePost,
  saveCampaign,
  saveTargets,
  getTargets,
  getCampaigns,
  duplicateCampaign,
  getActivity,
  getSettings,
  setSettings,
  logActivity,
  getDeviceId,
  getStorageUsage,
  type Campaign,
  type CampaignTarget,
  type ActivityEvent,
} from '../lib/store';
import * as cloud from '../lib/cloud';
import {
  FRAMEWORKS,
  HOOKS,
  suggestHook,
  assemblePost,
  validatePost,
  type FrameworkType,
  type HookExample,
} from '../lib/post-builder';
import { uploadImages, MAX_IMAGES_PER_POST, approxDataUrlSize } from '../lib/images';
import {
  checkAllQuotas,
  canAddPublications,
  canAddGroups,
  canAddImages,
} from '../lib/quotas';
import { SAFETY_PRESETS, type SafetyMode } from '../lib/safety';
import {
  fetchLicense,
  startTrial,
  activateLicense,
  isLicenseValid,
  getStatusBadge,
  type License,
} from '../lib/license';
import { computeQuickStats, formatNextPost, formatHour } from '../lib/stats';
import { computeInsights } from '../lib/insights';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

function banner(msg: string, kind: 'ok' | 'warn' | 'err' | 'info' = 'info', ms = 4000): void {
  const host = $('banner-host');
  host.innerHTML = `<div class="status-banner ${kind}">${msg}</div>`;
  if (ms > 0) setTimeout(() => { host.innerHTML = ''; }, ms);
}

function renderQuickStats(stats: Awaited<ReturnType<typeof computeQuickStats>>): void {
  const dayLabel = new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });
  const el = (id: string) => document.getElementById(id);
  el('qs-day-label')!.textContent = dayLabel;
  el('qs-today-progress')!.textContent = `${stats.todayPosted} / ${stats.todayPlanned}`;
  const pct = stats.todayPlanned > 0 ? Math.min(100, (stats.todayPosted / stats.todayPlanned) * 100) : 0;
  const fill = el('qs-today-fill') as HTMLElement;
  fill.style.width = `${pct.toFixed(0)}%`;
  fill.className = 'storage-fill ' + (pct >= 90 ? 'critical' : pct >= 70 ? 'warn' : '');

  el('qs-next-post')!.textContent = formatNextPost(stats.nextPostInSeconds);
  if (stats.nextGroupName) {
    el('qs-next-group-row')!.style.display = 'flex';
    el('qs-next-group')!.textContent = stats.nextGroupName;
  } else {
    el('qs-next-group-row')!.style.display = 'none';
  }

  el('qs-success')!.textContent = stats.totalAttempts > 0
    ? `${stats.successRate}% (${stats.totalPosted}/${stats.totalAttempts})`
    : 'brak danych';

  el('qs-best-hour')!.textContent = stats.bestHour != null
    ? `${formatHour(stats.bestHour)} (${stats.bestHourSuccessCount} postów)`
    : 'mało danych';

  el('qs-week-react')!.textContent = String(stats.weeklyReactions);
  el('qs-week-comm')!.textContent = String(stats.weeklyComments);
}

async function refreshHome(): Promise<void> {
  const [groups, posts, targets, settings, usage, stats] = await Promise.all([
    getGroups(), getPosts(), getTargets(), getSettings(), getStorageUsage(), computeQuickStats(),
  ]);
  await refreshQuotasView('quotas-home', true);
  renderQuickStats(stats);
  const activeGroups = groups.filter((g) => g.isActive).length;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const today = targets.filter((t) => t.status === 'posted' && (t.postedAt ?? 0) >= todayStart.getTime()).length;

  $('stat-groups').textContent = String(activeGroups);
  $('stat-posts').textContent = String(posts.length);
  $('stat-today').textContent = String(today);

  if (settings.killSwitch) {
    // Sprawdź czy 24h od kill switch już minęło → pokaż banner Resume
    const elapsedMs = settings.killSwitchAt ? Date.now() - settings.killSwitchAt : 0;
    if (elapsedMs > 24 * 3600_000) {
      const hoursAgo = Math.round(elapsedMs / 3600_000);
      $('status-summary').innerHTML = `
        <span style="color: var(--warning)">⏰ Kill switch wygasł (${hoursAgo}h temu)</span><br/>
        <div style="margin-top: 8px; display: flex; gap: 6px">
          <button class="btn btn-primary btn-sm" id="resume-now">✓ Wznów</button>
          <button class="btn btn-secondary btn-sm" id="resume-wait">Jeszcze nie</button>
        </div>
      `;
      document.getElementById('resume-now')?.addEventListener('click', async () => {
        if (!confirm(
          'Sprawdziłeś czy konto FB działa normalnie?\n' +
          '✓ Brak captcha / blokady\n' +
          '✓ Możesz publikować ręcznie\n\n' +
          'Wznawiać postowanie?'
        )) return;
        await setSettings({
          killSwitch: false,
          killSwitchReason: undefined,
          killSwitchAt: undefined,
          paused: false,
        });
        banner('✓ System wznowiony. Postuj ostrożnie.', 'ok', 6000);
        await refreshHome();
      });
      document.getElementById('resume-wait')?.addEventListener('click', async () => {
        // Przedłuż kill switch o kolejne 24h
        await setSettings({ killSwitchAt: Date.now() });
        banner('Kill switch przedłużony o 24h.', 'info', 4000);
        await refreshHome();
      });
    } else {
      const remaining = settings.killSwitchAt
        ? Math.max(0, 24 * 3600_000 - elapsedMs)
        : 24 * 3600_000;
      const hLeft = Math.ceil(remaining / 3600_000);
      $('status-summary').innerHTML = `<span style="color: var(--danger)">🚨 KILL SWITCH</span><br/><span style="font-size: 10.5px; color: var(--muted)">Auto-przegląd za ${hLeft}h · powód: ${escapeHtml(settings.killSwitchReason ?? 'nieznany')}</span>`;
    }
  } else if (settings.pauseUntil && Date.now() < settings.pauseUntil) {
    const until = new Date(settings.pauseUntil).toLocaleString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    $('status-summary').innerHTML = `<span style="color: var(--warning)">⏸ Wstrzymane ${escapeHtml(settings.pauseReason ?? '')}</span><br/><span style="font-size: 10.5px; color: var(--muted)">Auto-wznowienie: ${until}</span>`;
  } else if (settings.paused) {
    $('status-summary').textContent = 'Wstrzymane (kliknij switch żeby wznowić)';
  } else {
    const mode = SAFETY_PRESETS[settings.safetyMode]?.name ?? '';
    $('status-summary').innerHTML = `${mode} · ${activeGroups} grup · ${posts.length} postów`;
  }

  const toggle = $('pause-toggle');
  toggle.classList.toggle('on', !settings.paused);

  // Storage warning (przy 70%+)
  if (usage.warning !== 'ok') {
    const mb = (usage.bytesUsed / 1024 / 1024).toFixed(1);
    const cls = usage.warning === 'critical' ? 'err' : 'warn';
    const msg = usage.warning === 'critical'
      ? `⚠ Storage ${mb} MB / 10 MB (${usage.percentUsed.toFixed(0)}%) — usuń stare posty albo zdjęcia.`
      : `Storage ${mb} MB / 10 MB (${usage.percentUsed.toFixed(0)}%) — uwaga na limit.`;
    banner(msg, cls, 8000);
  }
}

async function refreshFBStatus(): Promise<void> {
  // Sprawdź czy na facebook.com jest jakaś otwarta zakładka
  const tabs = await chrome.tabs.query({ url: '*://*.facebook.com/*' });
  const el = $('fb-status');
  const dot = $('fb-status-dot');
  if (tabs.length > 0) {
    el.innerHTML = `<span class="badge badge-success badge-dot">Zalogowany</span> · ${tabs.length} kart${tabs.length > 1 ? '' : 'a'} FB`;
    dot.innerHTML = '<div class="pulse" title="FB aktywny"></div>';
  } else {
    el.innerHTML = '<span class="badge badge-warning badge-dot">Brak otwartej karty FB</span>';
    dot.innerHTML = '';
  }
}

// ============ HOME ============
$('open-fb').addEventListener('click', async () => {
  await chrome.tabs.create({ url: 'https://www.facebook.com/' });
});

$('import-groups').addEventListener('click', async () => {
  const btn = $('import-groups') as HTMLButtonElement;
  btn.disabled = true;
  btn.textContent = '⏳ Otwieram listę grup...';
  banner('Otwieram facebook.com/groups/joins/ — auto-scroll potrwa 30-90 sekund', 'info', 8000);

  let tab: chrome.tabs.Tab;
  try {
    tab = await chrome.tabs.create({ url: 'https://www.facebook.com/groups/joins/', active: true });
  } catch (e) {
    banner('Nie udało się otworzyć karty: ' + (e as Error).message, 'err');
    btn.disabled = false;
    btn.textContent = '↻ Importuj grupy';
    return;
  }

  // Czekaj na complete
  await new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, 30_000);
    const listener = (id: number, info: chrome.tabs.TabChangeInfo) => {
      if (id === tab.id && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        clearTimeout(timer);
        setTimeout(resolve, 3500);
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });

  btn.textContent = '⏳ Scrapuję grupy...';

  const response = await chrome.tabs.sendMessage(tab.id!, { type: 'SCRAPE_GROUPS' }).catch((e) => ({ ok: false, error: String(e) }));

  if (!response?.ok || !response.groups) {
    banner(`Scraping nie powiódł się${response?.error ? ': ' + response.error : ''}. Upewnij się że jesteś zalogowany do FB.`, 'err', 8000);
    btn.disabled = false;
    btn.textContent = '↻ Importuj grupy';
    return;
  }

  // Sprawdź limit grup — nie wpuszczaj jeśli przekroczone
  const existingGroups = await getGroups();
  const existingIds = new Set(existingGroups.map((g) => g.fbGroupId));
  const newCount = (response.groups as Array<{ fbGroupId: string }>).filter((g) => !existingIds.has(g.fbGroupId)).length;
  if (newCount > 0) {
    const err = await canAddGroups(newCount);
    if (err) {
      banner(err, 'err', 10_000);
      btn.disabled = false;
      btn.textContent = '↻ Importuj grupy';
      return;
    }
  }

  const result = await upsertGroups(response.groups);
  await logActivity({ type: 'scrape', message: `Zaimportowano ${result.added} nowych grup, zaktualizowano ${result.updated}` });

  // Cloud sync
  const deviceId = await getDeviceId();
  await cloud.registerDevice(deviceId, `Chrome — ${navigator.platform}`);
  await cloud.syncGroups(deviceId, response.groups.map((g: any) => ({
    fbGroupId: g.fbGroupId,
    name: g.name,
    url: g.url,
    membersCount: g.membersCount,
    privacy: g.privacy,
    isActive: true,
  })));
  void cloud.logActivity(deviceId, {
    eventType: 'scrape',
    message: `Zaimportowano ${result.added} grup (+${result.updated} zaktualizowano)`,
  });

  banner(`✓ Zaimportowano ${result.added} nowych grup${result.updated ? `, zaktualizowano ${result.updated}` : ''} (cloud sync)`, 'ok');
  btn.disabled = false;
  btn.textContent = '↻ Importuj grupy';
  await refreshHome();
});

$('quick-save').addEventListener('click', async () => {
  const text = ($('quick-text') as HTMLTextAreaElement).value.trim();
  if (!text || text.length < 10) {
    banner('Wpisz treść posta (min 10 znaków)', 'warn');
    return;
  }
  const title = text.slice(0, 60);
  await savePost({
    id: crypto.randomUUID(),
    title,
    type: 'other',
    body: text,
    imageDataUrls: [],
    createdAt: Date.now(),
  });
  ($('quick-text') as HTMLTextAreaElement).value = '';
  banner('Post zapisany. Przejdź do "Kampanie" żeby wysłać.', 'ok');
  await refreshHome();
});

$('pause-toggle').addEventListener('click', async () => {
  const settings = await getSettings();
  // Toggle wyłącza także pauseUntil
  await setSettings({ paused: !settings.paused, pauseUntil: undefined, pauseReason: undefined });
  await refreshHome();
});

// ============ SMART PAUSE ============
function presetToTimestamp(preset: string): { until: number; label: string } | null {
  const now = new Date();
  switch (preset) {
    case 'tomorrow_9': {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      return { until: d.getTime(), label: 'do jutra 9:00' };
    }
    case 'monday_8': {
      const d = new Date(now);
      const daysUntilMonday = (8 - d.getDay()) % 7 || 7;
      d.setDate(d.getDate() + daysUntilMonday);
      d.setHours(8, 0, 0, 0);
      return { until: d.getTime(), label: 'do poniedziałku 8:00' };
    }
    case '2hours': {
      const t = now.getTime() + 2 * 3600 * 1000;
      return { until: t, label: 'na 2h' };
    }
    case 'evening': {
      const d = new Date(now);
      // jeśli już po 20, idź do jutra
      if (d.getHours() >= 20) d.setDate(d.getDate() + 1);
      d.setHours(20, 0, 0, 0);
      return { until: d.getTime(), label: 'do wieczora 20:00' };
    }
    case '7days': {
      const t = now.getTime() + 7 * 86400 * 1000;
      return { until: t, label: 'na 7 dni' };
    }
    default:
      return null;
  }
}

$('smart-pause-btn').addEventListener('click', () => {
  $('pause-modal').classList.add('show');
});

$('pause-cancel').addEventListener('click', () => $('pause-modal').classList.remove('show'));
$('pause-modal').addEventListener('click', (e) => {
  if (e.target === $('pause-modal')) $('pause-modal').classList.remove('show');
});

document.querySelectorAll('.pause-preset').forEach((b) => {
  b.addEventListener('click', async (e) => {
    const preset = (e.currentTarget as HTMLElement).getAttribute('data-preset')!;
    const r = presetToTimestamp(preset);
    if (!r) return;
    await setSettings({ paused: true, pauseUntil: r.until, pauseReason: r.label });
    $('pause-modal').classList.remove('show');
    const untilStr = new Date(r.until).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' });
    banner(`✓ Wstrzymano ${r.label} (do ${untilStr})`, 'ok', 6000);
    await refreshHome();
  });
});

$('pause-custom-btn').addEventListener('click', async () => {
  const val = ($('pause-custom') as HTMLInputElement).value;
  if (!val) {
    banner('Wybierz datę i czas', 'warn');
    return;
  }
  const until = new Date(val).getTime();
  if (until <= Date.now()) {
    banner('Czas musi być w przyszłości', 'warn');
    return;
  }
  await setSettings({ paused: true, pauseUntil: until, pauseReason: `do ${new Date(until).toLocaleString('pl-PL')}` });
  $('pause-modal').classList.remove('show');
  banner(`✓ Wstrzymano do ${new Date(until).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}`, 'ok', 6000);
  await refreshHome();
});

// ============ GROUPS ============
async function refreshGroupsTab(): Promise<void> {
  const filter = ($('group-filter') as HTMLInputElement).value.toLowerCase();
  const groups = await getGroups();
  const filtered = filter ? groups.filter((g) => g.name.toLowerCase().includes(filter)) : groups;
  $('groups-count').textContent = `${filtered.length} grup`;

  const html = filtered.map((g) => {
    const lastPost = g.lastPostedAt
      ? `<span style="color: var(--muted)">· ${timeAgo(g.lastPostedAt)}</span>`
      : '';
    return `
      <div class="group-row">
        <input type="checkbox" data-id="${g.fbGroupId}" ${g.isActive ? 'checked' : ''} />
        <div class="group-row-info">
          <div class="group-row-name">${escapeHtml(g.name)}</div>
          <div class="group-row-meta">
            ${g.membersCount ? formatNumber(g.membersCount) + ' członków' : 'członków: ?'}
            · ${g.privacy ?? 'unknown'}
            ${lastPost}
          </div>
        </div>
      </div>`;
  }).join('');

  $('groups-list').innerHTML = html || `
    <div class="empty">
      Nie masz jeszcze zaimportowanych grup.<br/>
      <button class="btn btn-primary btn-sm" id="empty-import-groups" style="margin-top: 10px">↻ Importuj z FB</button>
    </div>`;
  document.getElementById('empty-import-groups')?.addEventListener('click', () => $('import-groups').click());

  $('groups-list').querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener('change', async (e) => {
      const id = (e.target as HTMLInputElement).dataset.id!;
      const isActive = (e.target as HTMLInputElement).checked;
      const all = await getGroups();
      const g = all.find((x) => x.fbGroupId === id);
      if (g) {
        g.isActive = isActive;
        await chrome.storage.local.set({ groups: all });
      }
    });
  });
}

$('group-filter').addEventListener('input', refreshGroupsTab);
$('refresh-groups').addEventListener('click', refreshGroupsTab);

// ============ POSTS ============
async function renderInsights(): Promise<void> {
  const insights = await computeInsights();
  const host = document.getElementById('insights-card');
  if (!host) return;
  if (insights.length === 0) {
    host.style.display = 'none';
    return;
  }
  host.style.display = 'block';
  host.innerHTML = insights.slice(0, 3).map((ins) => {
    const color = ins.severity === 'warning' ? 'var(--warning)' : ins.severity === 'tip' ? 'var(--primary-light)' : 'var(--success)';
    return `
      <div class="card" style="border-left: 3px solid ${color}; padding: 10px 12px; margin-bottom: 6px">
        <div style="font-size: 12.5px; font-weight: 600; margin-bottom: 4px">${ins.title}</div>
        <div style="font-size: 11px; color: var(--muted); line-height: 1.5">${ins.description}</div>
        ${ins.actionLabel ? `<button class="btn btn-ghost btn-sm" data-ins-action="${ins.actionType}" style="margin-top: 6px">${ins.actionLabel} →</button>` : ''}
      </div>
    `;
  }).join('');

  host.querySelectorAll('[data-ins-action]').forEach((b) => {
    b.addEventListener('click', (e) => {
      const action = (e.currentTarget as HTMLElement).getAttribute('data-ins-action');
      const targetTab = action === 'open_groups' ? 'tab-groups'
        : action === 'open_assistant' ? 'tab-assistant'
        : action === 'open_settings' ? 'tab-settings'
        : null;
      if (targetTab) ($(targetTab) as HTMLInputElement).checked = true;
    });
  });
}

async function refreshPostsTab(): Promise<void> {
  const posts = await getPosts();
  $('posts-count').textContent = `${posts.length} postów`;
  await renderInsights();
  $('posts-list').innerHTML = posts.length
    ? posts.map((p) => {
        const imgCount = p.imageDataUrls?.length ?? 0;
        const thumb = imgCount > 0
          ? `<div class="post-thumb" style="background-image: url('${p.imageDataUrls[0]}')"></div>`
          : `<div class="post-thumb placeholder">📝</div>`;
        const imgBadge = imgCount > 0 ? `<span class="badge badge-primary">${imgCount} 📷</span>` : '';
        return `
          <div class="post-row">
            ${thumb}
            <div class="post-content">
              <div class="post-title">${escapeHtml(p.title)}</div>
              <div style="color: var(--muted); font-size: 10.5px; margin-top: 2px">
                ${escapeHtml(p.body.slice(0, 80))}${p.body.length > 80 ? '…' : ''}
              </div>
              <div class="row" style="margin-top: 6px; gap: 4px">
                <span class="badge badge-muted">${p.type}</span>
                ${imgBadge}
                <span style="flex: 1"></span>
                <button class="btn btn-ghost btn-sm" data-edit="${p.id}" title="Edytuj">✏</button>
                <button class="btn btn-ghost btn-sm" data-dup="${p.id}" title="Duplikuj">⎘</button>
                <button class="btn btn-ghost btn-sm" data-del="${p.id}" title="Usuń">🗑</button>
              </div>
            </div>
          </div>`;
      }).join('')
    : `<div class="empty">
        Brak postów jeszcze.<br/>
        <button class="btn btn-primary btn-sm" id="empty-go-assistant" style="margin-top: 10px">🧠 Otwórz Asystenta</button>
      </div>`;

  // CTA empty
  document.getElementById('empty-go-assistant')?.addEventListener('click', () => {
    ($('tab-assistant') as HTMLInputElement).checked = true;
  });

  $('posts-list').querySelectorAll('[data-edit]').forEach((b) => {
    b.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.edit!;
      void openEditModal(id);
    });
  });
  $('posts-list').querySelectorAll('[data-dup]').forEach((b) => {
    b.addEventListener('click', async (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.dup!;
      const copy = await duplicatePost(id);
      if (copy) {
        banner(`✓ Duplikowano: "${copy.title}"`, 'ok');
        await refreshPostsTab();
        await refreshHome();
      }
    });
  });
  $('posts-list').querySelectorAll('[data-del]').forEach((b) => {
    b.addEventListener('click', async (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.del!;
      if (!confirm('Usunąć ten post na zawsze?')) return;
      await deletePost(id);
      await refreshPostsTab();
      await refreshHome();
    });
  });
}

$('new-post').addEventListener('click', () => {
  ($('tab-assistant') as HTMLInputElement).checked = true;
});

// ============ EDIT POST MODAL ============
let editingPostId: string | null = null;
const editState = { images: [] as string[] };

async function openEditModal(id: string): Promise<void> {
  const posts = await getPosts();
  const post = posts.find((p) => p.id === id);
  if (!post) return;
  editingPostId = id;
  editState.images = (post.imageDataUrls ?? []).slice();
  ($('edit-title') as HTMLInputElement).value = post.title;
  ($('edit-body') as HTMLTextAreaElement).value = post.body;
  renderEditThumbs();
  updateEditLength();
  $('edit-modal').classList.add('show');
}

function closeEditModal(): void {
  editingPostId = null;
  editState.images = [];
  $('edit-modal').classList.remove('show');
}

function renderEditThumbs(): void {
  $('edit-img-count').textContent = String(editState.images.length);
  const host = $('edit-thumbs');
  host.innerHTML = editState.images
    .map((url, i) => `
      <div class="thumb" style="background-image: url('${url}')">
        <div class="thumb-remove" data-edit-rm="${i}">×</div>
      </div>
    `).join('');
  host.querySelectorAll('[data-edit-rm]').forEach((el) => {
    el.addEventListener('click', () => {
      const i = parseInt(el.getAttribute('data-edit-rm')!, 10);
      editState.images.splice(i, 1);
      renderEditThumbs();
    });
  });
}

function updateEditLength(): void {
  const t = ($('edit-body') as HTMLTextAreaElement).value;
  const words = t.split(/\s+/).filter(Boolean).length;
  $('edit-length').textContent = `${t.length} znaków · ${words} słów`;
}

$('edit-body').addEventListener('input', updateEditLength);
$('edit-cancel').addEventListener('click', closeEditModal);
$('edit-discard').addEventListener('click', closeEditModal);
$('edit-modal').addEventListener('click', (e) => {
  if (e.target === $('edit-modal')) closeEditModal();
});

$('edit-add-img').addEventListener('click', () => {
  if (editState.images.length >= MAX_IMAGES_PER_POST) {
    banner(`Limit ${MAX_IMAGES_PER_POST} zdjęć — usuń jedno żeby dodać.`, 'warn');
    return;
  }
  ($('edit-file-input') as HTMLInputElement).click();
});

($('edit-file-input') as HTMLInputElement).addEventListener('change', async (e) => {
  const files = (e.target as HTMLInputElement).files;
  if (!files) return;
  const remaining = MAX_IMAGES_PER_POST - editState.images.length;
  const slice = Array.from(files).slice(0, remaining);
  const quotaErr = await canAddImages(slice.length);
  if (quotaErr) {
    banner(quotaErr, 'err', 8000);
    return;
  }
  const { dataUrls, errors } = await uploadImages(slice);
  editState.images.push(...dataUrls);
  renderEditThumbs();
  if (errors.length) banner(`Błędy: ${errors.length} (${errors[0]!.reason})`, 'warn');
  (e.target as HTMLInputElement).value = '';
});

$('edit-save').addEventListener('click', async () => {
  if (!editingPostId) return;
  const title = ($('edit-title') as HTMLInputElement).value.trim();
  const body = ($('edit-body') as HTMLTextAreaElement).value.trim();
  if (title.length < 3) { banner('Tytuł za krótki', 'warn'); return; }
  if (body.length < 20) { banner('Treść za krótka (min 20 znaków)', 'warn'); return; }
  const posts = await getPosts();
  const post = posts.find((p) => p.id === editingPostId);
  if (!post) return;
  post.title = title;
  post.body = body;
  post.imageDataUrls = editState.images.slice();
  await savePost(post);
  closeEditModal();
  banner(`✓ Zapisano "${title}"`, 'ok');
  await refreshPostsTab();
});

// ============ CAMPAIGNS ============
const selectedGroupIds = new Set<string>();

async function refreshCampTab(): Promise<void> {
  const [posts, groups, campaigns, allTargets] = await Promise.all([
    getPosts(), getGroups(), getCampaigns(), getTargets(),
  ]);

  // Lista kampanii (running / paused / completed)
  const campsList = $('campaigns-list');
  if (campaigns.length === 0) {
    campsList.innerHTML = '<div class="empty" style="padding: 16px">Brak kampanii. Stwórz pierwszą wybierając post + grupy wyżej.</div>';
  } else {
    campsList.innerHTML = campaigns
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10)
      .map((c) => {
        const ts = allTargets.filter((t) => t.campaignId === c.id);
        const posted = ts.filter((t) => t.status === 'posted').length;
        const failed = ts.filter((t) => t.status === 'failed').length;
        const pending = ts.filter((t) => t.status === 'pending' || t.status === 'queued').length;
        const statusBadge = c.status === 'running'
          ? `<span class="badge badge-success badge-dot">aktywna</span>`
          : c.status === 'paused' ? `<span class="badge badge-warning badge-dot">pauza</span>`
          : `<span class="badge badge-muted">${c.status}</span>`;
        const post = posts.find((p) => p.id === c.postId);
        const created = timeAgo(c.createdAt);
        return `
          <div class="post-row" style="align-items: center">
            <div class="post-content">
              <div class="post-title">${escapeHtml(c.name)}</div>
              <div style="font-size: 10.5px; color: var(--muted); margin-top: 2px">
                ${escapeHtml(post?.title ?? '—')} · ${ts.length} grup · ${created}
              </div>
              <div class="row" style="gap: 6px; margin-top: 6px; align-items: center">
                ${statusBadge}
                <span class="badge badge-success">✓ ${posted}</span>
                ${pending ? `<span class="badge badge-primary">⏱ ${pending}</span>` : ''}
                ${failed ? `<span class="badge badge-danger">✗ ${failed}</span>` : ''}
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" data-clone="${c.id}" title="Klonuj kampanię">⎘</button>
            ${c.status === 'running'
              ? `<button class="btn btn-ghost btn-sm" data-pause-camp="${c.id}" title="Pauza">⏸</button>`
              : `<button class="btn btn-ghost btn-sm" data-resume-camp="${c.id}" title="Wznów">▶</button>`}
          </div>
        `;
      }).join('');

    // Klonuj handler
    campsList.querySelectorAll('[data-clone]').forEach((b) => {
      b.addEventListener('click', async (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.clone!;
        const newCamp = await duplicateCampaign(id);
        if (newCamp) {
          banner(`✓ Kampania sklonowana: "${newCamp.name}"`, 'ok', 6000);
          await refreshCampTab();
          await refreshHome();
        }
      });
    });
    // Pauza/Resume per kampania
    campsList.querySelectorAll('[data-pause-camp]').forEach((b) => {
      b.addEventListener('click', async (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.pauseCamp!;
        const camps = await getCampaigns();
        const c = camps.find((x) => x.id === id);
        if (!c) return;
        c.status = 'paused';
        await saveCampaign(c);
        await refreshCampTab();
        banner('⏸ Kampania wstrzymana', 'ok');
      });
    });
    campsList.querySelectorAll('[data-resume-camp]').forEach((b) => {
      b.addEventListener('click', async (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.resumeCamp!;
        const camps = await getCampaigns();
        const c = camps.find((x) => x.id === id);
        if (!c) return;
        c.status = 'running';
        await saveCampaign(c);
        await refreshCampTab();
        banner('▶ Kampania wznowiona', 'ok');
      });
    });
  }

  // Posts dropdown
  const select = $('camp-post') as HTMLSelectElement;
  select.innerHTML = '<option value="">— wybierz post —</option>' +
    posts.map((p) => `<option value="${p.id}">${escapeHtml(p.title)} (${p.type})</option>`).join('');

  // Groups
  const filter = ($('camp-group-filter') as HTMLInputElement).value.toLowerCase();
  const activeGroups = groups.filter((g) => g.isActive);
  const filtered = filter ? activeGroups.filter((g) => g.name.toLowerCase().includes(filter)) : activeGroups;

  $('camp-total-count').textContent = String(activeGroups.length);
  $('camp-selected-count').textContent = String(selectedGroupIds.size);

  $('camp-groups').innerHTML = filtered.length ? filtered.map((g) => `
    <div class="group-row">
      <input type="checkbox" data-id="${g.fbGroupId}" ${selectedGroupIds.has(g.fbGroupId) ? 'checked' : ''} />
      <div class="group-row-info">
        <div class="group-row-name">${escapeHtml(g.name)}</div>
        <div class="group-row-meta">${g.membersCount ? formatNumber(g.membersCount) + ' członków' : ''}</div>
      </div>
    </div>`).join('') : '<div class="empty">Brak grup. Najpierw zaimportuj listę grup z FB.</div>';

  $('camp-groups').querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener('change', (e) => {
      const id = (e.target as HTMLInputElement).dataset.id!;
      if ((e.target as HTMLInputElement).checked) selectedGroupIds.add(id);
      else selectedGroupIds.delete(id);
      $('camp-selected-count').textContent = String(selectedGroupIds.size);
    });
  });
}

$('camp-group-filter').addEventListener('input', refreshCampTab);
$('camp-select-all').addEventListener('click', async () => {
  const groups = await getGroups();
  for (const g of groups.filter((x) => x.isActive)) selectedGroupIds.add(g.fbGroupId);
  await refreshCampTab();
});
$('camp-select-none').addEventListener('click', async () => {
  selectedGroupIds.clear();
  await refreshCampTab();
});

$('camp-start').addEventListener('click', async () => {
  const postId = ($('camp-post') as HTMLSelectElement).value;
  if (!postId) { banner('Wybierz post', 'warn'); return; }
  if (selectedGroupIds.size === 0) { banner('Wybierz co najmniej 1 grupę', 'warn'); return; }

  const posts = await getPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return;

  const minDelay = parseInt(($('camp-min-delay') as HTMLInputElement).value, 10) || 90;
  const maxDelay = parseInt(($('camp-max-delay') as HTMLInputElement).value, 10) || 240;

  const campaign: Campaign = {
    id: crypto.randomUUID(),
    name: `Kampania: ${post.title}`,
    postId,
    status: 'running',
    minDelaySeconds: minDelay,
    maxDelaySeconds: maxDelay,
    dailyCap: 25,
    createdAt: Date.now(),
  };
  // Sprawdź limit miesięczny publikacji
  const quotaErr = await canAddPublications(selectedGroupIds.size);
  if (quotaErr) {
    banner(quotaErr, 'err', 12_000);
    return;
  }

  await saveCampaign(campaign);

  const targets: CampaignTarget[] = Array.from(selectedGroupIds).map((groupId) => ({
    id: crypto.randomUUID(),
    campaignId: campaign.id,
    groupId,
    status: 'pending',
    renderedText: post.body,
  }));
  await saveTargets(targets);
  await logActivity({ type: 'post', message: `Uruchomiono kampanię "${post.title}" na ${targets.length} grup` });

  // Cloud sync: zapisz wszystkie publications jako 'pending'
  const deviceId = await getDeviceId();
  const groupsMap = new Map((await getGroups()).map((g) => [g.fbGroupId, g] as const));
  for (const t of targets) {
    const g = groupsMap.get(t.groupId);
    void cloud.upsertPublication(deviceId, {
      id: t.id,
      fbGroupId: t.groupId,
      groupName: g?.name,
      campaignName: campaign.name,
      postTitle: post.title,
      postBody: post.body,
      status: 'pending',
    });
  }
  void cloud.logActivity(deviceId, {
    eventType: 'campaign_started',
    message: `Uruchomiono kampanię "${post.title}" na ${targets.length} grup`,
  });

  selectedGroupIds.clear();
  banner(`✓ Kampania na ${targets.length} grup uruchomiona (cloud sync ON). Pierwszy post za ≤30s — kliknij Publikuj na FB.`, 'ok', 8000);

  // Tab → log
  ($('tab-log') as HTMLInputElement).checked = true;
  await refreshLog();
});

// ============ LOG ============
async function refreshLog(): Promise<void> {
  const activity = (await getActivity()).slice(-50).reverse();
  $('log-list').innerHTML = activity.length ? activity.map((a) => `
    <div class="log-item">
      <div class="log-time">${formatTime(a.ts)} · ${typeLabel(a.type)}</div>
      <div class="log-msg">${escapeHtml(a.message)}${a.groupName ? ` <span style="color: var(--muted)">— ${escapeHtml(a.groupName)}</span>` : ''}</div>
    </div>`).join('') : '<div class="empty">Brak aktywności jeszcze.</div>';
}

$('clear-log').addEventListener('click', async () => {
  await chrome.storage.local.set({ activity: [] });
  await refreshLog();
});

// ============ ASYSTENT ============
const assistantState = {
  type: 'job' as 'job' | 'sales' | 'other',
  framework: 'aida' as FrameworkType,
  values: {} as Record<string, string>,
  images: [] as string[],
  edited: false, // user manually edited preview — nie nadpisuj
};

function renderFrameworks(): void {
  const grid = $('as-frameworks');
  grid.innerHTML = Object.values(FRAMEWORKS)
    .map((fw) => `
      <div class="framework-card ${fw.id === assistantState.framework ? 'active' : ''}" data-fw="${fw.id}">
        <div class="fw-name">${fw.name}</div>
        <div class="fw-desc">${escapeHtml(fw.desc.split('.')[0]!)}.</div>
      </div>
    `).join('');
  grid.querySelectorAll('[data-fw]').forEach((el) => {
    el.addEventListener('click', () => {
      assistantState.framework = el.getAttribute('data-fw') as FrameworkType;
      assistantState.values = {}; // reset wartości
      assistantState.edited = false;
      renderFrameworks();
      renderFields();
      renderHooks();
      regenerate();
    });
  });
}

function renderHooks(): void {
  const hooksHost = $('as-hooks');
  const list = suggestHook(assistantState.type);
  const byCategory = new Map<string, HookExample[]>();
  for (const h of list) {
    if (!byCategory.has(h.category)) byCategory.set(h.category, []);
    byCategory.get(h.category)!.push(h);
  }
  hooksHost.innerHTML = Array.from(byCategory.entries())
    .map(([cat, hooks]) => `
      <div class="hook-category">${escapeHtml(cat)}</div>
      ${hooks.map((h) => `<div class="hook-chip" data-hook-id="${h.id}" title="${escapeHtml(h.text)}">${escapeHtml(h.text.slice(0, 42))}${h.text.length > 42 ? '…' : ''}</div>`).join('')}
    `).join('');
  hooksHost.querySelectorAll('[data-hook-id]').forEach((el) => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-hook-id')!;
      const h = HOOKS.find((x) => x.id === id);
      if (!h) return;
      // Wkleja w pierwsze pole frameworka (hook / problem / before / hook)
      const def = FRAMEWORKS[assistantState.framework];
      const firstField = def.fields[0]!;
      assistantState.values[firstField.id] = h.text;
      assistantState.edited = false;
      renderFields();
      regenerate();
    });
  });
}

function renderFields(): void {
  const def = FRAMEWORKS[assistantState.framework];
  const host = $('as-fields');
  host.innerHTML = def.fields.map((f) => `
    <div>
      <label class="form-label">${escapeHtml(f.label)}</label>
      <textarea data-field="${f.id}" rows="${f.rows ?? 2}" placeholder="${escapeHtml(f.placeholder)}">${escapeHtml(assistantState.values[f.id] ?? '')}</textarea>
    </div>
  `).join('');
  host.querySelectorAll<HTMLTextAreaElement>('textarea[data-field]').forEach((ta) => {
    ta.addEventListener('input', () => {
      const id = ta.getAttribute('data-field')!;
      assistantState.values[id] = ta.value;
      assistantState.edited = false;
      regenerate();
    });
  });
}

function regenerate(): void {
  if (assistantState.edited) return; // nie nadpisuj ręcznej edycji
  const text = assemblePost(assistantState.framework, assistantState.values);
  ($('as-preview') as HTMLTextAreaElement).value = text;
  updateScore(text);
}

function updateScore(text: string): void {
  const v = validatePost(text);
  $('as-score-value').textContent = String(v.score);
  const fill = $('as-score-fill') as HTMLElement;
  fill.style.width = `${v.score}%`;
  fill.className = 'score-fill ' + (v.score < 40 ? 'low' : v.score < 70 ? 'mid' : 'high');
  $('as-warnings').innerHTML = v.warnings.map((w) => `<li>${escapeHtml(w)}</li>`).join('');
  const words = text.split(/\s+/).filter(Boolean).length;
  $('as-length').textContent = `${text.length} znaków · ${words} słów`;
}

function renderThumbs(): void {
  const host = $('as-thumbs');
  host.innerHTML = assistantState.images
    .map((url, i) => `
      <div class="thumb" style="background-image: url('${url}')">
        <div class="thumb-remove" data-rm="${i}">×</div>
      </div>
    `).join('');
  host.querySelectorAll('[data-rm]').forEach((el) => {
    el.addEventListener('click', () => {
      const i = parseInt(el.getAttribute('data-rm')!, 10);
      assistantState.images.splice(i, 1);
      renderThumbs();
      updateDropzoneState();
    });
  });
}

function updateDropzoneState(): void {
  const dz = $('as-dropzone');
  if (assistantState.images.length >= MAX_IMAGES_PER_POST) {
    dz.style.opacity = '0.5';
    dz.style.pointerEvents = 'none';
    dz.querySelector('div:nth-child(2)')!.textContent = `Limit ${MAX_IMAGES_PER_POST} osiągnięty`;
  } else {
    dz.style.opacity = '1';
    dz.style.pointerEvents = 'auto';
    dz.querySelector('div:nth-child(2)')!.innerHTML = '<strong>Przeciągnij zdjęcia tutaj</strong> lub kliknij';
  }
}

async function handleImageFiles(files: FileList | File[]): Promise<void> {
  const remaining = MAX_IMAGES_PER_POST - assistantState.images.length;
  if (remaining <= 0) {
    banner(`Już masz ${MAX_IMAGES_PER_POST} zdjęć — usuń jedno żeby dodać kolejne.`, 'warn');
    return;
  }
  const slice = Array.from(files).slice(0, remaining);
  // Sprawdź globalny limit zdjęć
  const quotaErr = await canAddImages(slice.length);
  if (quotaErr) {
    banner(quotaErr, 'err', 8000);
    return;
  }
  banner(`⏳ Kompresuję ${slice.length} zdjęć...`, 'info', 2000);

  const { dataUrls, errors } = await uploadImages(slice);
  assistantState.images.push(...dataUrls);
  renderThumbs();
  updateDropzoneState();

  const totalSize = assistantState.images.reduce((s, u) => s + approxDataUrlSize(u), 0);
  if (errors.length > 0) {
    banner(`Dodano ${dataUrls.length}, błędów: ${errors.length} (${errors[0]!.reason})`, 'warn', 6000);
  } else {
    banner(`✓ Dodano ${dataUrls.length} zdjęć (${(totalSize / 1024 / 1024).toFixed(2)} MB w sumie)`, 'ok');
  }
}

function bindAssistant(): void {
  $('as-type').addEventListener('change', () => {
    assistantState.type = ($('as-type') as HTMLSelectElement).value as 'job' | 'sales' | 'other';
    renderHooks();
  });

  $('as-preview').addEventListener('input', () => {
    assistantState.edited = true;
    updateScore(($('as-preview') as HTMLTextAreaElement).value);
  });

  const dz = $('as-dropzone');
  const fileInput = $('as-file-input') as HTMLInputElement;

  dz.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    if (fileInput.files) await handleImageFiles(fileInput.files);
    fileInput.value = '';
  });
  dz.addEventListener('dragover', (e) => {
    e.preventDefault();
    dz.classList.add('drag-over');
  });
  dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
  dz.addEventListener('drop', async (e) => {
    e.preventDefault();
    dz.classList.remove('drag-over');
    const dataTransfer = (e as DragEvent).dataTransfer;
    if (dataTransfer?.files) await handleImageFiles(dataTransfer.files);
  });

  $('as-save').addEventListener('click', async () => {
    const text = ($('as-preview') as HTMLTextAreaElement).value.trim();
    const title = ($('as-title') as HTMLInputElement).value.trim() || text.slice(0, 60);
    if (text.length < 20) {
      banner('Tekst za krótki (min 20 znaków).', 'warn');
      return;
    }
    if (!title) {
      banner('Wpisz tytuł posta.', 'warn');
      return;
    }
    await savePost({
      id: crypto.randomUUID(),
      title,
      type: assistantState.type,
      body: text,
      imageDataUrls: assistantState.images.slice(),
      createdAt: Date.now(),
    });
    // Reset
    assistantState.values = {};
    assistantState.images = [];
    assistantState.edited = false;
    ($('as-preview') as HTMLTextAreaElement).value = '';
    ($('as-title') as HTMLInputElement).value = '';
    renderFields();
    renderThumbs();
    updateDropzoneState();
    updateScore('');
    banner(`✓ Post "${title}" zapisany${assistantState.images.length ? ` z ${assistantState.images.length} zdjęciami` : ''}`, 'ok');
    await refreshPostsTab();
    await refreshHome();
  });
}

// ============ HELPERS ============
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'mln';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'k';
  return String(n);
}
function timeAgo(ts: number): string {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return 'przed chwilą';
  if (diff < 3600) return Math.floor(diff / 60) + ' min temu';
  if (diff < 86400) return Math.floor(diff / 3600) + ' h temu';
  return Math.floor(diff / 86400) + ' dni temu';
}
function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function typeLabel(t: ActivityEvent['type']): string {
  return { scrape: '📥 import', post: '✓ post', skip: '⏭ skip', fail: '✗ błąd', login_needed: '🔒 login' }[t];
}

// ============ SETTINGS ============
const DEFAULT_SETTINGS = {
  paused: false,
  minDelaySeconds: 30,
  maxDelaySeconds: 90,
  globalDailyCap: 50,
  defaultCooldownMinutes: 240,
  defaultGroupDailyCap: 2,
};

async function refreshSettingsTab(): Promise<void> {
  const s = await getSettings();
  ($('set-daily-cap') as HTMLInputElement).value = String(s.globalDailyCap);
  ($('set-min-delay') as HTMLInputElement).value = String(s.minDelaySeconds);
  ($('set-max-delay') as HTMLInputElement).value = String(s.maxDelaySeconds);
  ($('set-cooldown') as HTMLInputElement).value = String(s.defaultCooldownMinutes);
  ($('set-group-cap') as HTMLInputElement).value = String(s.defaultGroupDailyCap);
  ($('set-sleep-enabled') as HTMLInputElement).checked = s.sleepHoursEnabled;
  ($('set-sleep-start') as HTMLInputElement).value = String(s.sleepStartHour);
  ($('set-sleep-end') as HTMLInputElement).value = String(s.sleepEndHour);
  ($('set-variator') as HTMLInputElement).checked = s.variatorEnabled;

  // Safety modes
  renderSafetyModes(s.safetyMode);
  renderScheduler(s);

  // Kill switch banner
  const ksCard = $('kill-switch-card');
  if (s.killSwitch) {
    ksCard.style.display = 'block';
    const since = s.killSwitchAt ? timeAgo(s.killSwitchAt) : 'nieznana';
    $('kill-switch-info').innerHTML = `
      <div style="margin-bottom: 4px">Aktywowany: <strong>${since}</strong></div>
      <div style="margin-bottom: 4px">Powód: <code>${escapeHtml(s.killSwitchReason ?? 'unknown')}</code></div>
      <div style="color: var(--muted)">System wstrzymany na 24h dla bezpieczeństwa Twojego konta. Sprawdź FB ręcznie — czy nie ma blokady/captcha.</div>
    `;
  } else {
    ksCard.style.display = 'none';
  }

  await refreshStorageUsage();
  await refreshCloudInfo();
  await refreshQuotasView('quotas-settings', false);
}

function renderSafetyModes(active: SafetyMode): void {
  const host = $('safety-modes');
  host.innerHTML = (['safe', 'standard', 'aggressive'] as SafetyMode[])
    .map((mode) => {
      const p = SAFETY_PRESETS[mode];
      const isActive = mode === active;
      return `
        <div class="framework-card ${isActive ? 'active' : ''}" data-mode="${mode}">
          <div class="row-between">
            <div class="fw-name">${p.name}</div>
            <div style="font-size: 10px; color: var(--muted)">${p.globalDailyCap}/dzień · ${p.minDelaySeconds / 60}-${p.maxDelaySeconds / 60} min delay</div>
          </div>
          <div class="fw-desc" style="margin-top: 4px">${p.description}</div>
        </div>
      `;
    }).join('');

  host.querySelectorAll('[data-mode]').forEach((el) => {
    el.addEventListener('click', async () => {
      const mode = el.getAttribute('data-mode') as SafetyMode;
      const preset = SAFETY_PRESETS[mode];
      if (mode === 'aggressive') {
        if (!confirm(preset.warning + '\n\nNa pewno chcesz włączyć tryb Agresywny?')) return;
      }
      await setSettings({
        safetyMode: mode,
        globalDailyCap: preset.globalDailyCap,
        minDelaySeconds: preset.minDelaySeconds,
        maxDelaySeconds: preset.maxDelaySeconds,
        defaultCooldownMinutes: preset.defaultCooldownMinutes,
        defaultGroupDailyCap: preset.defaultGroupDailyCap,
      });
      banner(`✓ Tryb: ${preset.name}`, 'ok');
      await refreshSettingsTab();
    });
  });

  // Warning dla aggressive
  const warn = $('safety-warning');
  const presetActive = SAFETY_PRESETS[active];
  if (presetActive.warning) {
    warn.style.display = 'block';
    warn.textContent = presetActive.warning;
  } else {
    warn.style.display = 'none';
  }
}

async function refreshQuotasView(hostId: string, compact = false): Promise<void> {
  const q = await checkAllQuotas();
  const host = document.getElementById(hostId);
  if (!host) return;
  const row = (c: { label: string; used: number; limit: number; percent: number; warning: string }) => {
    const colorClass = c.warning === 'blocked' ? 'critical' : c.warning === 'critical' ? 'critical' : c.warning === 'warn' ? 'warn' : '';
    return `
      <div style="margin-bottom: ${compact ? 6 : 10}px">
        <div class="row-between" style="font-size: ${compact ? 11 : 12}px; margin-bottom: 3px">
          <div style="color: ${c.warning === 'blocked' ? 'var(--danger)' : 'var(--text)'}">${escapeHtml(c.label)}</div>
          <div style="color: var(--muted); font-weight: 500">${c.used} / ${c.limit}</div>
        </div>
        <div class="storage-bar"><div class="storage-fill ${colorClass}" style="width: ${c.percent.toFixed(0)}%"></div></div>
      </div>
    `;
  };
  host.innerHTML = row(q.publications) + row(q.groups) + row(q.images);

  if (!compact) {
    const monthName = new Date().toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
    host.innerHTML += `<div style="font-size: 10.5px; color: var(--muted); margin-top: 8px">Licznik publikacji resetuje się 1. dnia miesiąca. Bieżący okres: <strong>${monthName}</strong></div>`;
  }
}

async function refreshStorageUsage(): Promise<void> {
  const u = await getStorageUsage();
  const mb = (u.bytesUsed / 1024 / 1024).toFixed(2);
  const quotaMb = (u.bytesQuota / 1024 / 1024).toFixed(0);
  $('storage-used').textContent = `${mb} / ${quotaMb} MB`;
  $('storage-percent').textContent = `${u.percentUsed.toFixed(1)}%`;
  const fill = $('storage-fill') as HTMLElement;
  fill.style.width = `${Math.min(100, u.percentUsed)}%`;
  fill.className = 'storage-fill ' + (u.warning === 'critical' ? 'critical' : u.warning === 'warn' ? 'warn' : '');
}

async function refreshCloudInfo(): Promise<void> {
  const s = cloud.getSyncStatus();
  const lastSync = s.lastSyncAt ? timeAgo(s.lastSyncAt) : 'nigdy';
  const statusLabel = s.status === 'ok' ? '✓ Zapisuje się w chmurze' :
                       s.status === 'no_schema' ? '⚠ Backup niedostępny (skontaktuj się z administratorem)' :
                       s.status === 'offline' ? '✗ Tryb offline — dane lokalne' :
                       '? Sprawdzam status';
  $('cloud-info').innerHTML = `
    <div style="margin-bottom: 4px"><strong>${statusLabel}</strong></div>
    <div style="color: var(--muted); font-size: 10.5px">Ostatnia synchronizacja: ${lastSync}</div>
  `;
}

function refreshSyncPill(): void {
  const s = cloud.getSyncStatus();
  const pill = $('sync-pill');
  if (s.status === 'ok') { pill.className = 'sync-pill ok'; pill.textContent = 'sync OK'; pill.title = `Ostatni sync: ${timeAgo(s.lastSyncAt)}`; }
  else if (s.status === 'no_schema') { pill.className = 'sync-pill err'; pill.textContent = 'błąd'; pill.title = 'Backup w chmurze niedostępny — skontaktuj się z administratorem'; }
  else if (s.status === 'offline') { pill.className = 'sync-pill err'; pill.textContent = 'offline'; pill.title = 'Brak połączenia z internetem — dane zapisują się lokalnie'; }
  else { pill.className = 'sync-pill unk'; pill.textContent = 'sync…'; pill.title = 'Nie wykonano jeszcze żadnej operacji'; }
}

function renderScheduler(s: Awaited<ReturnType<typeof getSettings>>): void {
  const sch = s.scheduler ?? {
    enabled: false,
    intervalMinutes: 90,
    jitterMinutes: 20,
    days: [
      { enabled: false, startHour: 12, endHour: 18 },
      { enabled: true,  startHour: 8,  endHour: 17 },
      { enabled: true,  startHour: 8,  endHour: 17 },
      { enabled: true,  startHour: 8,  endHour: 17 },
      { enabled: true,  startHour: 8,  endHour: 17 },
      { enabled: true,  startHour: 8,  endHour: 17 },
      { enabled: false, startHour: 10, endHour: 14 },
    ],
  };
  ($('sch-enabled') as HTMLInputElement).checked = sch.enabled;
  ($('sch-interval') as HTMLInputElement).value = String(sch.intervalMinutes);
  ($('sch-jitter') as HTMLInputElement).value = String(sch.jitterMinutes);

  const dayNames = ['Niedz', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'];
  $('sch-days').innerHTML = sch.days.map((d, i) => `
    <div class="row" style="gap: 6px; align-items: center; padding: 4px 0">
      <input type="checkbox" data-sch-day="${i}" ${d.enabled ? 'checked' : ''} style="width: auto" />
      <div style="flex: 0 0 32px; font-size: 11px; color: var(--muted)">${dayNames[i]}</div>
      <input type="number" data-sch-start="${i}" min="0" max="23" value="${d.startHour}" style="flex: 1" />
      <div style="font-size: 11px; color: var(--muted)">-</div>
      <input type="number" data-sch-end="${i}" min="0" max="23" value="${d.endHour}" style="flex: 1" />
    </div>
  `).join('');
}

function readSchedulerFromUI(): Awaited<ReturnType<typeof getSettings>>['scheduler'] {
  const days = [0, 1, 2, 3, 4, 5, 6].map((i) => {
    const enabled = (document.querySelector(`[data-sch-day="${i}"]`) as HTMLInputElement).checked;
    const startHour = parseInt((document.querySelector(`[data-sch-start="${i}"]`) as HTMLInputElement).value, 10);
    const endHour = parseInt((document.querySelector(`[data-sch-end="${i}"]`) as HTMLInputElement).value, 10);
    return { enabled, startHour: Math.max(0, Math.min(23, startHour)), endHour: Math.max(0, Math.min(23, endHour)) };
  }) as ExtensionSettingsSchedDays;
  return {
    enabled: ($('sch-enabled') as HTMLInputElement).checked,
    intervalMinutes: Math.max(30, parseInt(($('sch-interval') as HTMLInputElement).value, 10)),
    jitterMinutes: Math.max(0, parseInt(($('sch-jitter') as HTMLInputElement).value, 10)),
    days,
  };
}

type ExtensionSettingsSchedDays = NonNullable<Awaited<ReturnType<typeof getSettings>>['scheduler']>['days'];

$('set-save').addEventListener('click', async () => {
  const get = (id: string) => parseInt(($(id) as HTMLInputElement).value, 10);
  const minD = Math.max(10, get('set-min-delay'));
  const maxD = Math.max(minD, get('set-max-delay'));
  await setSettings({
    globalDailyCap: Math.max(1, Math.min(200, get('set-daily-cap'))),
    minDelaySeconds: minD,
    maxDelaySeconds: maxD,
    defaultCooldownMinutes: Math.max(60, get('set-cooldown')),
    defaultGroupDailyCap: Math.max(1, get('set-group-cap')),
    sleepHoursEnabled: ($('set-sleep-enabled') as HTMLInputElement).checked,
    sleepStartHour: Math.max(0, Math.min(23, get('set-sleep-start'))),
    sleepEndHour: Math.max(0, Math.min(23, get('set-sleep-end'))),
    variatorEnabled: ($('set-variator') as HTMLInputElement).checked,
    scheduler: readSchedulerFromUI(),
  });
  banner('✓ Ustawienia zapisane', 'ok');
  await refreshSettingsTab();
});

$('kill-switch-clear').addEventListener('click', async () => {
  if (!confirm(
    '⚠ UWAGA: Kill switch aktywuje się gdy FB wykryje automatyzację.\n\n' +
    'Wznowienie bez sprawdzenia konta może doprowadzić do BANA.\n\n' +
    'Czy:\n' +
    '1. Sprawdziłeś swoje konto FB ręcznie?\n' +
    '2. Nie ma captcha / blokady / restriction?\n' +
    '3. Możesz publikować normalnie ręcznie?\n\n' +
    'Wznawiać?'
  )) return;
  await setSettings({
    killSwitch: false,
    killSwitchReason: undefined,
    killSwitchAt: undefined,
    paused: false,
  });
  banner('System wznowiony. Postępuj ostrożnie!', 'ok');
  await refreshSettingsTab();
  await refreshHome();
});

$('set-reset').addEventListener('click', async () => {
  if (!confirm('Przywrócić domyślne ustawienia?')) return;
  await setSettings(DEFAULT_SETTINGS);
  await refreshSettingsTab();
  banner('Przywrócono domyślne', 'ok');
});

$('set-export').addEventListener('click', async () => {
  const data = await chrome.storage.local.get(null);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mapjob-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  banner('✓ Backup pobrany', 'ok');
});

// ============ LICENSE ============
let currentLicense: License | null = null;

async function refreshLicense(): Promise<void> {
  currentLicense = await fetchLicense();
  applyLicenseToUI();
}

function applyLicenseToUI(): void {
  const badge = getStatusBadge(currentLicense);
  const pill = $('license-pill');
  if (pill) {
    pill.className = `sync-pill ${badge.cls === 'success' ? 'ok' : badge.cls === 'warning' ? 'unk' : badge.cls === 'danger' ? 'err' : 'off'}`;
    pill.textContent = badge.text;
  }

  // Modal expired — gdy NIE jest valid
  const expiredModal = $('expired-modal');
  if (currentLicense && !isLicenseValid(currentLicense)) {
    expiredModal.classList.add('show');
  } else {
    expiredModal.classList.remove('show');
  }

  // Modal onboarding — gdy brak licencji w ogóle
  const onbModal = $('onboarding-modal');
  if (!currentLicense) {
    onbModal.classList.add('show');
  } else {
    onbModal.classList.remove('show');
  }

  // License section w Settings
  const licSect = document.getElementById('license-info');
  if (licSect && currentLicense) {
    const trialEnds = currentLicense.trialEndsAt ? new Date(currentLicense.trialEndsAt).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
    const paidUntil = currentLicense.paidUntil ? new Date(currentLicense.paidUntil).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
    licSect.innerHTML = `
      <div style="font-size: 12px; line-height: 1.7">
        <div>Plan: <strong>${currentLicense.plan.toUpperCase()}</strong></div>
        <div>Status: <strong style="color: ${badge.cls === 'success' ? 'var(--success)' : badge.cls === 'warning' ? 'var(--warning)' : 'var(--danger)'}">${badge.text}</strong></div>
        <div>Email: <code>${escapeHtml(currentLicense.email ?? '—')}</code></div>
        ${currentLicense.phone ? `<div>Telefon: <code>${escapeHtml(currentLicense.phone)}</code></div>` : ''}
        <div>Limit miesięczny: <strong>${currentLicense.monthlyPublicationsCap}</strong></div>
        ${currentLicense.plan === 'trial' ? `<div>Trial do: <strong>${trialEnds}</strong></div>` : ''}
        ${currentLicense.paidUntil ? `<div>Ważna do: <strong>${paidUntil}</strong></div>` : ''}
      </div>
    `;
  }
}

// ONBOARDING
function bindOnboardingHandlers(): void {
  const email = $('onb-email') as HTMLInputElement;
  const phone = $('onb-phone') as HTMLInputElement;
  const tos = $('onb-tos') as HTMLInputElement;
  const startBtn = $('onb-start') as HTMLButtonElement;

  const updateState = () => {
    const ok = email.value.trim().length > 5 && phone.value.trim().length >= 9 && tos.checked;
    startBtn.disabled = !ok;
  };
  email.addEventListener('input', updateState);
  phone.addEventListener('input', updateState);
  tos.addEventListener('change', updateState);

  startBtn.addEventListener('click', async () => {
    startBtn.disabled = true;
    startBtn.textContent = '⏳ Aktywuję trial...';
    const r = await startTrial(email.value, phone.value);
    if (!r.ok) {
      startBtn.disabled = false;
      startBtn.textContent = '🚀 Rozpocznij 7-dniowy trial';
      banner(r.error ?? 'Nie udało się rozpocząć trialu', 'err', 8000);
      return;
    }
    $('onboarding-modal').classList.remove('show');
    banner('✓ Trial 7-dniowy aktywowany! Możesz importować grupy i postować.', 'ok', 8000);
    await refreshLicense();
  });

  $('onb-have-key').addEventListener('click', (e) => {
    e.preventDefault();
    $('onboarding-modal').classList.remove('show');
    $('activate-modal').classList.add('show');
  });
}

// ACTIVATE KEY MODAL
function bindActivateHandlers(): void {
  const close = () => $('activate-modal').classList.remove('show');
  $('activate-cancel').addEventListener('click', close);
  $('activate-discard').addEventListener('click', close);
  $('activate-modal').addEventListener('click', (e) => {
    if (e.target === $('activate-modal')) close();
  });

  $('activate-submit').addEventListener('click', async () => {
    const key = ($('activate-key') as HTMLInputElement).value.trim();
    if (!key) {
      $('activate-msg').innerHTML = '<span style="color: var(--danger)">Wpisz klucz</span>';
      return;
    }
    $('activate-msg').innerHTML = '<span style="color: var(--muted)">⏳ Aktywuję...</span>';
    const r = await activateLicense(key);
    if (!r.ok) {
      $('activate-msg').innerHTML = `<span style="color: var(--danger)">${escapeHtml(r.error ?? 'Błąd')}</span>`;
      return;
    }
    $('activate-msg').innerHTML = '<span style="color: var(--success)">✓ Aktywowane!</span>';
    setTimeout(async () => {
      close();
      $('expired-modal').classList.remove('show');
      await refreshLicense();
      banner(`✓ Plan ${r.license?.plan.toUpperCase()} aktywny`, 'ok');
    }, 1200);
  });

  $('expired-activate').addEventListener('click', () => {
    $('expired-modal').classList.remove('show');
    $('activate-modal').classList.add('show');
  });
}

// ============ INIT ============
async function refreshAll(): Promise<void> {
  await Promise.all([
    refreshHome(), refreshFBStatus(), refreshGroupsTab(), refreshPostsTab(),
    refreshCampTab(), refreshLog(), refreshSettingsTab(), refreshLicense(),
  ]);
  refreshSyncPill();
}

document.getElementById('open-activate')?.addEventListener('click', () => {
  $('activate-modal').classList.add('show');
});

bindOnboardingHandlers();
bindActivateHandlers();

document.querySelectorAll('input[name="tabs"]').forEach((input) => {
  input.addEventListener('change', () => refreshAll());
});

// Init asystenta (raz)
renderFrameworks();
renderHooks();
renderFields();
renderThumbs();
updateDropzoneState();
updateScore('');
bindAssistant();

void refreshAll();
setInterval(refreshFBStatus, 5000);
setInterval(refreshSyncPill, 10_000);
