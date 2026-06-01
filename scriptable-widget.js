// ═══════════════════════════════════════════════════════════════
//  📊 MapJob Stats — Widżet Scriptable (Design B)
//
//  INSTALACJA:
//  1. Pobierz "Scriptable" z App Store (darmowa)
//  2. Otwórz → "+" → wklej ten kod → nazwij "MapJob Stats"
//  3. Naciśnij ▷ Run — jeśli zapyta o PIN, wpisz 9801
//  4. Ekran główny → przytrzymaj → "+" → Scriptable → MapJob Stats
//
//  Rozmiary: Mały · Średni · Duży
// ═══════════════════════════════════════════════════════════════

const API         = 'https://ahgzjneegvptudphibdm.supabase.co/functions/v1/quick-stats'
const TOKEN_KEY   = 'mj_stats_token'
const PIN_KEY     = 'mj_stats_pin'
const DEFAULT_PIN = '9801'

const C = {
  bg:      new Color('#080D18'),
  text:    new Color('#F0F4FF'),
  text2:   new Color('#94A3B8'),
  text3:   new Color('#3D5060'),
  blue:    new Color('#60A5FA'),
  purple:  new Color('#A78BFA'),
  green:   new Color('#22C55E'),
  gold:    new Color('#F59E0B'),
  red:     new Color('#F87171'),
}

// ─── API / Autoryzacja ──────────────────────────────────────────
async function apiPost(body) {
  const req = new Request(API)
  req.method  = 'POST'
  req.headers = { 'Content-Type': 'application/json' }
  req.body    = JSON.stringify(body)
  req.timeoutInterval = 20
  return req.loadJSON()
}

async function getStats() {
  if (Keychain.contains(TOKEN_KEY)) {
    const token = Keychain.get(TOKEN_KEY)
    try {
      const d = await apiPost({ action: 'get_stats', token })
      if (d.ok && d.stats) return d.stats
    } catch(e) {}
    Keychain.remove(TOKEN_KEY)
  }

  const pin = Keychain.contains(PIN_KEY) ? Keychain.get(PIN_KEY) : DEFAULT_PIN
  try {
    const d = await apiPost({ action: 'verify_pin', pin })
    if (d.ok && d.token) {
      Keychain.set(TOKEN_KEY, d.token)
      return d.stats
    }
  } catch(e) {}

  if (!config.runsInWidget) {
    const alert = new Alert()
    alert.title   = '📊 MapJob Stats'
    alert.message = 'Wpisz PIN dostępu'
    alert.addSecureTextField('PIN (domyślnie: 9801)')
    alert.addAction('Zaloguj')
    alert.addCancelAction('Anuluj')
    if (await alert.present() === -1) return null
    const p = alert.textFieldValue(0).trim() || DEFAULT_PIN
    const d2 = await apiPost({ action: 'verify_pin', pin: p })
    if (d2.ok && d2.token) {
      Keychain.set(PIN_KEY, p)
      Keychain.set(TOKEN_KEY, d2.token)
      return d2.stats
    }
    throw new Error(d2.error || 'Błędny PIN')
  }
  return null
}

// ─── Helpers ───────────────────────────────────────────────────
function fmt(n) {
  if (n == null) return '—'
  if (n >= 10000) return Math.round(n / 1000) + 'k'
  if (n >= 1000)  return (n / 1000).toFixed(1).replace('.0', '') + 'k'
  return String(n)
}

function timeAgo(iso) {
  const m = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (m < 1)  return 'teraz'
  if (m < 60) return m + 'm'
  return Math.floor(m / 60) + 'h'
}

function totalPhoneClicks(funnel) {
  return (funnel || []).reduce((s, r) => s + (r.reveals || 0), 0)
}

function makeBg() {
  const g = new LinearGradient()
  g.locations = [0, 1]
  g.colors    = [new Color('#0D1424'), new Color('#060B14')]
  return g
}

// ─── Nagłówek ──────────────────────────────────────────────────
function addHeader(parent, fetchedAt) {
  const hdr = parent.addStack()
  hdr.layoutHorizontally()
  hdr.centerAlignContent()

  const sym = SFSymbol.named('chart.bar.fill')
  sym.applyFont(Font.systemFont(11))
  const ico = hdr.addImage(sym.image)
  ico.imageSize = new Size(12, 12)
  ico.tintColor = C.blue
  ico.resizable = false
  hdr.addSpacer(4)

  const ttl = hdr.addText('MapJob')
  ttl.font      = Font.boldSystemFont(12)
  ttl.textColor = C.text

  hdr.addSpacer()

  const upd = hdr.addText('◷ ' + timeAgo(fetchedAt))
  upd.font      = Font.systemFont(9)
  upd.textColor = C.text3

  hdr.addSpacer(5)

  const rsym = SFSymbol.named('arrow.clockwise')
  rsym.applyFont(Font.systemFont(9))
  const rico = hdr.addImage(rsym.image)
  rico.imageSize = new Size(10, 10)
  rico.tintColor = C.text3
  rico.resizable = false
}

// ─── Linia oddzielająca ─────────────────────────────────────────
function addDivider(parent) {
  const line = parent.addStack()
  line.backgroundColor = new Color('#FFFFFF', 0.09)
  line.size = new Size(0, 1)
}

// ─── Hero: duża liczba wyśrodkowana ────────────────────────────
//  value    – liczba
//  sublabel – tekst pod liczbą (np. "🟢 online teraz")
//  color    – kolor liczby
//  size     – rozmiar czcionki
function addHero(parent, value, sublabel, color, size) {
  const numRow = parent.addStack()
  numRow.layoutHorizontally()
  numRow.addSpacer()
  const n = numRow.addText(fmt(value))
  n.font = Font.boldMonospacedSystemFont(size || 44)
  n.textColor = color
  n.minimumScaleFactor = 0.5
  numRow.addSpacer()

  parent.addSpacer(2)

  const lblRow = parent.addStack()
  lblRow.layoutHorizontally()
  lblRow.addSpacer()
  const l = lblRow.addText(sublabel)
  l.font      = Font.mediumSystemFont(10)
  l.textColor = C.text3
  lblRow.addSpacer()
}

// ─── Wiersz statystyki: emoji label . . . val1 · val2 ───────────
//  val2 jest opcjonalne — jeśli podane, pojawia się "val1 · val2"
function addRow(parent, emoji, label, val1, color, val2) {
  const row = parent.addStack()
  row.layoutHorizontally()
  row.centerAlignContent()

  const left = row.addText(emoji + '  ' + label)
  left.font      = Font.systemFont(10)
  left.textColor = C.text2
  left.lineLimit = 1

  row.addSpacer()

  const v1 = row.addText(fmt(val1))
  v1.font      = Font.boldSystemFont(12)
  v1.textColor = color
  v1.lineLimit = 1

  if (val2 !== undefined) {
    const sep = row.addText('  ·  ')
    sep.font      = Font.systemFont(10)
    sep.textColor = C.text3

    const v2 = row.addText(fmt(val2))
    v2.font      = Font.boldSystemFont(12)
    v2.textColor = color
    v2.lineLimit = 1
  }
}

// ─── Wiersz z dwoma osobnymi statystykami obok siebie ───────────
//  np. "👁 wyśw. 1.2k     📞 tel. 28"
function addDualRow(parent, e1, l1, v1, c1, e2, l2, v2, c2) {
  const row = parent.addStack()
  row.layoutHorizontally()
  row.centerAlignContent()

  const a1 = row.addText(e1 + '  ' + l1 + ' ')
  a1.font      = Font.systemFont(10)
  a1.textColor = C.text2

  const b1 = row.addText(fmt(v1))
  b1.font      = Font.boldSystemFont(12)
  b1.textColor = c1

  row.addSpacer()

  const a2 = row.addText(e2 + '  ' + l2 + ' ')
  a2.font      = Font.systemFont(10)
  a2.textColor = C.text2

  const b2 = row.addText(fmt(v2))
  b2.font      = Font.boldSystemFont(12)
  b2.textColor = c2
}

// ─── Blok mini-statystyk (wspólny dla małego i prawej kolumny) ──
function addMiniStats(parent, k, phones, showSessions7d) {
  const G = 4

  // 24h · 7d label
  const hint = parent.addStack()
  hint.layoutHorizontally()
  hint.addSpacer()
  const hl = hint.addText('24h  ·  7d')
  hl.font      = Font.systemFont(8)
  hl.textColor = C.text3
  parent.addSpacer(3)

  addRow(parent, '👤', 'unikalni', k.visitors_real_24h, C.blue, k.visitors_real_7d)
  parent.addSpacer(G)
  addRow(parent, '📊', 'sesje',    k.visits_real_24h,   C.purple, showSessions7d ? k.visits_real_7d : undefined)
  parent.addSpacer(G)
  addDualRow(parent, '👁', 'wyśw.', k.views_30d, C.gold, '📞', 'tel.', phones, C.blue)
}

// ═══ BUDOWANIE WIDŻETU ════════════════════════════════════════════
function buildWidget(stats) {
  const k      = stats.kpi    || {}
  const phones = totalPhoneClicks(stats.funnel)
  const family = config.widgetFamily
  const small  = !family || family === 'small'
  const large  = family === 'large'

  const w = new ListWidget()
  w.backgroundGradient = makeBg()
  w.url = 'scriptable:///run/MapJob%20Stats'
  w.refreshAfterDate = new Date(Date.now() + 10 * 60 * 1000)
  w.setPadding(12, 14, 12, 14)

  addHeader(w, stats.fetched_at)

  if (small) {
    // ─ Mały: hero na górze, lista na dole ───────────────────────
    w.addSpacer(6)
    addHero(w, k.online, '🟢 online teraz', C.green, 44)
    w.addSpacer(7)
    addDivider(w)
    w.addSpacer(7)
    addMiniStats(w, k, phones, false)
    w.addSpacer()

  } else if (!large) {
    // ─ Średni: hero po lewej, lista po prawej ───────────────────
    w.addSpacer(8)

    const cols = w.addStack()
    cols.layoutHorizontally()
    cols.centerAlignContent()

    // Lewa kolumna: hero
    const left = cols.addStack()
    left.layoutVertically()
    left.centerAlignContent()
    addHero(left, k.online, '🟢 online', C.green, 40)

    // Pionowy separator
    cols.addSpacer(14)
    const vline = cols.addStack()
    vline.backgroundColor = new Color('#FFFFFF', 0.09)
    vline.size = new Size(1, 0)
    cols.addSpacer(14)

    // Prawa kolumna: mini-lista
    const right = cols.addStack()
    right.layoutVertically()
    addMiniStats(right, k, phones, true)

    w.addSpacer()

  } else {
    // ─ Duży: hero na górze (pełna szerokość), lista poniżej ─────
    w.addSpacer(10)
    addHero(w, k.online, '🟢 online teraz', C.green, 52)
    w.addSpacer(10)
    addDivider(w)
    w.addSpacer(10)

    const G = 7
    addRow(w, '👤', 'unikalni',     k.visitors_real_24h, C.blue,   k.visitors_real_7d)
    w.addSpacer(G)
    addRow(w, '📊', 'sesje',        k.visits_real_24h,   C.purple, k.visits_real_7d)
    w.addSpacer(G)
    addRow(w, '👁', 'wyśw. 30d',    k.views_30d,         C.gold)
    w.addSpacer(G)
    addRow(w, '📞', 'tel. kliknięcia', phones,           C.blue)
    w.addSpacer(G)
    addRow(w, '👤', 'unikalni łącznie', k.visitors_total, C.text2)
    w.addSpacer(G)
    addRow(w, '👁', 'wyśw. łącznie',    k.views_total,   C.gold)
    w.addSpacer()
  }

  return w
}

// ─── Widżet zastępczy ──────────────────────────────────────────
function fallback(msg, accent) {
  const w = new ListWidget()
  w.backgroundGradient = makeBg()
  w.setPadding(14, 14, 14, 14)
  w.url = 'scriptable:///run/MapJob%20Stats'
  w.refreshAfterDate = new Date(Date.now() + 5 * 60 * 1000)

  const sym = SFSymbol.named('chart.bar.fill')
  sym.applyFont(Font.systemFont(20))
  const ico = w.addImage(sym.image)
  ico.imageSize = new Size(22, 22)
  ico.tintColor = C.blue
  ico.centerAlignImage()

  w.addSpacer(8)
  const t1 = w.addText('MapJob Stats')
  t1.font = Font.boldSystemFont(13)
  t1.textColor = C.text
  t1.centerAlignText()
  w.addSpacer(6)
  const t2 = w.addText(msg)
  t2.font = Font.systemFont(11)
  t2.textColor = accent || C.text2
  t2.centerAlignText()
  t2.minimumScaleFactor = 0.75
  w.addSpacer()
  return w
}

// ─── Live-view (otwiera się po tapnięciu widżetu) ──────────────
function sleep(s) {
  return new Promise(r => Timer.schedule(s, false, r))
}

function buildLiveHTML(s, loading) {
  const k      = s.kpi || {}
  const phones = totalPhoneClicks(s.funnel)
  const ago    = timeAgo(s.fetched_at)
  const f      = v => fmt(v)
  const dot    = '<span style="color:#3D5060"> · </span>'

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#080D18;font-family:-apple-system,sans-serif;color:#F0F4FF;min-height:100vh}
.hdr{background:linear-gradient(160deg,#0D1424,#060B14);padding:56px 20px 18px;border-bottom:1px solid rgba(255,255,255,.09)}
.hdr h1{font-size:20px;font-weight:700;display:flex;align-items:center;gap:8px}
.hdr .ago{font-size:12px;color:#3D5060;margin-top:5px}
.hero{text-align:center;padding:28px 20px 22px;border-bottom:1px solid rgba(255,255,255,.09)}
.hero .n{font-size:76px;font-weight:800;color:#22C55E;line-height:1;font-variant-numeric:tabular-nums}
.hero .sub{font-size:13px;color:#3D5060;margin-top:5px}
.rows{padding:4px 0}
.row{display:flex;align-items:center;justify-content:space-between;padding:15px 20px;border-bottom:1px solid rgba(255,255,255,.06)}
.row .lbl{font-size:15px;color:#94A3B8}
.row .val{font-size:17px;font-weight:700}
.blue{color:#60A5FA}.purple{color:#A78BFA}.gold{color:#F59E0B}.dim{color:#94A3B8}
.footer{padding:22px 20px 48px}
.btn{width:100%;padding:15px;background:linear-gradient(135deg,#1a2d4a,#0f1c30);border:1px solid rgba(96,165,250,.35);border-radius:14px;color:#60A5FA;font-size:17px;font-weight:600;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:opacity .15s}
.btn:active{opacity:.6}
body.loading .btn{opacity:.45;pointer-events:none}
body.loading .ago::before{content:'⟳ '}
</style>
</head>
<body class="${loading ? 'loading' : ''}">
<div class="hdr">
  <h1>📊 MapJob Stats</h1>
  <div class="ago">${loading ? 'odświeżam…' : '◷ ' + ago}</div>
</div>
<div class="hero">
  <div class="n">${k.online ?? '—'}</div>
  <div class="sub">🟢 online teraz</div>
</div>
<div class="rows">
  <div class="row"><span class="lbl">👤 Unikalni 24h · 7d</span><span class="val blue">${f(k.visitors_real_24h)}${dot}${f(k.visitors_real_7d)}</span></div>
  <div class="row"><span class="lbl">📊 Sesje 24h · 7d</span><span class="val purple">${f(k.visits_real_24h)}${dot}${f(k.visits_real_7d)}</span></div>
  <div class="row"><span class="lbl">👁 Wyświetlenia 30d</span><span class="val gold">${f(k.views_30d)}</span></div>
  <div class="row"><span class="lbl">📞 Kliknięcia tel.</span><span class="val blue">${f(phones)}</span></div>
  <div class="row"><span class="lbl">👤 Unikalni łącznie</span><span class="val dim">${f(k.visitors_total)}</span></div>
  <div class="row"><span class="lbl">👁 Wyśw. łącznie</span><span class="val gold">${f(k.views_total)}</span></div>
</div>
<div class="footer">
  <button class="btn" onclick="window._r=true;document.body.classList.add('loading');this.textContent='⟳  Odświeżam…'">🔄  Odśwież</button>
</div>
<script>window._r=false</script>
</body></html>`
}

async function showLiveView(initialStats) {
  let _s = initialStats
  const wv = new WebView()
  await wv.loadHTML(buildLiveHTML(_s, false))

  let closed = false
  wv.present(true).then(() => { closed = true })

  while (!closed) {
    await sleep(0.4)
    if (closed) break
    const requested = await wv.evaluateJavaScript('window._r')
    if (requested) {
      await wv.loadHTML(buildLiveHTML(_s, true))
      try {
        if (Keychain.contains(TOKEN_KEY)) {
          const d = await apiPost({ action: 'get_stats', token: Keychain.get(TOKEN_KEY) })
          if (d.ok && d.stats) _s = d.stats
        }
      } catch(e) {}
      await wv.loadHTML(buildLiveHTML(_s, false))
    }
  }
}

// ═══ MAIN ══════════════════════════════════════════════════════
let widget
try {
  const stats = await getStats()
  if (!stats) {
    widget = fallback('Dotknij, aby się zalogować', C.blue)
    if (!config.runsInWidget) {
      const a = new Alert()
      a.title   = 'MapJob Stats'
      a.message = 'Nie udało się zalogować. Sprawdź PIN.'
      a.addAction('OK')
      await a.present()
    }
  } else {
    widget = buildWidget(stats)
    if (!config.runsInWidget) {
      await showLiveView(stats)
    }
  }
} catch(e) {
  widget = fallback('⚠️ ' + (e.message || String(e)), C.red)
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
