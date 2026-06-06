/* BoboFoto — lekki, anonimowy tracking ruchu i klików.
 * Zapisuje zdarzenia do Supabase (tabela 'zdarzenia'). Bez danych osobowych.
 * Fire-and-forget: błędy nigdy nie blokują strony. */
(function () {
  "use strict";

  var SUPABASE_URL = "https://juqlhorodqvczoqkvkim.supabase.co";
  var SUPABASE_KEY = "sb_publishable_noroVF0Q4ktIkPM6lYh95g__WAYsuW5";

  // Klient Supabase (ten sam SDK co reszta strony)
  var sb = null;
  try {
    if (window.supabase && SUPABASE_URL && SUPABASE_KEY) {
      sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
  } catch (e) { /* brak SDK = brak trackingu, strona działa normalnie */ }
  if (!sb) return;

  // Anonimowy identyfikator sesji (losowy, bez danych osobowych)
  function sessionId() {
    try {
      var k = "bf_sid";
      var v = localStorage.getItem(k);
      if (!v) {
        v = (window.crypto && crypto.randomUUID)
          ? crypto.randomUUID()
          : (Date.now().toString(36) + Math.random().toString(36).slice(2));
        localStorage.setItem(k, v);
      }
      return v;
    } catch (e) { return "anon"; }
  }

  var SID = sessionId();
  var DEVICE = window.matchMedia && window.matchMedia("(max-width: 760px)").matches ? "mobile" : "desktop";
  var REF = "";
  try {
    REF = document.referrer ? new URL(document.referrer).hostname : "(bezpośrednie)";
    if (REF === location.hostname) REF = "(wewnętrzne)";
  } catch (e) { REF = "(nieznane)"; }

  function send(typ, nazwa, meta) {
    try {
      sb.from("zdarzenia").insert({
        typ: typ,
        nazwa: nazwa || null,
        sciezka: location.pathname,
        referrer: REF,
        urzadzenie: DEVICE,
        sesja: SID,
        meta: meta || null
      }).then(function () {}, function () {});
    } catch (e) { /* ignoruj */ }
  }
  // Udostępnij globalnie (np. main.js może zgłosić 'order')
  window.bfTrack = send;

  // 1) Odsłona strony
  send("view", "page_view");

  // 2) Kliki — delegacja, automatyczna etykieta (bez ręcznego tagowania)
  document.addEventListener("click", function (ev) {
    var el = ev.target.closest("a, button, [data-track]");
    if (!el) return;
    var label =
      el.getAttribute("data-track") ||
      el.id ||
      (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40) ||
      el.className ||
      el.tagName.toLowerCase();
    send("click", label, { tag: el.tagName.toLowerCase(), href: el.getAttribute("href") || null });
  }, { passive: true, capture: true });
})();
