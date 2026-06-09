/* BoboFoto — Panel promptów: dane
 * Mirror skilla .claude/skills/foto-prompt-pro. Każdy szablon = środek promptu (body).
 * Pełny prompt = PREFIX (Tryb A/B) + body + customizacja + SUFFIX + linia formatu.
 * Miniatury: hotlink z CDN Higgsfield (te same kadry co galeria — fikcyjne modele).
 */

const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3EL0T26twgaFdlHuM3eJuT2XjHR/";

// ===== ZAPAMIĘTANE USTAWIENIA DOMYŚLNE (zatwierdzone w praktyce) =====
const DEFAULTS = {
  model: "nano_banana_pro",   // produkcja; podgląd: nano_banana_2
  resolution: "2k",
  format: "3:4",              // 3:4 wydruk · 1:1 Instagram · 9:16 social
  count: 4,                   // twarz "trafia" losowo — wybierasz najlepszy
  tryb: "A"                   // A = na zdjęciu klienta (identity-lock) · B = fikcyjny model
};

// ===== PREFIKSY / SUFIKS =====
// Tryb A — TWARDY identity-lock (sprawdzony: trzyma twarz przy zmianie tła/ubranka)
const PREFIX_A =
  'This is image-to-image editing. The baby in the output MUST be the exact same baby ' +
  'as in the uploaded reference — identical face. Preserve the face, head shape, skull ' +
  'proportions, forehead, eyebrows, eye shape and spacing, eye color, nose, nostrils, ' +
  'lips, philtrum, chin, cheeks, ear shape and skin tone with 100% pixel-level fidelity. ' +
  'Do NOT generate a different child, do NOT beautify, slim, smooth, age or symmetrize ' +
  'the face, do NOT change the expression. Keep the exact same crop, pose and head angle ' +
  'as the reference. Only the outfit, props and background may change — the face stays ' +
  'untouched and identical.';

// Tryb B — fikcyjny model (galeria/reklamy/testy)
const PREFIX_B =
  'Photorealistic newborn baby, a fictional infant not based on any real person, ' +
  'natural newborn head shape and peaceful expression. The model chooses a fitting outfit ' +
  'and a relaxed, safe newborn pose.';

// Sufiks realizmu + anty-AI (wspólny)
const SUFFIX =
  'Shot on a full-frame camera, 85mm lens at f/2.0, eye-level, shallow depth of field, ' +
  'creamy bokeh, tack-sharp eyes, soft catchlights. Photorealistic newborn skin with fine ' +
  'texture, visible pores, soft peach fuzz, subtle natural redness and mottling, subsurface ' +
  'scattering, gentle film grain, no digital smoothing. Anatomically correct hands with five ' +
  'fingers each. High detail, ultra-realistic, premium fine-art newborn photography. ' +
  'Avoid: different baby, altered facial features, face swap, idealized face, changed eye ' +
  'shape or spacing, plastic or waxy skin, over-smoothing, oversharpening, HDR, extra or ' +
  'missing fingers, distorted or fused hands, text, watermark, logo, harsh lighting, ' +
  'cartoonish baby.';

// ===== SZABLONY =====
// id · nazwa · kat (klasyczne|sezonowe|tematyczne) · opis · img (plik CDN) · body
const TEMPLATES = [
  // — KLASYCZNE —
  { id: "klasyczne-studio", nazwa: "Klasyczne studio", kat: "klasyczne",
    opis: "Eleganckie, neutralne, ponadczasowe. Najbezpieczniejszy start.",
    img: "hf_20260604_124634_1e966137-7010-4a48-b5c8-08e03f5a4f2c",
    body: "Outfit: soft cream chunky-knit romper and matching knotted bonnet, hand-knitted texture. Background: seamless warm cream studio backdrop, soft brushed-cotton beanbag, smooth out-of-focus depth. Lighting: large softbox key light high and slightly left, gentle 2:1 ratio, soft chin shadow, warm 4800K. Color: warm neutral palette, true-to-life skin. Mood: timeless, elegant, fine-art." },

  { id: "minimal-bez", nazwa: "Minimalistyczny beż", kat: "klasyczne",
    opis: "Nowoczesna, czysta estetyka fine-art, dużo przestrzeni.",
    img: "hf_20260604_124644_aed99c6a-00d9-4649-94c3-9cbccee8bcdc",
    body: "Outfit: simple undyed cotton wrap, minimal. Background: seamless warm taupe backdrop, no props, lots of negative space. Lighting: single soft side light, gentle gradient falloff, 4700K. Color: ultra-clean modern neutral. Mood: calm, editorial fine-art." },

  { id: "boho", nazwa: "Boho / naturalne", kat: "klasyczne",
    opis: "Ciepłe, organiczne tła z naturalnymi fakturami.",
    img: "hf_20260604_215502_6405fc74-0000-462e-9b86-1c7edd0235e0",
    body: "Outfit: oatmeal ribbed-knit romper with a soft muslin wrap. Background: layered textured beige muslin, dried pampas grass and eucalyptus accents, earthy out-of-focus backdrop, clear depth. Props: woven basket lined with cream faux-fur. Lighting: large window light from the left, soft falloff, warm 4900K. Color: warm earthy boho palette. Mood: organic, tender." },

  { id: "granat-aksamit", nazwa: "Granatowy aksamit", kat: "klasyczne",
    opis: "Głębokie, eleganckie tło dla kontrastu ze skórą (premium low-key).",
    img: "hf_20260604_124654_e0c783e0-3197-450b-87e0-10da4e5c3aae",
    body: "Outfit: cream knitted romper for contrast. Background: deep navy velvet drape, baby on a soft cream layer, rich dark depth. Lighting: dramatic low-key single side light, strong falloff into shadow, 4300K. Color: rich premium low-key, deep contrast. Mood: elegant, luxurious." },

  { id: "vintage-koronka", nazwa: "Vintage koronka", kat: "klasyczne",
    opis: "Nostalgiczny, ciepły, klasyczny klimat film-like.",
    img: "hf_20260604_124659_ae1f91ef-e5b9-4ecf-891b-712fcf4a0232",
    body: "Outfit: soft ivory lace-trimmed gown. Background: an antique lace blanket in a wooden basket, soft sepia-warm tones, blurred vintage interior behind. Lighting: soft warm directional light, 4000K, nostalgic. Color: warm sepia, film-like. Mood: nostalgic, classic." },

  { id: "pastel", nazwa: "Pastel róż / błękit", kat: "klasyczne",
    opis: "Klasyczny podział dziewczynka / chłopiec.",
    img: "hf_20260604_125300_cb537f2e-3fe5-4d7b-afe4-986d43543d26",
    body: "Outfit: matching pastel knitted wrap (soft pink for a girl / soft blue for a boy). Background: smooth seamless pastel backdrop matching the wrap, soft even depth. Lighting: soft even high-key studio light, 5200K. Color: gentle pastel, clean. Mood: sweet, classic." },

  // — SEZONOWE —
  { id: "zima-swieta", nazwa: "Zima / Boże Narodzenie", kat: "sezonowe",
    opis: "Sezonowe, na kampanie świąteczne.",
    img: "hf_20260604_125328_c04550eb-75e5-4a00-9f6d-d131eb811d03",
    body: "Outfit: tiny red-and-white knitted santa outfit with a little pompom hat. Background: soft white faux-fur blanket, warm bokeh fairy lights in the far distance, cozy depth. Lighting: warm key light plus golden bokeh highlights, 3800K. Color: warm golden festive palette. Mood: cozy, magical." },

  { id: "wiosna-kwiaty", nazwa: "Wiosna / kwiaty", kat: "sezonowe",
    opis: "Jasne, pastelowe; na wiosnę i Dzień Matki.",
    img: "hf_20260604_124639_c8bc012b-880f-4d60-9cbd-f8568bb7b212",
    body: "Outfit: delicate pastel floral romper with a tiny flower headband. Background: a soft nest of fresh pastel flowers and greenery, the baby resting in a floral wreath, airy out-of-focus garden behind. Lighting: bright airy daylight, soft high-key, 5500K. Color: fresh delicate pastel palette. Mood: light, joyful." },

  // — TEMATYCZNE —
  { id: "ksiezyc", nazwa: "Bajkowy księżyc", kat: "tematyczne",
    opis: "Klimatyczne, marzycielskie; wyróżnia się w social mediach.",
    img: "hf_20260604_131111_faf8003f-7001-424a-af1d-0e37bca94eac",
    body: "Outfit: soft pale-grey star-patterned onesie. Background: the baby safely nestled and supported on a crescent-moon prop wrapped in soft clouds, deep navy starry backdrop with tiny glowing stars, dreamy depth. Lighting: soft dreamy glow from above, cool 4200K with warm rim. Color: deep navy with soft silver accents. Mood: dreamy, fantasy newborn art." },

  { id: "lesny", nazwa: "Leśny / zwierzątka", kat: "tematyczne",
    opis: "Przytulne, z motywem natury.",
    img: "hf_20260604_131127_386d400b-53e8-4414-9b5d-b42ab3ab03fc",
    body: "Outfit: a knitted animal-ear bonnet (bear or fox) and cozy earth-tone romper. Background: a cozy mossy woodland nest, soft autumn leaves, blurred forest with light filtering through behind. Lighting: warm dappled forest light, 4600K. Color: warm forest earth tones. Mood: snug, whimsical." },

  // — MASKOTKA / POSTAĆ (uwaga IP — do prywatnych pamiątek, nie do oferty) —
  { id: "maskotka", nazwa: "Maskotka / ulubiona postać", kat: "tematyczne",
    ip: true,
    opis: "Pluszak / bohater obok dziecka. Wpisz postać w polu 'maskotka'. ⚠️ Postacie chronione (np. Stitch) tylko prywatnie, nie w ofercie.",
    img: "hf_20260604_131121_37f7a0d4-de86-4241-9097-978006ccad03",
    body: "Add a small soft plush toy [[MASKOTKA]] nestled snugly beside the baby, the baby's hand gently resting on it, soft fuzzy fabric texture. Background: a cozy warm nursery scene with gentle golden bokeh and clear depth, soft cream knit blanket under the baby. Lighting: large soft window light from the left, gentle 2:1 ratio, soft catchlights, warm 4900K. Color: warm cozy pastel palette. Mood: tender, cozy, playful." }
];
