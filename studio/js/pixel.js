/* BoboFoto — Meta Pixel (retargeting + optymalizacja reklam).
 * Wklej swój PIXEL_ID poniżej (Menedżer zdarzeń Meta → Źródła danych → Twój pixel → ID).
 * Gdy PIXEL_ID jest pusty → nic się nie ładuje (strona działa normalnie). */
(function () {
  "use strict";
  var PIXEL_ID = "2611183012610966"; // BoboFoto (pixel „MapJob") — śledzenie ruchu z bobofoto.pl
  if (!PIXEL_ID) return;

  // Standardowy kod bazowy Meta Pixel
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  fbq("init", PIXEL_ID);
  fbq("track", "PageView");

  // ViewContent — wejście na stronę z ofertą (sygnał do retargetingu)
  try { if (location.pathname === "/" || /index/.test(location.pathname)) fbq("track", "ViewContent", { content_name: "Cennik BoboFoto" }); } catch (e) {}

  // InitiateCheckout — kliknięcie w przycisk zakupu / przejście do płatności
  document.addEventListener("click", function (ev) {
    var el = ev.target.closest('a, button');
    if (!el) return;
    var href = el.getAttribute("href") || "";
    var isBuy = href.indexOf("buy.stripe.com") > -1 ||
      el.id === "cartOpen" || el.classList.contains("pricebar") ||
      el.hasAttribute("data-plan");
    if (isBuy) { try { fbq("track", "InitiateCheckout"); } catch (e) {} }
  }, { passive: true, capture: true });

  window._fbqReady = true;
})();
