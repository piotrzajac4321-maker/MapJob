# -*- coding: utf-8 -*-
import os
data_js = open("_otto_data.js", encoding="utf-8").read()
logo_js = open("_logo_data.js", encoding="utf-8").read()
css = open("_tarcz_css.txt", encoding="utf-8").read()

# strip the trailing "CSS length ..." line if present
css = "\n".join(l for l in css.splitlines() if not l.startswith("CSS length"))

# OTTO Work Force brand colours: red (#E01820) + navy (#202870)
css = css.replace("--brand:#E1251B;--brand2:#B11710;", "--brand:#E01820;--brand2:#202870;")
css = css.replace("border-color:rgba(225,37,27,.5)", "border-color:rgba(224,24,32,.5)")
# OTTO logo is square -> keep the default 76x76 white logo box (no horizontal override)

# extra rules: UDT badge, map pins, popups
css += """
  .ob.udt{background:rgba(32,40,112,.18);color:#8FA2FF;border:1px solid rgba(32,40,112,.5)}
  .bpin .head2{width:36px;height:36px;border-radius:50% 50% 50% 0;background:#fff;transform:rotate(-45deg);box-shadow:0 4px 10px rgba(0,0,0,.4);border:3px solid var(--brand);display:flex;align-items:center;justify-content:center}
  .bpin .head2 .ic{transform:rotate(45deg);width:22px;height:22px;display:flex;align-items:center;justify-content:center}
  .bpin .head2 .ic img{width:100%;height:100%;object-fit:contain}
  .leaflet-popup-content-wrapper{background:var(--surf);color:var(--text);border-radius:10px;border:1px solid var(--border2)}
  .leaflet-popup-tip{background:var(--surf)}
  .leaflet-popup-content{margin:9px 12px;font-family:var(--ff)}
  .leaflet-popup-content b{font-size:13px}
"""

HTML = r"""<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>MapJob — podgląd profilu firmy: OTTO Work Force (do akceptacji)</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>__CSS__</style>
</head>
<body>
<div class="topbar">
  <div class="brand"><svg width="20" height="24" viewBox="0 0 18 22" fill="none"><path d="M9 0C4.03 0 0 4.03 0 9c0 6.75 9 13 9 13s9-6.25 9-13c0-4.97-4.03-9-9-9z" fill="#60A5FA"/><circle cx="9" cy="9" r="3.5" fill="#080D18"/></svg><span><span style="color:#F0F4FF">Map</span><span style="color:#60A5FA">Job</span><span style="color:#F0F4FF">.pl</span></span></div>
  <span class="badge-akc">Podgląd · do akceptacji</span>
</div>

<div class="wrap">
  <h1>Tak będzie wyglądać profil <span style="color:#E01820">OTTO Work Force</span> na Map<span class="hl">Job</span>.pl</h1>
  <p class="intro">Przygotowaliśmy kompletny <b>profil firmy</b> wraz ze wszystkimi aktualnymi ogłoszeniami. Kandydaci znajdą Wasze oferty na mapie i zaaplikują jednym kliknięciem — bez logowania, bez CV, bez zbędnych formularzy.</p>

  <div class="stage">
    <div class="phone">
      <div class="notch"></div>
      <div class="pscroll">
        <div class="pbar"><div class="bk">←</div><div class="ti">Profil firmy</div></div>
        <div class="cover"><div class="logo"><img id="hd-logo" alt="OTTO Work Force"></div></div>
        <div class="head">
          <div class="name">OTTO Work Force <span class="verif">✓ Zweryfikowana</span></div>
          <div class="ind">Agencja pracy tymczasowej i rekrutacji</div>
          <div class="loc">📍 Cała Polska + Holandia · <span id="st-ci2">16</span> lokalizacji</div>
          <div class="descco">OTTO Work Force to międzynarodowa agencja pracy i rekrutacji — od ponad 25 lat łączymy ludzi z pracą w Polsce, Holandii i całej Europie. Specjalizujemy się w pracy magazynowej, produkcyjnej i logistycznej. Zapewniamy legalne zatrudnienie, zakwaterowanie, transport i pełne wsparcie — także w języku ukraińskim.</div>
          <div class="trust">
            <span class="tchip">Agencja pracy (KRAZ)</span>
            <span class="tchip">Praca PL + Holandia</span>
            <span class="tchip">Zakwaterowanie i transport</span>
            <span class="tchip">Obsługa 🇵🇱 / 🇺🇦</span>
          </div>
        </div>

        <div class="stats">
          <div><div class="v" id="st-count">17</div><div class="k">Aktywnych ofert</div></div>
          <div><div class="v" id="st-ci">16</div><div class="k">Lokalizacje</div></div>
          <div><div class="v">25<small>+</small></div><div class="k">Lat na rynku</div></div>
        </div>

        <div class="sec">🎁 Co oferuje OTTO Work Force</div>
        <div class="bens">
          <div class="ben"><div class="i">💶</div><div class="t">Atrakcyjne stawki</div></div>
          <div class="ben"><div class="i">🏠</div><div class="t">Zakwaterowanie</div></div>
          <div class="ben"><div class="i">🚌</div><div class="t">Transport do pracy</div></div>
          <div class="ben"><div class="i">📄</div><div class="t">Legalne zatrudnienie</div></div>
          <div class="ben"><div class="i">🌍</div><div class="t">Praca w PL i Holandii</div></div>
          <div class="ben"><div class="i">🗣️</div><div class="t">Wsparcie 🇵🇱 / 🇺🇦</div></div>
        </div>

        <div class="sec">🗺️ Oferty na mapie</div>
        <div class="map" id="o-map"></div>
        <div class="maphint">✋ Przeciągnij i przybliż mapę · 🔵 <span id="mh-n">17</span> ofert w <span id="mh-c">16</span> lokalizacjach</div>

        <div class="sec" data-anchor="oferty" style="margin-bottom:11px">💼 Aktywne ogłoszenia (<span id="sec-count">17</span>)</div>
        <div class="filters" id="filters">
          <span class="fchip on" data-f="all">Wszystkie</span>
          <span class="fchip" data-f="magazyn">📦 Magazyn</span>
          <span class="fchip" data-f="operator">🚜 Operator wózka</span>
          <span class="fchip" data-f="produkcja">🏭 Produkcja</span>
          <span class="fchip" data-f="udt">🔧 Z UDT</span>
          <span class="fchip" data-f="abroad">🇳🇱 Holandia</span>
        </div>
        <div class="offers" id="offers"></div>
        <button class="morebtn" id="morebtn" style="display:none"></button>

        <div class="followbar">
          <button class="fb">🔔 Obserwuj firmę</button>
          <div class="ca">📞 Kontakt</div>
        </div>
      </div>
    </div>
  </div>

  <div class="desc">
    <div class="okbox"><p><b>Nie musicie nic robić ani niczego wypełniać</b> — cały profil i wszystkie ogłoszenia przygotowaliśmy za Was na podstawie Waszych ofert. Wystarczy, że <b>zatwierdzicie</b>, a my opublikujemy. Publikacja jest <b style="color:#F87171">BEZPŁATNA</b>.</p></div>
    <ul class="feat">
      <li><b>Jeden profil firmy</b> ze wszystkimi ogłoszeniami — kandydat widzi całą ofertę OTTO Work Force w jednym miejscu</li>
      <li><b>Piny na mapie</b> — oferty w całej Polsce oraz w Holandii (Venlo, Dordrecht, Nieuwegein)</li>
      <li><b>Filtry</b> — magazyn, operator wózka, produkcja, z UDT, Holandia</li>
      <li><b>Szybki kontakt</b> — „Aplikuj szybko" przy każdej ofercie, bez logowania i bez CV</li>
      <li><b>Wasze logo i barwy marki</b> — profil w kolorystyce OTTO Work Force</li>
    </ul>
    <div class="note">To tylko podgląd — nic nie zostało jeszcze opublikowane. Po Waszej akceptacji profil pojawi się na mapjob.pl. W każdej chwili go dla Was zmienimy lub usuniemy.</div>
  </div>
</div>

<div class="footer">
  <div style="font-size:19px;font-weight:900;letter-spacing:-.3px;margin-bottom:8px">Zatwierdzacie profil?</div>
  <p style="font-size:14px;color:var(--text2);max-width:520px;margin:0 auto 20px;line-height:1.65">Jeśli wszystko się zgadza — <b style="color:var(--text)">odpowiedzcie na wiadomość, w której dostaliście ten link</b>. <b style="color:#34D399">Czekamy na potwierdzenie i działamy</b> — opublikujemy profil od ręki na mapie MapJob. Publikacja jest <b style="color:#F87171">BEZPŁATNA</b>, a profil w każdej chwili dla Was zmienimy lub usuniemy.</p>
  <div style="font-size:11px;color:var(--text3)">To tylko podgląd — nic nie zostało jeszcze opublikowane na mapjob.pl.</div>

  <div style="margin-top:28px;font-size:14px;color:var(--text);font-weight:700">Wejdźcie na naszą stronę i zobaczcie, jak to działa</div>
  <div style="margin-top:12px">
    <a href="https://mapjob.pl" target="_blank" rel="noopener" style="display:inline-block;font-size:14px;font-weight:800;color:#fff;background:var(--surf);border:1px solid var(--border2);padding:13px 24px;border-radius:13px;text-decoration:none">🌐 Wejdź na Map<span style="color:#60A5FA">Job</span>.pl →</a>
  </div>

  <div style="margin-top:22px;font-size:13px;color:var(--text2);font-weight:600">📱 Już niedługo dostępni także w aplikacji mobilnej</div>
  <div style="margin-top:10px;display:inline-flex;flex-wrap:wrap;gap:9px;justify-content:center">
    <span style="display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;color:var(--text2);background:var(--surf);border:1px solid var(--border);border-radius:10px;padding:9px 15px">▶ Google Play <span style="color:var(--text3);font-weight:600">· wkrótce</span></span>
    <span style="display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;color:var(--text2);background:var(--surf);border:1px solid var(--border);border-radius:10px;padding:9px 15px">🍎 App Store <span style="color:var(--text3);font-weight:600">· wkrótce</span></span>
  </div>

  <div style="margin-top:24px;display:inline-flex;align-items:center;gap:7px;font-size:14px;font-weight:800;opacity:.85"><svg width="16" height="20" viewBox="0 0 18 22" fill="none"><path d="M9 0C4.03 0 0 4.03 0 9c0 6.75 9 13 9 13s9-6.25 9-13c0-4.97-4.03-9-9-9z" fill="#60A5FA"/><circle cx="9" cy="9" r="3.5" fill="#080D18"/></svg><span><span style="color:#F0F4FF">Map</span><span style="color:#60A5FA">Job</span><span style="color:#F0F4FF">.pl</span></span> <span style="font-weight:600;color:var(--text3);font-size:12px">· mapa pracy i fachowców</span></div>
</div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
__DATA__
__LOGO__
document.getElementById('hd-logo').src=LOGO;
document.getElementById('st-count').textContent=STATS.offers;
document.getElementById('st-ci').textContent=STATS.cities;
document.getElementById('st-ci2').textContent=STATS.cities;
document.getElementById('sec-count').textContent=STATS.offers;
document.getElementById('mh-n').textContent=STATS.offers;
document.getElementById('mh-c').textContent=STATS.cities;

function badges(o){
  var h='';
  if(o.sup) h+='<span class="ob sup">★ Superoferta</span>';
  h+='<span class="ob lvl">'+o.lvl+'</span>';
  if(o.ua) h+='<span class="ob ua">🇺🇦 Україна</span>';
  if(o.udt) h+='<span class="ob udt">🔧 Uprawnienia UDT</span>';
  if(o.cv) h+='<span class="ob cv">CV niewymagane</span>';
  return h;
}
function card(o){
  var sal=o.sal?'<div class="salary">'+o.sal+'</div>':'<div class="salary none">Wynagrodzenie do uzgodnienia</div>';
  return '<div class="offer"><div class="offer-top"><div class="offer-logo"><img src="'+LOGO_MARK+'" alt=""></div><div style="flex:1;min-width:0"><div class="offer-t">'+o.t+'</div><div class="offer-loc">📍 '+o.loc+'</div></div></div><div class="obadges">'+badges(o)+'</div><div class="offer-bottom">'+sal+'<div class="date">'+o.date+'</div><button class="apply">Aplikuj szybko</button></div></div>';
}
var LIMIT=5, curFilter='all', expanded=false;
var offersEl=document.getElementById('offers');
var moreBtn=document.getElementById('morebtn');
function filtered(){
  if(curFilter==='all') return OFFERS;
  if(curFilter==='udt') return OFFERS.filter(function(o){return o.udt;});
  if(curFilter==='abroad') return OFFERS.filter(function(o){return /Holandia/.test(o.loc);});
  return OFFERS.filter(function(o){return o.cat===curFilter;});
}
function render(){
  var list=filtered();
  var shown=expanded?list:list.slice(0,LIMIT);
  offersEl.innerHTML=shown.length?shown.map(card).join(''):'<div class="nores">Brak ofert w tej kategorii.</div>';
  document.getElementById('sec-count').textContent=list.length;
  if(list.length>LIMIT){
    moreBtn.style.display='block';
    moreBtn.innerHTML=expanded?'▴ Zwiń listę':('▾ Pokaż wszystkie ogłoszenia <span class="cnt">('+list.length+')</span>');
  }else{moreBtn.style.display='none';}
}
moreBtn.addEventListener('click',function(){
  expanded=!expanded; render();
  if(!expanded){var a=document.querySelector('.sec[data-anchor="oferty"]'); if(a) a.scrollIntoView({behavior:'smooth',block:'start'});}
});
document.getElementById('filters').addEventListener('click',function(e){
  var c=e.target.closest('.fchip'); if(!c) return;
  document.querySelectorAll('.fchip').forEach(function(x){x.classList.remove('on');});
  c.classList.add('on'); curFilter=c.dataset.f; expanded=false; render();
});
render();

(function(){
  function pin(){return L.divIcon({className:'',html:'<div class="bpin"><div class="head2"><span class="ic"><img src="'+LOGO_MARK+'"/></span></div></div>',iconSize:[36,42],iconAnchor:[18,42],popupAnchor:[0,-40]});}
  try{
    var m=L.map('o-map',{zoomControl:true,attributionControl:false,dragging:true,scrollWheelZoom:false,touchZoom:true,doubleClickZoom:true}).setView([51.6,12.5],5);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(m);
    var b=[];
    PINS.forEach(function(p){
      var mk=L.marker([p[1],p[2]],{icon:pin()}).addTo(m);
      var word=p[3]===1?'oferta':(p[3]<5?'oferty':'ofert');
      mk.bindPopup('<b>'+p[0]+'</b><br>'+p[3]+' '+word+' OTTO Work Force');
      b.push([p[1],p[2]]);
    });
    if(b.length>1) m.fitBounds(b,{padding:[30,30],maxZoom:7});
    setTimeout(function(){m.invalidateSize();},200);
  }catch(e){
    var el=document.getElementById('o-map');
    if(el) el.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#6B7280;font-size:12px;text-align:center;padding:14px">Mapa wczyta się po otwarciu strony z dostępem do internetu.</div>';
  }
})();
</script>
</body>
</html>
"""

HTML = HTML.replace("__CSS__", css).replace("__DATA__", data_js).replace("__LOGO__", logo_js)
open("preview-otto.html", "w", encoding="utf-8").write(HTML)
os.makedirs("otto", exist_ok=True)
open("otto/index.html", "w", encoding="utf-8").write(HTML)
print("wrote preview-otto.html + otto/index.html", len(HTML), "bytes")
