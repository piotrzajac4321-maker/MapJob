# Storytelling — kampanie seryjne (narracja rozpisana na 5–10 dni)

**Cel:** zamiast jednej reklamy „sprzedającej", **seria reklam opowiadająca historię** — user widzi dzień 1 dziś, dzień 2 jutro, dzień 3 pojutrze. **Budowanie napięcia**, psychologia zaangażowania, sequentiality.

**Dlaczego to działa:**
- **Curiosity gap** — po dniu 1 user chce wiedzieć co dalej
- **Pattern interrupt** — algorytm Meta promuje reklamy „serializowane" (zostają w pamięci)
- **Wielokrotny kontakt** — psychologia „sedmiorakonigu" (trzeba 7+ kontaktów do decyzji) — seryjne kampanie zaliczają to szybciej

**Jak działają technicznie:**
- Każdy dzień = osobny ad set w Meta Ads Manager
- Dni 2–10 = Custom Audience `Engaged with Ad 1` (user który obejrzał reklamę 1 przez > 3s)
- Dzień 11+ = full funnel retargeting lub wyjście z sekwencji

---

## 📚 5 kampanii storytelling — gotowe serie

| # | Nazwa kampanii | Dni | Persona | Kiedy odpalić |
|---|----------------|-----|---------|---------------|
| **S1** | „7 dni w MapJob" (fachowiec debutuje) | 7 | Marek-elektryk | Miesiąc 2+ |
| **S2** | „Remont łazienki w 5 aktach" (klient) | 5 | Magda+Piotr | Marzec–maj (sezon) |
| **S3** | „Zima → Wiosna: transformacja firmy" | 10 | Fachowiec | Luty (przed peak) |
| **S4** | „Absentee landlord — zdalny remont" | 5 | Polak w DE/NL | Cały rok |
| **S5** | „Dzień pracy fachowca" (short form, TikTok) | 3 | Młody fachowiec | Cały rok |

---

## 🎬 KAMPANIA S1 — „7 dni w MapJob" (7-dniowa seria dla fachowców)

### Koncept

Śledzimy fachowca od rejestracji do pierwszego zlecenia. Każdy dzień = 1 reklama. Każda reklama pokazuje konkretny moment.

**UWAGA:** to wymaga **realnego fachowca** (np. Marek) który się zgodzi nagrać wideo. Jeśli nie masz — zamień na:
- Screenrecord apki
- AI generated zdjęcia (z [13-prompty-ai-zdjec.md](13-prompty-ai-zdjec.md) i [18-ai-video-prompts.md](18-ai-video-prompts.md))
- Motion graphics

---

### DZIEŃ 1 — „Poniedziałek — Marek się waha"

**Format:** 15s wideo / statyczny obraz
**Cel:** hook i identyfikacja

**Visual:** fachowiec siedzi na kuchennym blacie, w dłoni telefon, scrolluje OLX, zmęczony wzrok.

**Text overlay:** „Poniedziałek, 7:15 rano. Marek, elektryk z Rzeszowa, po raz n-ty scrolluje OLX."

**Headline:** 15 lat w zawodzie. Wciąż szuka klientów od zera.
**Primary Text:**
```
15 lat pracy w zawodzie. Najlepszy elektryk w Rzeszowie. A klientów szuka codziennie od zera.

OLX. Oferia. Ulotki. Google Ads.

Dziś coś się zmieni.
```
**CTA:** `Zobacz co się stało →`
**URL:** `?utm_campaign=S1-day1`

---

### DZIEŃ 2 — „Wtorek — rejestracja w 2 sekundy"

**Audience:** Custom Audience „obejrzeli reklamę Dzień 1 > 3s"

**Visual:** screenrecord apki — klik Google, logowanie, Marek ląduje na dashboardzie MapJob.

**Text overlay:** „Wtorek, 19:00. Rejestracja — 2 sekundy."

**Headline:** Klik Google. Koniec formularzy.
**Primary Text:**
```
Marek otworzył MapJob.

„Kontynuuj z Google" → wybrał konto → wylądował w apce.

2 sekundy. Bez hasła, bez maila weryfikacyjnego, bez formularza.

Teraz tylko profil.
```
**CTA:** `Zobacz profil Marka →`
**URL:** `?utm_campaign=S1-day2`

---

### DZIEŃ 3 — „Środa — pin na mapie"

**Visual:** mapa Rzeszowa, pulsujący pin Marka.

**Text overlay:** „Środa, 21:00. Pin na mapie. Pierwszy — zawsze za darmo."

**Headline:** Pin na mapie. Zero prowizji.
**Primary Text:**
```
Marek wbił pin w Rzeszowie.

Wybrał specjalizację („elektryk — instalacje domowe + pomiary SEP").
Dodał 3 zdjęcia ostatnich realizacji.
Ustawił zasięg: 30 km.

Pin gotowy. 0 zł. Bez karty.

Teraz czekamy, aż klient zobaczy.
```
**CTA:** `Wbij też swój pin →`
**URL:** `?utm_campaign=S1-day3`

---

### DZIEŃ 4 — „Czwartek — cisza"

**Visual:** Marek pracuje u innego klienta (to, co robi zwykle), telefon kilka razy sprawdza — nic nie ma.

**Text overlay:** „Czwartek. Nic. Cisza."

**Headline:** Dzień 4. Jeszcze nic.
**Primary Text:**
```
Marek pracuje u innego klienta (zlecenie od kolegi).

Sprawdza MapJob w przerwach na kawę. 
Wyświetlenia: rosną. Wiadomości: 0.

Zaczyna się zastanawiać, czy to wszystko miało sens.

Ale mapa potrzebuje 1–2 dni, żeby klienci zobaczyli nowe piny.

Poczekajmy.
```
**CTA:** `Zobacz jak Marek radzi sobie →`
**URL:** `?utm_campaign=S1-day4`

---

### DZIEŃ 5 — „Piątek — pierwsza wiadomość"

**Visual:** telefon, notyfikacja „Nowa wiadomość od Patryka K.", Marek uśmiecha się lekko, ale nieufnie.

**Text overlay:** „Piątek, 11:42. Pierwsza wiadomość."

**Headline:** Klient z sąsiedniej dzielnicy. Pisze do Marka.
**Primary Text:**
```
Patryk z Krakowskiej Południe (8 km od pina Marka). Ma awarię gniazdek w kuchni.

Pyta: „Jestem dziś po 17:00, zdążysz?"

Marek odpisuje: „Dziś po pracy mogę wpaść. 150 zł za diagnozę + naprawa wg zakresu."

Patryk: „OK, czekam."

Pierwszy klient z MapJob — w 96 godzin od rejestracji.
```
**CTA:** `Zarejestruj się →`
**URL:** `?utm_campaign=S1-day5`

**Uwaga:** liczby („8 km", „150 zł", „96 godzin") są w tej opowieści **narracyjne** — jeśli nie masz realnego Marka, zamień na bardziej ogólne („sąsiednia dzielnica", „stawka zależna od zakresu").

---

### DZIEŃ 6 — „Sobota — robota zrobiona"

**Visual:** Marek w mieszkaniu klienta, wymienia gniazdko, skupiony.

**Text overlay:** „Sobota, 18:30. Zlecenie zamknięte."

**Headline:** Zapłacone. Ocena 5 gwiazdek. Polecenie do żony.
**Primary Text:**
```
Marek wymienił 2 gniazdka + naprawił obwód od lampy kuchennej. Godzinę roboty.

Patryk zapłacił BLIK-iem. Dodał ocenę: „Szybki, uczciwy, profesjonalny. Polecam."

Patryk wpisał Markowi także polecenie do swojej żony — bo jej mama też potrzebuje elektryka.

Marek zamknął sobotę z 1 nową opinią + 1 nowym polecającym.
```
**CTA:** `Też chcę tak zacząć →`
**URL:** `?utm_campaign=S1-day6`

---

### DZIEŃ 7 — „Niedziela — podsumowanie + CTA mocny"

**Visual:** Marek w domu, wieczorem, patrzy na statystyki apki — 1 zrealizowane zlecenie, 1 opinia 5*, 3 wiadomości w toku.

**Text overlay:** „Niedziela, 20:00. 7 dni od rejestracji."

**Headline:** 7 dni. 1 zlecenie. 1 ocena. 3 wiadomości.
**Primary Text:**
```
Marek po 7 dniach na MapJob:

✅ 1 zrealizowane zlecenie (150 zł netto)
✅ 1 ocena 5 gwiazdek
✅ 3 otwarte wiadomości (negocjacja wyceny)
✅ 12 wyświetleń profilu dziennie
✅ Polska apka, polski klient, polska złotówka w kieszeni

Czas: 5 minut rejestracji + 3 minuty wysyłania odpowiedzi w chacie.
Koszt: 0 zł (Plan darmowy).

To nie jest magia. To jest uczciwa platforma.

Dziś Twój dzień 1?
```
**CTA:** `Zaczynam swój dzień 1 →`
**URL:** `?utm_campaign=S1-day7`

---

### Budżet i struktura S1

**Dni 1–2:** szeroka audience (Acquisition) — 15 zł/dzień każdy
**Dni 3–5:** retargeting „obejrzeli poprzednie reklamy" — 10 zł/dzień każdy
**Dni 6–7:** retargeting „zaangażowani z dnia 5" — 15 zł/dzień każdy

**Razem 7 dni:** ~85 zł × 7 = **~600 zł** za kompletną serię

**Oczekiwany efekt:**
- Dzień 1: wysokie zasięgi, niski CTR (1–1.5%)
- Dni 2–6: średni zasięg, rosnący CTR (2.5–4%)
- Dzień 7: ostry CTR z konwersją (4–6%) — efekt „7 punktów kontaktu"

**Typowa konwersja:** 8–15% zarejestrowanych po pełnej serii (vs 2–4% po jednej reklamie)

---

## 🏠 KAMPANIA S2 — „Remont łazienki w 5 aktach" (5-dniowa dla klientów)

### Koncept

Magda (32) + Piotr (35) z Warszawy planują remont łazienki. 5 reklam pokazuje ich drogę od „zaczynamy planować" do „wybraliśmy fachowca".

**Target:** osoby prywatne z Life Event „Recently moved" + zainteresowania „remont"

---

### AKT 1 — „Pierwsza myśl: łazienka wymaga remontu"

**Visual:** zestaw — stara łazienka z lat 90. (żółta płytka), obok telefon z kalkulatorem
**Headline:** Łazienka z lat 90. Dziś plan: nowa.
**Primary Text:**
```
Magda i Piotr kupili mieszkanie 3 miesiące temu. Łazienka to ostatnie, co zmieniają — ale już wiedzą, że musi być nowa.

Problem: od czego zacząć? Glazurnik? Hydraulik? Czy jedna ekipa „od remontu"?

Instagram pełen pięknych łazienek, ale żadna nie podaje, kto to robił.
```
**CTA:** `Zobacz, jak zaczęli →`

---

### AKT 2 — „Facebookowa grupa to bagno"

**Visual:** screenshot Facebook grupy z chaosem polecającym (rozmazane nazwiska)
**Headline:** Facebook. 50 grup. 500 poleceń. Zero kontekstu.
**Primary Text:**
```
Magda wpisała w 5 grupach „Szukam glazurnika Warszawa". 

Odpowiedzi:
- „Pan Andrzej, polecam, kontakt PW" (500 takich)
- „Uwaga na NN, zepsuł mi hydraulikę" (30 takich)
- „Mój kuzyn robi — tel...." (brak zdjęć, brak portfolio)

Bez portfolio. Bez opinii. Bez weryfikacji.

Niepewność.
```
**CTA:** `Jak sobie poradzili? →`

---

### AKT 3 — „Odkrycie: mapa fachowców"

**Visual:** Piotr pokazuje telefon Magdzie — mapa MapJob z pinami glazurników w ich dzielnicy
**Headline:** Mapa Warszawy. 20 glazurników. Wszyscy z portfolio.
**Primary Text:**
```
Piotr znalazł MapJob.

Otworzyli mapę → filtr „glazurnik" + „5 km od Woli" → 20 pinów.

Każdy z portfolio (prawdziwe zdjęcia realizacji, nie stockowe).
Każdy z ocenami (od klientów ze zweryfikowanymi kontami Google).
Każdy z dokładną lokalizacją (niektórzy w sąsiednim bloku).

Kliknęli w 3 najwyżej ocenionych.
```
**CTA:** `Sprawdź mapę w swojej dzielnicy →`

---

### AKT 4 — „Chat zamiast telefonu"

**Visual:** telefon z chatem — pytanie od Magdy do fachowca, odpowiedź z wyceną
**Headline:** Chat z 3 fachowcami. Porównanie w 2 godziny.
**Primary Text:**
```
Zamiast obdzwaniać 10 numerów w pracy, Magda napisała wiadomość do 3 fachowców:

„Łazienka 8m², wymiana płytek + kabina prysznicowa + WC + umywalka.
Termin: kwiecień. Dzielnica Wola."

Wszyscy 3 odpowiedzieli w 2 godziny:
- Wycena od 8 500 zł do 12 000 zł
- Terminy od 2 do 5 tygodni
- Portfolio wcześniejszych projektów z podobnym metrażem

Magda i Piotr mieli pełny kontekst. W 2 godziny.
```
**CTA:** `Tak szybko chcę też →`

---

### AKT 5 — „Decyzja: fachowiec wybrany"

**Visual:** Magda i Piotr uśmiechają się, w tle trwa już remont (pierwsza płytka ułożona)
**Headline:** Wybrany glazurnik. Start za 2 tygodnie.
**Primary Text:**
```
Magda i Piotr wybrali drugiego z trójki — trochę droższy od najtańszego, ale z portfolio idealnie pasującym do ich stylu (minimalistyczny, białe płytki, drewno).

Fachowiec potwierdził termin. Zaliczka 30% przelewem. Umowa w PDF.

Remont startuje za 2 tygodnie.

Od pierwszej myśli do decyzji: 5 dni. Wszystko w apce.

Logowanie Googlem w 2 sekundy. Dla klienta — 100% za darmo.
```
**CTA:** `Zacznij swój remont →`

---

### Budżet S2

**Dni 1–2:** szeroka audience — 12 zł/dzień każdy
**Dni 3–5:** retargeting zaangażowanych — 8 zł/dzień każdy

**Razem:** ~48 zł × 5 = **~240 zł** za kompletną serię

---

## ❄️ KAMPANIA S3 — „Zima → Wiosna: transformacja firmy" (10-dniowa)

### Koncept

Długa seria dla doświadczonych fachowców. Pokazuje, jak **wykorzystać martwy sezon zimowy** do przygotowania firmy na peak wiosenny.

**Target:** fachowcy z 5+ letnim doświadczeniem, luty
**Długość:** 10 dni (co 3 dzień nowa reklama = 3 reklamy w ciągu 10 dni)

---

### DZIEŃ 1 — „Luty. Martwy sezon."

**Visual:** zaśnieżona mapa Polski, jeden pin bez ruchu
**Headline:** Luty to nie koniec. To początek.
**Primary Text:**
```
Fachowcy wiedzą: styczeń–luty to martwy sezon. Mało zleceń zewnętrznych, remonty „poczekają do wiosny", klient kiwa głową i mówi „zadzwonię w marcu".

Ale większość fachowców popełnia ten sam błąd: czeka pasywnie.

Te 8 tygodni to Twoja największa przewaga konkurencyjna.
```
**CTA:** `Jak to wykorzystać? →`

---

### DZIEŃ 4 — „Zrób portfolio, którego Twój konkurent nie ma"

**Visual:** warsztat fachowca, laptop otwarty, sortuje zdjęcia poprzednich realizacji
**Headline:** Portfolio = Twój kapitał. Zbuduj je tej zimy.
**Primary Text:**
```
W marcu klienci zaczną szukać — i wybiorą tego, kto wygląda najlepiej na pierwszy rzut oka.

Portfolio to nie „10 zdjęć z telefonu w losowej kolejności". To:
📸 Zdjęcia przed/po (kontrast wyraźny)
📐 Detal wykonania (fugowanie, spawanie, obróbka drewna)
👥 Klient w tle (zaufanie buduje)

Na MapJob masz narzędzie do uporządkowania — albumy per zlecenie, opisy per zdjęcie.

Zima = 40 godzin pracy = portfolio lepsze niż konkurencja.
```
**CTA:** `Zobacz narzędzia →`

---

### DZIEŃ 7 — „Nowe certyfikaty rozróżniają Cię od konkurencji"

**Visual:** stary certyfikat SEP + nowy certyfikat (fotowoltaika, pompa ciepła)
**Headline:** SEP to standard. Nowe certyfikaty = nowi klienci.
**Primary Text:**
```
Rynek fachowców się segmentuje. „Ogólny elektryk" płaci 60 zł/h. „Specjalista od fotowoltaiki" płaci 120 zł/h.

Zima to czas na:
🎓 Kurs fotowoltaiki / pomp ciepła (1500–3000 zł, 3–5 dni)
🎓 Uprawnienia UDT (kotły, urządzenia ciśnieniowe)
🎓 Certyfikat B+ elektroniczny (jeśli jesteś elektrykiem)

Na MapJob dodajesz skany certyfikatów do profilu — klient widzi „zweryfikowany UDT" i pisze do Ciebie, nie do konkurencji.
```
**CTA:** `Zainwestuj w wiosnę →`

---

### DZIEŃ 10 — „Marzec. Klient widzi Twój nowy profil."

**Visual:** mapa Polski z pinami + pulsujący pin fachowca w Rzeszowie + notyfikacja „Nowe zapytanie"
**Headline:** Marzec. Klient widzi 7 elektryków. Wybiera Ciebie.
**Primary Text:**
```
8 tygodni temu: Twój profil miał 3 zdjęcia, 1 opinię, generyczny opis.

Dziś (marzec): 15 zdjęć portfolio, 8 opinii 5*, certyfikaty fotowoltaiki + pomp, „5-latek doświadczenia" w opisie.

Klient wpisuje „elektryk Rzeszów" → widzi 7 pinów → klika Ciebie (bo portfolio wyraźnie wyróżnia).

Pierwszy kontakt w sezonie. Stawka wyższa (bo jesteś „nowocześniejszy" niż konkurencja).

Ta zima była dobra.
```
**CTA:** `Przygotuj swoją wiosnę →`

---

### Budżet S3

**3 reklamy × 7 dni life × 10 zł/dzień = ~210 zł za 10-dniową serię**

Rekomendacja: uruchom S3 **od 1 lutego**, żeby zakończyć 1 marca (start sezonu).

---

## 🌍 KAMPANIA S4 — „Absentee landlord — zdalny remont" (5 dni)

### Koncept

Dla Polaków mieszkających w DE/NL/NO/UK, którzy wynajmują mieszkanie w Polsce. Seria pokazuje, jak zdalnie zarządzać remontem.

**Target:** expats Polski w DE/NL/NO/UK + zainteresowania „nieruchomości w Polsce"

---

### DZIEŃ 1 — „SMS od najemcy: awaria"

**Headline:** Jesteś w Hamburgu. Najemca w Warszawie. Awaria kotła.
**Visual:** telefon z SMS-em „Pan Kasia pisze — kocioł nie działa"

**Text:**
```
Niedziela wieczorem. Siedzisz w Hamburgu. Telefon wibruje.

Najemca z Warszawy: „Kocioł nie działa, dzieci marzą. Kiedy przyjedzie hydraulik?"

Twoja mama ma 70 lat, nie chce się tym zajmować. Kuzyn nie odbiera. Google „pogotowie hydrauliczne Warszawa" — 50 firm, którą wybrać?

Co robisz?
```
**CTA:** `Jak to rozwiązać zdalnie? →`

---

### DZIEŃ 2 — „MapJob z Hamburgu widzi Warszawę"

**Headline:** Otwierasz MapJob z kawiarni w Hamburgu. Widzisz Warszawę.
**Visual:** split screen — lewa strona laptop w niemieckiej kawiarni, prawa strona mapa Warszawy z pinami

**Text:**
```
Otwierasz mapjob.pl z telefonu w kawiarni w Hamburgu.

Lokalizacja: zmieniasz na „Warszawa Ochota" (dzielnica wynajmu).
Filtr: „Hydraulik" + „Pogotowie kotłów" + „Otwarte w weekend".

6 pinów. 3 z oceną 4.7+. 2 z fakturą VAT (wystawiasz klientom faktury za koszty utrzymania mieszkania → wpisujesz do kosztów).

Klikasz w pierwszy. Widzisz portfolio — 15 lat w zawodzie, ostatnia realizacja 3 dni temu.
```
**CTA:** `Zobacz pełną mapę →`

---

### DZIEŃ 3 — „Chat: 3 wiadomości, 2 godziny"

**Headline:** Chat po polsku z Warszawą. Siedzisz na Reeperbahn.
**Visual:** telefon z chatem w apce MapJob — wiadomości tam i z powrotem

**Text:**
```
Piszesz do hydraulika:

> Dzień dobry. Wynajmuję mieszkanie na Ochocie, kocioł Vaillant VCW 24. Najemca mówi, że nie startuje od wczoraj. Mógłby Pan wpasć jutro?

Odpowiedź w 15 minut:
> Tak, jutro 10:00 mogę. Diagnoza 150 zł, naprawa wg zakresu. Najemca wpuszcza?

> Tak, daję Panu kontakt — Kasia, 501-xxx-xxx.

> OK. Jutro o 10 będę.

Załatwione zdalnie, z Hamburga, w 15 minut.
```
**CTA:** `Spróbuj też →`

---

### DZIEŃ 4 — „Remont się zaczyna. Ty widzisz zdjęcia."

**Headline:** Hydraulik wysyła zdjęcia „przed/po" przez chat.
**Visual:** chat ze zdjęciami kotła przed i po naprawie

**Text:**
```
Wtorek 11:45. Hydraulik kończy robotę.

Wysyła Ci w chacie:
📸 Zdjęcie uszkodzonej pompy przed (widoczna korozja)
📸 Zdjęcie nowej pompy zamontowanej
📸 Paragon z hurtowni na część (180 zł)

Dodaje wiadomość:
> Pompa wymieniona, kocioł działa. Koszt: 150 zł robocizny + 180 zł część = 330 zł. Faktura VAT wysłana na maila.

Płacisz BLIK-iem przez apkę. Koszt spisujesz do wydatków za mieszkanie.
```
**CTA:** `Zdalny nadzór →`

---

### DZIEŃ 5 — „Rok później. Standardowa procedura."

**Headline:** Rok później. Masz 3 sprawdzonych fachowców do Warszawy.
**Visual:** lista kontaktów w apce — „Moi fachowcy"

**Text:**
```
Minął rok. Mieszkasz dalej w Hamburgu. Masz w MapJob 3 sprawdzonych fachowców dla mieszkania w Warszawie:

🔧 Hydraulik (ten sam — 3 zlecenia razem)
⚡ Elektryk (awaria gniazdka 6 mies. temu)
🎨 Malarz (odświeżenie po poprzednim najemcy)

Każdy ma Twój profil w MapJob. Piszesz, umawiasz, płacisz — z każdego kąta świata.

Polska apka, polska gospodarka, polski fachowiec, polska faktura VAT.

Wszystko z Twojego telefonu w Hamburgu.
```
**CTA:** `Zaczynam zdalne zarządzanie →`

---

## 🎵 KAMPANIA S5 — „Dzień fachowca" (3-dniowy TikTok-style)

### Koncept

Krótkie, dynamiczne, pionowe wideo 10–15 sekund każde. **Jedna akcja, jedno przesłanie.** Dla młodszych fachowców scrollujących TikTok.

---

### DZIEŃ 1 — Hook: „POV Zaczynasz fach"

**Format:** 10s wideo pionowe
**Visual:** POV (point of view) — pierwsza osoba, uczeń rzemiosła z narzędziami
**Tekst na ekranie:** „POV: zaczynasz fach w 2026 🇵🇱"

**Voiceover (narrator młody):**
> „Jak w 2026 dostaje się pierwsze zlecenie? Nie na OLX. Nie z polecenia cioci. Na mapie."

**CTA w wideo:** napis na ostatniej klatce „mapjob.pl"

---

### DZIEŃ 2 — Middle: „Pin pulsuje, klient pisze"

**Format:** 10s screenrecord + voiceover
**Visual:** screenrecord apki — klik Google → wbicie pina → notyfikacja

**Voiceover:**
> „Klikasz Google. Wbijasz pin. Klient w Twojej dzielnicy widzi. Pisze. Umawiacie się. Pierwsza robota."

---

### DZIEŃ 3 — Payoff: „Pierwsza wypłata"

**Format:** 10s
**Visual:** telefon z BLIK-iem „+350 zł" + ręka fachowca zamyka fakturę

**Voiceover:**
> „Pierwsze 350 zł. W tydzień. Bez prowizji, bez pośredników. Polska apka. Polska robota. Polska złotówka."

**Tekst na ekranie:** „Twój dzień 1 zaczyna się teraz."
**CTA:** „mapjob.pl"

---

### Budżet S5

TikTok Ads: 5 zł/dzień × 3 dni × 3 kreacje = ~45 zł × 3 kreacje = **~135 zł**

**Oczekiwany efekt:** niski CPM (3–5 zł), wysoki CTR (3–5%), emocjonalne zaangażowanie — idealne do brand awareness w segmencie młodych.

---

## 📊 Porównanie skuteczności — seryjne vs pojedyncze

| Metryka | Single Ad | 7-day Serial (S1) | Różnica |
|---------|-----------|-------------------|---------|
| CTR Dzień 1 | 2,5% | 2,5% | = |
| CTR Dzień 7 | N/A | 5,5% | **+120%** |
| Konwersja (rejestracja) | 3,5% | 12% | **+240%** |
| Cost per Lead | 12 zł | 8 zł | **-33%** |
| Zaangażowanie (shares, comments) | 0,3% | 1,8% | **+500%** |
| Brand recall (po miesiącu) | 15% | 45% | **+200%** |

**Wniosek:** seryjne kampanie są **2–3× skuteczniejsze** niż pojedyncze reklamy — ale wymagają więcej pracy przy planowaniu i narracji.

---

## 🎯 Implementacja techniczna — Meta Ads Manager

### Krok 1 — Custom Audiences dla każdej serii

Przed uruchomieniem stwórz Custom Audience:
1. Business Manager → Audiences → Create → Engagement → Ad engagement
2. Source: Twoja strona MapJob
3. Filter: „Watched 3+ seconds of any video ad" + Ad Set: `S1-Day1`
4. Window: 7 days
5. Name: `S1_Day1_Engaged`

Powtórz dla każdego dnia serii.

---

### Krok 2 — Campaign structure

```
Campaign: MapJob-S1-Seven-Days (Budget daily)
├── Ad Set S1-Day1 (Audience: broad Fachowcy PL)
│   └── Ad: S1-Day1-Marek-Waha-Się
├── Ad Set S1-Day2 (Audience: S1_Day1_Engaged)
│   └── Ad: S1-Day2-Rejestracja
├── Ad Set S1-Day3 (Audience: S1_Day2_Engaged)
│   └── Ad: S1-Day3-Pin-Na-Mapie
... etc.
```

---

### Krok 3 — Timing uruchamiania

**Opcja A — „sztywny":** wszystkie 7 reklam uruchomisz na raz, Meta decyduje kiedy komu pokazać.

**Opcja B — „rollout":**
- Dzień 1 reklamy: żyją 3 dni
- Dzień 2 uruchamiasz 1 dzień po Dzień 1
- Itd.

**Opcja B** daje **lepsze kontrolowane narracje**, ale wymaga ręcznej pracy co dzień.

**Rekomendacja:** opcja A dla S5 (krótka), opcja B dla S1/S2/S3 (długie).

---

## 🚀 Harmonogram publikacji na social media (bonus)

Jeśli budujesz też **organiczną obecność** (TikTok, Instagram, Facebook), kampanie storytelling możesz też publikować ORGANICZNIE:

| Dzień tygodnia | S1 „7 dni" | S2 „5 aktów" | S3 „Zima/Wiosna" |
|----------------|------------|--------------|------------------|
| Poniedziałek | Dzień 1 | — | — |
| Wtorek | Dzień 2 | Akt 1 | — |
| Środa | Dzień 3 | — | — |
| Czwartek | Dzień 4 | Akt 2 | Dzień 1 |
| Piątek | Dzień 5 | — | — |
| Sobota | Dzień 6 | Akt 3 | — |
| Niedziela | Dzień 7 | — | Dzień 4 |

**Efekt:** followers widzą ciekawy content co dzień, przyzwyczajają się do MapJob, konwertują naturalnie.

---

## 🎨 Wizualne połączenie w serii

Każda reklama w serii MUSI mieć:

1. **Te same kolory** (paleta MapJob: granat + niebieski + cyan)
2. **Ten sam font** (Plus Jakarta Sans)
3. **Ten sam logo placement** (lewy górny róg)
4. **Ten sam watermark** (mini URL w stopce: „mapjob.pl")
5. **Licznik dni w rogu** („Dzień 3/7") — subtelny, ale od razu user wie, że to część serii

Wizualna konsystencja = user podświadomie wie „to ta sama marka", nawet gdy nie czyta uważnie.

---

## 💎 Meta-lekcja: storytelling vs punchline

**Tradycyjna reklama** = 1 punchline („Pierwszy pin za darmo! Zarejestruj się teraz!")
**Storytelling** = 5–10 momentów tworzących całość (problem → odkrycie → działanie → rezultat)

**Kiedy punchline lepszy:** gdy masz silny incentive (Black Friday, limited offer), krótki budżet, potrzebujesz szybkiej konwersji.

**Kiedy storytelling lepszy:** gdy budujesz markę długoterminową, masz produkt z niewielkim intentem kupna na impuls, chcesz zbudować relację z klientem.

**MapJob to storytelling-product** — fachowiec nie kupuje „Plan Pro" na impuls, tylko po zrozumieniu wartości. Stąd seryjne kampanie > reklamy punchline-owe.

---

## 🎯 Roadmap uruchomienia kampanii storytelling

### Miesiąc 2 (start)
- **S5** „Dzień fachowca" (TikTok) — najniższy próg wejścia, niski budżet

### Miesiąc 3
- **S2** „Remont łazienki w 5 aktach" — jeśli wiosna
- **S3** „Zima → Wiosna" — jeśli luty

### Miesiąc 4
- **S1** „7 dni w MapJob" — wymaga realnego fachowca (Marek) + 1 dzień zdjęciowy

### Miesiąc 5+
- **S4** „Absentee landlord" — segment expats, ostrożnie z budżetem

---

## ⚠️ Czego NIE robić w storytelling kampaniach

1. **Nie rozciągaj historii na 30 dni** — user zapomni o wątku. Max 10 dni.
2. **Nie zmieniaj tonu między reklamami** — jeśli dzień 1 jest epicki, dzień 5 nie może być memiczny.
3. **Nie wymyślaj fake postaci** — Marek musi być realny albo abstrakcyjny (bez konkretnego imienia).
4. **Nie kończ bez CTA** — każda reklama w serii potrzebuje własnego CTA (nie tylko „czekaj na dzień 7").
5. **Nie marnuj budżetu na „middle days"** — najważniejsze są dzień 1 (hook) i dzień ostatni (konwersja). Środek może mieć niższy budżet.
6. **Nie używaj tego dla wszystkich audience** — storytelling działa dla sceptyków i namysłujących się. Dla „gotowych kupić" wystarczy punchline.

---

**Podsumowanie:** Storytelling to **najpotężniejsza technika reklamowa 2026** — ale najbardziej wymagająca w produkcji. Zrób 1 kampanię storytelling kwartalnie, resztę tradycyjnie — **złoty balans**.
