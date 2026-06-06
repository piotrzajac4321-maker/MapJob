/* BoboFoto — Panel admina.
 * Logowanie Supabase Auth → odczyt zamówień + zdjęcia + statystyki.
 * Wszystkie odczyty wymagają zalogowania (RLS po stronie bazy). */
(function () {
  "use strict";

  var SUPABASE_URL = "https://juqlhorodqvczoqkvkim.supabase.co";
  var SUPABASE_KEY = "sb_publishable_noroVF0Q4ktIkPM6lYh95g__WAYsuW5";
  var BUCKET = "zdjecia-klientow";
  var CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3EL0T26twgaFdlHuM3eJuT2XjHR/";

  var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var loginEl = $("#login"), appEl = $("#app");
  var ORDERS = [];

  /* ---------- pomocnicze ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmtDate(s) {
    if (!s) return "—";
    try {
      var d = new Date(s);
      return d.toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch (e) { return s; }
  }
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  /* ---------- AUTH ---------- */
  $("#loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = $("#loginBtn"); btn.disabled = true; btn.textContent = "Logowanie…";
    $("#loginErr").textContent = "";
    sb.auth.signInWithPassword({ email: $("#email").value.trim(), password: $("#haslo").value })
      .then(function (res) {
        if (res.error) throw res.error;
        boot();
      })
      .catch(function (err) {
        $("#loginErr").textContent = "Nie udało się zalogować: " + (err.message || "sprawdź e-mail i hasło.");
      })
      .finally(function () { btn.disabled = false; btn.textContent = "Zaloguj się"; });
  });

  $("#logout").addEventListener("click", function () {
    sb.auth.signOut().then(function () { location.reload(); });
  });

  function boot() {
    sb.auth.getUser().then(function (res) {
      var user = res.data && res.data.user;
      if (!user) { loginEl.hidden = false; appEl.hidden = true; return; }
      loginEl.hidden = true; appEl.hidden = false;
      $("#whoami").textContent = user.email || "";
      loadOrders();
      loadStats();
    });
  }

  /* ---------- ZAKŁADKI ---------- */
  $$(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      $$(".tab").forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      var name = tab.dataset.tab;
      $("#view-zamowienia").hidden = name !== "zamowienia";
      $("#view-statystyki").hidden = name !== "statystyki";
    });
  });

  /* ===========================================================
     ZAMÓWIENIA
     =========================================================== */
  $("#refreshOrders").addEventListener("click", loadOrders);
  $("#search").addEventListener("input", renderOrders);
  $("#statusFilter").addEventListener("change", renderOrders);
  $("#csvBtn").addEventListener("click", exportCsv);
  $("#bellBtn").addEventListener("click", toggleBell);

  var MAX_ID = 0;            // najwyższy znany id zamówienia (wykrywanie nowych)
  var NOTIFY = false;        // czy dźwięk włączony
  var pollTimer = null;

  function loadOrders() {
    $("#ordersList").innerHTML = '<div class="loading">Wczytywanie zamówień…</div>';
    sb.from("zamowienia").select("*").order("created_at", { ascending: false }).limit(500)
      .then(function (res) {
        if (res.error) throw res.error;
        ORDERS = res.data || [];
        MAX_ID = ORDERS.reduce(function (m, o) { return Math.max(m, +o.id || 0); }, MAX_ID);
        renderKpiOrders();
        renderOrders();
        startPolling();
      })
      .catch(function (err) {
        $("#ordersList").innerHTML = '<div class="loading err">Błąd odczytu: ' + esc(err.message) +
          '<br><small>Czy uruchomiłeś docs/panel-setup.sql i masz uprawnienia?</small></div>';
      });
  }

  function renderKpiOrders() {
    var now = Date.now(), d1 = 864e5;
    var dzis = ORDERS.filter(function (o) { return now - new Date(o.created_at).getTime() < d1; }).length;
    var tydz = ORDERS.filter(function (o) { return now - new Date(o.created_at).getTime() < 7 * d1; }).length;
    var nowe = ORDERS.filter(function (o) { return (o.status || "nowe") === "nowe"; }).length;
    $("#ordersKpi").innerHTML =
      kpi("🆕", nowe, "nowe (do obsłużenia)") +
      kpi("📅", dzis, "dziś") +
      kpi("🗓️", tydz, "ostatnie 7 dni") +
      kpi("Σ", ORDERS.length, "łącznie");
  }

  function renderOrders() {
    var q = $("#search").value.trim().toLowerCase();
    var sf = $("#statusFilter").value;
    var list = ORDERS.filter(function (o) {
      if (sf && (o.status || "nowe") !== sf) return false;
      if (!q) return true;
      return [o.imie, o.email, o.telefon, o.opis].join(" ").toLowerCase().indexOf(q) > -1;
    });
    var box = $("#ordersList");
    $("#ordersEmpty").hidden = list.length > 0;
    box.innerHTML = list.map(orderCard).join("");
    // podłącz akcje
    list.forEach(function (o) {
      var card = $('[data-id="' + o.id + '"]');
      if (!card) return;
      hydratePhotos(card, o);
      $(".st-select", card).addEventListener("change", function (e) { updateStatus(o, e.target.value); });
      var zip = $(".zip-btn", card);
      if (zip) zip.addEventListener("click", function () { downloadZip(o, zip); });
      $$(".copy", card).forEach(function (c) {
        c.addEventListener("click", function () {
          navigator.clipboard.writeText(c.dataset.copy).then(function () { toast("Skopiowano: " + c.dataset.copy); });
        });
      });
    });
  }

  function orderCard(o) {
    var st = o.status || "nowe";
    var styles = Array.isArray(o.stylizacje) ? o.stylizacje : [];
    var pliki = Array.isArray(o.pliki) ? o.pliki : [];
    var consents = [];
    if (o.zgoda_wizerunek) consents.push("wizerunek");
    if (o.zgoda_sms) consents.push("SMS");
    if (o.zgoda_email) consents.push("e-mail");
    if (o.zgoda_marketing) consents.push("marketing");

    return '' +
    '<article class="order ' + (st === "nowe" ? "is-new" : "") + '" data-id="' + esc(o.id) + '">' +
      '<div class="order-top">' +
        '<div class="order-who">' +
          '<b>' + esc(o.imie || "—") + '</b>' +
          '<span class="pill pill-' + esc(st) + '">' + stLabel(st) + '</span>' +
          (o.pakiet ? '<span class="pill pill-pkg">' + esc(o.pakiet) + '</span>' : "") +
        '</div>' +
        '<span class="order-date">' + fmtDate(o.created_at) + '</span>' +
      '</div>' +

      '<div class="order-contact">' +
        (o.email ? '<button class="copy" data-copy="' + esc(o.email) + '">✉️ ' + esc(o.email) + '</button>' : "") +
        (o.telefon ? '<button class="copy" data-copy="' + esc(o.telefon) + '">📞 ' + esc(o.telefon) + '</button>' : "") +
      '</div>' +

      (o.opis ? '<p class="order-opis">„' + esc(o.opis) + '"</p>' : "") +

      (styles.length ? '<div class="block"><h4>Wybrane stylizacje (' + styles.length + ')</h4>' +
        '<div class="thumbs">' + styles.map(function (s) {
          var url = CDN + (s.plik || "") + "_min.webp";
          return '<figure class="thumb">' +
            '<img loading="lazy" src="' + esc(url) + '" alt="" />' +
            '<figcaption>' + esc(s.styl || "") + (s.coZmienic ? '<span class="note">✎ ' + esc(s.coZmienic) + '</span>' : "") + '</figcaption>' +
          '</figure>';
        }).join("") + '</div></div>' : "") +

      '<div class="block">' +
        '<h4>Przesłane zdjęcia (' + pliki.length + ')' +
          (pliki.length ? ' <button class="btn btn-mini zip-btn">⬇ Pobierz wszystkie (ZIP)</button>' : "") +
        '</h4>' +
        (pliki.length ? '<div class="thumbs photos" data-loading="1"><span class="muted">ładowanie podglądów…</span></div>'
                      : '<p class="muted">Klient nie przesłał własnych zdjęć (zamówienie ze stylizacji).</p>') +
      '</div>' +

      '<div class="order-foot">' +
        '<label class="st-lab">Status: ' +
          '<select class="st-select">' +
            opt("nowe", st) + opt("w_toku", st) + opt("gotowe", st) +
          '</select>' +
        '</label>' +
        (consents.length ? '<span class="consents">Zgody: ' + consents.join(" · ") + '</span>' : '<span class="consents none">Brak zgód</span>') +
      '</div>' +
    '</article>';
  }

  function stLabel(s) { return { nowe: "🆕 Nowe", w_toku: "⏳ W toku", gotowe: "✅ Gotowe" }[s] || s; }
  function opt(v, cur) { return '<option value="' + v + '"' + (v === cur ? " selected" : "") + '>' + stLabel(v) + '</option>'; }
  function kpi(ico, n, lab) { return '<div class="kpi"><span class="kpi-ico">' + ico + '</span><b>' + n + '</b><span class="kpi-lab">' + esc(lab) + '</span></div>'; }

  /* ---- podpięcie podglądów zdjęć (signed URL, pełna jakość) ---- */
  function hydratePhotos(card, o) {
    var pliki = Array.isArray(o.pliki) ? o.pliki : [];
    if (!pliki.length) return;
    var box = $(".photos", card);
    if (!box) return;
    sb.storage.from(BUCKET).createSignedUrls(pliki, 3600).then(function (res) {
      if (res.error) { box.innerHTML = '<span class="muted err">Nie udało się wczytać zdjęć: ' + esc(res.error.message) + '</span>'; return; }
      box.removeAttribute("data-loading");
      box.innerHTML = res.data.map(function (it, i) {
        var name = (pliki[i] || "").split("/").pop();
        if (!it.signedUrl) return '';
        return '<figure class="thumb">' +
          '<a href="' + esc(it.signedUrl) + '" target="_blank" rel="noopener"><img loading="lazy" src="' + esc(it.signedUrl) + '" alt="" /></a>' +
          '<figcaption><a class="dl" href="' + esc(it.signedUrl) + '" download="' + esc(name) + '">⬇ ' + esc(name) + '</a></figcaption>' +
        '</figure>';
      }).join("");
    });
  }

  /* ---- ZIP całego zamówienia (pełna jakość) ---- */
  function downloadZip(o, btn) {
    var pliki = Array.isArray(o.pliki) ? o.pliki : [];
    if (!pliki.length || !window.JSZip) return;
    var old = btn.textContent; btn.disabled = true; btn.textContent = "Pakowanie…";
    sb.storage.from(BUCKET).createSignedUrls(pliki, 3600).then(function (res) {
      if (res.error) throw res.error;
      var zip = new JSZip();
      var jobs = res.data.map(function (it, i) {
        if (!it.signedUrl) return Promise.resolve();
        return fetch(it.signedUrl).then(function (r) { return r.blob(); }).then(function (b) {
          zip.file((i + 1) + "-" + (pliki[i] || "plik").split("/").pop(), b);
        });
      });
      return Promise.all(jobs).then(function () { return zip.generateAsync({ type: "blob" }); });
    }).then(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      var who = (o.imie || "klient").replace(/[^\w]+/g, "_");
      a.href = url; a.download = "bobofoto_" + who + "_" + String(o.id) + ".zip";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      toast("Pobrano ZIP z " + pliki.length + " zdjęciami");
    }).catch(function (err) {
      toast("Błąd pobierania ZIP: " + (err.message || ""));
    }).finally(function () { btn.disabled = false; btn.textContent = old; });
  }

  /* ---- zmiana statusu ---- */
  function updateStatus(o, status) {
    sb.from("zamowienia").update({ status: status }).eq("id", o.id).then(function (res) {
      if (res.error) { toast("Nie zapisano statusu: " + res.error.message); return; }
      o.status = status; renderKpiOrders();
      var card = $('[data-id="' + o.id + '"]');
      if (card) {
        var pill = $(".pill", card);
        card.classList.toggle("is-new", status === "nowe");
        if (pill) { pill.className = "pill pill-" + status; pill.textContent = stLabel(status); }
      }
      toast("Status zmieniony na: " + stLabel(status));
    });
  }

  /* ---- Eksport CSV (Excel PL: separator ;, BOM UTF-8) ---- */
  function exportCsv() {
    if (!ORDERS.length) { toast("Brak zamówień do eksportu"); return; }
    var cols = ["data", "status", "imie", "email", "telefon", "pakiet", "opis", "zdjec", "stylizacji", "zgody"];
    var rows = ORDERS.map(function (o) {
      var zg = [];
      if (o.zgoda_wizerunek) zg.push("wizerunek");
      if (o.zgoda_sms) zg.push("SMS");
      if (o.zgoda_email) zg.push("email");
      if (o.zgoda_marketing) zg.push("marketing");
      return [
        fmtDate(o.created_at), stLabel(o.status || "nowe").replace(/^\S+\s/, ""),
        o.imie || "", o.email || "", o.telefon || "", o.pakiet || "", o.opis || "",
        (Array.isArray(o.pliki) ? o.pliki.length : 0),
        (Array.isArray(o.stylizacje) ? o.stylizacje.length : 0),
        zg.join(" ")
      ];
    });
    var csv = [cols].concat(rows).map(function (r) {
      return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(";");
    }).join("\r\n");
    var blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bobofoto_zamowienia_" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    toast("Wyeksportowano " + ORDERS.length + " zamówień do CSV");
  }

  /* ---- Powiadomienia dźwiękowe o nowym zamówieniu ---- */
  var audioCtx = null;
  function beep() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.18].forEach(function (t) {
        var o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = "sine"; o.frequency.value = t ? 1175 : 880;
        g.gain.setValueAtTime(0.001, audioCtx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + t + 0.16);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(audioCtx.currentTime + t); o.stop(audioCtx.currentTime + t + 0.18);
      });
    } catch (e) {}
  }
  function toggleBell() {
    NOTIFY = !NOTIFY;
    var b = $("#bellBtn");
    b.setAttribute("aria-pressed", NOTIFY ? "true" : "false");
    b.textContent = NOTIFY ? "🔔 Powiadomienia: wł." : "🔔 Powiadomienia: wył.";
    b.classList.toggle("on", NOTIFY);
    if (NOTIFY) {
      try { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume(); } catch (e) {}
      beep(); // potwierdzenie, że dźwięk działa
      if (window.Notification && Notification.permission === "default") Notification.requestPermission();
      toast("Powiadomienia włączone — usłyszysz dźwięk przy nowym zamówieniu");
    } else {
      toast("Powiadomienia wyłączone");
    }
  }
  function startPolling() {
    if (pollTimer) return;
    pollTimer = setInterval(function () {
      sb.from("zamowienia").select("id").order("id", { ascending: false }).limit(1)
        .then(function (res) {
          if (res.error || !res.data || !res.data.length) return;
          var top = +res.data[0].id || 0;
          if (top > MAX_ID) {
            MAX_ID = top;
            loadOrders();
            if (NOTIFY) {
              beep();
              if (window.Notification && Notification.permission === "granted")
                new Notification("BoboFoto", { body: "Nowe zamówienie! 🎉" });
            }
            toast("🎉 Nowe zamówienie!");
          }
        });
    }, 30000);
  }

  /* ===========================================================
     STATYSTYKI
     =========================================================== */
  function loadStats() {
    sb.from("zdarzenia").select("typ,nazwa,urzadzenie,referrer,sesja,created_at")
      .order("created_at", { ascending: false }).limit(8000)
      .then(function (res) {
        if (res.error) { $("#statsKpi").innerHTML = '<div class="loading err">Błąd: ' + esc(res.error.message) + '</div>'; return; }
        renderStats(res.data || []);
      });
  }

  function renderStats(ev) {
    var now = Date.now(), d1 = 864e5;
    var views = ev.filter(function (e) { return e.typ === "view"; });
    var clicks = ev.filter(function (e) { return e.typ === "click"; });
    var orders = ev.filter(function (e) { return e.typ === "order"; });

    var vDzis = views.filter(function (e) { return now - new Date(e.created_at).getTime() < d1; }).length;
    var v7 = views.filter(function (e) { return now - new Date(e.created_at).getTime() < 7 * d1; }).length;
    var sesje = uniq(views.map(function (e) { return e.sesja; })).length;
    var konw = sesje ? Math.round((uniq(orders.map(function (e) { return e.sesja; })).length / sesje) * 1000) / 10 : 0;

    $("#statsKpi").innerHTML =
      kpi("👁️", vDzis, "wizyty dziś") +
      kpi("🗓️", v7, "wizyty 7 dni") +
      kpi("🧑", sesje, "unikalne osoby") +
      kpi("🛒", orders.length, "zamówienia") +
      kpi("📈", konw + "%", "konwersja");

    // wykres dzienny (14 dni)
    var days = [];
    for (var i = 13; i >= 0; i--) {
      var d = new Date(now - i * d1);
      var key = d.toISOString().slice(0, 10);
      var c = views.filter(function (e) { return new Date(e.created_at).toISOString().slice(0, 10) === key; }).length;
      days.push({ label: d.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" }), n: c });
    }
    var max = Math.max.apply(null, days.map(function (d) { return d.n; }).concat([1]));
    $("#chartDays").innerHTML = days.map(function (d) {
      return '<div class="col"><div class="bar" style="height:' + Math.round((d.n / max) * 100) + '%" title="' + d.n + '"></div>' +
        '<span class="cnum">' + d.n + '</span><span class="clab">' + d.label + '</span></div>';
    }).join("");

    barsInto("#topClicks", countBy(clicks, "nazwa"), 8);
    barsInto("#devices", countBy(views, "urzadzenie"), 5);
    barsInto("#sources", countBy(views, "referrer"), 8);
  }

  function uniq(a) { return a.filter(function (v, i, s) { return v && s.indexOf(v) === i; }); }
  function countBy(arr, key) {
    var m = {};
    arr.forEach(function (e) { var k = e[key] || "(brak)"; m[k] = (m[k] || 0) + 1; });
    return Object.keys(m).map(function (k) { return { k: k, n: m[k] }; }).sort(function (a, b) { return b.n - a.n; });
  }
  function barsInto(sel, rows, lim) {
    var el = $(sel);
    if (!rows.length) { el.innerHTML = '<p class="muted">Brak danych.</p>'; return; }
    var max = rows[0].n || 1;
    el.innerHTML = rows.slice(0, lim).map(function (r) {
      return '<div class="brow"><span class="bk" title="' + esc(r.k) + '">' + esc(r.k) + '</span>' +
        '<span class="bt"><span class="bf" style="width:' + Math.round((r.n / max) * 100) + '%"></span></span>' +
        '<b class="bn">' + r.n + '</b></div>';
    }).join("");
  }

  /* ---------- start ---------- */
  boot();
})();
