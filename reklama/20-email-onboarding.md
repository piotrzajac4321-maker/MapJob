# Email & SMS Onboarding — funnel po rejestracji

**Cel:** po rejestracji (event `CompleteRegistration`) nowy user wchodzi w **sekwencję 7 maili** w ciągu 30 dni. Celem jest: **aktywacja → monetyzacja → retencja**.

**Metryki kluczowe:**
- **D1 retention** (czy user wrócił w drugi dzień) — cel: > 40%
- **D7 retention** (czy wrócił w tydzień) — cel: > 25%
- **D30 conversion** (Plan Pro) — cel: > 8%
- **Churn rate** (nieaktywni przez 30 dni) — cel: < 50%

**Technologia:** MapJob może użyć:
- **Resend** (już w CSP!) — `api.resend.com` dopisane
- **Postmark** — transakcyjne maile (alternatywa)
- **Supabase Auth** — ma wbudowane trigger emails
- **Custom edge function** + cron (Supabase) → Resend

---

## 📧 7-emailowa sekwencja (fachowcy)

### 📨 Email #1 — Welcome (natychmiast po rejestracji, 0 min opóźnienia)

**Subject:** Witaj na MapJob, [imię] — zaczynamy?
**Preview text:** Twoje konto jest gotowe. Oto co zrobić w następne 5 minut.

**Body (HTML + plaintext):**

```
Cześć [imię]!

Cieszymy się, że jesteś. Założenie konta zajęło Ci 2 sekundy — reszta też nie powinna być dłuższa.

3 kroki, żeby Twój pin pojawił się na mapie:

  1. Wybierz swój zawód
  2. Dodaj zdjęcie profilowe + 2–3 zdjęcia portfolio
  3. Wpisz obszar pracy (miasto + zasięg km)

To wszystko. Pierwszy pin zostaje na mapie — zawsze za darmo.

👉 [Dokończ profil — 3 minuty](https://mapjob.pl/?view=profile-setup)

Masz pytanie? Po prostu odpowiedz na tego maila — piszę osobiście.

Pozdrawiam,
[założyciel MapJob]

PS: Jeśli nie założyłeś tego konta, możesz je usunąć jednym kliknięciem [tutaj](https://mapjob.pl/unsubscribe).
```

**Timing:** natychmiast (trigger: `CompleteRegistration` event)
**CTA:** przycisk „Dokończ profil"
**Unsubscribe link:** ZAWSZE w stopce (RODO + CAN-SPAM)

---

### 📨 Email #2 — „Twój pin jeszcze nie jest na mapie" (24h)

**Subject:** [imię], Twój pin jeszcze nie jest na mapie 🔴
**Preview:** Klient w Twojej okolicy nie widzi Cię — bo brak zdjęć.

**Wysyłany tylko jeśli** user NIE dodał pina w ciągu 24h od rejestracji.

```
Cześć [imię],

Widzę, że zacząłeś — super. Ale Twój profil jeszcze nie jest widoczny dla klientów, bo brakuje:

  • Zdjęcia profilowego (klient patrzy, komu pisze)
  • 2–3 zdjęć realizacji (bez tego wyglądasz „surowo")
  • Obszaru pracy (km od Twojej lokalizacji)

Wiem, że czas to problem. Ale to jest inwestycja 5 minut, która w następnym tygodniu przyniesie pierwszy kontakt.

Oto co zrobić TERAZ:

  1. [Dodaj zdjęcie profilowe](https://mapjob.pl/?view=profile&step=photo) (możesz wziąć z Google Photos)
  2. [Dodaj 2 zdjęcia realizacji](https://mapjob.pl/?view=profile&step=portfolio) (telefon w kieszeni)
  3. [Ustaw obszar pracy](https://mapjob.pl/?view=profile&step=area) (30s kliknięć)

Żaden z tych kroków nie wymaga płatności. Pin zostaje na mapie za darmo.

👉 [Dokończ profil](https://mapjob.pl/?view=profile)

Jeśli masz problem techniczny — odpisz na tego maila, pomogę.

Pozdrawiam,
[założyciel]
```

**Timing:** 24h po rejestracji, TYLKO jeśli `pin.photo === null` albo `pin.description === null`
**Opt-out:** każdy email ma link „nie chcę więcej maili przypominających"

---

### 📨 Email #3 — „3 rzeczy, które widzą klienci na Twoim pinie" (48h)

**Subject:** Co klient widzi, gdy klika Twój pin? 🔍
**Preview:** Mini-audyt Twojego profilu (3 punkty).

**Wysyłany:** 48h po rejestracji (niezależnie od stanu profilu)

```
Cześć [imię],

Wchodzisz w to jako fachowiec. Ale pomyśl z perspektywy klienta — co on widzi, gdy klika Twój pin na mapie?

👉 1. ZDJĘCIE PROFILOWE
   Klient decyduje w 2 sekundy, czy pisze czy scroll'uje dalej.
   [ ] Masz zdjęcie? (zwykle wpada pierwsze wrażenie)

👉 2. PORTFOLIO (zdjęcia realizacji)
   Bez nich — klient widzi „ślepą" kartę i przechodzi do konkurencji.
   [ ] Masz min. 3 zdjęcia? (mogą być z telefonu)

👉 3. OPIS PROFILU (Bio)
   „Elektryk, 12 lat doświadczenia, instalacje w domach jednorodzinnych" — 1 zdanie = konkretny klient.
   [ ] Masz 1 zdanie opisu? 

Otwórz swój profil i zobacz z boku klienta:
[Podgląd mojego profilu →](https://mapjob.pl/?view=profile-preview)

Każdy z tych 3 elementów = ~30% szansy, że klient do Ciebie napisze.

Pozdrawiam,
[założyciel]

PS: Mam jedną prośbę. Odpisz mi — dlaczego założyłeś konto MapJob? Co Ci brakuje w portalu? Zebrane opinie pomogą mi ulepszyć produkt.
```

**Timing:** 48h
**Cel:** zaangażowanie + bezpośredni feedback od użytkownika

---

### 📨 Email #4 — Case study / Social proof (Dzień 7)

**Subject:** Jak MapJob zmienia dzień fachowca (realna historia)
**Preview:** Co się stało Pawłowi w ciągu 14 dni.

**Ważne:** gdy będziesz mieć **realnych użytkowników** z realnymi historiami → ten email używa prawdziwego case study. Do tego czasu = **usuń albo zastąp innym contentem** (nie pisz fake'ów).

**Wersja „fallback" do momentu realnych historii:**

```
Cześć [imię],

Minął tydzień, odkąd zarejestrowałeś się na MapJob. Jak idzie?

Dziś trochę kontekstu o tym, **jak MapJob ma działać** — szczerze, bez obietnic.

MapJob to nie magiczna apka. Nie wysyła klientów automatycznie w Twoje ręce.

To, co robi: **pokazuje Twój pin ludziom, którzy aktywnie szukają fachowca w Twojej okolicy.**

Czyli klient:
  1. Wchodzi na mapjob.pl (bo widział reklamę albo polecenie)
  2. Filtruje zawód + odległość
  3. Widzi Twój pin razem z innymi
  4. Klika → widzi portfolio, oceny, obszar pracy
  5. Pisze do Ciebie — wprost, bez pośrednika

**Czas od rejestracji do pierwszego kontaktu** zwykle:
  - Duże miasta (Warszawa, Kraków, Wrocław): **2–7 dni**
  - Średnie miasta (Rzeszów, Kielce): **7–14 dni**
  - Małe miasta/wsie: **14–30 dni**

(To są nasze obserwacje, nie obietnica.)

**Co przyspiesza Ci pierwsze zapytanie:**
  ✅ Pełny profil (3 zdjęcia portfolio, opis, zasięg)
  ✅ Złoty badge Plan Pro (w wynikach pierwszy) — 79 zł/mies, opcjonalne
  ✅ Udział w Giełdzie Zleceń (Plan Pro) — sam szukasz zleceń

👉 Plan Pro za 39 zł pierwszy miesiąc (zamiast 79 zł) — [aktywuj tutaj](https://mapjob.pl/?view=pricing&promo=WEEK1)

**Wzmocnij swoją obecność zanim ktokolwiek kliknie mapę.**

Pozdrawiam,
[założyciel]

PS: Jeśli masz pierwsze zapytania — daj znać, cieszę się.
```

**Timing:** dzień 7
**Cel:** miękka sprzedaż Plan Pro + budowanie trust przez szczerość
**Uwaga:** **jeśli dasz kod promo, musi faktycznie działać w Stripe**. Nie obietnice bez pokrycia.

---

### 📨 Email #5 — „Zbliża się Plan Pro decyzja" (Dzień 14)

**Subject:** [imię], pierwsze 2 tygodnie — co działa, co nie?
**Preview:** Plus opcja Planu Pro z 50% zniżki.

```
Cześć [imię],

Dwa tygodnie na MapJob. Czas na szczery check-in.

**Pytam wprost:**
  • Widziałeś wyświetlenia swojego pina? (sprawdź statystyki w Plan Pro)
  • Otrzymałeś pierwsze zapytanie? Jeśli tak — od kogo?
  • Czego Ci brakuje na platformie?

**Jeśli jeszcze nie widzisz ruchu** — 3 możliwe przyczyny:

  1. **Profil niekompletny** (80% nowych kont) — [sprawdź tutaj](https://mapjob.pl/?view=profile-audit)
  2. **Twoja dzielnica jeszcze rzadziej oglądana** — poczekaj jeszcze 7–10 dni, my wspólnie pracujemy nad rozpoznawalnością w Twoim mieście
  3. **Plan darmowy — pokazuje Cię w wynikach „ogólnych"** — jeśli chcesz być pierwszy → Plan Pro.

**Oferta dla Ciebie dziś:**

Plan Pro — 39 zł za pierwszy miesiąc (-50%).
Dostajesz: Giełdę Zleceń, statystyki, złoty badge, filtr „Premium only".

👉 [Aktywuj Plan Pro](https://mapjob.pl/?view=pricing&promo=HALFPRICE)

Jeśli nie zwraca Ci się w miesiąc, rezygnujesz — zero problemu.

(Alternatywa: Pakiet Wspierający — 200 zł jednorazowo = 5 lat Plan Pro. Dla tych, którzy nie lubią abonamentów.)

Pozdrawiam,
[założyciel]

PS: Jeśli jesteś sceptycznie nastawiony, to piszę prosto — czytasz polski, nie Silicon Valley BS. Szukasz wartości, dajemy wartość.
```

**Timing:** dzień 14
**Cel:** konwersja na Plan Pro (z kodem promo 50%)
**Kluczowe:** kod `HALFPRICE` musi być aktywny w Stripe. Zadbaj o to.

---

### 📨 Email #6 — Retention / Feedback (Dzień 30)

**Subject:** Miesiąc na MapJob — Twoja opinia?
**Preview:** 1-minutowa ankieta + darmowy bonus.

```
Cześć [imię],

Miesiąc temu założyłeś konto na MapJob. Dziś mam prośbę — 1 minuta Twojego czasu.

**Odpowiedz na 3 pytania:**
  
  1. Na skali 1–10, jak polecisz MapJob innemu fachowcowi z Twojej branży?
  2. Co Ci się najbardziej podoba? (1 zdanie)
  3. Co Cię najbardziej wkurza? (bez cenzury — chcę wiedzieć)

[Ankieta 1 minuta](https://mapjob.pl/?view=feedback-survey)

**W zamian dostaniesz:**
  🎁 +30 dni Plan Pro (jeśli go używasz)
  🎁 Lub kod rabatowy 20% na Plan Pro na stałe (pierwszy rok)

Wybór Twój. Kod zostaje wysłany po wypełnieniu.

---

**A na koniec:**

Dziękuję, że jesteś w tej „wczesnej fazie" MapJob. Twoja opinia naprawdę kształtuje, jak apka ewoluuje.

Jeśli miesiąc Ci się nie podobał — też mi napisz. Chcę wiedzieć.

Pozdrawiam,
[założyciel]
```

**Timing:** dzień 30
**Cel:** NPS (Net Promoter Score) + feedback + retention bonus
**Bonus:** musi być realny (30 dni Plan Pro lub 20% kod rabatowy w Stripe)

---

### 📨 Email #7 — „Dla tych, którzy przestali odwiedzać" (Dzień 45, win-back)

**Wysyłany tylko jeśli** user NIE zalogował się przez 14+ dni.

**Subject:** Brakuje nas Ci? [imię], szybki update co się zmieniło.
**Preview:** Nowe funkcje MapJob + pytanie, co Cię odepchnęło.

```
Cześć [imię],

Widzę, że nie logowałeś się od 2 tygodni. Zakładam, że nie spełniliśmy Twoich oczekiwań.

Chcę być szczery — wolę wiedzieć, dlaczego, niż próbować Cię „trzymać" bez poprawy.

**Odpowiedz mi jednym zdaniem — co Cię odepchnęło?** 👉 po prostu odpisz na tego maila.

Najczęstsze powody, które słyszymy:

  😞 „Za mało klientów w mojej okolicy" → pracujemy nad reklamą regionalną
  😞 „Plan Pro za drogi" → dodajemy Pakiet Wspierający 200 zł jednorazowy
  😞 „Interfejs skomplikowany" → ostatnio uprościliśmy onboarding
  😞 „Brak funkcji X" → daj znać, co by pomogło

**Co się zmieniło w ostatnim miesiącu:**

  ✨ Nowy kreator CV z AI (napisze CV za Ciebie w 30s) — [zobacz](https://mapjob.pl/?view=cv-builder)
  ✨ Szybsze mapy na mobile (30% szybciej)
  ✨ Nowa funkcja: chat z załącznikami (wysyłasz zdjęcia / PDF-y)

👉 [Sprawdź co nowe](https://mapjob.pl/?view=map&utm_campaign=winback)

**Jeśli jednak nie chcesz dłużej otrzymywać maili:**
[Wypisz się jednym kliknięciem](https://mapjob.pl/unsubscribe)

Bez urazy. Szanuję Twój czas.

Pozdrawiam,
[założyciel]
```

**Timing:** dzień 45 (jeśli `last_login > 14 days ago`)
**Cel:** win-back + feedback od „lost users"

---

## 📱 SMS sequence (alternatywa dla email, szczególnie dla persony Bożena/Krzysztof)

**Zasada:** SMS tylko jeśli user **explicitnie zgodził** na SMS marketing w consent (osobna zgoda, nie razem z emailem). RODO + ustawa telekomunikacyjna.

### SMS #1 — po rejestracji (6h po rejestracji, bez natychmiast — to wygląda na bot)

```
MapJob: Witaj [imię]! Pierwszy pin na mapie = 5 minut. Wejdź: mapjob.pl/start → zaloguj Googlem → wbij pin. Pomoc: tel. [support]. Stop: STOP na 2XXXX.
```

**Długość:** max 160 znaków
**Koszt:** SMSAPI ~0,07 zł/SMS → 1000 SMS = 70 zł

---

### SMS #2 — „Twój pin jest niewidoczny" (Dzień 3, jeśli profil nie ukończony)

```
MapJob: [imię], Twój pin nie jest jeszcze widoczny dla klientów — brakuje zdjęć. Dokończ profil: mapjob.pl/profile (2 min). Stop: STOP.
```

---

### SMS #3 — Plan Pro (Dzień 14, jeśli pełny profil)

```
MapJob: [imię], masz aktywny profil 2 tyg. Oferta: Plan Pro -50% pierwszy m-c (39zł). Aktywacja: mapjob.pl/pro. Kod: WEEK2. Stop: STOP.
```

---

## 🎯 Email funnel dla KLIENTÓW (B strona)

Klienci nie są „retainowani" jak fachowcy (nie płacą abonamentu), ale należy ich **pozyskać do powrotu** (= więcej kontaktów = więcej fachowców na platformie).

### 📨 Email Client #1 — Welcome (natychmiast)

**Subject:** Twoja pierwsza mapa fachowców jest gotowa
**Body:**

```
Cześć [imię],

Cieszymy się, że jesteś! Twoje konto klienta MapJob zawiera:

  🗺️ Mapa fachowców w Twojej okolicy
  💬 Chat bezpośredni z wybranymi fachowcami  
  ⭐ Możliwość dodawania opinii po zrealizowanych zleceniach
  📝 Publikowanie zleceń na Giełdzie

Wszystko za darmo, bez ukrytych opłat.

👉 [Otwórz mapę fachowców](https://mapjob.pl/?view=map)

Pozdrawiam,
[założyciel]
```

---

### 📨 Email Client #2 — „Nie kontaktowałeś się z fachowcem" (Dzień 3)

**Jeśli** klient odwiedził stronę ale nie napisał do żadnego fachowca.

```
Cześć [imię],

3 dni temu zarejestrowałeś konto, ale jeszcze nie napisałeś do żadnego fachowca. Wszystko OK?

Często blokada to:
  1. „Za mało pinów w mojej okolicy" — odezwij się, powiększymy dla Ciebie zasięg
  2. „Nie wiem, do którego fachowca napisać" — poradnik: [Jak wybrać fachowca na MapJob](link)
  3. „Opublikowałem zlecenie, ale brak ofert" — Giełda Zleceń = ~1–3 dni na pierwsze odpowiedzi

Daj mi znać — odpowiem osobiście na maila.

Pozdrawiam,
[założyciel]
```

---

### 📨 Email Client #3 — „Oceń swojego fachowca" (7 dni po ostatnim chatowaniu)

**Wysyłany:** gdy klient miał chat z fachowcem, ale nie dodał jeszcze opinii.

**Subject:** [imię], jak poszło z [fachowiec]?
**Body:**

```
Cześć [imię],

Tydzień temu pisałeś z [imię fachowca]. Jak poszło?

**Opinia zajmie 30 sekund:**
  ⭐ 5 gwiazdek — świetnie
  ⭐ 3 gwiazdki — ok, ale są uwagi
  ⭐ 1 gwiazdka — absolutna katastrofa

👉 [Dodaj opinię](https://mapjob.pl/?view=review&pro=[fachowiec_id])

Opinie pomagają innym klientom, a także motywują fachowców.

Jeśli nic z tego nie wyszło (np. fachowiec nie odpowiedział) — też daj znać, poprawi to algorytm.

Pozdrawiam,
[założyciel]
```

**Cel:** budowanie UGC (user-generated content) + social proof dla innych klientów.

---

## 🛠️ Implementacja techniczna

### Setup edge function (Supabase)

Plik `supabase/functions/email-onboarding/index.ts`:

```typescript
// Pseudocode — real implementation wymaga Resend API + cron trigger
import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface EmailDef {
  day: number;  // od rejestracji
  condition: (user: any) => boolean;
  subject: string;
  template: string;  // ID templatu w Resend
}

const emails: EmailDef[] = [
  { day: 0, condition: () => true, subject: 'Witaj na MapJob', template: 'welcome' },
  { day: 1, condition: (u) => !u.pin?.photo, subject: 'Twój pin jeszcze nie jest na mapie', template: 'no-pin' },
  { day: 2, condition: () => true, subject: '3 rzeczy, które widzą klienci', template: 'profile-tips' },
  { day: 7, condition: () => true, subject: 'Jak MapJob zmienia dzień fachowca', template: 'case-study' },
  { day: 14, condition: () => true, subject: 'Pierwsze 2 tygodnie — check-in', template: 'plan-pro-50' },
  { day: 30, condition: () => true, subject: 'Miesiąc na MapJob — Twoja opinia?', template: 'nps-survey' },
  { day: 45, condition: (u) => (Date.now() - new Date(u.last_login).getTime()) > 14 * 24 * 3600 * 1000, subject: 'Brakuje nas Ci?', template: 'winback' },
];

// Cron: co noc sprawdzaj, komu wysłać maila
async function sendScheduledEmails() {
  const users = await supabase.from('profiles').select('*').where('email_opt_in', true);
  
  for (const user of users.data) {
    const daysSinceReg = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 3600 * 24));
    
    for (const email of emails) {
      if (email.day === daysSinceReg && email.condition(user)) {
        const alreadySent = await checkEmailLog(user.id, email.template);
        if (!alreadySent) {
          await sendEmail(user.email, email.subject, email.template, user);
          await logEmail(user.id, email.template);
        }
      }
    }
  }
}
```

---

### Resend templates — HTML + plaintext

Każdy email musi mieć:
1. **HTML wersję** (z inline CSS — bez zewnętrznych stylów!)
2. **Plaintext wersję** (dla Gmail Promotions tab)
3. **Preview text** (150 znaków, widoczne w inboxie)
4. **Unsubscribe link** w stopce (RODO — obowiązkowe)
5. **Reply-to:** kontakt@mapjob.pl (żeby user mógł odpisać)
6. **Sender name:** „[Imię Założyciela] z MapJob" (nie „MapJob Team" — bardziej osobiste)

**Template HTML MUSI:**
- Działać w Gmail, Outlook, Apple Mail, Thunderbird
- Nie używać CSS grid / flexbox (stare klienty pocztowe)
- Max 600px width
- Mobile responsive (media queries + table layouts)

---

### Consent flow

**Przed pierwszym emailem wysłanym do usera:**

1. Sprawdź `profiles.email_marketing_opt_in === true` (user explicit zaznaczył)
2. Jeśli false — **NIE wysyłaj**
3. Nawet „welcome" wymaga zgody — w RODO transakcyjne maile OK, ale każdy inny = opt-in

**Double opt-in:**
- Po rejestracji user dostaje email „Potwierdź email żeby dostawać newslettery" → klik → `email_opt_in = true`
- Dopiero wtedy email #2, #3, ... leci

---

## 📊 Metryki do śledzenia

### Email deliverability

| Metryka | Cel | Uwaga |
|---------|-----|-------|
| **Open rate** | > 30% | Welcome zwykle 50–70%, retention 20–35% |
| **Click rate** | > 5% | Link w CTA, nie w headerze |
| **Unsubscribe rate** | < 0,5% na email | Powyżej = problem z targetowaniem/contentem |
| **Bounce rate** | < 2% | Powyżej = list zepsuty (kup maile? spam trap?) |
| **Spam complaints** | < 0,1% | Powyżej = blokada od ISP |

### Konwersja funnelu

| Event | Oczekiwana wartość |
|-------|--------------------|
| Email #1 delivered | 100% |
| Email #1 opened | 50–70% |
| Email #1 CTA clicked | 15–30% |
| Email #4 opened | 25–40% |
| Email #5 → Plan Pro conversion | 3–8% |
| Email #7 winback → return | 5–15% |

---

## 🚫 Czego NIE robić w emailach

1. **Spam triggers:** „GRATIS!", „AKCJA!", „Zarabiaj bez pracy", CAPS LOCK, wykrzykniki x5
2. **Link shorteners** (bit.ly, tinyurl) — Gmail flaguje jako spam
3. **Obraz tylko jako hero** bez tekstu — spam filter tego nie lubi
4. **Za wiele linków** (max 3 linki w emailu)
5. **Brak unsubscribe** — natychmiast flaga spam
6. **Kupione listy maili** — nie tylko nielegalne (RODO), ale też ISP blokują
7. **Mailowanie codziennie** — szybki unsubscribe, frustracja
8. **Imienna personalizacja z bugiem** — „Cześć [FIRST_NAME]!" gdy tag nie zadziała = profesjonalna kompromitacja

---

## 💡 Pro-tipy

1. **Pisz z prawdziwego konta** — kontakt@mapjob.pl, nie „noreply@" (noreply = spam feeling)
2. **Reply-to działa** — jeśli user odpisze, musi trafić do osoby, nie czarnej dziury
3. **A/B test subject lines** — 2 warianty subject, wysyłasz 50/50, wybierasz zwycięzcę po 24h
4. **Send time optimization** — Resend i Postmark mają AI które wybiera optymalną godzinę per user
5. **Segmentation** > mass mailing — Marek dostaje inny email #4 niż Tomek (persony!)
6. **Reactivation campaigns** co 3 miesiące — lista nieaktywnych + „brakuje Cię" + oferta

---

## 🎯 Sprawdź — czy Twój funnel działa

Po 60 dniach kampanii:

- [ ] Email #1 open rate > 50%?
- [ ] Email #4 (case study) click rate > 10%?
- [ ] Email #5 (Plan Pro 50% off) → min. 5% konwersja?
- [ ] Email #7 (winback) → min. 10% powrócających users?
- [ ] Spam rate < 0,1%?
- [ ] Unsubscribe rate < 1% total?

Jeśli nie — sprawdź każdy email osobno, popraw:
- Subject line (jeśli open rate < 30%)
- CTA copy (jeśli CTR < 5%)
- Timing (może za wcześnie/za późno)
- Segmentacja (może trafia do złych person)

**Email funnel to sila długoterminowa** — pierwsza wersja rzadko jest idealna. Iteruj co 30 dni.
