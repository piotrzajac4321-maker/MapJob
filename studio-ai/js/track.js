/* BoboFoto — lekki, anonimowy tracking ruchu, klików i czasu na stronie.
 * Zapisuje zdarzenia do Supabase (tabela 'zdarzenia'). Bez danych osobowych.
 * Fire-and-forget: błędy nigdy nie blokują strony. */
(function () {
  "use strict";

  var SUPABASE_URL = "https://juqlhorodqvczoqkvkim.supabase.co";
  var SUPABASE_KEY = "sb_publishable_noroVF0Q4ktIkPM6lYh95g__WAYsuW5";

  var sb = null;
  try {
    if (window.supabase && SUPABASE_URL && SUPABASE_KEY) {
      sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
  } catch (e) { /* brak SDK = brak trackingu */ }
  if (!sb) return;

  // Anonimowy id sesji z limitem 30 min bezczynności (nowa wizyta = nowa sesja)
  var TIMEOUT = 30 * 60 * 1000;
  function sessionId() {
    try {
      var now = Date.now();
      var v = localStorage.getItem("bf_sid");
      var t = parseInt(localStorage.getItem("bf_sid_t") || "0", 10);
      if (!v || (now - t) > TIMEOUT) {
        v = (window.crypto && crypto.randomUUID)
          ? crypto.randomUUID()
          : (now.toString(36) + Math.random().toString(36).slice(2));
        localStorage.setItem("bf_sid", v);
      }
      localStorage.setItem("bf_sid_t", String(now));
      return v;
    } catch (e) { return "anon"; }
  }
  function touch() { try { localStorage.setItem("bf_sid_t", String(Date.now())); } catch (e) {} }

  var SID = sessionId();
  var DEVICE = window.matchMedia && window.matchMedia("(max-width: 760px)").matches ? "mobile" : "desktop";
  var REF = "";
  try {
    REF = document.referrer ? new URL(document.referrer).hostname : "(bezpośrednie)";
    if (REF === location.hostname) REF = "(wewnętrzne)";
  } catch (e) { REF = "(nieznane)"; }

  function send(typ, nazwa, meta) {
    touch();
    try {
      sb.from("zdarzenia").insert({
        typ: typ, nazwa: nazwa || null, sciezka: location.pathname,
        referrer: REF, urzadzenie: DEVICE, sesja: SID, meta: meta || null
      }).then(function () {}, function () {});
    } catch (e) {}
  }
  window.bfTrack = send;

  // 1) Odsłona strony
  send("view", "page_view");

  // 2) Kliki
  document.addEventListener("click", function (ev) {
    var el = ev.target.closest("a, button, [data-track]");
    if (!el) return;
    var label = el.getAttribute("data-track") || el.id ||
      (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40) ||
      el.className || el.tagName.toLowerCase();
    send("click", label, { tag: el.tagName.toLowerCase(), href: el.getAttribute("href") || null });
  }, { passive: true, capture: true });

  // 3) Czas na stronie + głębokość przewinięcia
  var START = Date.now(), maxScroll = 0, exited = false;
  function scrollPct() {
    var h = document.documentElement;
    var top = h.scrollTop || document.body.scrollTop || 0;
    var max = (h.scrollHeight - h.clientHeight);
    return max > 0 ? Math.min(100, Math.round(top / max * 100)) : 0;
  }
  addEventListener("scroll", function () { var p = scrollPct(); if (p > maxScroll) maxScroll = p; }, { passive: true });

  // Pulsy — potwierdzają, że ktoś realnie został na stronie
  [15000, 30000, 60000, 120000].forEach(function (ms) {
    setTimeout(function () { if (!document.hidden) send("czas", "na stronie " + (ms / 1000) + " s", { sekundy: ms / 1000, scroll: maxScroll }); }, ms);
  });

  // Zapis realnego czasu przy wyjściu (keepalive — przetrwa zamknięcie karty)
  function sendExit() {
    if (exited) return; exited = true;
    var sek = Math.round((Date.now() - START) / 1000);
    if (sek < 1) return;
    try {
      fetch(SUPABASE_URL + "/rest/v1/zdarzenia", {
        method: "POST", keepalive: true,
        headers: {
          "apikey": SUPABASE_KEY, "Authorization": "Bearer " + SUPABASE_KEY,
          "Content-Type": "application/json", "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          typ: "czas", nazwa: "na stronie " + sek + " s", sciezka: location.pathname,
          referrer: REF, urzadzenie: DEVICE, sesja: SID, meta: { sekundy: sek, scroll: maxScroll }
        })
      }).catch(function () {});
    } catch (e) {}
    touch();
  }
  addEventListener("visibilitychange", function () { if (document.hidden) sendExit(); });
  addEventListener("pagehide", sendExit);
})();
