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
  toggle.addEventListener("click", () => links.classList.toggle("open"));
  links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));

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
      selected.set(item.f, { item, note: "" });
      fig && fig.classList.add("selected");
      fig && (fig.querySelector(".sel-btn").textContent = "♥");
    }
    updateCartBar();
  }

  /* ---- Pasek koszyka ---- */
  const cartBar = document.getElementById("cartBar");
  const cartCount = document.getElementById("cartCount");
  function updateCartBar() {
    const n = selected.size;
    if (cartCount) cartCount.textContent = n;
    if (cartBar) cartBar.classList.toggle("show", n > 0);
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

  if (cartForm) {
    cartForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (selected.size === 0) { alert("Najpierw wybierz przynajmniej jedno zdjęcie (kliknij ♡ przy zdjęciu)."); return; }
      if (!cartForm.checkValidity()) { cartForm.reportValidity(); return; }
      const fd = Object.fromEntries(new FormData(cartForm).entries());
      const pliki = fileInput ? [...fileInput.files].map(f => f.name) : [];
      const order = {
        kontakt: { imie: fd.imie, email: fd.email, telefon: fd.telefon || "—", pakiet: fd.pakiet },
        zgody: { sms: !!fd.zgodaSms, email: !!fd.zgodaEmail, marketing: !!fd.zgodaMarketing },
        wgranePliki: pliki,
        zdjecia: [...selected.values()].map(({ item, note }) => ({ styl: item.title, plik: item.f, coZmienic: note || "—" })),
      };
      // TODO (backend): przesłać wgrane pliki (fileInput.files) wraz z zamówieniem.
      console.log("Zamówienie spersonalizowane:", order);
      alert(
        "Dziękujemy, " + (fd.imie || "") + "! 💛\n\n" +
        "Wgrane zdjęcia: " + (pliki.length || 0) + "\n" +
        "Wybrane stylizacje: " + order.zdjecia.length + "\n" +
        order.zdjecia.map((z, i) => `${i + 1}. ${z.styl} — ${z.coZmienic}`).join("\n") + "\n\n" +
        "Tu nastąpi przekierowanie do płatności (Przelewy24 / Stripe).\n" +
        "[Demo] Płatności i wysyłka plików nie są jeszcze podłączone — patrz README.md."
      );
      // window.location.href = PAYMENT_LINKS[fd.pakiet];
    });
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

  buildFilters();
  renderGallery();
  updateCartBar();

  /* ---- Reveal on scroll ---- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  /* ---- Wybór pakietu z cennika -> formularze ---- */
  document.querySelectorAll("[data-plan]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll('select[name="pakiet"]').forEach(sel => { sel.value = btn.dataset.plan; });
    });
  });

});
