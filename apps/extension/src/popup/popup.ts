/**
 * Popup logic — standalone, zero backendu.
 */

import {
  getGroups,
  upsertGroups,
  getPosts,
  savePost,
  getCampaigns,
  saveCampaign,
  saveTargets,
  getTargets,
  getActivity,
  getSettings,
  setSettings,
  logActivity,
  getDeviceId,
  type FBGroup,
  type PostTemplate,
  type Campaign,
  type CampaignTarget,
  type ActivityEvent,
} from '../lib/store';
import * as cloud from '../lib/cloud';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

function banner(msg: string, kind: 'ok' | 'warn' | 'err' | 'info' = 'info', ms = 4000): void {
  const host = $('banner-host');
  host.innerHTML = `<div class="status-banner ${kind}">${msg}</div>`;
  if (ms > 0) setTimeout(() => { host.innerHTML = ''; }, ms);
}

async function refreshHome(): Promise<void> {
  const [groups, posts, targets, settings] = await Promise.all([getGroups(), getPosts(), getTargets(), getSettings()]);
  const activeGroups = groups.filter((g) => g.isActive).length;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const today = targets.filter((t) => t.status === 'posted' && (t.postedAt ?? 0) >= todayStart.getTime()).length;

  $('stat-groups').textContent = String(activeGroups);
  $('stat-posts').textContent = String(posts.length);
  $('stat-today').textContent = String(today);

  $('status-summary').textContent = settings.paused
    ? 'Wstrzymane (kliknij switch żeby wznowić)'
    : `Aktywne · ${activeGroups} grup · ${posts.length} postów`;

  const toggle = $('pause-toggle');
  toggle.classList.toggle('on', !settings.paused);
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
  await setSettings({ paused: !settings.paused });
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

  $('groups-list').innerHTML = html || '<div class="empty">Brak grup. Kliknij "Importuj grupy" na ekranie głównym.</div>';

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
async function refreshPostsTab(): Promise<void> {
  const posts = await getPosts();
  $('posts-count').textContent = `${posts.length} postów`;
  $('posts-list').innerHTML = posts.length
    ? posts.map((p) => `
      <div class="card" style="padding: 10px">
        <div style="font-weight: 600; font-size: 12.5px">${escapeHtml(p.title)}</div>
        <div style="color: var(--muted); font-size: 11px; margin-top: 4px; margin-bottom: 6px">
          ${escapeHtml(p.body.slice(0, 120))}${p.body.length > 120 ? '…' : ''}
        </div>
        <div class="row-between">
          <span class="badge badge-muted">${p.type}</span>
          <button class="btn btn-ghost btn-sm" data-del="${p.id}">Usuń</button>
        </div>
      </div>`).join('')
    : '<div class="empty">Brak postów. Stwórz pierwszy na ekranie głównym lub klikając "Nowy".</div>';

  $('posts-list').querySelectorAll('[data-del]').forEach((b) => {
    b.addEventListener('click', async (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.del!;
      const all = await getPosts();
      await chrome.storage.local.set({ posts: all.filter((p) => p.id !== id) });
      await refreshPostsTab();
      await refreshHome();
    });
  });
}

$('new-post').addEventListener('click', () => {
  ($('tab-home') as HTMLInputElement).checked = true;
  ($('quick-text') as HTMLTextAreaElement).focus();
});

// ============ CAMPAIGNS ============
let selectedGroupIds = new Set<string>();

async function refreshCampTab(): Promise<void> {
  const [posts, groups] = await Promise.all([getPosts(), getGroups()]);

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

// ============ INIT ============
async function refreshAll(): Promise<void> {
  await Promise.all([refreshHome(), refreshFBStatus(), refreshGroupsTab(), refreshPostsTab(), refreshCampTab(), refreshLog()]);
}

document.querySelectorAll('input[name="tabs"]').forEach((input) => {
  input.addEventListener('change', () => refreshAll());
});

void refreshAll();
setInterval(refreshFBStatus, 5000);
