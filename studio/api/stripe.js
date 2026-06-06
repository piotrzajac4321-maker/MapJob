// BoboFoto — realne zyski ze Stripe (tylko opłacone transakcje).
// Dostęp tylko dla zalogowanego admina (token Supabase weryfikowany po stronie serwera).
// Wymaga zmiennej środowiskowej STRIPE_SECRET_KEY w projekcie Vercel (klucz read-only).
module.exports = async (req, res) => {
  const SUPABASE_URL = "https://juqlhorodqvczoqkvkim.supabase.co";
  const SUPABASE_ANON = "sb_publishable_noroVF0Q4ktIkPM6lYh95g__WAYsuW5";
  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  try {
    // 1) tylko zalogowany admin
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ error: "brak autoryzacji" });
    const u = await fetch(SUPABASE_URL + "/auth/v1/user", {
      headers: { apikey: SUPABASE_ANON, Authorization: "Bearer " + token }
    });
    if (!u.ok) return res.status(401).json({ error: "nieautoryzowany" });

    // 2) klucz Stripe ustawiony?
    if (!STRIPE_KEY) return res.status(200).json({ configured: false });

    // 3) pobierz opłacone płatności
    let charges = [], after = null, pages = 0;
    do {
      const url = new URL("https://api.stripe.com/v1/charges");
      url.searchParams.set("limit", "100");
      if (after) url.searchParams.set("starting_after", after);
      const r = await fetch(url.toString(), { headers: { Authorization: "Bearer " + STRIPE_KEY } });
      const j = await r.json();
      if (j.error) return res.status(200).json({ configured: true, error: j.error.message });
      charges = charges.concat(j.data || []);
      after = j.has_more && j.data.length ? j.data[j.data.length - 1].id : null;
      pages++;
    } while (after && pages < 10);

    // 4) agregacja — TYLKO pakiety BoboFoto (24/49/99 zł).
    //    Konto Stripe jest wspólne z MapJob, więc inne kwoty pomijamy.
    const PKG = { 2400: "mini", 4900: "standard", 9900: "premium" };
    const now = new Date(), ym = now.getUTCFullYear() + "-" + now.getUTCMonth();
    let total = 0, count = 0, miesiac = 0;
    const byPkg = { mini: { n: 0, sum: 0 }, standard: { n: 0, sum: 0 }, premium: { n: 0, sum: 0 } };
    for (const c of charges) {
      if (c.status !== "succeeded" || !c.paid) continue;
      const k = PKG[c.amount];
      if (!k) continue; // pomijaj płatności spoza pakietów BoboFoto (np. MapJob)
      const net = c.amount - (c.amount_refunded || 0);
      if (net <= 0) continue;
      total += net; count++;
      const d = new Date(c.created * 1000);
      if (d.getUTCFullYear() + "-" + d.getUTCMonth() === ym) miesiac += net;
      byPkg[k].n++; byPkg[k].sum += net;
    }
    const z = (g) => Math.round(g) / 100;
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      configured: true,
      total: z(total), miesiac: z(miesiac), count,
      byPkg: Object.fromEntries(Object.entries(byPkg).map(([k, v]) => [k, { n: v.n, sum: z(v.sum) }]))
    });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
};
