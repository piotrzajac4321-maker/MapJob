/* STUDIO AI — interakcje strony */
document.addEventListener("DOMContentLoaded", () => {

  /* ---- Rok w stopce ---- */
  document.getElementById("year").textContent = new Date().getFullYear();

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
    // duplikujemy zestaw, by pętla była bezszwowa (animacja przesuwa o -50%)
    [...strip, ...strip].forEach(item => {
      const img = document.createElement("img");
      img.src = item.thumb;
      img.alt = item.title;
      img.loading = "lazy";
      marquee.appendChild(img);
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
      fig.innerHTML =
        `<img src="${item.thumb}" alt="${item.title}" loading="lazy" />` +
        `<figcaption>${item.title}</figcaption>`;
      fig.addEventListener("click", () => openLightbox(i));
      galleryEl.appendChild(fig);
    });
  }

  /* ---- Lightbox ---- */
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  let lbIndex = 0;

  function openLightbox(i) {
    lbIndex = i;
    showLb();
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  function showLb() {
    const items = visibleItems();
    const item = items[lbIndex];
    lbImg.src = item.full;     // pełna rozdzielczość
    lbImg.alt = item.title;
  }
  function step(dir) {
    const len = visibleItems().length;
    lbIndex = (lbIndex + dir + len) % len;
    showLb();
  }

  document.getElementById("lbClose").addEventListener("click", closeLightbox);
  document.getElementById("lbPrev").addEventListener("click", () => step(-1));
  document.getElementById("lbNext").addEventListener("click", () => step(1));
  lb.addEventListener("click", e => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", e => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });

  buildFilters();
  renderGallery();

  /* ---- Reveal on scroll ---- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  /* ---- Wybór pakietu z cennika -> formularz ---- */
  document.querySelectorAll("[data-plan]").forEach(btn => {
    btn.addEventListener("click", () => {
      const sel = document.getElementById("pakiet");
      if (sel) sel.value = btn.dataset.plan;
    });
  });

  /* ---- Obsługa formularza ----
     TODO (płatności): podłącz Przelewy24 lub Stripe.
     Najprościej: utwórz Payment Link w panelu Stripe / P24 i przekieruj tam
     po wysłaniu formularza, np.:
       const LINKS = { mini:"https://...", standard:"https://...", premium:"https://..." };
       window.location.href = LINKS[data.pakiet];
     Wariant z backendem: wyślij dane na endpoint tworzący Checkout Session
     (Stripe) i przekieruj na zwrócony URL. Szczegóły w README.md.
  */
  const form = document.getElementById("orderForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const data = Object.fromEntries(new FormData(form).entries());
      console.log("Zamówienie:", data);
      alert(
        "Dziękujemy, " + (data.imie || "") + "!\n\n" +
        "Wybrany pakiet: " + data.pakiet.toUpperCase() + ".\n" +
        "Tu nastąpi przekierowanie do płatności (Przelewy24 / Stripe).\n\n" +
        "[Demo] Płatności nie są jeszcze podłączone — patrz README.md."
      );
      // window.location.href = PAYMENT_LINKS[data.pakiet];
    });
  }
});
