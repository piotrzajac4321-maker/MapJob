/**
 * MapJob Analytics Tracker
 *
 * Pełne śledzenie każdego kroku użytkownika:
 *   - każde kliknięcie z koordynatami (heatmapa)
 *   - scroll depth (25/50/75/90/100%)
 *   - exit intent (mysz opuszcza viewport)
 *   - czas na stronie + ostatnia akcja przed opuszczeniem
 *   - rage click, copy telefonu/emaila
 *   - formularze (start → pola → submit/abandon)
 *   - widoczność karty, błędy JS
 *   - mapy, filtry, wyszukiwanie, ogłoszenia, czat
 *
 * Użycie:
 *   import { initTracker, identify, trackPageView, track } from './tracker.js';
 *
 *   // Na starcie aplikacji (raz):
 *   initTracker({ supabaseClient: supabase, userId: user?.id });
 *
 *   // Po zmianie route (SPA):
 *   trackPageView('/nowa-sciezka');
 *
 *   // Po logowaniu:
 *   identify(user.id);
 */

// ─────────────────────────────────────────────
// Konfiguracja
// ─────────────────────────────────────────────

const SESSION_TIMEOUT_MS   = 30 * 60 * 1000; // 30 min braku aktywności = nowa sesja
const SCROLL_MILESTONES    = [25, 50, 75, 90, 100];
const RAGE_CLICK_THRESHOLD = 3;              // ile kliknięć w tym samym miejscu
const RAGE_CLICK_WINDOW_MS = 700;            // w ciągu ilu ms
const BATCH_SIZE           = 20;             // ile eventów trzymamy przed wysłaniem
const BATCH_FLUSH_MS       = 4000;           // co ile ms wymuszamy flush

// ─────────────────────────────────────────────
// Typy eventów
// ─────────────────────────────────────────────

export const EVENT = {
  // Nawigacja
  PAGE_VIEW:       'page_view',       // wejście na stronę / zmiana route
  PAGE_EXIT:       'page_exit',       // opuszczenie strony (czas, ostatnia akcja)
  TAB_HIDDEN:      'tab_hidden',      // karta schowana (alt+tab, inna karta)
  TAB_VISIBLE:     'tab_visible',     // karta wróciła do fokusa
  EXIT_INTENT:     'exit_intent',     // mysz wychodzi poza ekran (zamiar zamknięcia)

  // Kliknięcia
  CLICK:           'click',           // każde kliknięcie (tag, tekst, href, x/y)
  RAGE_CLICK:      'rage_click',      // ≥3 kliknięcia w to samo miejsce < 700ms
  COPY:            'copy',            // kopiowanie tekstu (wykrywa tel/email)

  // Scroll
  SCROLL_DEPTH:    'scroll_depth',    // milestone 25/50/75/90/100%

  // Formularze
  FORM_START:      'form_start',      // pierwsze kliknięcie w pole formularza
  FORM_FIELD:      'form_field',      // wypełnienie konkretnego pola
  FORM_SUBMIT:     'form_submit',     // wysłanie formularza
  FORM_ABANDON:    'form_abandon',    // opuszczenie strony z niedokończonym formularzem

  // Ogłoszenia pracy
  JOB_VIEW:        'job_view',        // otwarcie szczegółów ogłoszenia
  JOB_CONTACT:     'job_contact',     // kliknięcie w telefon lub email na ogłoszeniu
  JOB_APPLY:       'job_apply',       // kliknięcie "Aplikuj"
  JOB_SAVE:        'job_save',        // zapisanie/odznaczenie ogłoszenia
  JOB_SHARE:       'job_share',       // udostępnienie ogłoszenia

  // Mapa
  MAP_PIN_CLICK:   'map_pin_click',   // kliknięcie w pinezkę
  MAP_CLUSTER:     'map_cluster',     // kliknięcie w grupę pinezek
  MAP_ZOOM:        'map_zoom',        // zmiana zoomu
  MAP_PAN:         'map_pan',         // przesunięcie mapy

  // Filtry i wyszukiwanie
  SEARCH:          'search',          // wpisanie frazy szukania
  FILTER_APPLY:    'filter_apply',    // zmiana/zastosowanie filtrów
  FILTER_CLEAR:    'filter_clear',    // wyczyszczenie filtrów

  // Profil / Pin
  PROFILE_VIEW:    'profile_view',    // otwarcie profilu specjalisty
  PIN_CONTACT:     'pin_contact',     // kliknięcie w kontakt na profilu

  // Czat
  CHAT_OPEN:       'chat_open',       // otwarcie okna czatu
  CHAT_MESSAGE:    'chat_message',    // wysłanie wiadomości

  // Autoryzacja
  LOGIN:           'login',
  LOGOUT:          'logout',
  REGISTER:        'register',

  // Płatności
  CHECKOUT_START:  'checkout_start',
  CHECKOUT_DONE:   'checkout_done',

  // Powiadomienia
  NOTIF_CLICK:     'notif_click',

  // Błędy
  JS_ERROR:        'js_error',
};

// ─────────────────────────────────────────────
// Stan wewnętrzny
// ─────────────────────────────────────────────

let _supabase      = null;
let _supabaseUrl   = null;
let _supabaseKey   = null;
let _userId        = null;
let _sessionId     = null;
let _anonId        = null;
let _sessionStart  = 0;
let _pageEntry     = 0;
let _currentPath   = '';
let _maxScroll     = 0;
let _scrollHit     = new Set();
let _lastAction    = null;    // { type, target, ts }
let _recentClicks  = [];      // rage click buffer
let _formStates    = new Map(); // formKey → { started, fields, startTs }
let _exitIntentFired = false;
let _queue         = [];
let _flushTimer    = null;
let _initialized   = false;

// ─────────────────────────────────────────────
// Session management
// ─────────────────────────────────────────────

function getOrCreateAnonId() {
  try {
    let id = localStorage.getItem('mj_anon');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('mj_anon', id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function loadStoredSession() {
  try {
    const raw = sessionStorage.getItem('mj_sess');
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (Date.now() - s.lastAt < SESSION_TIMEOUT_MS) return s.id;
    return null; // wygasła
  } catch {
    return null;
  }
}

function saveSession(id) {
  try {
    sessionStorage.setItem('mj_sess', JSON.stringify({ id, lastAt: Date.now() }));
  } catch {}
}

function refreshSession() {
  saveSession(_sessionId);
}

// ─────────────────────────────────────────────
// Helpery
// ─────────────────────────────────────────────

function deviceType() {
  if (/Mobi|Android/i.test(navigator.userAgent)) return 'mobile';
  if (/Tablet|iPad/i.test(navigator.userAgent)) return 'tablet';
  return 'desktop';
}

function utmParams() {
  const p = new URLSearchParams(location.search);
  return {
    utm_source:   p.get('utm_source')   || undefined,
    utm_medium:   p.get('utm_medium')   || undefined,
    utm_campaign: p.get('utm_campaign') || undefined,
    utm_content:  p.get('utm_content')  || undefined,
    utm_term:     p.get('utm_term')     || undefined,
    ref:          p.get('ref')          || undefined,
  };
}

function scrollPct() {
  const scrolled = window.scrollY + window.innerHeight;
  const total = Math.max(document.documentElement.scrollHeight, 1);
  return Math.min(100, Math.round((scrolled / total) * 100));
}

function elInfo(el) {
  if (!el) return {};
  const tag = el.tagName?.toLowerCase() || '';
  const rawText = (
    el.innerText ||
    el.value ||
    el.getAttribute('aria-label') ||
    el.getAttribute('title') ||
    el.getAttribute('placeholder') ||
    ''
  ).trim();
  const text = rawText.slice(0, 80) || undefined;
  const href = (el.href || el.closest?.('a')?.href)?.replace(location.origin, '') || undefined;
  const classes = (el.className || '').toString()
    .split(' ')
    .filter(c => c && !/svelte|tw-|css-/.test(c))
    .slice(0, 5)
    .join(' ') || undefined;
  const id = el.id || el.closest?.('[data-track-id]')?.dataset?.trackId || undefined;
  const component = el.closest?.('[data-component]')?.dataset?.component || undefined;
  const trackLabel = el.closest?.('[data-track]')?.dataset?.track || undefined;
  return { tag, text, href, class: classes, id, component, label: trackLabel };
}

// ─────────────────────────────────────────────
// Queue & flush
// ─────────────────────────────────────────────

function enqueue(eventType, targetType, targetId, metadata = {}) {
  if (!_initialized) return;

  // Wyczyść undefined z metadata
  const meta = Object.fromEntries(
    Object.entries({
      ...metadata,
      scroll_pct: scrollPct(),
    }).filter(([, v]) => v !== undefined && v !== null)
  );

  const event = {
    session_id:  _sessionId,
    user_id:     _userId || null,
    anon_id:     _anonId,
    event_type:  eventType,
    target_type: targetType || null,
    target_id:   targetId != null ? String(targetId) : null,
    path:        location.pathname + location.search,
    metadata:    meta,
    created_at:  new Date().toISOString(),
  };

  _lastAction = { type: eventType, target: targetType, ts: Date.now() };
  refreshSession();
  _queue.push(event);

  if (_queue.length >= BATCH_SIZE) {
    flush();
  } else {
    scheduleFlush();
  }
}

function scheduleFlush() {
  if (_flushTimer) return;
  _flushTimer = setTimeout(flush, BATCH_FLUSH_MS);
}

async function flush() {
  clearTimeout(_flushTimer);
  _flushTimer = null;
  if (!_queue.length || !_supabase) return;

  const batch = _queue.splice(0);
  try {
    await _supabase.from('user_events').insert(batch);

    // Aktualizuj sesję (last_seen, last_event, last_path)
    const last = batch[batch.length - 1];
    await _supabase.from('user_sessions').update({
      last_seen_at: new Date().toISOString(),
      last_event:   last.event_type,
      last_path:    last.path,
    }).eq('id', _sessionId);
  } catch {
    // Odłóż eventy z powrotem - nie chcemy tracić danych
    _queue.unshift(...batch);
  }
}

/** Synchroniczna wysyłka przy zamykaniu strony (keepalive fetch) */
function flushSync() {
  if (!_queue.length || !_supabaseUrl || !_supabaseKey) return;
  const batch = _queue.splice(0);
  fetch(`${_supabaseUrl}/rest/v1/user_events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': _supabaseKey,
      'Authorization': `Bearer ${_supabaseKey}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(batch),
    keepalive: true,
  }).catch(() => {});
}

// ─────────────────────────────────────────────
// Listeners — auto-tracking
// ─────────────────────────────────────────────

function setupClicks() {
  document.addEventListener('click', (e) => {
    const el = e.target;
    const info = elInfo(el.closest?.('a, button, [role="button"], [data-track]') || el);

    // Telefon / email z linku
    if (info.href?.startsWith('/tel:') || el.href?.startsWith('tel:')) {
      enqueue(EVENT.COPY, 'phone', null, { value_preview: (el.href || '').replace('tel:', '') });
    } else if (info.href?.startsWith('/mailto:') || el.href?.startsWith('mailto:')) {
      enqueue(EVENT.COPY, 'email', null, {});
    }

    enqueue(EVENT.CLICK, info.component || info.tag || 'element', info.id || null, {
      x: Math.round(e.clientX),
      y: Math.round(e.clientY),
      page_x: Math.round(e.pageX),
      page_y: Math.round(e.pageY),
      ...info,
    });

    // Rage click
    const now = Date.now();
    _recentClicks = _recentClicks.filter(c => now - c.ts < RAGE_CLICK_WINDOW_MS);
    _recentClicks.push({ x: e.clientX, y: e.clientY, ts: now });
    const nearby = _recentClicks.filter(
      c => Math.abs(c.x - e.clientX) < 40 && Math.abs(c.y - e.clientY) < 40
    );
    if (nearby.length >= RAGE_CLICK_THRESHOLD) {
      enqueue(EVENT.RAGE_CLICK, info.component || 'element', info.id || null, {
        x: Math.round(e.clientX),
        y: Math.round(e.clientY),
        clicks: nearby.length,
        ...info,
      });
      _recentClicks = [];
    }
  }, { passive: true });
}

function setupScroll() {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const depth = scrollPct();
      _maxScroll = Math.max(_maxScroll, depth);

      for (const milestone of SCROLL_MILESTONES) {
        if (depth >= milestone && !_scrollHit.has(milestone)) {
          _scrollHit.add(milestone);
          enqueue(EVENT.SCROLL_DEPTH, 'page', null, {
            depth_pct: milestone,
            max_depth_pct: _maxScroll,
            time_ms: Date.now() - _pageEntry,
          });
        }
      }
      ticking = false;
    });
  }, { passive: true });
}

function setupExitIntent() {
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY > 0 || _exitIntentFired) return;
    _exitIntentFired = true;
    enqueue(EVENT.EXIT_INTENT, 'page', null, {
      last_action: _lastAction?.type || null,
      time_on_page_ms: Date.now() - _pageEntry,
      max_scroll_pct: _maxScroll,
    });
  });
}

function setupVisibility() {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      enqueue(EVENT.TAB_HIDDEN, 'tab', null, {
        time_on_page_ms: Date.now() - _pageEntry,
        max_scroll_pct: _maxScroll,
      });
      flush();
    } else {
      enqueue(EVENT.TAB_VISIBLE, 'tab', null, {
        away_ms: Date.now() - (_lastAction?.ts || Date.now()),
      });
    }
  });
}

function setupPageExit() {
  const doExit = () => {
    enqueue(EVENT.PAGE_EXIT, 'page', null, {
      time_on_page_ms: Date.now() - _pageEntry,
      max_scroll_pct: _maxScroll,
      last_action: _lastAction?.type || null,
      last_target: _lastAction?.target || null,
    });
    flushSync();
  };
  window.addEventListener('beforeunload', doExit);
  window.addEventListener('pagehide', doExit);
}

function setupForms() {
  // Śledzenie startu wypełniania
  document.addEventListener('focusin', (e) => {
    const form = e.target.closest?.('form');
    if (!form) return;
    const key = form.id || form.dataset?.form || form.action?.split('/').pop() || 'form';
    if (!_formStates.has(key)) {
      _formStates.set(key, { fields: new Set(), startTs: Date.now() });
      enqueue(EVENT.FORM_START, 'form', key, { form_name: key });
    }
    const fieldName = e.target.name || e.target.id || e.target.placeholder?.slice(0, 20);
    if (fieldName) {
      const state = _formStates.get(key);
      if (!state.fields.has(fieldName)) {
        state.fields.add(fieldName);
        enqueue(EVENT.FORM_FIELD, 'form', key, { field: fieldName, form_name: key });
      }
    }
  }, { passive: true });

  // Submit
  document.addEventListener('submit', (e) => {
    const key = e.target.id || e.target.dataset?.form || e.target.action?.split('/').pop() || 'form';
    const state = _formStates.get(key);
    enqueue(EVENT.FORM_SUBMIT, 'form', key, {
      form_name: key,
      fields_count: state?.fields.size || 0,
      time_ms: state ? Date.now() - state.startTs : null,
    });
    _formStates.delete(key);
  }, { passive: true });
}

function setupCopy() {
  document.addEventListener('copy', () => {
    const sel = window.getSelection()?.toString().trim() || '';
    if (!sel) return;
    const isPhone = /^[\d\s\+\-\(\)]{7,15}$/.test(sel);
    const isEmail = /@\w+\.\w+/.test(sel);
    enqueue(EVENT.COPY, isPhone ? 'phone' : isEmail ? 'email' : 'text', null, {
      type: isPhone ? 'phone' : isEmail ? 'email' : 'text',
      preview: sel.slice(0, 20),
    });
  }, { passive: true });
}

function setupErrors() {
  window.addEventListener('error', (e) => {
    enqueue(EVENT.JS_ERROR, 'js', null, {
      message: e.message?.slice(0, 200),
      source: e.filename?.split('/').slice(-2).join('/'),
      line: e.lineno,
    });
  });
  window.addEventListener('unhandledrejection', (e) => {
    enqueue(EVENT.JS_ERROR, 'promise', null, {
      message: String(e.reason)?.slice(0, 200),
    });
  });
}

// ─────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────

/**
 * Inicjalizacja — wywołaj raz na starcie aplikacji.
 *
 * @param {object} opts
 * @param {object} opts.supabaseClient  - zainicjalizowany klient Supabase
 * @param {string} opts.supabaseUrl     - URL projektu Supabase (do keepalive fetch)
 * @param {string} opts.supabaseKey     - anon key (do keepalive fetch)
 * @param {string|null} opts.userId     - ID zalogowanego użytkownika (lub null)
 */
export function initTracker({ supabaseClient, supabaseUrl, supabaseKey, userId = null }) {
  if (_initialized) return;

  _supabase    = supabaseClient;
  _supabaseUrl = supabaseUrl;
  _supabaseKey = supabaseKey;
  _userId      = userId;
  _anonId      = getOrCreateAnonId();
  _sessionId   = loadStoredSession() || crypto.randomUUID();
  _sessionStart = Date.now();
  _pageEntry    = Date.now();
  _currentPath  = location.pathname;

  saveSession(_sessionId);

  // Stwórz lub odnów rekord sesji w bazie
  supabaseClient.from('user_sessions').upsert({
    id:           _sessionId,
    user_id:      userId || null,
    anon_id:      _anonId,
    started_at:   new Date(_sessionStart).toISOString(),
    last_seen_at: new Date().toISOString(),
    last_path:    _currentPath,
    user_agent:   navigator.userAgent.slice(0, 300),
    events_count: 0,
    created_at:   new Date(_sessionStart).toISOString(),
  }, { onConflict: 'id', ignoreDuplicates: false }).catch(() => {});

  setupClicks();
  setupScroll();
  setupExitIntent();
  setupVisibility();
  setupPageExit();
  setupForms();
  setupCopy();
  setupErrors();

  _initialized = true;

  // Pierwszy page view
  trackPageView(location.pathname + location.search);
}

/**
 * Wywoływane po zalogowaniu użytkownika — łączy anonimowe zdarzenia z kontem.
 */
export function identify(userId) {
  _userId = userId;
  _supabase?.from('user_sessions')
    .update({ user_id: userId })
    .eq('id', _sessionId)
    .catch(() => {});
}

/**
 * Wywoływane przy każdej zmianie route (SPA).
 * Automatycznie trackuje exit z poprzedniej strony.
 */
export function trackPageView(path = location.pathname + location.search) {
  if (_currentPath && _currentPath !== path) {
    // Exit poprzedniej strony
    enqueue(EVENT.PAGE_EXIT, 'page', null, {
      time_on_page_ms: Date.now() - _pageEntry,
      max_scroll_pct: _maxScroll,
      last_action: _lastAction?.type || null,
      last_target: _lastAction?.target || null,
      next_path: path,
    });
  }

  _currentPath = path;
  _pageEntry   = Date.now();
  _maxScroll   = 0;
  _scrollHit   = new Set();
  _exitIntentFired = false;
  _lastAction  = null;

  enqueue(EVENT.PAGE_VIEW, 'page', null, {
    referrer: document.referrer || undefined,
    title: document.title,
    device: deviceType(),
    viewport_w: window.innerWidth,
    viewport_h: window.innerHeight,
    ...utmParams(),
  });
}

/**
 * Ogólny tracker — do wywołania manualnie z dowolnego miejsca.
 */
export function track(eventType, targetType = null, targetId = null, metadata = {}) {
  enqueue(eventType, targetType, targetId, metadata);
}

// ─── Skróty dla najważniejszych akcji ───────

export function trackJobView(jobId, meta = {}) {
  enqueue(EVENT.JOB_VIEW, 'job', jobId, meta);
}

export function trackJobContact(medium, jobId, meta = {}) {
  // medium: 'phone' | 'email' | 'whatsapp'
  enqueue(EVENT.JOB_CONTACT, medium, jobId, meta);
}

export function trackJobApply(jobId, meta = {}) {
  enqueue(EVENT.JOB_APPLY, 'job', jobId, meta);
}

export function trackJobSave(jobId, saved = true) {
  enqueue(EVENT.JOB_SAVE, 'job', jobId, { saved });
}

export function trackSearch(query, resultsCount = null, filters = {}) {
  enqueue(EVENT.SEARCH, 'search', null, {
    query: query?.slice(0, 100),
    results: resultsCount,
    filters,
  });
}

export function trackFilterApply(filters) {
  enqueue(EVENT.FILTER_APPLY, 'filter', null, { filters });
}

export function trackFilterClear() {
  enqueue(EVENT.FILTER_CLEAR, 'filter', null, {});
}

export function trackMapPin(pinId, meta = {}) {
  enqueue(EVENT.MAP_PIN_CLICK, 'pin', pinId, meta);
}

export function trackMapCluster(count, lat, lng) {
  enqueue(EVENT.MAP_CLUSTER, 'map', null, { count, lat, lng });
}

export function trackMapZoom(level, meta = {}) {
  enqueue(EVENT.MAP_ZOOM, 'map', null, { zoom_level: level, ...meta });
}

export function trackProfileView(userId, meta = {}) {
  enqueue(EVENT.PROFILE_VIEW, 'profile', userId, meta);
}

export function trackPinContact(medium, pinId, meta = {}) {
  enqueue(EVENT.PIN_CONTACT, medium, pinId, meta);
}

export function trackChatOpen(conversationId, meta = {}) {
  enqueue(EVENT.CHAT_OPEN, 'chat', conversationId, meta);
}

export function trackChatMessage(conversationId) {
  enqueue(EVENT.CHAT_MESSAGE, 'chat', conversationId, {});
}

export function trackCheckout(product, price, currency = 'PLN') {
  enqueue(EVENT.CHECKOUT_START, 'cart', null, { product, price, currency });
}

export function trackCheckoutDone(product, price, currency = 'PLN') {
  enqueue(EVENT.CHECKOUT_DONE, 'cart', null, { product, price, currency });
}

export function trackLogin(method = null) {
  enqueue(EVENT.LOGIN, 'auth', null, { method });
  flush();
}

export function trackLogout() {
  enqueue(EVENT.LOGOUT, 'auth', null, {});
  flush();
}

export function trackRegister(meta = {}) {
  enqueue(EVENT.REGISTER, 'auth', null, meta);
  flush();
}

export function trackNotifClick(notifId, type = null) {
  enqueue(EVENT.NOTIF_CLICK, 'notification', notifId, { type });
}
