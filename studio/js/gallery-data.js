/* STUDIO AI — dane galerii
 * Zdjęcia: fikcyjne modele AI (Nano Banana 2 / Higgsfield), format 3:4.
 * UWAGA: na razie hotlinkowane z CDN Higgsfield. Docelowo warto pobrać pliki
 * i wrzucić do ./img/galeria/ (patrz README — sekcja "Własny hosting zdjęć").
 * Żaden kadr nie przedstawia prawdziwego dziecka — to generowane modele.
 */
const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3EL0T26twgaFdlHuM3eJuT2XjHR/";

// f = nazwa pliku bez rozszerzenia | cat = kategoria | title = etykieta PL
const GALLERY = [
  // — Klasyczne / minimalistyczne —
  { f: "hf_20260604_124634_1e966137-7010-4a48-b5c8-08e03f5a4f2c", cat: "klasyczne", title: "Klasyczne studio" },
  { f: "hf_20260604_124644_aed99c6a-00d9-4649-94c3-9cbccee8bcdc", cat: "klasyczne", title: "Minimalistyczny beż" },
  { f: "hf_20260604_125334_02a0289a-0a39-477f-b85d-bf56c902b4b5", cat: "klasyczne", title: "Bouclé, ciepły minimalizm" },
  { f: "hf_20260604_125306_2fee1508-3d22-4070-9ed0-9dc3027e2a4d", cat: "klasyczne", title: "Czysty szary fine-art" },
  { f: "hf_20260604_131054_680459fe-3ddc-43f1-92de-b3a8b12f4230", cat: "klasyczne", title: "Skandynawski splot" },
  { f: "hf_20260604_124654_e0c783e0-3197-450b-87e0-10da4e5c3aae", cat: "klasyczne", title: "Granatowy aksamit" },
  { f: "hf_20260604_131105_2c187dfe-00ce-47e5-b7c3-7e11f24990ba", cat: "klasyczne", title: "Szmaragd & złoto premium" },
  { f: "hf_20260604_124659_ae1f91ef-e5b9-4ecf-891b-712fcf4a0232", cat: "klasyczne", title: "Vintage koronka" },
  { f: "hf_20260604_131615_5d17f434-eef9-4cb2-880f-0f7a4a14ae92", cat: "klasyczne", title: "Zen / minimalizm" },
  { f: "hf_20260604_131133_6d7750b5-f4dd-4610-ae97-94ba9c66e7f4", cat: "klasyczne", title: "Gipsówka, biel" },
  { f: "hf_20260604_125316_5bb47a83-eaa6-4fb9-b3ec-5128ba3d9724", cat: "klasyczne", title: "Lawendowy spokój" },
  { f: "hf_20260604_125300_cb537f2e-3fe5-4d7b-afe4-986d43543d26", cat: "klasyczne", title: "Pudrowy róż" },

  // — Sezonowe —
  { f: "hf_20260604_125328_c04550eb-75e5-4a00-9f6d-d131eb811d03", cat: "sezonowe", title: "Święta — elf" },
  { f: "hf_20260604_131552_215d35e3-14b5-4de2-8ccf-44c6f5ef08e8", cat: "sezonowe", title: "Zimowa kraina" },
  { f: "hf_20260604_131100_b1a59cb6-e8a9-404b-ac20-e6535b64ef6c", cat: "sezonowe", title: "Wielkanoc" },
  { f: "hf_20260604_131542_afa52429-eb5f-4c49-82df-90cb40feb216", cat: "sezonowe", title: "Jesień, dynia" },
  { f: "hf_20260604_131603_4fef4490-b90f-4c5c-a38f-029b07fe98ff", cat: "sezonowe", title: "Walentynki" },
  { f: "hf_20260604_124639_c8bc012b-880f-4d60-9cbd-f8568bb7b212", cat: "sezonowe", title: "Wiosenne kwiaty" },
  { f: "hf_20260604_131049_8f6d841a-b104-4d1e-95c7-d1cb01af7337", cat: "sezonowe", title: "Piwonie" },

  // — Tematyczne —
  { f: "hf_20260604_131526_84fa11ef-79dc-492b-8da1-526a228bb023", cat: "tematyczne", title: "Mały doktor" },
  { f: "hf_20260604_131537_93262e19-14fe-407c-83b7-a0bbc538f5dd", cat: "tematyczne", title: "Mały kosmonauta" },
  { f: "hf_20260604_131547_a4c9e9db-cf57-4daf-88e2-0001315ec610", cat: "tematyczne", title: "Mały artysta" },
  { f: "hf_20260604_131558_b648bd8b-a2a2-49e1-95b8-8bea675623d7", cat: "tematyczne", title: "Mały kucharz" },
  { f: "hf_20260604_131609_ea22071c-fa14-4c96-8d2e-bcb06ff7f243", cat: "tematyczne", title: "Mały pilot" },
  { f: "hf_20260604_131121_37f7a0d4-de86-4241-9097-978006ccad03", cat: "tematyczne", title: "Mały król" },
  { f: "hf_20260604_131127_386d400b-53e8-4414-9b5d-b42ab3ab03fc", cat: "tematyczne", title: "Bajkowy las" },
  { f: "hf_20260604_131111_faf8003f-7001-424a-af1d-0e37bca94eac", cat: "tematyczne", title: "Chmurki i gwiazdki" },
  { f: "hf_20260604_125255_d8aaf8a0-9cde-4e2b-8fe8-d3c0cda186b0", cat: "tematyczne", title: "Mały aniołek" },
  { f: "hf_20260604_125322_10816dec-e562-444e-9bb4-edf6135ba024", cat: "tematyczne", title: "Marynarski" },
];

// Pomocnicze URL-e
GALLERY.forEach(g => {
  g.thumb = CDN + g.f + "_min.webp";
  g.full  = CDN + g.f + ".png";
});

const CAT_LABELS = {
  wszystkie: "Wszystkie",
  klasyczne: "Klasyczne",
  sezonowe: "Sezonowe",
  tematyczne: "Tematyczne",
};
