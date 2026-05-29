// ═══════════════════════════════════════════════════════════════
//  📊 MapJob Stats — Widżet dla aplikacji Scriptable (iOS)
//
//  INSTALACJA:
//  1. Pobierz Scriptable z App Store (darmowa)
//  2. Otwórz Scriptable → "+" → wklej ten kod → nazwij "MapJob Stats"
//  3. Naciśnij ▷ Run → wpisz PIN jeśli zapyta (domyślnie: 9801)
//  4. Ekran główny → przytrzymaj → "+" → Scriptable → "MapJob Stats"
//
//  Dostępne rozmiary: Mały / Średni / Duży
//  Widżet otwiera mapjob.pl/stats po dotknięciu.
//  Token sesji zapisywany w Keychain — odświeża się automatycznie.
// ═══════════════════════════════════════════════════════════════

const API         = 'https://ahgzjneegvptudphibdm.supabase.co/functions/v1/quick-stats'
const TOKEN_KEY   = 'mj_stats_token'
const PIN_KEY     = 'mj_stats_pin'
const DEFAULT_PIN = '9801'

// Paleta
const C = {
  bg:     new Color('#080D18'),
  text:   new Color('#F0F4FF'),
  text2:  new Color('#94A3B8'),
  text3:  new Color('#5A6678'),
  blue:   new Color('#60A5FA'),
  purple: new Color('#A78BFA'),
  green:  new Color('#22C55E'),
  gold:   new Color('#F59E0B'),
  red:    new Color('#F87171'),
}

// ─── API ────────────────────────────────────────────────────────
async function apiPost(body) {
  const req = new Request(API)
  req.method  = 'POST'
  req.headers = { 'Content-Type': 'application/json' }
  req.body    = JSON.stringify(body)
  req.timeoutInterval = 20
  return req.loadJSON()
}

async function getStats() {
  // 1) Spróbuj zapisanego tokena
  if (Keychain.contains(TOKEN_KEY)) {
    const token = Keychain.get(TOKEN_KEY)
    try {
      const d = await apiPost({ action: 'get_stats', token })
      if (d.ok && d.stats) return d.stats
    } catch(e) {}
    Keychain.remove(TOKEN_KEY)
  }

  // 2) Zaloguj się PINem (domyślny lub zapamiętany)
  const pin = Keychain.contains(PIN_KEY) ? Keychain.get(PIN_KEY) : DEFAULT_PIN
  try {
    const d = await apiPost({ action: 'verify_pin', pin })
    if (d.ok && d.token) {
      Keychain.set(TOKEN_KEY, d.token)
      return d.stats
    }
  } catch(e) {}

  // 3) Zapytaj o PIN (tylko gdy skrypt otwarty w aplikacji, nie w widżecie)
  if (!config.runsInWidget) {
    const alert = new Alert()
    alert.title   = '📊 MapJob Stats'
    alert.message = 'Wpisz PIN dostępu'
    alert.addSecureTextField('PIN (domyślnie: 9801)')
    alert.addAction('Zaloguj')
    alert.addCancelAction('Anuluj')
    if (await alert.present() === -1) return null

    const enteredPin = alert.textFieldValue(0).trim() || DEFAULT_PIN
    const d2 = await apiPost({ action: 'verify_pin', pin: enteredPin })
    if (d2.ok && d2.token) {
      Keychain.set(PIN_KEY, enteredPin)
      Keychain.set(TOKEN_KEY, d2.token)
      return d2.stats
    }
    throw new Error(d2.error || 'Błędny PIN — sprawdź i uruchom ponownie')
  }

  return null  // Widżet bez sesji — pokaż "dotknij"
}

// ─── Formatowanie ────────────────────────────────────────────────
function fmt(n) {
  if (n == null) return '—'
  if (n >= 10000) return Math.round(n / 1000) + 'k'
  if (n >= 1000)  return (n / 1000).toFixed(1).replace('.0', '') + 'k'
  return String(n)
}

function timeAgo(iso) {
  const min = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (min < 1)  return 'teraz'
  if (min < 60) return min + 'm temu'
  return Math.floor(min / 60) + 'h temu'
}

function makeGradient() {
  const g = new LinearGradient()
  g.locations = [0, 1]
  g.colors    = [new Color('#0f1117'), new Color('#080D18')]
  return g
}

// ─── Wiersz statystyki ───────────────────────────────────────────
function statRow(parent, icon, label, value, color, smallFont) {
  const row = parent.addStack()
  row.layoutHorizontally()
  row.centerAlignContent()

  const ic = row.addText(icon + ' ')
  ic.font = Font.systemFont(smallFont ? 12 : 13)

  const lb = row.addText(label + ' ')
  lb.font = Font.systemFont(smallFont ? 10 : 11)
  lb.textColor = C.text2

  row.addSpacer()

  const vl = row.addText(fmt(value))
  vl.font      = Font.boldSystemFont(smallFont ? 14 : 15)
  vl.textColor = color
  vl.lineLimit = 1
}

// ─── Budowanie widżetu ze statystykami ───────────────────────────
function buildWidget(stats) {
  const k      = stats.kpi || {}
  const family = config.widgetFamily
  const small  = !family || family === 'small'
  const large  = family === 'large'

  const w = new ListWidget()
  w.backgroundGradient = makeGradient()
  w.setPadding(13, 14, 12, 14)
  w.url = 'https://mapjob.pl/stats'
  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000)

  // Nagłówek
  const hdr = w.addStack()
  hdr.layoutHorizontally()
  hdr.centerAlignContent()
  const ttl = hdr.addText('📊 MapJob')
  ttl.font = Font.boldSystemFont(13)
  ttl.textColor = C.text
  hdr.addSpacer()
  const upd = hdr.addText('🕐 ' + timeAgo(stats.fetched_at))
  upd.font = Font.systemFont(9)
  upd.textColor = C.text3

  w.addSpacer(9)

  if (small) {
    // ─ Mały widżet: 4 wiersze
    statRow(w, '🟢', 'Online',       k.online,            C.green,  true)
    w.addSpacer(5)
    statRow(w, '👤', 'Unikalni 24h', k.visitors_real_24h, C.blue,   true)
    w.addSpacer(5)
    statRow(w, '👤', 'Unikalni 7d',  k.visitors_real_7d,  C.blue,   true)
    w.addSpacer(5)
    statRow(w, '📊', 'Sesje 24h',    k.visits_real_24h,   C.purple, true)

  } else {
    // ─ Średni / Duży: dwie kolumny
    const cols = w.addStack()
    cols.layoutHorizontally()

    const L = cols.addStack()
    L.layoutVertically()
    statRow(L, '🟢', 'Online',        k.online,            C.green,  false)
    L.addSpacer(6)
    statRow(L, '👤', 'Unikaln. 24h',  k.visitors_real_24h, C.blue,   false)
    L.addSpacer(6)
    statRow(L, '👤', 'Unikaln. 7d',   k.visitors_real_7d,  C.blue,   false)

    cols.addSpacer(14)

    const R = cols.addStack()
    R.layoutVertically()
    statRow(R, '📊', 'Sesje 24h',    k.visits_real_24h,   C.purple, false)
    R.addSpacer(6)
    statRow(R, '📊', 'Sesje 7d',     k.visits_real_7d,    C.purple, false)
    R.addSpacer(6)
    statRow(R, '👁', 'Wyśw. 30d',    k.views_30d,         C.gold,   false)

    if (large) {
      w.addSpacer(10)
      statRow(w, '👤', 'Unikalni łącznie',   k.visitors_total, C.text2, false)
      w.addSpacer(6)
      statRow(w, '👁', 'Wyświetl. łącznie',  k.views_total,    C.gold,  false)
    }
  }

  w.addSpacer()
  return w
}

// ─── Widżet błędu / logowania ────────────────────────────────────
function fallbackWidget(msg, isInfo) {
  const w = new ListWidget()
  w.backgroundGradient = makeGradient()
  w.setPadding(14, 14, 14, 14)
  w.url = 'https://mapjob.pl/stats'
  w.refreshAfterDate = new Date(Date.now() + 5 * 60 * 1000)

  const t1 = w.addText('📊 MapJob Stats')
  t1.font = Font.boldSystemFont(13)
  t1.textColor = C.text
  w.addSpacer(8)

  const t2 = w.addText(msg)
  t2.font = Font.systemFont(12)
  t2.textColor = isInfo ? C.blue : C.red
  t2.minimumScaleFactor = 0.7

  return w
}

// ═══ GŁÓWNA LOGIKA ════════════════════════════════════════════════
let widget
try {
  const stats = await getStats()
  if (!stats) {
    widget = fallbackWidget('Dotknij, aby się zalogować →', true)
  } else {
    widget = buildWidget(stats)
    // Podgląd w aplikacji Scriptable
    if (!config.runsInWidget) {
      await widget.presentSmall()
    }
  }
} catch(e) {
  widget = fallbackWidget('⚠️ ' + (e.message || String(e)), false)
  if (!config.runsInWidget) {
    const a = new Alert()
    a.title   = 'Błąd'
    a.message = e.message || String(e)
    a.addAction('OK')
    await a.present()
  }
}

Script.setWidget(widget)
Script.complete()
