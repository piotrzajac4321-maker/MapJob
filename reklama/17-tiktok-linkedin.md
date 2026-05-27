# Platformy dodatkowe — TikTok + LinkedIn + Instagram Reels

**Cel:** uzupełnienie Meta + Google o platformy niszowe ale skalowalne. Każda platforma ma **inną persona i inny ton copy** — dopasuj, nie kopiuj reklam z Meta.

**Przewaga per platforma:**
- **TikTok** → młodsi fachowcy (20–35) i klienci (18–40), niskie CPM (2–5 zł w PL), **bardzo wysoki CTR** dla autentycznego content
- **LinkedIn** → B2B (deweloperzy, generalni wykonawcy, kierownicy budowy), drogo (CPM 50–150 zł), ale wysokie LTV
- **Instagram Reels** → część Meta Ads, ale wymaga **innych kreacji** niż feed (inny ton)
- **X (Twitter)** → niski zasięg w PL, pomijamy

**Budżet rekomendowany (start):** TikTok 20 zł/dzień · LinkedIn 20 zł/dzień · Reels już w Meta.

---

## 🎵 TIKTOK ADS

### Filozofia TikToka

**NIE rób reklam wyglądających jak reklama.** TikTok algorytm karze „ads feel". Zamiast:
- ❌ Polished marketing video z voiceover-em
- ❌ Logo i CTA przez całe video
- ❌ Tekst zalegający ekran

Rób:
- ✅ Natywne, autentyczne, „self-made" feeling
- ✅ Pierwszy klip niepozorowany (kasza na blacie, ręka w kuchni)
- ✅ Hook w 1 sekundzie (pytanie, kontrowersja, surprise)
- ✅ Tekst dodany w TikTok Editor (nie w Adobe Premiere — różnica)

**Strategia:** „TikTok made me register" — twórz organiczny content → boost tych, które działają (Spark Ads).

---

### Struktura konta TikTok Ads

```
TikTok For Business → Ads Manager
└── Kampania: MapJob-Fachowcy-PL
    ├── Ad Group: Interest-based (młodsi 20–35)
    ├── Ad Group: Custom audience (visitor retargeting)
    └── Ad Group: Lookalike (po zebraniu 1000 signupsów)
└── Kampania: MapJob-Klienci-PL
    ├── Ad Group: Life events (przeprowadzka, remont)
    └── Ad Group: Interest DIY / Home
```

---

### 5 konceptów wideo na TikTok — każdy inny hook

#### TikTok Concept #1 — „Typ fachowca który nie rozdaje ulotek"

**Format:** POV (point of view), 15s
**Hook (0–1s):** tekst na ekranie — „Typ fachowca który nie rozdaje ulotek. 🙄" + fachowiec patrzy zmęczony w kamerę
**Middle (1–12s):**
- Pokazuje telefon z apką MapJob
- Wbija pin
- Notyfikacja „nowa wiadomość od klienta"
- Uśmiech zmęczony ale zadowolony
**CTA (12–15s):** tekst „mapjob.pl — pierwszy pin 0 zł"

**Nagrywanie:** selfie stick, telefon, naturalne światło, bez post-produkcji profesjonalnej. CapCut do tekstu i cięć.

**Koszt:** 0 zł (nagrywasz sam albo znajomy fachowiec — kolacja w zamian)

---

#### TikTok Concept #2 — „Policzmy ile płacisz za leady"

**Format:** head-on camera „tutorial style", 25s
**Hook (0–2s):** „Policzymy razem ile tracisz na Oferii w rok."
**Middle:** kalkulator, głośne liczenie „200 zł miesięcznie razy 12… to 2400 zł rocznie. A MapJob? 79 zł × 12 = 948 zł. I nie kupujesz punktów."
**CTA (22–25s):** „Pierwszy pin za darmo. mapjob.pl"

**Nagrywanie:** stabilny statyw, dobra dykcja, natural light kitchen/biuro
**Styling:** bez korporacyjnego — koszulka, realna kuchnia w tle

---

#### TikTok Concept #3 — „Screen recording z apki + voice-over"

**Format:** screen record, 18s
**Hook (0–2s):** „Czy moja apka znajdzie fachowca w 30 sekund? Zobacz."
**Middle:**
- Otwiera mapjob.pl
- Klika „Kontynuuj z Google" → 2 sekundy → zalogowana
- Filtruje „elektryk" w swoim mieście
- Widzi listę, klika pin, otwiera portfolio
- Pisze wiadomość
**CTA:** „Polska apka. 0 zł dla klienta. mapjob.pl"

**Nagrywanie:** screen recorder telefonu
**Głos:** naturalny, nie-lektor (w stylu vlogera)

---

#### TikTok Concept #4 — „Stitch / Duet reactions"

**Format:** reakcja na inny TikTok (15s)
**Hook:** reaguj na czyjś TikTok „szukam elektryka od tygodnia" → twoja odpowiedź: „Otwórz mapjob.pl, masz 30 fachowców w Twoim mieście"
**Middle:** pokazujesz screen apki, pin, portfolio

**Uwaga:** tego nie zrobisz jako płatnej reklamy (Stitch nie działa w Ads). Ale organicznie = świetny content — **boost** potem przez Spark Ads.

---

#### TikTok Concept #5 — „Before / After: jak szukałem klientów wcześniej"

**Format:** porównanie split-screen, 20s
**Hook:** „Jak szukałem klientów rok temu VS teraz."
**Left side (0–10s):** ulotki, rozmawianie z sąsiadem, OLX z telefonem
**Right side (10–20s):** telefon z MapJob, pin na mapie, powiadomienie „klient pisze"
**CTA:** „mapjob.pl — polska apka"

---

### Targetowanie TikTok

**Lokalizacja:** Polska
**Wiek:** 18–35 (młodsi niż Meta — TikTok DNA)
**Zainteresowania:**
- DIY & Home
- Construction
- Small Business
- Finance (dla reklam cash-flow)
- Automotive (dla mechaników mobilnych — B12)

**Custom audiences (po 2 tygodniach):**
- Website visitors (TikTok Pixel → zobacz **sekcję Pixel** niżej)
- Engaged users (kliknęli Twoją reklamę w ostatnich 30 dniach)

**Behavioral:**
- Small business owner intent
- Home improvement intent

**Budżet:** **startowy 20 zł/dzień** · Cost cap 8 zł per lead

---

### TikTok Pixel — setup

Identyczny proces co Meta Pixel:

1. TikTok Ads Manager → Assets → Events → Install TikTok Pixel
2. Skopiuj Pixel ID (np. `CXXXXXXXX`)
3. Dodaj w `<head>` index.html **po Meta Pixel** (oba mogą działać równolegle):

```html
<!-- ========= TIKTOK PIXEL — podobnie consent-gated jak Meta ========= -->
<script>
(function(){
  window.MAPJOB_TIKTOK_PIXEL_ID = window.MAPJOB_TIKTOK_PIXEL_ID || 'REPLACE_WITH_YOUR_TIKTOK_PIXEL_ID';
  
  function _mjMarketingAllowed(){ /* ... to samo co Meta */ }
  
  window.loadTikTokPixel = function(){
    if(window.ttq) return;
    var pid = window.MAPJOB_TIKTOK_PIXEL_ID;
    if(!pid || pid==='REPLACE_WITH_YOUR_TIKTOK_PIXEL_ID') return;
    
    !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load(pid);ttq.page()}(window,document,"ttq");
  };
  
  if(_mjMarketingAllowed()) window.loadTikTokPixel();
  
  // Mapuj events na TikTok
  window.mjTrackTikTok = function(eventName, params){
    try{
      if(!_mjMarketingAllowed()) return;
      if(!window.ttq) window.loadTikTokPixel();
      if(window.ttq){
        var ttkMap = {
          'Lead': 'SubmitForm',
          'CompleteRegistration': 'CompleteRegistration',
          'InitiateCheckout': 'InitiateCheckout',
          'Purchase': 'CompletePayment'
        };
        ttq.track(ttkMap[eventName] || eventName, params||{});
      }
    }catch(e){}
  };
})();
</script>
```

**Eventy TikToka** do śledzenia: `ViewContent`, `SubmitForm`, `CompleteRegistration`, `InitiateCheckout`, `CompletePayment`.

---

## 💼 LINKEDIN ADS

### Dla kogo

**TYLKO kampania B8** z [12-reklamy-dodatkowe.md](12-reklamy-dodatkowe.md) — B2B (deweloperzy, generalni wykonawcy).

**NIE rób** kampanii dla fachowców na LinkedIn — są tam, ale CPM absurdalny (80+ zł) dla tej persony. LinkedIn = B2B, Meta = B2C/solopreneur.

---

### LinkedIn Targeting (dla kampanii B8)

**Locations:** Polska (cała) — LinkedIn nie ma dokładnego geo-targetingu (pomija mniejsze miasta)

**Demographics:**
- Age: 30–60
- Job function: Operations, Project Management, Engineering, Construction

**Job Titles (kluczowe):**
- Construction Manager
- Project Manager (Construction / Real Estate)
- Site Manager
- Dyrektor Budowy
- Kierownik Budowy
- Kierownik Kontraktu
- Inżynier Budowy
- Deweloper
- Generalny Wykonawca
- Managing Director (Construction)

**Company (opcjonalne — jeśli chcesz wąsko):**
- Industry: Construction, Real Estate, Architecture & Planning
- Company size: 11–200 (małe i średnie firmy — lepszy decision-maker access)

**Estymowana audience:** 30–80k w Polsce (wąska = droga)

---

### LinkedIn Ad formats

| Format | Charakterystyka | Budżet rekomendowany |
|--------|-----------------|----------------------|
| **Sponsored Content (Single Image)** | Feed post z obrazkiem | 20 zł/dzień start |
| **Sponsored Content (Video)** | Feed post z wideo | 25 zł/dzień (lepszy engagement) |
| **Message Ads** (dawniej InMail) | Prywatna wiadomość do skrzynki | 30 zł/dzień (drogo ale high-intent) |
| **Document Ads** | PDF (case study, whitepaper) | 20 zł/dzień |

**Rekomendacja:** zacznij od **Sponsored Content Image** + testuj **Message Ads** (najdroższe, ale najwyższa konwersja).

---

### Copy dla LinkedIn — 2 wersje

#### LinkedIn Ad #1 — Sponsored Content Image (B2B acquisition)

**Kreacja:** zdjęcie profesjonalistki w biurze z laptopem + mapa MapJob (generuj prompt z [13-prompty-ai-zdjec.md](13-prompty-ai-zdjec.md) sekcja B8)

**Headline:**
> Jak deweloperzy znajdują ekipy podwykonawców bez obdzwaniania 30 numerów?

**Body:**
```
Zarządzasz 3 inwestycjami. Każda potrzebuje 5–10 różnych ekip — elektryków, hydraulików, glazurników, dekarzy.

Tygodnie szukania = opóźnienia = kary umowne.

MapJob dla B2B:

✅ Mapa polskich fachowców z filtrem zawodu, obszaru, certyfikatów
✅ Portfolio każdego podwykonawcy — zdjęcia realnych realizacji
✅ Chat z załącznikami (rysunki, wyceny, PDF-y)
✅ Eksport listy kontaktów do Twojego CRM (Plan Premium)
✅ Dla inwestora biznesowego — 100% za darmo

Zaloguj Googlem w 2 sekundy. Sprawdź mapę bez rejestracji ekipy.

mapjob.pl
```

**CTA:** `Learn more` (LinkedIn native CTA button)

---

#### LinkedIn Ad #2 — Message Ads (bezpośrednia wiadomość)

**Sender:** utwórz profil osoby („[Imię] z MapJob" — najlepiej właściciel, nie „marketing team")

**Subject line:**
> Pyt. o podwykonawców na Twoje kolejne 3 inwestycje

**Message body (max 1500 znaków):**
```
Cześć [imię],

widzę, że pracujesz jako [job title] w [firma]. Zapewne znasz ten ból: zarządzanie wieloma budowami jednocześnie i konstantne szukanie sprawdzonych ekip podwykonawców.

Stworzyliśmy polską apkę MapJob — mapa fachowców z filtrami per zawód, obszar pracy i certyfikaty. Dla dewelopera / GW = 0 zł.

Co myślisz — czy mógłbyś poświęcić 3 minuty na sprawdzenie, czy Twoich 5 najczęstszych branż podwykonawców tam jest?

mapjob.pl — wchodzisz, filtrujesz, widzisz mapę. Bez formularza.

Jeśli wolisz zobaczyć przez wideo (5 minut) demo — odpisz „video", wyślę link.

Pozdrawiam,
[imię]
Założyciel MapJob
```

**CTA button:** `Otwórz mapę`
**Link:** `https://mapjob.pl/?view=map&utm_source=linkedin&utm_medium=message&utm_campaign=B2B-outreach&utm_content=inmail1`

**Koszt:** ~2–5 zł za wysłaną wiadomość. Open rate ~45%, CTR ~8%, conversion ~3%. = **CAC per B2B lead: ~100–200 zł**. Dla LTV B2B (jeden klient = 5–20 fachowców z polecenia) — opłacalne.

---

### LinkedIn Insight Tag (pixel)

Identycznie jak Meta / TikTok Pixel. Setup:

1. LinkedIn Campaign Manager → Account Assets → Insight Tag → Generate
2. Skopiuj `Partner ID` (np. `1234567`)
3. Wstaw w `<head>` **po Meta i TikTok Pixel**:

```html
<!-- ========= LINKEDIN INSIGHT TAG (consent-gated) ========= -->
<script>
(function(){
  window.MAPJOB_LINKEDIN_PARTNER_ID = window.MAPJOB_LINKEDIN_PARTNER_ID || 'REPLACE_WITH_YOUR_PARTNER_ID';
  
  window.loadLinkedInInsight = function(){
    if(window._linkedin_partner_id) return;
    var pid = window.MAPJOB_LINKEDIN_PARTNER_ID;
    if(!pid || pid==='REPLACE_WITH_YOUR_PARTNER_ID') return;
    
    window._linkedin_partner_id = pid;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(pid);
    
    var s = document.getElementsByTagName("script")[0];
    var b = document.createElement("script");
    b.type = "text/javascript"; b.async = true;
    b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
    s.parentNode.insertBefore(b, s);
  };
  
  // Tylko jeśli marketing consent aktywny
  try{
    var c=JSON.parse(localStorage.getItem('mj_cookie_consent_v2')||'null');
    if(c&&c.analytics===true) window.loadLinkedInInsight();
  }catch(e){}
})();
</script>
```

**Conversion tracking:** LinkedIn Campaign Manager → Conversions → Add → Match URL pattern (`/?payment=success` → Purchase, `?registered=1` → Lead).

---

## 📱 INSTAGRAM REELS — specyficzne kreacje

**Uwaga:** Instagram to Meta, ale **Reels mają inne wymagania niż Feed**.

### Różnice Reels vs Feed

| Element | Feed (1:1 / 4:5) | Reels (9:16) |
|---------|------------------|--------------|
| Aspect ratio | 1:1 lub 4:5 | **9:16 pionowe** |
| Tekst na obrazie | OK | **Krótki** (zakryty overlayem IG) |
| Długość video | 60s+ | **15s sweet spot, max 60s** |
| Napisy | Opcjonalne | **MUSZĄ być** (85% bez dźwięku) |
| Muzyka | Opcjonalna | **Tracklista IG/TikTok** (trend-driven) |
| CTA | Button widoczny | Tekst + CTA („Link w bio" nie działa w reklamie) |

### Reels Ad Concept — dla Meta Ads Manager

**Selekcja z [14-scenariusze-filmowe.md](14-scenariusze-filmowe.md):**
- **#2 AI Kreator CV** (15s) → Reels ready
- **#5 Screenrecord klik Google** (15s) → Reels ready
- **#3 Para przed remontem** (15s, pionowy cut) → Reels ready

**Dodatkowe Reels-only koncepty:**

#### Reels Concept #R1 — „Typ który szuka fachowca na OLX"
**Hook (0–1s):** tekst „Typ który szuka fachowca na OLX 🧐" + zdjęcie kogoś z laptopem
**Middle (1–12s):** pokazujesz jak OLX wygląda → kiepskie zdjęcia, brak portfolio → przechodzisz do MapJob → pin + portfolio + chat
**CTA (12–15s):** tekst „mapjob.pl · polska mapa fachowców"

#### Reels Concept #R2 — „Dzień z życia elektryka" (fast cuts)
**Format:** 15s fast-cut → 8 ujęć × 2s każde
**Content:** pobudka 6:00 → kawa → telefon z MapJob → samochód → robota → klient → zadowolony klient → koniec dnia
**Muzyka:** fast beat 120 BPM (kategoria „Upbeat" na Meta Sound Library)

---

## 🎯 Budżetowy plan — 4 platformy razem

**Tydzień 1–2:** TYLKO Meta (50–70 zł/d)
**Tydzień 3:** Meta + Google (100–140 zł/d)
**Tydzień 4:** Meta + Google + TikTok (140–180 zł/d)
**Tydzień 6+:** Meta + Google + TikTok + LinkedIn (200–300 zł/d)

**Proporcje docelowe (miesiąc 3+):**
- Meta: 50% budżetu
- Google: 30%
- TikTok: 15%
- LinkedIn: 5% (B2B tylko)

---

## ⚠️ Czego NIE robić cross-platform

1. **Nie kopiuj reklam 1:1 między Meta a TikTok** — TikTok algorytm karze „polished ads". Potrzebujesz autentycznego feelu.

2. **Nie używaj LinkedIn dla B2C (fachowców-solopreneurów)** — ich tam mało, CPM wysoki. LinkedIn = TYLKO B2B.

3. **Nie ignoruj Pixeli** — każda platforma ma swój. Instaluj wszystkie, zbieraj dane, buduj retargeting na każdej.

4. **Nie rób „universal creative"** — jedno wideo na 4 platformy = słaba skuteczność wszędzie. Każdy format = inny cut.

5. **Nie rób Message Ads LinkedIn bez personalizacji** — masówka „Dear Sir/Madam" = spam = blocked.

---

## 💎 Pro-tip: Organiczny TikTok + Spark Ads

**Strategia:** zamiast od razu płatnych reklam TikTok:

1. **Tworzysz konto organiczne @mapjob.pl** (albo @mapjobapp)
2. **Postujesz 3 wideo tygodniowo** — edukacyjne dla fachowców („3 tipy jak zdobyć klientów w 2026", „Dlaczego OLX nie działa na remonty")
3. Po 30 dniach — **wybierasz 3 najbardziej viralne** (> 10k views)
4. **Boostujesz je jako Spark Ads** — to jest **organic post jako reklama** (wyższy trust, niższy CPM)

**Koszt organicznego contentu:** 0 zł (sam nagrywasz) albo 200–500 zł/tygodniowo za kreatora z Fiverr (polskiego speakera)

**Korzyść:** TikTok algorytm kocha Spark Ads (bo to wygląda jak organiczny content, nie reklama) — **CPM 30–50% niższy** niż „zwykłe" reklamy.

---

## 🧠 Platform fit per reklama

Mapowanie reklam z biblioteki na platformy:

| Reklama | Meta FB | Meta IG Feed | Meta Reels | TikTok | Google Search | LinkedIn |
|---------|---------|--------------|------------|--------|---------------|----------|
| A1 „Klik Google" | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| A2 „Koniec OLX" | ✅ | ✅ | ✅ | ✅ (strong) | ✅ | — |
| A3 „AI Kreator CV" | ✅ | ✅ | ✅ (top) | ✅ (top) | ✅ | — |
| A12 „Porównanie kosztów" | ✅ | — | — | ✅ (tutorial) | ✅ (top) | — |
| A15 „Sam sobie szef" | ✅ | ✅ | — | — | — | — |
| A16 „Pakiet Wspierający" | ✅ retargeting | — | — | — | — | — |
| A22 „Kobiety w fachu" | ✅ (niszowo) | ✅ (strong) | ✅ | ✅ | — | — |
| B1 „Fachowiec w okolicy" | ✅ | ✅ | ✅ | — | ✅ (top) | — |
| B6 „Pilna awaria" | ✅ | — | ✅ | ✅ | ✅ (top) | — |
| B8 „Dla dewelopera" | — | — | — | — | ✅ | ✅ (top) |

**Wniosek:** nie każda reklama pasuje wszędzie. Dopasowuj.
