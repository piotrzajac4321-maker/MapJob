# -*- coding: utf-8 -*-
"""Generator minimalistycznej, premium strony marketingowej dla firm (MapJob).
Czyta loga z logos/ (committed) i oferty z oferty-snapshot.json.
Uruchamiany jako część buildCommand na Vercel.
"""
import json
import os

ROOT = os.path.dirname(os.path.abspath(__file__))

def read(path):
    with open(os.path.join(ROOT, path), encoding='utf-8') as f:
        return f.read().strip()

pramer = read('logos/pramer.b64')
jobwerke = read('logos/jobwerke.svg')
platinum = "https://ahgzjneegvptudphibdm.supabase.co/storage/v1/object/public/avatars/profile-avatars/c01e3144-f760-40dd-8a56-c2c34efd57b5-platinum-active-1779805480669.jpeg"

snap = json.load(open(os.path.join(ROOT, 'oferty-snapshot.json'), encoding='utf-8'))
offers = snap['offers']
pins = []
for o in offers:
    la, ln = o.get('location_lat'), o.get('location_lng')
    if la and ln:
        pins.append({
            'lat': round(float(la), 4),
            'lng': round(float(ln), 4),
            'c': o.get('company_name', ''),
            't': (o.get('title') or '')[:60],
            'loc': o.get('location', '')
        })
pins_js = json.dumps(pins, ensure_ascii=False)

HTML = r'''<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>MapJob — dodaj oferty pracy za darmo</title>
<meta name="description" content="Twoje oferty pracy widoczne na liście i na mapie Polski. Bez karty, bez umów, bez kosztów.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css">
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css">
<style>
:root{
  --bg:#07090F;--surf:#0E1117;--surf2:#141A24;
  --border:rgba(255,255,255,.08);--border2:rgba(255,255,255,.14);
  --text:#F2F5FC;--text2:#9AA4B8;--text3:#5A6478;
  --blue:#3B82F6;--blue2:#60A5FA;--green:#10B981;--green2:#34D399;
  --ff:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{font-family:var(--ff);background:var(--bg);color:var(--text);line-height:1.5;
  -webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:inherit;text-decoration:none}
.wrap{max-width:1080px;margin:0 auto;padding:0 24px}

body::before{content:"";position:fixed;top:-30%;left:50%;transform:translateX(-50%);
  width:120vw;height:80vh;pointer-events:none;z-index:0;
  background:radial-gradient(ellipse at center,rgba(59,130,246,.16),transparent 60%);
  filter:blur(20px)}

nav{position:sticky;top:0;z-index:50;backdrop-filter:blur(16px);
  background:rgba(7,9,15,.72);border-bottom:1px solid var(--border)}
.nav-in{max-width:1080px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between}
.logo{display:flex;align-items:center;gap:9px;font-weight:800;font-size:18px;letter-spacing:-.02em}
.logo .pin{width:24px;height:24px;border-radius:8px;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,var(--blue),var(--green));box-shadow:0 4px 14px rgba(59,130,246,.4)}
.logo .pin svg{width:14px;height:14px}
.logo span{color:var(--blue2)}
.nav-cta{font-size:14px;font-weight:600;padding:9px 18px;border-radius:999px;
  background:var(--text);color:#0a0a0a;transition:transform .2s,box-shadow .2s}
.nav-cta:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(255,255,255,.12)}

.hero{position:relative;z-index:1;text-align:center;padding:80px 0 56px}
.badge{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;
  padding:7px 16px;border-radius:999px;background:rgba(16,185,129,.1);
  border:1px solid rgba(16,185,129,.28);color:var(--green2);margin-bottom:30px}
.badge .dot{width:8px;height:8px;border-radius:50%;background:var(--green2);
  box-shadow:0 0 0 0 rgba(52,211,153,.7);animation:pulse 2s infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(52,211,153,.6)}70%{box-shadow:0 0 0 10px rgba(52,211,153,0)}100%{box-shadow:0 0 0 0 rgba(52,211,153,0)}}
h1{font-size:clamp(40px,7.5vw,80px);font-weight:800;letter-spacing:-.035em;line-height:1.02;margin-bottom:24px}
h1 .grad{background:linear-gradient(110deg,var(--blue2) 10%,var(--green2) 90%);
  -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.lead{font-size:clamp(17px,2.4vw,21px);color:var(--text2);max-width:600px;margin:0 auto 38px;font-weight:400}
.lead b{color:var(--text);font-weight:600}
.cta-row{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-bottom:22px}
.btn{display:inline-flex;align-items:center;gap:9px;font-size:16px;font-weight:700;
  padding:16px 30px;border-radius:999px;transition:transform .2s,box-shadow .2s;cursor:pointer;border:none}
.btn-primary{background:linear-gradient(135deg,var(--blue),var(--green));color:#fff;
  box-shadow:0 10px 34px rgba(59,130,246,.42)}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 16px 44px rgba(59,130,246,.55)}
.btn-ghost{background:transparent;color:var(--text2);border:1px solid var(--border2)}
.btn-ghost:hover{color:var(--text);border-color:var(--text3)}
.micro{font-size:13.5px;color:var(--text3);font-weight:500}

.show{position:relative;z-index:1;margin-top:54px}
.map-frame{position:relative;border-radius:24px;overflow:hidden;border:1px solid var(--border2);
  box-shadow:0 40px 90px rgba(0,0,0,.6),0 0 0 1px rgba(59,130,246,.08);background:var(--surf)}
#map{height:540px;width:100%;background:#0b0e14}
.map-chip{position:absolute;top:18px;left:18px;z-index:600;display:flex;align-items:center;gap:9px;
  font-size:13px;font-weight:600;padding:9px 15px;border-radius:999px;
  background:rgba(10,13,20,.82);backdrop-filter:blur(10px);border:1px solid var(--border2);color:var(--text)}
.map-chip .dot{width:8px;height:8px;border-radius:50%;background:var(--green2);animation:pulse 2s infinite}
.map-cap{text-align:center;color:var(--text3);font-size:13px;margin-top:16px}

.trust{position:relative;z-index:1;padding:74px 0 12px;text-align:center}
.trust-label{font-size:12.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--text3);margin-bottom:28px}
.logos{display:flex;align-items:center;justify-content:center;gap:46px;flex-wrap:wrap}
.logos .lg{height:38px;display:flex;align-items:center;opacity:.9;transition:opacity .25s}
.logos .lg:hover{opacity:1}
.logos img{max-height:38px;max-width:150px;object-fit:contain}
.logos .lg.pf img{height:44px;border-radius:10px}
.logos .lg svg{height:30px;width:auto}

.value{position:relative;z-index:1;padding:84px 0}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.vcard{background:var(--surf);border:1px solid var(--border);border-radius:20px;padding:32px 28px;transition:transform .25s,border-color .25s}
.vcard:hover{transform:translateY(-4px);border-color:var(--border2)}
.vicon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;
  background:rgba(59,130,246,.12);margin-bottom:20px}
.vicon svg{width:24px;height:24px;stroke:var(--blue2)}
.vcard h3{font-size:19px;font-weight:700;letter-spacing:-.02em;margin-bottom:9px}
.vcard p{font-size:15px;color:var(--text2);line-height:1.55}

.stats{position:relative;z-index:1;padding:26px 0 0}
.stats-row{display:flex;justify-content:center;gap:14px;flex-wrap:wrap}
.stat{background:var(--surf);border:1px solid var(--border);border-radius:16px;padding:18px 28px;text-align:center;min-width:150px}
.stat .n{font-size:26px;font-weight:800;letter-spacing:-.02em;background:linear-gradient(135deg,var(--blue2),var(--green2));-webkit-background-clip:text;background-clip:text;color:transparent}
.stat .l{font-size:12.5px;color:var(--text2);margin-top:4px}

.steps{position:relative;z-index:1;padding:84px 0 10px}
.sec-title{text-align:center;font-size:clamp(24px,3.6vw,34px);font-weight:800;letter-spacing:-.03em;margin-bottom:10px}
.sec-sub{text-align:center;color:var(--text2);font-size:16px;margin-bottom:40px}
.step{position:relative;background:var(--surf);border:1px solid var(--border);border-radius:20px;padding:30px 26px}
.step .num{position:absolute;top:-14px;left:24px;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;background:linear-gradient(135deg,var(--blue),var(--green))}
.step h3{font-size:17px;font-weight:700;margin-bottom:8px}
.step p{font-size:14.5px;color:var(--text2);line-height:1.55}

.compare{position:relative;z-index:1;padding:74px 0 10px}
.cmp-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;max-width:760px;margin:0 auto}
.cmp{border-radius:20px;padding:30px 28px;border:1px solid var(--border);background:var(--surf)}
.cmp.win{border-color:rgba(16,185,129,.4);background:linear-gradient(160deg,rgba(16,185,129,.10),var(--surf) 55%)}
.cmp h3{font-size:16px;font-weight:700;margin-bottom:14px;color:var(--text2)}
.cmp.win h3{color:var(--green2)}
.cmp .price{font-size:30px;font-weight:800;letter-spacing:-.03em;margin-bottom:14px}
.cmp.win .price{color:var(--green2)}
.cmp ul{list-style:none;display:flex;flex-direction:column;gap:9px}
.cmp li{font-size:14px;color:var(--text2);display:flex;gap:8px;align-items:flex-start}
.cmp li::before{content:"✕";color:var(--text3);font-weight:700;flex-shrink:0}
.cmp.win li::before{content:"✓";color:var(--green2)}
.cmp-note{text-align:center;color:var(--text3);font-size:12.5px;margin-top:16px}

.badges{position:relative;z-index:1;padding:60px 0 0}
.badge-row{display:flex;justify-content:center;gap:12px;flex-wrap:wrap}
.tbadge{display:inline-flex;align-items:center;gap:8px;padding:11px 20px;border-radius:30px;background:var(--surf);border:1px solid var(--border);font-size:13.5px;font-weight:600;color:var(--text2)}

.faq{position:relative;z-index:1;padding:84px 0 10px;max-width:680px;margin:0 auto}
.faq details{background:var(--surf);border:1px solid var(--border);border-radius:16px;margin-bottom:10px;overflow:hidden}
.faq summary{padding:18px 22px;font-size:15.5px;font-weight:600;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:12px}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";font-size:22px;font-weight:400;color:var(--text3);transition:transform .25s}
.faq details[open] summary::after{transform:rotate(45deg)}
.faq .a{padding:0 22px 18px;font-size:14.5px;color:var(--text2);line-height:1.6}

.boost-hint{max-width:680px;margin:54px auto 0;text-align:center;border:1px dashed rgba(245,158,11,.35);border-radius:18px;padding:22px 26px;background:rgba(245,158,11,.05)}
.boost-hint b{color:#FBBF24}
.boost-hint p{font-size:14px;color:var(--text2);line-height:1.6}

#sticky-cta{position:fixed;left:0;right:0;bottom:0;z-index:50;padding:10px 14px calc(10px + env(safe-area-inset-bottom,0px));
  background:rgba(7,9,15,.92);backdrop-filter:blur(10px);border-top:1px solid var(--border);display:none}
#sticky-cta a{display:flex;justify-content:center}

.final{position:relative;z-index:1;padding:30px 0 96px}
.final-box{position:relative;overflow:hidden;border-radius:28px;padding:64px 40px;text-align:center;
  background:linear-gradient(135deg,rgba(59,130,246,.16),rgba(16,185,129,.12));
  border:1px solid var(--border2)}
.final-box::before{content:"";position:absolute;inset:0;
  background:radial-gradient(ellipse at 50% -20%,rgba(59,130,246,.3),transparent 60%);pointer-events:none}
.final-box h2{position:relative;font-size:clamp(28px,4.6vw,44px);font-weight:800;letter-spacing:-.03em;line-height:1.08;margin-bottom:16px}
.final-box p{position:relative;color:var(--text2);font-size:17px;margin-bottom:32px}
.final-box .btn{position:relative}

footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:30px 0;text-align:center;color:var(--text3);font-size:13px}

.rv{opacity:0;transform:translateY(22px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1)}
.rv.in{opacity:1;transform:none}

.leaflet-control-attribution{font-size:9px;opacity:.5}
.marker-cluster{background:rgba(59,130,246,.35)!important}
.marker-cluster div{background:rgba(59,130,246,.85)!important;color:#fff!important;font-weight:700!important;font-family:var(--ff)!important}

@media(max-width:720px){
  .hero{padding:52px 0 36px}
  .grid3{grid-template-columns:1fr}
  #map{height:420px}
  .logos{gap:32px}
  .final-box{padding:48px 24px}
  .btn{width:100%;justify-content:center}
  .cmp-grid{grid-template-columns:1fr}
  .stat{min-width:120px;padding:14px 18px;flex:1}
  #sticky-cta{display:block}
  footer{padding-bottom:86px}
}
</style>
</head>
<body>

<nav>
  <div class="nav-in">
    <div class="logo">
      <span class="pin"><svg viewBox="0 0 24 24" fill="none"><path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" fill="#fff"/><circle cx="12" cy="9" r="2.4" fill="#3B82F6"/></svg></span>
      Map<span>Job</span>
    </div>
    <a class="nav-cta" href="https://mapjob.pl">Dodaj ofertę</a>
  </div>
</nav>

<header class="hero">
  <div class="wrap">
    <div class="badge"><span class="dot"></span>Zawsze bezpłatne — bez karty, bez umów</div>
    <h1>Twoje oferty pracy<br><span class="grad">widoczne na mapie Polski.</span></h1>
    <p class="lead">Dodajesz ogłoszenie w 2 minuty. Kandydaci znajdują Cię na <b>liście</b> i na <b>mapie</b> — a Ty nie płacisz ani złotówki.</p>
    <div class="cta-row">
      <a class="btn btn-primary" href="https://mapjob.pl">Dodaj ofertę za darmo →</a>
      <a class="btn btn-ghost" href="#mapa">Zobacz na żywo ↓</a>
    </div>
    <div class="micro">Bez karty &nbsp;·&nbsp; Bez umów &nbsp;·&nbsp; Bez ukrytych kosztów</div>
  </div>

  <div class="wrap show rv" id="mapa">
    <div class="map-frame">
      <div class="map-chip"><span class="dot"></span><span id="liveCount"></span></div>
      <div id="map"></div>
    </div>
    <div class="map-cap">Prawdziwe ogłoszenia firm, które już są na MapJob. Każdy znacznik to realna oferta pracy.</div>
  </div>
</header>

<section class="stats">
  <div class="wrap">
    <div class="stats-row rv">
      <div class="stat"><div class="n" id="stat-offers">—</div><div class="l">aktywnych ofert</div></div>
      <div class="stat"><div class="n">3</div><div class="l">kraje: PL · DE · NL</div></div>
      <div class="stat"><div class="n">2 min</div><div class="l">do publikacji</div></div>
      <div class="stat"><div class="n">0 zł</div><div class="l">za ogłoszenie</div></div>
    </div>
  </div>
</section>

<section class="trust">
  <div class="wrap">
    <div class="trust-label rv">Już zatrudniają z MapJob</div>
    <div class="logos rv">
      <span class="lg"><img src="PRAMER_PLACEHOLDER" alt="Pramer"></span>
      <span class="lg">JOBWERKE_PLACEHOLDER</span>
      <span class="lg pf"><img src="PLATINUM_PLACEHOLDER" alt="Platinum Active"></span>
    </div>
  </div>
</section>

<section class="value">
  <div class="wrap">
    <div class="grid3">
      <div class="vcard rv">
        <div class="vicon"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg></div>
        <h3>0 zł. Na zawsze.</h3>
        <p>Bez abonamentu, bez prowizji, bez podawania karty. Publikujesz tyle ofert, ile chcesz.</p>
      </div>
      <div class="vcard rv">
        <div class="vicon"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 20l-5-2V5l5 2 6-2 5 2v13l-5-2-6 2z"/><path d="M9 7v13M15 5v13"/></svg></div>
        <h3>Lista i mapa naraz</h3>
        <p>Kandydat przegląda oferty na czytelnej liście albo widzi je dokładnie tam, gdzie chce pracować.</p>
      </div>
      <div class="vcard rv">
        <div class="vicon"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v5l3 2"/><circle cx="12" cy="12" r="9"/></svg></div>
        <h3>Gotowe w 2 minuty</h3>
        <p>Wklejasz treść, ustawiasz lokalizację, publikujesz. Oferta od razu trafia na listę i na mapę.</p>
      </div>
    </div>
  </div>
</section>

<section class="steps">
  <div class="wrap">
    <h2 class="sec-title rv">Jak to działa</h2>
    <p class="sec-sub rv">Od treści ogłoszenia do kandydatów — bez działu IT, bez umów, bez czekania.</p>
    <div class="grid3">
      <div class="step rv">
        <div class="num">1</div>
        <h3>Wklej treść ogłoszenia</h3>
        <p>Masz już ogłoszenie? Wklej je — AI samo uzupełni stanowisko, lokalizację, stawkę i wymagania. Zero przepisywania.</p>
      </div>
      <div class="step rv">
        <div class="num">2</div>
        <h3>Wbij pinezkę na mapie</h3>
        <p>Twoja oferta pojawia się dokładnie tam, gdzie jest praca. Kandydaci szukający w okolicy widzą ją od razu.</p>
      </div>
      <div class="step rv">
        <div class="num">3</div>
        <h3>Odbieraj zgłoszenia</h3>
        <p>Kandydaci dzwonią lub aplikują bezpośrednio. Żadnych pośredników, żadnej prowizji od zatrudnienia.</p>
      </div>
    </div>
  </div>
</section>

<section class="compare">
  <div class="wrap">
    <h2 class="sec-title rv">Policz, ile oszczędzasz</h2>
    <p class="sec-sub rv">Jedno ogłoszenie na dużym portalu pracy potrafi kosztować tyle, co cała rekrutacja u nas.</p>
    <div class="cmp-grid">
      <div class="cmp rv">
        <h3>Tradycyjny portal pracy</h3>
        <div class="price">400–900 zł <span style="font-size:14px;font-weight:500;color:var(--text3)">/ ogłoszenie</span></div>
        <ul>
          <li>Płacisz z góry, zanim zobaczysz efekt</li>
          <li>Oferta ginie wśród tysięcy innych</li>
          <li>Pakiety, umowy, faktury, zobowiązania</li>
          <li>Dodatkowe opłaty za wyróżnienie</li>
        </ul>
      </div>
      <div class="cmp win rv">
        <h3>MapJob</h3>
        <div class="price">0 zł <span style="font-size:14px;font-weight:500;color:var(--text3)">/ ogłoszenie · bez limitu</span></div>
        <ul>
          <li>Publikujesz za darmo, ile chcesz</li>
          <li>Widoczność na liście i na mapie naraz</li>
          <li>Bez karty, bez umów, bez zobowiązań</li>
          <li>Wyróżnienie tylko, gdy sam chcesz — od 9 zł</li>
        </ul>
      </div>
    </div>
    <div class="cmp-note rv">Ceny portali wg publicznych cenników pakietów podstawowych (2026). U nas publikacja jest bezpłatna — zawsze.</div>
  </div>
</section>

<section class="badges">
  <div class="wrap">
    <div class="badge-row rv">
      <span class="tbadge">🔒 Dane w UE · zgodność z RODO</span>
      <span class="tbadge">✓ Zweryfikowani pracodawcy</span>
      <span class="tbadge">🇵🇱 Polska platforma</span>
      <span class="tbadge">💬 Wsparcie po polsku</span>
    </div>
  </div>
</section>

<section class="faq">
  <div class="wrap">
    <h2 class="sec-title rv">Częste pytania</h2>
    <p class="sec-sub rv">Wszystko, co firmy pytają przed pierwszym ogłoszeniem.</p>
    <details class="rv">
      <summary>Czy publikacja ogłoszeń naprawdę jest darmowa?</summary>
      <div class="a">Tak — dodawanie i utrzymywanie ofert pracy nie kosztuje nic. Bez karty, bez okresu próbnego, bez „darmowe do czasu". Płatne są wyłącznie opcjonalne wyróżnienia (PILNE, Boost Dnia), które włączasz tylko wtedy, gdy chcesz przyspieszyć rekrutację.</div>
    </details>
    <details class="rv">
      <summary>Skąd biorą się kandydaci?</summary>
      <div class="a">MapJob odwiedzają osoby szukające pracy w Polsce, Niemczech i Holandii — głównie pracownicy fizyczni, produkcyjni i budowlani. Kandydat przegląda oferty na mapie dokładnie tam, gdzie chce pracować, więc zgłoszenia są lokalne i trafne.</div>
    </details>
    <details class="rv">
      <summary>Jak długo trwa dodanie oferty?</summary>
      <div class="a">Około 2 minut. Wklejasz gotową treść ogłoszenia, a AI automatycznie uzupełnia stanowisko, kategorię, lokalizację i widełki. Sprawdzasz, klikasz „Publikuj" — i oferta jest na liście oraz na mapie.</div>
    </details>
    <details class="rv">
      <summary>Co daje wyróżnienie PILNE i Boost Dnia?</summary>
      <div class="a">PILNE (19 zł) sprawia, że ogłoszenie jest zawsze pierwsze na liście i mieni się na czerwono — średnio 3× więcej aplikacji. Boost Dnia (9 zł) wynosi ofertę na szczyt listy na 48 godzin. Płacisz jednorazowo BLIK-iem lub kartą, bez subskrypcji.</div>
    </details>
    <details class="rv">
      <summary>Czy moje dane i dane kandydatów są bezpieczne?</summary>
      <div class="a">Tak. Dane przechowujemy na serwerach w Unii Europejskiej, zgodnie z RODO. Nie sprzedajemy danych, nie wysyłamy spamu, a konto możesz usunąć w każdej chwili razem ze wszystkimi danymi.</div>
    </details>
  </div>
</section>

<div class="wrap">
  <div class="boost-hint rv">
    <p>⚡ <b>Chcesz zatrudnić szybciej?</b> Wyróżnij ogłoszenie jako <b>PILNE za 19 zł</b> albo włącz <b>Boost Dnia za 9 zł</b> — jednorazowo, BLIK-iem, bez subskrypcji. Tylko wtedy, gdy sam chcesz.</p>
  </div>
</div>

<section class="final">
  <div class="wrap">
    <div class="final-box rv">
      <h2>Niech kandydaci sami Cię znajdą.</h2>
      <p>Dołącz do firm z Polski, Niemiec i Holandii, które już rekrutują na MapJob — zupełnie za darmo.</p>
      <a class="btn btn-primary" href="https://mapjob.pl">Dodaj pierwszą ofertę →</a>
      <div style="position:relative;margin-top:18px;font-size:13px;color:var(--text3)">Bez karty · Publikacja w 2 minuty · Usuniesz, kiedy chcesz</div>
    </div>
  </div>
</section>

<div id="sticky-cta"><a class="btn btn-primary" href="https://mapjob.pl">Dodaj ofertę za darmo →</a></div>

<footer>© 2026 MapJob.pl — praca na mapie Polski</footer>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
<script>
var PINS = PINS_PLACEHOLDER;
var io = new IntersectionObserver(function(es){
  es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
},{threshold:.12});
document.querySelectorAll('.rv').forEach(function(el){io.observe(el);});
var map = L.map('map',{scrollWheelZoom:false,attributionControl:true,zoomControl:true}).setView([51.6,11.5],5);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{
  attribution:'© OpenStreetMap, © CARTO',subdomains:'abcd',maxZoom:19
}).addTo(map);
var cluster = L.markerClusterGroup({maxClusterRadius:44,showCoverageOnHover:false});
var icon = L.divIcon({className:'',iconSize:[18,18],
  html:'<div style="width:16px;height:16px;border-radius:50%;background:#3B82F6;border:2.5px solid #0b0e14;box-shadow:0 0 0 3px rgba(59,130,246,.35),0 2px 8px rgba(0,0,0,.5)"></div>'});
PINS.forEach(function(p){
  var m = L.marker([p.lat,p.lng],{icon:icon});
  m.bindPopup('<div style="font-family:Inter,sans-serif;min-width:170px"><div style="font-weight:700;font-size:13px;color:#0a0a0a">'+p.c+'</div><div style="font-size:12px;color:#555;margin-top:3px">'+p.t+'</div><div style="font-size:11px;color:#3B82F6;margin-top:5px;font-weight:600">📍 '+p.loc+'</div></div>');
  cluster.addLayer(m);
});
map.addLayer(cluster);
try{ map.fitBounds(cluster.getBounds().pad(0.18)); }catch(e){}
document.getElementById('liveCount').textContent = PINS.length + ' aktywnych ofert na żywo';
var so=document.getElementById('stat-offers');if(so)so.textContent=PINS.length+'+';
</script>
</body>
</html>'''

HTML = HTML.replace('PRAMER_PLACEHOLDER', pramer)
HTML = HTML.replace('JOBWERKE_PLACEHOLDER', jobwerke)
HTML = HTML.replace('PLATINUM_PLACEHOLDER', platinum)
HTML = HTML.replace('PINS_PLACEHOLDER', pins_js)

out = os.path.join(ROOT, 'dla-firm-9k3x7m.html')
with open(out, 'w', encoding='utf-8') as f:
    f.write(HTML)
print(f'[build_dlafirm] written {len(HTML):,} bytes -> dla-firm-9k3x7m.html')
