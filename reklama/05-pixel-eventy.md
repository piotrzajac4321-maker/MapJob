# Meta Pixel — Konfiguracja eventów konwersji w MapJob

**Cel:** żeby Meta wiedziała, które reklamy generują rzeczywiste rejestracje i płatności — nie tylko kliknięcia. Bez tego kampania leci w ciemno.

---

## 📋 4 eventy które MUSISZ mieć

| Event | Kiedy się pali | Priorytet dla algorytmu | Wartość do przekazania |
|-------|----------------|------------------------|------------------------|
| `PageView` | każde wejście na stronę | niski | — (automatycznie) |
| `Lead` | kliknięcie "Zarejestruj się" (zanim uzupełni formularz) | średni | — |
| `CompleteRegistration` | pomyślna rejestracja (konto utworzone) | **wysoki** | value: 0, currency: PLN |
| `InitiateCheckout` | otwarcie Stripe Checkout | średni | value: {cena planu}, currency: PLN |
| `Purchase` | pomyślna płatność (webhook Stripe) | **KRYTYCZNY** | value: {kwota}, currency: PLN |

---

## 1️⃣ Event `Lead` — otwarcie modalu rejestracji

**Gdzie w kodzie:** szukaj w `index.html` wszystkich miejsc z `openM('m-register')`.

**Znajdź:**
```html
<div onclick="closeM('m-globe-enter');openM('m-register')" ...>
```

**Zamień na:**
```html
<div onclick="closeM('m-globe-enter');openM('m-register');fbq&&fbq('track','Lead');" ...>
```

**Alternatywnie (czyściej) — owiń funkcję `openM`:**

Znajdź definicję `function openM` i tuż przed wywołaniem (albo w osobnym wrapperze) dodaj:

```javascript
var _origOpenM = window.openM;
window.openM = function(id) {
  if (id === 'm-register' && typeof fbq !== 'undefined') {
    fbq('track', 'Lead');
  }
  return _origOpenM.apply(this, arguments);
};
```

---

## 2️⃣ Event `CompleteRegistration` — po udanej rejestracji

**Gdzie:** znajdź funkcję która obsługuje rejestrację użytkownika (prawdopodobnie `signUp`, `register`, lub wywołanie `supabase.auth.signUp`).

```javascript
// W momencie SUKCESU rejestracji:
if (typeof fbq !== 'undefined') {
  fbq('track', 'CompleteRegistration', {
    content_name: 'Rejestracja MapJob',
    currency: 'PLN',
    value: 0 // można zmienić na estymowane LTV np. 150
  });
}
```

---

## 3️⃣ Event `InitiateCheckout` — otwarcie Stripe

**Gdzie w kodzie:** funkcja `openStripePayment` (jest wywoływana 6+ razy w index.html).

**Znajdź definicję `function openStripePayment` i dodaj na początku:**

```javascript
function openStripePayment(planKey) {
  // === META PIXEL EVENT ===
  if (typeof fbq !== 'undefined') {
    var priceMap = {
      'plan_pro': 79,
      'premium_monthly': 199,
      'portfolio_pro': 99,
      'supporter_pack': 200
    };
    fbq('track', 'InitiateCheckout', {
      content_name: planKey,
      currency: 'PLN',
      value: priceMap[planKey] || 0
    });
  }
  // === reszta istniejącego kodu ===
  // ...
}
```

---

## 4️⃣ Event `Purchase` — NAJWAŻNIEJSZY

**Problem:** płatność odbywa się na stronie Stripe, nie Twojej. User wraca po sukcesie na `/?payment=success` (albo podobny URL — sprawdź w swojej konfiguracji Stripe `success_url`).

**Rozwiązanie A (prostsze):** pal event po powrocie z Stripe.

Dodaj na końcu `<body>` w index.html:

```javascript
<script>
// Detect powrotu z Stripe
(function(){
  var params = new URLSearchParams(window.location.search);
  if (params.get('payment') === 'success' || params.get('session_id')) {
    var plan = params.get('plan') || localStorage.getItem('last_checkout_plan');
    var priceMap = {
      'plan_pro': 79, 'premium_monthly': 199,
      'portfolio_pro': 99, 'supporter_pack': 200
    };
    var value = priceMap[plan] || 0;

    if (typeof fbq !== 'undefined' && value > 0) {
      fbq('track', 'Purchase', {
        content_name: plan,
        currency: 'PLN',
        value: value
      });
    }
    // wyczyść z URL
    window.history.replaceState({}, '', window.location.pathname);
  }
})();
</script>
```

**Rozwiązanie B (lepsze — Server-Side via Conversions API):** pal event z Supabase Edge Function po webhooku Stripe. To pokonuje blokery reklam i iOS 14 restrictions.

Zobacz plik `supabase/functions/stripe-webhook/index.ts` w Twoim projekcie — tam gdzie obsługiwany jest event `checkout.session.completed`, dodaj POST do Meta Conversions API. Szablon:

```typescript
// W funkcji obsługującej checkout.session.completed:
async function sendFbConversion(event: string, value: number, email: string, clientIp: string, userAgent: string) {
  const PIXEL_ID = Deno.env.get('META_PIXEL_ID');
  const ACCESS_TOKEN = Deno.env.get('META_CAPI_TOKEN'); // wygeneruj w Business Manager

  const emailHash = await sha256(email.toLowerCase().trim());

  await fetch(`https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: [{
        event_name: event,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: {
          em: [emailHash],
          client_ip_address: clientIp,
          client_user_agent: userAgent
        },
        custom_data: {
          currency: 'PLN',
          value: value
        }
      }]
    })
  });
}
```

---

## 🔒 Consent Mode (RODO) — WAŻNE

MapJob już ma politykę prywatności i wspomina o consent dla marketingu. Pixel **NIE MOŻE** się ładować przed zgodą.

**Co zrobić:**

1. W miejscu gdzie user akceptuje zgody (prawdopodobnie modal "Akceptuję Regulamin + Polityka prywatności"), dodaj opcjonalny checkbox: `"Zgoda na marketing (analityka, remarketing Facebook)"`

2. Po akceptacji:
```javascript
localStorage.setItem('mapjob_consent_marketing', 'true');
if (window.loadMetaPixel) window.loadMetaPixel();
```

3. Użyj **drugiej wersji** snippetu z `04-pixel-kod.html` (sekcja "Consent Mode"). Pixel ładuje się tylko jeśli user wcześniej zaakceptował.

---

## ✅ Checklist przed uruchomieniem kampanii

- [ ] Pixel ID wstawiony (zamieniony placeholder)
- [ ] Snippet w `<head>` index.html
- [ ] Event `Lead` przy otwarciu modalu rejestracji
- [ ] Event `CompleteRegistration` po utworzeniu konta
- [ ] Event `InitiateCheckout` w `openStripePayment`
- [ ] Event `Purchase` po powrocie z Stripe / webhook
- [ ] Conversions API (CAPI) — opcjonalnie ale zalecane
- [ ] Consent Mode wdrożony (RODO)
- [ ] **Przetestowane**: użyj rozszerzenia Chrome **"Meta Pixel Helper"** → kliknij w apce → zobacz czy eventy się palą
- [ ] W Meta Events Manager zobacz "Test Events" — real-time podgląd
- [ ] Oznacz event `Purchase` jako **priorytetowy** w Meta Events Manager (Aggregated Event Measurement)

---

## 🧪 Jak przetestować

1. Zainstaluj **Meta Pixel Helper** (Chrome extension, za darmo)
2. Otwórz `mapjob.pl` w Chrome
3. Ikona Pixel Helper powinna zapalić się na zielono z ilością wykrytych Pixels
4. Kliknij "Zarejestruj się" → Pixel Helper pokaże event `Lead`
5. Zarejestruj testowe konto → Pixel Helper pokaże `CompleteRegistration`
6. Otwórz Stripe → `InitiateCheckout`
7. Zapłać testową kartą Stripe (4242 4242 4242 4242) → `Purchase`

Jeśli któryś event się nie pali → zobacz konsolę przeglądarki, popraw.

---

## 📊 Jak skonfigurować Events Manager (po stronie Meta)

1. Wejdź na https://business.facebook.com/events_manager
2. Wybierz swój Pixel
3. Zakładka **"Events"** — zobaczysz listę wykrytych eventów
4. Zakładka **"Aggregated Event Measurement"** — oznacz priorytety:
   - Priority 1: `Purchase` (najwyższa)
   - Priority 2: `InitiateCheckout`
   - Priority 3: `CompleteRegistration`
   - Priority 4: `Lead`
   - Priority 5: `PageView`
5. Zakładka **"Settings"** → włącz **Advanced Matching** (przekazuje email w hashu — znacznie poprawia dopasowanie)
6. Zakładka **"Conversions API"** → wygeneruj Access Token do użycia w Supabase Edge Function

**Uwaga o iOS 14+:** Apple ograniczyła tracking. Meta może mierzyć max 8 eventów na domenę. Dlatego priorytety są kluczowe. Dla MapJob — wystarczy 5 eventów, więc jesteś w normie.
