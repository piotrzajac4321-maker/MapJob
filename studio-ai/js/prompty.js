/* BoboFoto — Panel promptów: logika
 * Składa gotowy prompt z szablonu + Tryb A/B + customizacji + formatu, kopiuje 1 klikiem.
 * Zależy od js/prompty-data.js (DEFAULTS, PREFIX_A, PREFIX_B, SUFFIX, TEMPLATES, CDN).
 */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const state = {
    tryb: DEFAULTS.tryb,
    format: DEFAULTS.format,
    outfit: "",
    tlo: "",
    maskotka: "",
    kat: "wszystkie"
  };

  // —— Składanie promptu ——
  function buildPrompt(tpl) {
    const prefix = state.tryb === "A" ? PREFIX_A : PREFIX_B;

    let body = tpl.body;
    // Maskotka: podmień [[MASKOTKA]]
    if (body.includes("[[MASKOTKA]]")) {
      const m = state.maskotka.trim();
      body = body.replace(/\[\[MASKOTKA\]\]/g,
        m ? `of "${m}"` : "of a cuddly character");
    }

    const extra = [];
    if (state.outfit.trim()) extra.push(`Outfit override: change the outfit to ${state.outfit.trim()}.`);
    if (state.tlo.trim())    extra.push(`Background override: change the background to ${state.tlo.trim()}.`);

    const formatLine = `Aspect ratio ${state.format}.`;

    return [prefix, body, extra.join(" "), formatLine, SUFFIX]
      .filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  }

  function settingsLine() {
    return `${DEFAULTS.model} · ${state.format} · ${DEFAULTS.resolution} · count ${DEFAULTS.count} · Tryb ${state.tryb}`;
  }

  // —— Render ——
  function render() {
    const grid = $("#grid");
    grid.innerHTML = "";
    const list = TEMPLATES.filter(t => state.kat === "wszystkie" || t.kat === state.kat);

    list.forEach(tpl => {
      const card = document.createElement("article");
      card.className = "pcard";
      card.innerHTML = `
        <div class="pcard-thumb">
          <img loading="lazy" src="${CDN}${tpl.img}.png" alt="${tpl.nazwa}" />
          <span class="pcard-cat">${tpl.kat}</span>
          ${tpl.ip ? '<span class="pcard-ip" title="Postać chroniona prawem autorskim — tylko do prywatnych pamiątek">⚠ IP</span>' : ""}
        </div>
        <div class="pcard-body">
          <h3>${tpl.nazwa}</h3>
          <p class="pcard-opis">${tpl.opis}</p>
          <div class="pcard-set">${settingsLine()}</div>
          <div class="pcard-actions">
            <button class="btn btn-primary btn-copy" data-id="${tpl.id}">📋 Kopiuj prompt</button>
            <button class="btn btn-ghost btn-show" data-id="${tpl.id}">👁 Podgląd</button>
          </div>
          <pre class="pcard-prompt" hidden></pre>
        </div>`;
      grid.appendChild(card);
    });
  }

  // —— Kopiowanie ——
  async function copyText(txt) {
    try {
      await navigator.clipboard.writeText(txt);
      return true;
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = txt; document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand("copy"); } catch (_) {}
      ta.remove(); return ok;
    }
  }

  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 1800);
  }

  // —— Zdarzenia ——
  document.addEventListener("click", async (e) => {
    const copyBtn = e.target.closest(".btn-copy");
    if (copyBtn) {
      const tpl = TEMPLATES.find(t => t.id === copyBtn.dataset.id);
      const ok = await copyText(buildPrompt(tpl));
      toast(ok ? "Skopiowano prompt ✓" : "Nie udało się skopiować");
      return;
    }
    const showBtn = e.target.closest(".btn-show");
    if (showBtn) {
      const tpl = TEMPLATES.find(t => t.id === showBtn.dataset.id);
      const pre = showBtn.closest(".pcard-body").querySelector(".pcard-prompt");
      if (pre.hidden) { pre.textContent = buildPrompt(tpl); pre.hidden = false; showBtn.textContent = "🙈 Ukryj"; }
      else { pre.hidden = true; showBtn.textContent = "👁 Podgląd"; }
      return;
    }
  });

  function bindControls() {
    // Tryb A/B
    document.querySelectorAll("[data-tryb]").forEach(b => b.addEventListener("click", () => {
      state.tryb = b.dataset.tryb;
      document.querySelectorAll("[data-tryb]").forEach(x => x.classList.toggle("active", x === b));
      render();
    }));
    // Format
    document.querySelectorAll("[data-fmt]").forEach(b => b.addEventListener("click", () => {
      state.format = b.dataset.fmt;
      document.querySelectorAll("[data-fmt]").forEach(x => x.classList.toggle("active", x === b));
      render();
    }));
    // Kategorie
    document.querySelectorAll("[data-kat]").forEach(b => b.addEventListener("click", () => {
      state.kat = b.dataset.kat;
      document.querySelectorAll("[data-kat]").forEach(x => x.classList.toggle("active", x === b));
      render();
    }));
    // Pola customizacji
    $("#cOutfit").addEventListener("input", e => { state.outfit = e.target.value; });
    $("#cTlo").addEventListener("input", e => { state.tlo = e.target.value; });
    $("#cMaskotka").addEventListener("input", e => { state.maskotka = e.target.value; });
  }

  // —— Init ——
  document.addEventListener("DOMContentLoaded", () => {
    $("#defModel").textContent = DEFAULTS.model;
    $("#defRes").textContent = DEFAULTS.resolution;
    $("#defCount").textContent = DEFAULTS.count;
    bindControls();
    render();
  });
})();
