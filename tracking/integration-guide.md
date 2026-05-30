# Integracja Trackera — MapJob User Journey

## 1. Inicjalizacja (raz na starcie aplikacji)

```js
import { initTracker, identify } from './tracker.js';

// Np. w App.svelte, layout.js, lub głównym pliku
initTracker({
  supabaseClient: supabase,          // twój klient supabase
  supabaseUrl: 'https://ahgzjneegvptudphibdm.supabase.co',
  supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
  userId: $user?.id ?? null,         // null jeśli niezalogowany
});
```

## 2. Po zalogowaniu — połącz sesję z użytkownikiem

```js
import { identify, trackLogin } from './tracker.js';

// Po udanym logowaniu:
identify(user.id);
trackLogin('email'); // lub 'google', 'phone', etc.
```

## 3. Zmiana route (SPA — SvelteKit, Next.js, itp.)

```js
import { trackPageView } from './tracker.js';

// SvelteKit — w +layout.svelte:
afterNavigate(({ to }) => {
  trackPageView(to?.url?.pathname + to?.url?.search);
});

// Next.js — w _app.js:
router.events.on('routeChangeComplete', (url) => trackPageView(url));
```

## 4. Ogłoszenia pracy

```js
import { trackJobView, trackJobContact, trackJobApply, trackJobSave } from './tracker.js';

// Otwarcie szczegółów ogłoszenia:
trackJobView(jobId, { title: job.title, city: job.city, category: job.category });

// Kliknięcie w telefon / email:
trackJobContact('phone', jobId, { job_title: job.title });
trackJobContact('email', jobId);

// Kliknięcie "Aplikuj":
trackJobApply(jobId, { job_title: job.title });

// Zapisanie ogłoszenia:
trackJobSave(jobId, true);   // true = zapisano, false = odznaczono
```

## 5. Mapa

```js
import { trackMapPin, trackMapZoom, trackMapCluster } from './tracker.js';

// Kliknięcie w pinezkę na mapie:
trackMapPin(pinId, { category: pin.category, city: pin.city });

// Kliknięcie w klaster:
trackMapCluster(cluster.count, cluster.lat, cluster.lng);

// Zmiana zoomu:
trackMapZoom(map.getZoom(), { triggered_by: 'scroll' });
```

## 6. Wyszukiwanie i filtry

```js
import { trackSearch, trackFilterApply, trackFilterClear } from './tracker.js';

// Wyszukiwanie:
trackSearch(query, resultsArray.length, activeFilters);

// Zmiana filtrów:
trackFilterApply({ category: 'IT', city: 'Warszawa', radius_km: 15 });

// Wyczyszczenie:
trackFilterClear();
```

## 7. Czat

```js
import { trackChatOpen, trackChatMessage } from './tracker.js';

trackChatOpen(conversationId, { with_user: otherUserId });
trackChatMessage(conversationId);
```

## 8. Checkout / płatności

```js
import { trackCheckout, trackCheckoutDone } from './tracker.js';

trackCheckout('pro_monthly', 49, 'PLN');
trackCheckoutDone('pro_monthly', 49, 'PLN');
```

## 9. Oznaczanie elementów HTML dla lepszego trackingu

Dodaj `data-component` i `data-track` do kluczowych elementów:

```html
<!-- Sekcja nagłówka -->
<header data-component="navbar">
  <button data-track="open-search">Szukaj</button>
  <button data-track="open-notifications">Powiadomienia</button>
</header>

<!-- Karta ogłoszenia -->
<div data-component="job-card" data-track-id="{job.id}">
  <button data-track="apply-btn">Aplikuj</button>
  <a href="tel:{job.phone}" data-track="call-btn">Zadzwoń</a>
</div>

<!-- Sidebar filtrów -->
<aside data-component="filters">
  <select data-track="category-filter">...</select>
</aside>
```

---

## Analityka — Zapytania Admin Panel

### Pełna ścieżka konkretnej sesji

```sql
SELECT * FROM get_session_journey('id-sesji-uuid');
```

### Lejek konwersji

```sql
SELECT * FROM v_conversion_funnel;
```

### Gdzie użytkownicy wychodzą (exit points)

```sql
SELECT exit_path, exit_event, COUNT(*) as exits
FROM v_exit_analysis
GROUP BY exit_path, exit_event
ORDER BY exits DESC
LIMIT 20;
```

### Ostatnie 3 akcje przed wyjściem z konkretnej strony

```sql
SELECT pre2_exit_event, pre_exit_event, exit_event, COUNT(*) as count
FROM v_exit_analysis
WHERE exit_path = '/'
GROUP BY pre2_exit_event, pre_exit_event, exit_event
ORDER BY count DESC;
```

### Dokąd idą po stronie głównej

```sql
SELECT * FROM get_paths_after('/');
```

### Co robili zanim kliknęli "Kontakt"

```sql
SELECT * FROM get_paths_before_event('job_contact', 5);
```

### Heatmapa kliknięć na stronie głównej

```sql
SELECT x_bucket, y_bucket, SUM(click_count) as clicks
FROM v_click_heatmap
WHERE path = '/'
GROUP BY x_bucket, y_bucket
ORDER BY clicks DESC;
```

### Scroll depth na stronie głównej

```sql
SELECT * FROM get_scroll_depth_breakdown('/');
```

### Bounce rate

```sql
SELECT * FROM v_bounce_stats;
```

### Skąd przychodzą użytkownicy

```sql
SELECT source, medium, SUM(sessions) as sessions
FROM v_traffic_sources
GROUP BY source, medium
ORDER BY sessions DESC;
```

### Najczęściej klikane elementy

```sql
SELECT * FROM v_top_clicked_elements
WHERE path = '/'
ORDER BY total_clicks DESC
LIMIT 20;
```

### Rage clicki (gdzie frustracja)

```sql
SELECT * FROM v_rage_clicks
ORDER BY rage_click_events DESC
LIMIT 10;
```

### Dzienna aktywność (ostatnie 30 dni)

```sql
SELECT * FROM v_daily_activity
WHERE date >= CURRENT_DATE - 30
ORDER BY date DESC;
```
