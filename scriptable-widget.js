// ═══════════════════════════════════════════════════════════════
//  📊 MapJob Stats — Widżet Scriptable (premium design)
//
//  INSTALACJA:
//  1. Pobierz "Scriptable" z App Store (darmowa)
//  2. Otwórz → "+" → wklej ten kod → nazwij "MapJob Stats"
//  3. Naciśnij ▷ Run — jeśli zapyta o PIN, wpisz 9801
//  4. Ekran główny → przytrzymaj → "+" → Scriptable → MapJob Stats
//
//  Rozmiary: Mały (2×2 karty)  Średni (2×3 karty)  Duży (3×3 karty)
// ═══════════════════════════════════════════════════════════════

const API         = 'https://ahgzjneegvptudphibdm.supabase.co/functions/v1/quick-stats'
const TOKEN_KEY   = 'mj_stats_token'
const PIN_KEY     = 'mj_stats_pin'
const DEFAULT_PIN = '9801'

// ─── Kolory ────────────────────────────────────────────────────
const C = {
  bg:      new Color('#080D18'),
  card:    new Color('#111827'),
  card2:   new Color('#1A2438'),
  border:  new Color('#FFFFFF', 0.07),
  text:    new Color('#F0F4FF'),
  text2:   new Color('#94A3B8'),
  text3:   new Color('#3D5060'),
  blue:    new Color('#60A5FA'),
  purple:  new Color('#A78BFA'),
  green:   new Color('#22C55E'),
  gold:    new Color('#F59E0B'),
  red:     new Color('#F87171'),
  gBlue:   new Color('#1E40AF', 0.25),  // karta-tło blue
  gGreen:  new Color('#14532D', 0.30),  // karta-tło green
  gPurple: new Color('#4C1D95', 0.25),  // karta-tło purple
  gGold:   new Color('#78350F', 0.25),  // karta-tło gold
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

function makeBg() {
  const g = new LinearGradient()
  g.locations = [0, 1]
  g.colors    = [new Color('#0D1424'), new Color('#060B14')]
  return g
}

// ─── Karta metryki (duża liczba + etykieta) ────────────────────
//   value  – liczba do wyświetlenia
//   label  – podpis (małe litery), np. 'online'
//   color  – kolor liczby
//   bgColor – kolor tła karty (subtelny)
//   numSize – rozmiar czcionki liczby
function addCard(parent, value, label, color, bgColor, numSize) {
  const card = parent.addStack()
  card.layoutVertically()
  card.backgroundColor = bgColor || C.card2
  card.cornerRadius    = 11
  card.setPadding(9, 11, 8, 11)

  const num = card.addText(fmt(value))
  num.font  = Font.boldMonospacedSystemFont(numSize || 22)
  num.textColor = color
  num.minimumScaleFactor = 0.6
  num.lineLimit = 1

  card.addSpacer(3)

  const lbl = card.addText(label)
  lbl.font      = Font.mediumSystemFont(8.5)
  lbl.textColor = C.text3
  lbl.lineLimit = 1
  lbl.minimumScaleFactor = 0.8

  return card
}

// ─── Budowanie widżetu ─────────────────────────────────────────
function buildWidget(stats) {
  const k      = stats.kpi || {}
  const family = config.widgetFamily
  const small  = !family || family === 'small'
  const large  = family === 'large'
  const GAP    = 6

  const w = new ListWidget()
  w.backgroundGradient = makeBg()
  w.setPadding(small ? 12 : 13, 12, small ? 11 : 12, 12)
  w.url = 'https://mapjob.pl/stats'
  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000)

  // ── Nagłówek ──────────────────────────────────────────────────
  const hdr = w.addStack()
  hdr.layoutHorizontally()
  hdr.centerAlignContent()

  // SF Symbol ikona wykresu
  const sym = SFSymbol.named('chart.bar.fill')
  sym.applyFont(Font.systemFont(11))
  const ico = hdr.addImage(sym.image)
  ico.imageSize  = new Size(13, 13)
  ico.tintColor  = C.blue
  ico.resizable  = false
  hdr.addSpacer(5)

  const ttl = hdr.addText('MapJob')
  ttl.font = Font.boldSystemFont(12)
  ttl.textColor = C.text

  hdr.addSpacer()

  // Czas odświeżenia
  const badge = hdr.addStack()
  badge.backgroundColor = new Color('#FFFFFF', 0.06)
  badge.cornerRadius = 5
  badge.setPadding(2, 6, 2, 6)
  const upd = badge.addText('◷ ' + timeAgo(stats.fetched_at))
  upd.font = Font.mediumSystemFont(9)
  upd.textColor = C.text3

  w.addSpacer(small ? 9 : 10)

  // ── Karty ─────────────────────────────────────────────────────
  if (small) {
    // 2 × 2 siatka
    const r1 = w.addStack()
    r1.layoutHorizontally()
    addCard(r1, k.online,            'online',    C.green,  C.gGreen,  20)
    r1.addSpacer(GAP)
    addCard(r1, k.visitors_real_24h, 'uniq 24h',  C.blue,   C.gBlue,   20)

    w.addSpacer(GAP)

    const r2 = w.addStack()
    r2.layoutHorizontally()
    addCard(r2, k.visitors_real_7d,  'uniq 7d',   C.blue,   C.gBlue,   20)
    r2.addSpacer(GAP)
    addCard(r2, k.visits_real_24h,   'sesje 24h', C.purple, C.gPurple, 20)

  } else if (!large) {
    // Średni — 2 × 3 siatka
    const r1 = w.addStack()
    r1.layoutHorizontally()
    addCard(r1, k.online,            'online',    C.green,  C.gGreen,  24)
    r1.addSpacer(GAP)
    addCard(r1, k.visitors_real_24h, 'uniq 24h',  C.blue,   C.gBlue,   24)
    r1.addSpacer(GAP)
    addCard(r1, k.visitors_real_7d,  'uniq 7d',   C.blue,   C.gBlue,   24)

    w.addSpacer(GAP)

    const r2 = w.addStack()
    r2.layoutHorizontally()
    addCard(r2, k.visits_real_24h,   'sesje 24h', C.purple, C.gPurple, 24)
    r2.addSpacer(GAP)
    addCard(r2, k.visits_real_7d,    'sesje 7d',  C.purple, C.gPurple, 24)
    r2.addSpacer(GAP)
    addCard(r2, k.views_30d,         'wyśw. 30d', C.gold,   C.gGold,   24)

  } else {
    // Duży — 3 × 3 siatka
    const rows = [
      [
        [k.online,            'online',        C.green,  C.gGreen ],
        [k.visitors_real_24h, 'uniq 24h',      C.blue,   C.gBlue  ],
        [k.visitors_real_7d,  'uniq 7d',       C.blue,   C.gBlue  ],
      ],[
        [k.visits_real_24h,   'sesje 24h',     C.purple, C.gPurple],
        [k.visits_real_7d,    'sesje 7d',      C.purple, C.gPurple],
        [k.views_30d,         'wyśw. 30d',     C.gold,   C.gGold  ],
      ],[
        [k.visitors_real_30d, 'uniq 30d',      C.blue,   C.gBlue  ],
        [k.visitors_total,    'uniq łącznie',  C.text2,  C.card2  ],
        [k.views_total,       'wyśw. łącznie', C.gold,   C.gGold  ],
      ],
    ]

    for (const [ri, row] of rows.entries()) {
      if (ri > 0) w.addSpacer(GAP)
      const rs = w.addStack()
      rs.layoutHorizontally()
      for (const [ci, [val, lbl, col, bg]] of row.entries()) {
        if (ci > 0) rs.addSpacer(GAP)
        addCard(rs, val, lbl, col, bg, 22)
      }
    }
  }

  w.addSpacer()
  return w
}

// ─── Widżet zastępczy ──────────────────────────────────────────
function fallback(msg, accent) {
  const w = new ListWidget()
  w.backgroundGradient = makeBg()
  w.setPadding(14, 14, 14, 14)
  w.url = 'https://mapjob.pl/stats'
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

// ═══ MAIN ══════════════════════════════════════════════════════
let widget
try {
  const stats = await getStats()
  if (!stats) {
    widget = fallback('Dotknij, aby się zalogować', C.blue)
  } else {
    widget = buildWidget(stats)
    if (!config.runsInWidget) {
      // Podgląd w aplikacji — wybierz rozmiar parametrem skryptu
      const size = args.widgetParameter || 'small'
      if      (size === 'medium') await widget.presentMedium()
      else if (size === 'large')  await widget.presentLarge()
      else                        await widget.presentSmall()
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
