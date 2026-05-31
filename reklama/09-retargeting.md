# Retargeting — 5 ścieżek remarketingu (playbook)

**Zasada:** zimna reklama kosztuje 15–25 zł za rejestrację. Retargeting kosztuje 3–8 zł. Każda złotówka w remarketingu zwraca 3–5× więcej niż w acquisition.

**Kiedy uruchomić:** po zbudowaniu audience — minimum **1 000 odwiedzających** na stronie (zwykle po tygodniu kampanii A + B).

---

## ⚠️ Uczciwe retargetingowanie (zmiana od poprzedniej wersji)

Poprzednia wersja tego pliku używała fake'owej scarcity („Zostało 127 z 500 miejsc"), fake'owych testymoniali („Marek zwrócił mu się 10×") i fake'owych kodów promocyjnych bez podparcia.

**Teraz: uczciwie.** Scarcity tylko jeśli jest realna (np. „Plan Wspierający dostępny do końca miesiąca" — ale TYLKO jeśli taka decyzja jest w admin panelu). Kody promo — tylko te które rzeczywiście są w Stripe.

Poniższe reklamy bazują na **realnych faktach o produkcie** i **sensownym FOMO** („jesteśmy w fazie startu").

---

## 🎯 ŚCIEŻKA 1 — „Porzucony koszyk" (Abandoned Checkout)

**Target:** otworzył Stripe Checkout, ale nie dokończył płatności w ciągu 7 dni
**Custom Audience:** `InitiatedCheckout_14d` **MINUS** `Purchased_180d`
**Spodziewany CPL:** 5–8 zł (CAC: 20–40 zł — to są klienci o wysokim intent)
**Budżet:** 10 zł/dzień

### Reklama R1 — „Zostałeś na kroku przed płatnością"

**Headline (wariant A):** Zostałeś na kroku przed Plan Pro. Wrócisz?
**Headline (wariant B):** 79 zł/mies — a pierwsze zlecenie zwróci to 10×.

### Primary Text
```
Widziałem — otworzyłeś Plan Pro, ale nie dokończyłeś.

Wiem. 79 zł miesięcznie to decyzja.

Co dostajesz:
🎯 Pełny dostęp do Giełdy Zleceń (kontrakty od 1 800 zł)
📊 Statystyki wyświetleń Twojego profilu
🏆 Przewaga w wynikach wyszukiwania — klient widzi Cię pierwszego
⭐ Możesz składać oferty na wszystkie zlecenia

Pierwsza wiadomość od klienta zwraca koszt abonamentu 10×.
```
**CTA:** `Dokończ rejestrację`
**URL:** `https://mapjob.pl/?view=pricing&utm_source=fb&utm_medium=cpc&utm_campaign=R1-abandoned&utm_content=A`

**Uwaga o zniżce:** *Jeśli* w admin panelu MapJob istnieje aktywna promocja (np. „PIN20 — pierwszy miesiąc -20%"), wtedy dopisz: **„Mamy dla Ciebie kod: PIN20 — pierwszy miesiąc 63 zł zamiast 79."** Jeśli takiej promocji NIE MA w Stripe → nie pisz (bo user wklei kod i zobaczy błąd → zła opinia).

---

## 🎯 ŚCIEŻKA 2 — „Pricing Viewers" (widzieli cennik, nie otworzyli Stripe)

**Target:** odwiedzili `/pricing` (lub podobny widok), nie kliknęli „Kup"
**Custom Audience:** `Pricing_Viewers_30d` **MINUS** `InitiatedCheckout_14d`
**Spodziewany CPL:** 8–12 zł
**Budżet:** 10 zł/dzień

### Reklama R2 — „Pakiet Wspierający — jednorazowo, bez abonamentu"

**Headline (wariant A):** Nie lubisz abonamentów? Pakiet Wspierający — 200 zł jednorazowo.
**Headline (wariant B):** Plan Pro bez miesięcznej płatności — przez 5 lat.

### Primary Text
```
Widziałeś cennik MapJob. Rozumiem — 79 zł/mies to powtarzalny koszt, a polscy fachowcy nie lubią subskrypcji.

Jest lepsza opcja: **Pakiet Wspierający — 200 zł jednorazowo za 5 lat pełnego dostępu.**

Co dostajesz za 200 zł:
✅ Plan Pro przez 5 lat (bez comiesięcznych opłat)
✅ Portfolio Pro (dodatkowe zdjęcia w galerii)
✅ Pełna Giełda Zleceń — 5 lat
✅ Płatność BLIK — bez karty, bez subskrypcji

Jeden raz płacisz, pięć lat korzystasz. Polska apka, polska cena.
```
**CTA:** `Wybieram Pakiet Wspierający`
**URL:** `https://mapjob.pl/?view=pricing&utm_source=fb&utm_medium=cpc&utm_campaign=R2-pricing&utm_content=supporter`

**Dlaczego to działa:**
- **Unikanie subskrypcji** — polska kultura mniej lubi abonamenty niż np. amerykańska
- **Jednorazowa płatność** — psychologicznie łatwiej niż „79 zł co miesiąc, na zawsze"
- **BLIK** — dla ludzi bez karty kredytowej (ważne w Polsce)

---

## 🎯 ŚCIEŻKA 3 — „Visitors nie rejestrowali" (zimni ale zainteresowani)

**Target:** byli na stronie, nie zarejestrowali się w 30 dni
**Custom Audience:** `Visitors_All_30d` **MINUS** `Registered_90d`
**Spodziewany CPL:** 10–15 zł
**Budżet:** 10 zł/dzień

### Reklama R3 — „Dlaczego jeszcze nie masz pina?"

**Format:** Carousel (3 karty — najczęstsze wątpliwości + odpowiedzi)

### Primary Text (wspólny)
```
Widzisz MapJob od kilku dni. Wahasz się?

Rozwiewam 3 najczęstsze wątpliwości ⬇️
```

### Karta 1 — „To kolejna platforma co nic nie daje"
- **Headline:** „Ale czy to nie kolejna platforma bez zleceń?"
- **Description:** MapJob nie obiecuje zleceń — daje Ci widoczność. Klient widzi pin, portfolio, oceny → pisze bezpośrednio. Bez prowizji, bez pośredników.
- **Obraz:** mockup #13 — screen mapy z pinem + chat z klientem

### Karta 2 — „Kosztuje czy nie?"
- **Headline:** „Ile kosztuje MapJob?"
- **Description:** Pierwszy pin — zawsze 0 zł. Bez karty. Bez abonamentu startowego. Płacisz tylko jak chcesz więcej (Plan Pro = Giełda Zleceń, Portfolio Pro).
- **Obraz:** mockup #14 — cennik apki (layout z prawdziwego cennika)

### Karta 3 — „Ile to zajmie?"
- **Headline:** „Ile czasu na rejestrację?"
- **Description:** Logowanie Googlem — 2 sekundy. Wbicie pina — 2–3 minuty. Dodanie zdjęć portfolio — 5 minut. Gotowe. Klient zaczyna widzieć Cię tego samego dnia.
- **Obraz:** mockup #15 — zegar odliczający 2s → pin pojawia się na mapie

### CTA (na każdej karcie)
`Wypróbuj za darmo`
**URL:** `https://mapjob.pl/?utm_source=fb&utm_medium=cpc&utm_campaign=R3-visitors&utm_content=carousel`

---

## 🎯 ŚCIEŻKA 4 — „Map Viewers" (klienci otwierali mapę, nie napisali)

**Target:** otworzyli mapę (`?view=map`), nie skontaktowali się z fachowcem
**Custom Audience:** `Map_Viewers_30d` **MINUS** `Registered_90d`
**Spodziewany CPL:** N/A (to ruch, nie lead)
**Budżet:** 5 zł/dzień

### Reklama R4 — „Nie znalazłeś? Opublikuj zlecenie"

**Headline (wariant A):** Nie znalazłeś fachowca? Opublikuj swoje zlecenie.
**Headline (wariant B):** Odwróć sytuację — niech fachowcy zgłoszą się do Ciebie.

### Primary Text
```
Szukałeś fachowca na mapie, ale nie znalazłeś tego idealnego?

Opublikuj zlecenie na Giełdzie — fachowcy sami zgłoszą się do Ciebie.

📝 Opisz pracę + lokalizację + budżet
⏱️ Fachowcy widzą zlecenie na żywo
✅ Wybierasz najlepszą ofertę
💬 Kontakt bezpośredni, bez pośrednika

Publikacja zlecenia: 0 zł dla klienta.

Logowanie Googlem — 2 sekundy.
```
**CTA:** `Dodaj zlecenie`
**URL:** `https://mapjob.pl/?view=tenders&utm_source=fb&utm_medium=cpc&utm_campaign=R4-mapviewers&utm_content=publish`

---

## 🎯 ŚCIEŻKA 5 — „Po rejestracji — upsell na Plan Pro" (najcenniejszy!)

**Target:** zarejestrowani w ostatnich 14 dniach, nie kupili planu
**Custom Audience:** `Registered_90d` **MINUS** `Purchased_180d`, ograniczone do ostatnich 14 dni
**Spodziewany CPL:** N/A (cel: `Purchase`, nie `Lead`)
**Budżet:** 10 zł/dzień (DUŻY — ta audience płaci)

### Reklama R5a — „Twój pierwszy tydzień w MapJob"

**Headline (wariant A):** Zarejestrowany od tygodnia? Następny krok to Plan Pro.
**Headline (wariant B):** Twój pin już dostaje wyświetlenia. Odblokuj Giełdę Zleceń.

### Primary Text
```
Zarejestrowałeś się na MapJob — super.

Widzisz już wyświetlenia swojego pina? To znaczy że klienci w Twojej okolicy Cię zauważają. Pora na kolejny krok.

**Plan Pro (79 zł/mies):**
🎯 Pełny dostęp do Giełdy Zleceń — kontrakty od 1 800 zł
📊 Statystyki wyświetleń Twojego profilu
🏆 Przewaga w wynikach wyszukiwania
⭐ Składanie ofert na wszystkie zlecenia

Pierwszy miesiąc Plan Pro — anuluj, jeśli nie przyniesie pierwszego zlecenia w 30 dni.
```
**CTA:** `Aktywuj Plan Pro`
**URL:** `https://mapjob.pl/?view=pricing&utm_source=fb&utm_medium=cpc&utm_campaign=R5-upsell&utm_content=pro`

**Uwaga:** zwrot „anuluj jeśli nie przyniesie pierwszego zlecenia w 30 dni" — użyj **TYLKO** jeśli MapJob rzeczywiście ma taką politykę zwrotów (trzeba sprawdzić regulamin w [index.html](../index.html)). Jeśli nie — usuń ostatnie zdanie.

---

### Reklama R5b — „Dla zarejestrowanych — Pakiet Wspierający"

**Headline (wariant A):** Zarejestrowany? Masz pierwszeństwo do Pakietu Wspierającego.
**Headline (wariant B):** Jednorazowo 200 zł = 5 lat Plan Pro. Tylko dla zarejestrowanych.

### Primary Text
```
Hej — jesteś już na MapJob. Dziękujemy za zaufanie.

Mamy ofertę dla zarejestrowanych:

**Pakiet Wspierający — 200 zł jednorazowo.**
5 lat Plan Pro + Portfolio + pełna Giełda.

Bez abonamentu. Bez subskrypcji. Płacisz raz, korzystasz 5 lat.

Polska apka, polscy fachowcy, polska cena.
```
**CTA:** `Wspieram MapJob`
**URL:** `https://mapjob.pl/?view=pricing&utm_source=fb&utm_medium=cpc&utm_campaign=R5-upsell&utm_content=supporter`

---

## 📊 Rozkład budżetu retargetingu (tydzień 3+)

| Ścieżka | Budżet/dzień | Priorytet |
|---------|--------------|-----------|
| **R1** — Abandoned Checkout | 10 zł | ⭐⭐⭐ KRYTYCZNY (najwyższy intent) |
| **R2** — Pricing Viewers | 10 zł | ⭐⭐⭐ |
| **R3** — Visitors Carousel | 10 zł | ⭐⭐ |
| **R4** — Map Viewers | 5 zł | ⭐ |
| **R5** — Post-reg upsell | 10 zł | ⭐⭐⭐ NAJLEPSZY ROAS |

**Razem retargeting (tydzień 3+):** 45 zł/dzień = 315 zł/tydz.

**Proporcja acquisition vs retargeting w tygodniu 3:**
- Acquisition (Kampania A + B): ~50 zł/dzień
- Retargeting: ~45 zł/dzień
- **Razem: 95 zł/dzień** (blisko celu 100 zł/dzień)

**Dlaczego retargeting dostaje prawie tyle co acquisition?** Bo retargeting **natychmiast się zwraca** (wysoki intent), a acquisition zwraca się dopiero po kilku tygodniach (learning phase). Retargeting = cashflow, acquisition = wzrost audience.

---

## 🚫 Wykluczenia (żeby reklamy się nie kanibalizowały)

Z **każdej** ścieżki retargetingu WYKLUCZ:
- `Purchased_180d` (nie reklamuj tym, co już zapłacili)
- Reklama R1 **wyklucza** osoby z R5 (i odwrotnie) — żeby ta sama osoba nie widziała dwóch różnych ofert naraz

**Hierarchia pokazywania reklam jednej osobie (w kolejności priorytetu):**
1. Najpierw R5 (post-reg upsell) — jeśli user zarejestrowany
2. Potem R1 (abandoned checkout) — jeśli otwierał Stripe
3. Potem R2 (pricing viewers) — jeśli widział cennik
4. Potem R3 (visitors) — dla ogółu
5. R4 (map viewers) — tylko dla klientów, nie fachowców

---

## ⏰ Częstotliwość i „cooldown"

- **Frequency cap:** max 3 wyświetlenia na osobę w 7 dni (ustaw w Ad Set)
- **Cooldown:** po 30 dniach bez akcji → zabij audience (zmień okno na 14 dni)
- **Burn-out:** jeśli CTR spada o 30% w ciągu tygodnia → zmień kreacje

---

## 💎 Pro-tip — Dynamic Creative (dla ścieżki R3)

Zamiast ręcznie robić 10 wariantów reklamy R3:

1. Meta → Ad → Format → **Dynamic Creative**
2. Wrzuć: 5 headline'ów, 5 obrazków, 5 primary text, 3 CTA
3. Meta sama testuje kombinacje (5×5×5×3 = 375 wariantów)
4. Po 500 wyświetleniach Meta pokazuje, które kombinacje działają

To oszczędność 80% czasu vs. ręczne A/B.

---

## 🎯 Oczekiwane rezultaty retargetingu (po 30 dniach)

Dla budżetu 45 zł/dzień × 30 dni = 1 350 zł:

| Ścieżka | Expected Conversions | Expected Revenue |
|---------|----------------------|------------------|
| **R1** (Abandoned Checkout) | 15 purchases × 79 zł | ~1 200 zł |
| **R2** (Pricing → Wspierający) | 5 purchases × 200 zł | ~1 000 zł |
| **R3** (Visitors → Registration) | 30 registrations | 0 zł direct (ale LTV!) |
| **R4** (Map viewers → clients) | 20 registrations klientów | 0 zł direct (paliwo) |
| **R5** (Post-reg upsell) | 12 purchases × 79 zł | ~950 zł |

**Razem:** ~30 purchases, ~3 150 zł revenue
**ROAS retargetingu:** 3 150 / 1 350 = **2.3** 🔥

**Ten ROAS jest kluczowy** — acquisition ma ROAS ~0.5–1.0 w tygodniu 1–2, retargeting podnosi średnią kampanii do 1.5–2.0.

**Bez retargetingu nie dochodzimy do break-even.**

---

## 💡 Kiedy NIE robić retargetingu

- **Visitors < 500:** audience za mały, koszty CPM wystrzelą w kosmos (50+ zł). Czekaj.
- **Nie masz retoryki „czemu wróć":** reklama retargetingu musi odpowiadać na niewypowiedziane wątpliwości usera. Jeśli go na stronie spłoszyło coś konkretnego (np. wysoka cena) — copy musi to adresować.
- **Produkt nie jest jeszcze ready:** jeśli landing page ma bugi, mapa nie ładuje się na mobile, chat nie działa — retargeting tylko pogorszy opinię. **Najpierw produkt, potem retargeting.**

---

## 🎯 Pierwszy retargeting jaki włączasz (rekomendacja)

Jeśli jesteś nowy w Meta Ads, włącz **tylko R1 + R5** w tygodniu 3. Po 2 tygodniach dorzuć R2. Reszta w miesiącu 2.

Nie próbuj ogarnąć 5 ścieżek naraz — poznasz tylko metryki, nie naukę jaka kreacja działa.
