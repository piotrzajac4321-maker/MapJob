import { getAuth, getSettings, setSettings, getDeviceId, clearAuth } from '../lib/storage';
import { upsertGroups, ensureFbAccount } from '../lib/api';

const WEB_APP_URL = import.meta.env.VITE_WEB_APP_URL || 'http://localhost:3000';

const statusEl = document.getElementById('status') as HTMLDivElement;
const metaEl = document.getElementById('meta') as HTMLDivElement;
const btnLogin = document.getElementById('btn-login') as HTMLButtonElement;
const btnScrape = document.getElementById('btn-scrape') as HTMLButtonElement;
const btnPause = document.getElementById('btn-pause') as HTMLButtonElement;
const btnResume = document.getElementById('btn-resume') as HTMLButtonElement;
const btnLogout = document.getElementById('btn-logout') as HTMLButtonElement;
const rowToggle = document.getElementById('row-toggle') as HTMLDivElement;

async function refresh(): Promise<void> {
  const [auth, settings, deviceId] = await Promise.all([getAuth(), getSettings(), getDeviceId()]);

  if (!auth) {
    statusEl.textContent = 'Niezalogowany. Połącz z kontem MapJob.';
    statusEl.className = 'status warn';
    btnLogin.style.display = '';
    btnScrape.style.display = 'none';
    rowToggle.style.display = 'none';
    btnLogout.style.display = 'none';
    metaEl.textContent = `Device: ${deviceId.slice(0, 8)}…`;
    return;
  }

  const expiresInDays = Math.round((auth.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
  statusEl.textContent = settings.paused ? 'PAUZA — kliknij Wznów' : 'Aktywny i gotowy';
  statusEl.className = `status ${settings.paused ? 'warn' : 'ok'}`;

  btnLogin.style.display = 'none';
  btnScrape.style.display = '';
  rowToggle.style.display = '';
  btnLogout.style.display = '';

  metaEl.innerHTML = `Org: <code>${auth.orgId.slice(0, 8)}…</code><br>Device: <code>${deviceId.slice(0, 8)}…</code><br>Token wygasa za ${expiresInDays} dni`;
}

btnLogin.addEventListener('click', async () => {
  const deviceId = await getDeviceId();
  const extensionId = chrome.runtime.id;
  const url = `${WEB_APP_URL}/extension-auth?device=${deviceId}&ext=${extensionId}`;
  await chrome.tabs.create({ url });
  window.close();
});

btnScrape.addEventListener('click', async () => {
  btnScrape.disabled = true;
  statusEl.textContent = 'Otwieram listę grup…';
  statusEl.className = 'status warn';

  // Otwórz facebook.com/groups/joins/
  const tab = await chrome.tabs.create({ url: 'https://www.facebook.com/groups/joins/' });

  if (!tab.id) {
    statusEl.textContent = 'Nie udało się otworzyć karty.';
    statusEl.className = 'status err';
    btnScrape.disabled = false;
    return;
  }

  // Czekaj na complete
  await new Promise<void>((resolve) => {
    const listener = (id: number, info: chrome.tabs.TabChangeInfo) => {
      if (id === tab.id && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        setTimeout(resolve, 3000);
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });

  statusEl.textContent = 'Scrapuję grupy (może potrwać 1-2 min)…';

  const response = await chrome.tabs.sendMessage(tab.id, { type: 'SCRAPE_GROUPS' }).catch(() => null);

  if (!response?.ok || !response.groups) {
    statusEl.textContent = 'Scraping nie powiódł się. Upewnij się że jesteś zalogowany.';
    statusEl.className = 'status err';
    btnScrape.disabled = false;
    return;
  }

  const auth = await getAuth();
  if (!auth) return;

  const fbAccountId = await ensureFbAccount('Default');
  if (!fbAccountId) {
    statusEl.textContent = 'Nie udało się stworzyć rekordu fb_account.';
    statusEl.className = 'status err';
    btnScrape.disabled = false;
    return;
  }

  const result = await upsertGroups(fbAccountId, response.groups);

  statusEl.textContent = `Zaimportowano ${result?.inserted ?? 0} grup. Otwórz dashboard.`;
  statusEl.className = 'status ok';
  btnScrape.disabled = false;
});

btnPause.addEventListener('click', async () => {
  await setSettings({ paused: true });
  await refresh();
});

btnResume.addEventListener('click', async () => {
  await setSettings({ paused: false });
  await refresh();
});

btnLogout.addEventListener('click', async () => {
  await clearAuth();
  await refresh();
});

void refresh();
