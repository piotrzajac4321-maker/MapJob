/* STUDIO AI — interakcje strony */
document.addEventListener("DOMContentLoaded", () => {

  /* ---- Rok w stopce ---- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Nawigacja: tło po scrollu ---- */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Menu mobilne ---- */
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  const navBackdrop = document.createElement("div");
  navBackdrop.className = "nav-backdrop";
  document.body.appendChild(navBackdrop);
  function setMenu(open) {
    links.classList.toggle("open", open);
    navBackdrop.classList.toggle("show", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", () => setMenu(!links.classList.contains("open")));
  navBackdrop.addEventListener("click", () => setMenu(false));
  links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));

  /* ---- Marquee (przewijany pasek zdjęć) ---- */
  const marquee = document.getElementById("marquee");
  if (marquee && typeof GALLERY !== "undefined") {
    const strip = GALLERY.slice(0, 14);
    [...strip, ...strip].forEach(item => {
      const img = document.createElement("img");
      img.src = item.thumb;
      img.alt = item.title;
      img.loading = "lazy";
      marquee.appendChild(img);
    });
  }

  /* ===========================================================
     WYBÓR ZDJĘĆ + PERSONALIZACJA
     selected: Map(klucz f -> { item, note })
     =========================================================== */
  const selected = new Map();

  /* ===========================================================
     PAKIETY — limit liczby zdjęć wg pakietu
     =========================================================== */
  const PLAN_LIMIT = { mini: 1, standard: 4, premium: 10 };
  const PLAN_NEXT  = { mini: "standard", standard: "premium" };
  const PLAN_NAME  = { mini: "Mini", standard: "Standard", premium: "Premium" };
  // Linki płatności Stripe (LIVE) wg pakietu
  const PAYMENT_LINKS = {
    mini:     "https://buy.stripe.com/bJe00k0jz3E89C4d3mbjW0g",
    standard: "https://buy.stripe.com/14A4gA0jz7Uo5lO0gAbjW0h",
    premium:  "https://buy.stripe.com/dRm14o3vLdeI5lO2oIbjW0i"
  };
  let currentPlan = "standard";
  const planLimit = () => PLAN_LIMIT[currentPlan];

  const planPickEl = document.getElementById("planPick");
  const planCounterEl = document.getElementById("planCounter");
  const planHidden = document.getElementById("c-pakiet");

  const MAX_PHOTOS = 10;
  const planFor = (n) => (n <= 1 ? "mini" : n <= 4 ? "standard" : "premium");

  // eleganckie powiadomienie zamiast alert()
  let toastTimer;
  function toast(msg) {
    let t = document.getElementById("mjToast");
    if (!t) { t = document.createElement("div"); t.id = "mjToast"; t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  function setPlan(plan, opts) {
    opts = opts || {};
    // nie pozwól zejść do pakietu mniejszego niż liczba już wybranych zdjęć
    if (!opts.force && PLAN_LIMIT[plan] < selected.size) {
      toast("Masz zaznaczone " + selected.size + " zdjęć — pakiet " + PLAN_NAME[plan] +
            " obejmuje " + PLAN_LIMIT[plan] + ". Najpierw usuń nadmiar.");
      return false;
    }
    currentPlan = plan;
    if (planHidden) planHidden.value = plan;
    if (planPickEl) planPickEl.querySelectorAll(".plan-opt").forEach(b =>
      b.classList.toggle("is-active", b.dataset.plan === plan));
    updateCartBar();
    return true;
  }

  if (planPickEl) {
    planPickEl.querySelectorAll(".plan-opt").forEach(btn => {
      btn.addEventListener("click", () => setPlan(btn.dataset.plan));
    });
  }

  /* ---- Galeria + filtry ---- */
  const galleryEl = document.getElementById("gallery");
  const filtersEl = document.getElementById("filters");
  let current = "wszystkie";

  function buildFilters() {
    const cats = ["wszystkie", ...new Set(GALLERY.map(g => g.cat))];
    cats.forEach(cat => {
      const btn = document.createElement("button");
      btn.className = "filter" + (cat === "wszystkie" ? " active" : "");
      btn.textContent = CAT_LABELS[cat] || cat;
      btn.dataset.cat = cat;
      btn.addEventListener("click", () => {
        current = cat;
        filtersEl.querySelectorAll(".filter").forEach(f => f.classList.toggle("active", f.dataset.cat === cat));
        renderGallery();
      });
      filtersEl.appendChild(btn);
    });
  }

  function visibleItems() {
    return current === "wszystkie" ? GALLERY : GALLERY.filter(g => g.cat === current);
  }

  function renderGallery() {
    galleryEl.innerHTML = "";
    visibleItems().forEach((item, i) => {
      const fig = document.createElement("figure");
      fig.dataset.index = i;
      if (selected.has(item.f)) fig.classList.add("selected");
      fig.innerHTML =
        `<img src="${item.thumb}" alt="${item.title}" loading="lazy" />` +
        `<figcaption>${item.title}</figcaption>` +
        `<button class="sel-btn" type="button" title="Dodaj do wybranych" aria-label="Wybierz to zdjęcie">` +
          `${selected.has(item.f) ? "♥" : "♡"}</button>`;
      // klik w zdjęcie -> lightbox
      fig.querySelector("img").addEventListener("click", () => openLightbox(i));
      fig.querySelector("figcaption").addEventListener("click", () => openLightbox(i));
      // klik w serce -> wybór
      fig.querySelector(".sel-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        toggleSelect(item, fig);
      });
      galleryEl.appendChild(fig);
    });
  }

  function toggleSelect(item, fig) {
    if (selected.has(item.f)) {
      selected.delete(item.f);
      fig && fig.classList.remove("selected");
      fig && (fig.querySelector(".sel-btn").textContent = "♡");
    } else {
      // maksymalnie 10 zdjęć
      if (selected.size >= MAX_PHOTOS) {
        toast("Możesz wybrać maksymalnie " + MAX_PHOTOS + " zdjęć (pakiet Premium).");
        return;
      }
      selected.set(item.f, { item, note: "" });
      fig && fig.classList.add("selected");
      fig && (fig.querySelector(".sel-btn").textContent = "♥");
      // pakiet sam dopasowuje się do liczby zdjęć (w górę)
      if (PLAN_LIMIT[currentPlan] < selected.size) {
        const np = planFor(selected.size);
        setPlan(np, { force: true });
        toast("Pakiet zmieniony na " + PLAN_NAME[np] + " — " + PLAN_LIMIT[np] + " zdjęć.");
      }
    }
    updateCartBar();
  }

  /* ---- Pasek koszyka ---- */
  const cartBar = document.getElementById("cartBar");
  const cartCount = document.getElementById("cartCount");
  function updateCartBar() {
    const n = selected.size;
    if (cartCount) cartCount.textContent = n + " / " + planLimit();
    if (cartBar) cartBar.classList.toggle("show", n > 0);
    document.body.classList.toggle("cart-active", n > 0);
    if (planCounterEl) planCounterEl.innerHTML = "Wybrane zdjęcia: <strong>" + n + " / " + planLimit() + "</strong>";
  }

  /* ---- Ukryj pasek koszyka, gdy widoczny jest cennik (żeby nie zasłaniał przycisków „Wybieram") ---- */
  const cennikSection = document.getElementById("cennik");
  if (cartBar && cennikSection && "IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      cartBar.classList.toggle("hide-on-pricing", entries[0].isIntersecting);
    }, { threshold: 0.12 }).observe(cennikSection);
  }

  /* ---- Modal koszyka / personalizacji ---- */
  const cartModal = document.getElementById("cartModal");
  const cartItems = document.getElementById("cartItems");

  function renderCart() {
    cartItems.innerHTML = "";
    if (selected.size === 0) {
      cartItems.innerHTML = `<p class="cart-empty">Nie wybrano jeszcze żadnego zdjęcia. Zamknij to okno i kliknij ♡ przy zdjęciach, które Ci się podobają.</p>`;
      return;
    }
    selected.forEach(({ item, note }, key) => {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML =
        `<img src="${item.thumb}" alt="${item.title}" />` +
        `<div>` +
          `<div class="ci-head">` +
            `<span class="ci-title">${item.title}</span>` +
            `<button class="ci-remove" type="button" data-key="${key}">✕ usuń</button>` +
          `</div>` +
          `<textarea data-key="${key}" placeholder="Co zmienić w tym zdjęciu? (np. inne tło, kolor ubranka, dopisek z imieniem, format pod Instagram…)">${note}</textarea>` +
        `</div>`;
      // zapisywanie notatki
      row.querySelector("textarea").addEventListener("input", (e) => {
        const rec = selected.get(key);
        if (rec) rec.note = e.target.value;
      });
      // usuwanie z koszyka
      row.querySelector(".ci-remove").addEventListener("click", () => {
        selected.delete(key);
        updateCartBar();
        renderCart();
        // odśwież zaznaczenie w galerii
        const fig = [...galleryEl.children].find(f => {
          const idx = +f.dataset.index;
          return visibleItems()[idx] && visibleItems()[idx].f === key;
        });
        if (fig) { fig.classList.remove("selected"); fig.querySelector(".sel-btn").textContent = "♡"; }
      });
      cartItems.appendChild(row);
    });
  }

  function openCart() { renderCart(); cartModal.classList.add("open"); cartModal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; }
  function closeCart() { cartModal.classList.remove("open"); cartModal.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }

  document.getElementById("cartOpen").addEventListener("click", openCart);
  const editOrderBtn = document.getElementById("editOrder");
  if (editOrderBtn) editOrderBtn.addEventListener("click", openCart);
  document.getElementById("cartClose").addEventListener("click", closeCart);
  cartModal.addEventListener("click", e => { if (e.target === cartModal) closeCart(); });

  /* ---- Wysyłka spersonalizowanego zamówienia ----
     TODO (płatności): po walidacji przekieruj do Przelewy24 / Stripe.
     Dane zamówienia (zdjęcia + notatki + kontakt) są gotowe w obiekcie `order`.
  */
  const cartForm = document.getElementById("cartForm");

  /* ---- Upload zdjęć klienta (UI; realne wysyłanie wymaga backendu) ---- */
  const fileInput = document.getElementById("c-foto");
  const fileText = document.getElementById("fileText");
  const fileDrop = document.querySelector(".file-drop");
  if (fileInput) {
    fileInput.addEventListener("change", () => {
      const n = fileInput.files.length;
      if (n === 0) {
        fileText.textContent = "Kliknij, aby dodać zdjęcie (możesz dodać kilka)";
        fileDrop.classList.remove("has-file");
      } else {
        fileText.textContent = n === 1 ? fileInput.files[0].name : `Dodano ${n} zdjęć`;
        fileDrop.classList.add("has-file");
      }
    });
  }

  /* ===========================================================
     SUPABASE — zapis zamówień + wgrywanie zdjęć (BoboFoto)
     URL już ustawiony. WKLEJ publishable key poniżej
     (Supabase → Project Settings → API → Publishable key sb_publishable_...).
     Gdy KEY jest pusty → działa tryb demo (bez zapisu, nic się nie psuje).
     =========================================================== */
  const SUPABASE_URL = "https://juqlhorodqvczoqkvkim.supabase.co";
  const SUPABASE_KEY = "sb_publishable_noroVF0Q4ktIkPM6lYh95g__WAYsuW5";
  const SUPA_BUCKET = "zdjecia-klientow";

  /* Google Drive (Apps Script). Wklej URL aplikacji internetowej po wdrożeniu skryptu.
     Gdy puste → zapis na Drive wyłączony (nic się nie psuje). */
  const GDRIVE_WEBAPP_URL = "";
  const GDRIVE_SECRET = "bobofoto_082190e1db39cf796386ed5af4742b954e71";

  function fileToB64(file) {
    return new Promise((res) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result).split(",")[1] || null);
      r.onerror = () => res(null);
      r.readAsDataURL(file);
    });
  }
  // Wyślij zdjęcia + dane zamówienia na Twój Google Drive (fire-and-forget).
  function saveToDrive(fd, opis, stylizacje, files) {
    if (!GDRIVE_WEBAPP_URL || !files || !files.length) return;
    Promise.all(files.map(async (f) => ({ name: f.name, type: f.type, b64: await fileToB64(f) })))
      .then((pliki) => {
        fetch(GDRIVE_WEBAPP_URL, {
          method: "POST", mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            secret: GDRIVE_SECRET,
            imie: fd.imie || "", email: fd.email || "", telefon: fd.telefon || "",
            pakiet: fd.pakiet || "", opis: opis || "", stylizacje: stylizacje || [],
            pliki: pliki.filter((x) => x && x.b64)
          })
        }).catch(() => {});
      }).catch(() => {});
  }
  let _sb = null;
  function getSb() {
    if (!SUPABASE_URL || !SUPABASE_KEY || !window.supabase) return null;
    if (!_sb) _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    return _sb;
  }

  /* ---- Nakładka z paskiem postępu wysyłki ---- */
  let progEl = null;
  function showProgress(label, ratio) {
    if (!progEl) {
      progEl = document.createElement("div");
      progEl.id = "upOverlay";
      progEl.className = "up-overlay";
      progEl.innerHTML =
        '<div class="up-card">' +
          '<div class="up-spin" aria-hidden="true"></div>' +
          '<p class="up-text" id="upText">Wysyłanie…</p>' +
          '<div class="up-bar"><div class="up-fill" id="upFill"></div></div>' +
        '</div>';
      document.body.appendChild(progEl);
    }
    const t = progEl.querySelector("#upText");
    const f = progEl.querySelector("#upFill");
    if (t && label != null) t.textContent = label;
    if (f) {
      if (ratio == null) { f.classList.add("indeterminate"); f.style.width = "40%"; }
      else { f.classList.remove("indeterminate"); f.style.width = Math.round(Math.max(0, Math.min(1, ratio)) * 100) + "%"; }
    }
    progEl.classList.add("show");
    document.body.style.overflow = "hidden";
  }
  function hideProgress() { if (progEl) progEl.classList.remove("show"); }

  if (cartForm) {
    cartForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const files = fileInput ? [...fileInput.files] : [];
      const opis = (cartForm.querySelector('[name="opis"]')?.value || "").trim();
      if (selected.size === 0 && files.length === 0 && !opis) {
        toast("Wybierz zdjęcie z galerii (kliknij ♡) albo prześlij własne zdjęcie i opisz, czego potrzebujesz.");
        return;
      }
      if (!cartForm.checkValidity()) { cartForm.reportValidity(); return; }
      const fd = Object.fromEntries(new FormData(cartForm).entries());
      const stylizacje = [...selected.values()].map(({ item, note }) => ({ styl: item.title, plik: item.f, coZmienic: note || "" }));

      const sb = getSb();
      if (sb) {
        const submitBtn = cartForm.querySelector('button[type="submit"]');
        const oldLabel = submitBtn ? submitBtn.textContent : "";
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Wysyłanie…"; }
        showProgress(files.length ? ("Wysyłanie zdjęć… (0/" + files.length + ")") : "Zapisywanie zamówienia…", files.length ? 0 : null);
        try {
          const folder = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : (Date.now() + "-" + Math.random().toString(36).slice(2));
          const paths = [];
          for (let i = 0; i < files.length; i++) {
            const f = files[i];
            const safe = (f.name || ("zdjecie" + i)).replace(/[^\w.\-]+/g, "_");
            const path = folder + "/" + i + "-" + safe;
            showProgress("Wysyłanie zdjęć… (" + (i + 1) + "/" + files.length + ")", i / files.length);
            const { error: upErr } = await sb.storage.from(SUPA_BUCKET).upload(path, f, { upsert: false });
            if (upErr) throw upErr;
            paths.push(path);
            showProgress("Wysyłanie zdjęć… (" + (i + 1) + "/" + files.length + ")", (i + 1) / files.length);
          }
          showProgress("Zapisywanie zamówienia…", null);
          const { error: insErr } = await sb.from("zamowienia").insert({
            imie: fd.imie || null, email: fd.email || null, telefon: fd.telefon || null,
            pakiet: fd.pakiet || null, opis: opis || null,
            stylizacje: stylizacje, pliki: paths,
            zgoda_wizerunek: !!fd.zgodaWizerunek, zgoda_sms: !!fd.zgodaSms,
            zgoda_email: !!fd.zgodaEmail, zgoda_marketing: !!fd.zgodaMarketing
          });
          if (insErr) throw insErr;
          showProgress("Gotowe! Przekierowujemy do płatności…", 1);
          hideProgress();
          if (window.bfTrack) window.bfTrack("order", "zamowienie", { pakiet: fd.pakiet || null, zdjec: paths.length, stylizacji: stylizacje.length });
          saveToDrive(fd, opis, stylizacje, files);
          showOrderDone(fd, paths.length, stylizacje.length);
        } catch (err) {
          console.error("Supabase:", err);
          hideProgress();
          toast("Nie udało się wysłać zamówienia — spróbuj ponownie za chwilę.");
        } finally {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = oldLabel; }
        }
        return;
      }

      // tryb demo (Supabase niewpięty)
      try {
        const KEY = "fotomagia_orders";
        const all = JSON.parse(localStorage.getItem(KEY) || "[]");
        all.push({ data: new Date().toISOString(), kontakt: { imie: fd.imie, email: fd.email, telefon: fd.telefon || "—", pakiet: fd.pakiet }, zgody: { sms: !!fd.zgodaSms, email: !!fd.zgodaEmail, marketing: !!fd.zgodaMarketing }, opis: opis || "—", zdjecia: stylizacje });
        localStorage.setItem(KEY, JSON.stringify(all));
      } catch (e2) {}
      showOrderDone(fd, files.length, stylizacje.length);
    });
  }

  /* ---- Ładne okno potwierdzenia zamówienia ---- */
  function showOrderDone(fd, fileCount, styleCount) {
    closeCart();
    let m = document.getElementById("orderDone");
    if (!m) { m = document.createElement("div"); m.id = "orderDone"; m.className = "done-modal"; document.body.appendChild(m); }
    m.innerHTML =
      '<div class="done-card">' +
        '<div class="done-ico">✓</div>' +
        '<h3>Dziękujemy, ' + escapeHtml(fd.imie || "") + '!</h3>' +
        '<p>Twoje zamówienie zostało przyjęte. Za chwilę przejdziesz do płatności — <b>BLIK</b> lub karta.</p>' +
        '<ul class="done-sum">' +
          '<li>Pakiet <b>' + (PLAN_NAME[fd.pakiet] || fd.pakiet) + '</b></li>' +
          '<li>Wgrane zdjęcia: <b>' + (fileCount || 0) + '</b></li>' +
          '<li>Wybrane stylizacje: <b>' + styleCount + '</b></li>' +
        '</ul>' +
        '<a class="btn btn-primary" id="donepay" href="' + (PAYMENT_LINKS[fd.pakiet] || PAYMENT_LINKS.standard) + '">Przejdź do płatności →</a>' +
        '<p class="done-note">Po opłaceniu zabieramy się do pracy — gotowe zdjęcia wyślemy na Twój e-mail w ~10 godzin.</p>' +
      '</div>';
    m.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  /* ---- Lightbox ---- */
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  let lbIndex = 0;

  function openLightbox(i) { lbIndex = i; showLb(); lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; }
  function closeLightbox() { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }
  function showLb() { const item = visibleItems()[lbIndex]; lbImg.src = item.full; lbImg.alt = item.title; }
  function step(dir) { const len = visibleItems().length; lbIndex = (lbIndex + dir + len) % len; showLb(); }

  document.getElementById("lbClose").addEventListener("click", closeLightbox);
  document.getElementById("lbPrev").addEventListener("click", () => step(-1));
  document.getElementById("lbNext").addEventListener("click", () => step(1));
  lb.addEventListener("click", e => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", e => {
    if (lb.classList.contains("open")) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    } else if (cartModal.classList.contains("open") && e.key === "Escape") {
      closeCart();
    }
  });

  // pomieszaj kolejność zdjęć przy każdym wejściu (Fisher–Yates)
  for (let i = GALLERY.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [GALLERY[i], GALLERY[j]] = [GALLERY[j], GALLERY[i]];
  }

  buildFilters();
  renderGallery();
  updateCartBar();

  /* ---- Reveal on scroll ---- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  /* ---- Wybór pakietu z cennika ("Wybieram…") -> ustaw pakiet ---- */
  document.querySelectorAll("[data-plan][data-price]").forEach(btn => {
    btn.addEventListener("click", () => setPlan(btn.dataset.plan, { force: true }));
  });

  /* ---- Przed / Po (poziom = suwak, pion = scroll; blokada gestu „cofnij/zamknij" w in-app browserach np. Messenger) ---- */
  document.querySelectorAll("[data-ba]").forEach(ba => {
    let dragging = false, sx = 0, sy = 0, axis = null;
    const setFromX = (clientX) => {
      const r = ba.getBoundingClientRect();
      let p = ((clientX - r.left) / r.width) * 100;
      ba.style.setProperty("--pos", Math.max(0, Math.min(100, p)) + "%");
    };
    // mysz / desktop
    ba.addEventListener("pointerdown", (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      dragging = true;
      try { ba.setPointerCapture(e.pointerId); } catch (err) {}
      setFromX(e.clientX);
    });
    ba.addEventListener("pointermove", (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      if (dragging) setFromX(e.clientX);
    });
    const stop = () => { dragging = false; };
    ba.addEventListener("pointerup", stop);
    ba.addEventListener("pointercancel", stop);
    window.addEventListener("pointerup", stop);
    // dotyk — rozróżniamy gest poziomy (suwak) od pionowego (scroll strony)
    ba.addEventListener("touchstart", (e) => {
      const t = e.touches[0]; sx = t.clientX; sy = t.clientY; axis = null;
    }, { passive: true });
    ba.addEventListener("touchmove", (e) => {
      const t = e.touches[0];
      if (axis === null) axis = Math.abs(t.clientX - sx) > Math.abs(t.clientY - sy) ? "x" : "y";
      if (axis === "x") { e.preventDefault(); setFromX(t.clientX); } // blokuje swipe „wstecz" w Messengerze/FB
    }, { passive: false });
  });

  /* ---- Zgody: „zaznacz wszystkie" ---- */
  const allBox = document.getElementById("c-all");
  const consentBoxes = ["c-zgoda", "c-sms", "c-zgoda-email", "c-marketing"].map(id => document.getElementById(id)).filter(Boolean);
  if (allBox) {
    allBox.addEventListener("change", () => { consentBoxes.forEach(cb => { cb.checked = allBox.checked; }); });
    consentBoxes.forEach(cb => cb.addEventListener("change", () => {
      allBox.checked = consentBoxes.every(c => c.checked);
    }));
  }

  /* Baner cookies obsługiwany jest wbudowanym skryptem w index.html (niezależnym od tego pliku). */

});
