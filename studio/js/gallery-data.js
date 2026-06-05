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

  // — Otwarte oczy / różne miny (nowa partia) —
  { f: "hf_20260604_215500_bcf31546-efd1-4746-b8c8-bdd09d7ec8c7", cat: "klasyczne", title: "Otwarte oczy — studio" },
  { f: "hf_20260604_215519_b15883ac-9a9c-4c2d-862a-504e4f053091", cat: "klasyczne", title: "Otwarte oczy — minimal" },
  { f: "hf_20260604_215526_704f5930-c5ed-4b82-a9e1-fb3831693454", cat: "klasyczne", title: "Otwarte oczy — vintage" },
  { f: "hf_20260604_215530_4c08299d-f847-482c-9c52-30517b60cf0b", cat: "klasyczne", title: "Otwarte oczy — skandynawski" },
  { f: "hf_20260604_215502_6405fc74-0000-462e-9b86-1c7edd0235e0", cat: "klasyczne", title: "Uśmiech — boho" },
  { f: "hf_20260604_215523_90e6f5ae-935d-42f9-a33b-67e8a1ac6326", cat: "klasyczne", title: "Uśmiech — szałwia" },
  { f: "hf_20260604_215508_ea110dad-6b1d-4ba3-90d9-f5e323f4d605", cat: "klasyczne", title: "Ciekawość — terakota" },
  { f: "hf_20260604_215510_0281802c-1561-4c3f-a35e-b33141c8282f", cat: "sezonowe", title: "Uśmiech — wiosna" },
  { f: "hf_20260604_215506_74dc04dd-eee6-47e3-949d-995c3a332cea", cat: "sezonowe", title: "Spojrzenie w górę — kwiaty" },
  { f: "hf_20260604_215521_cba19679-a4be-4efc-80f1-4b109baa627a", cat: "sezonowe", title: "Otwarte oczy — święta" },
  { f: "hf_20260604_215527_bab46406-7fcb-44d4-be94-d0fc544014fd", cat: "sezonowe", title: "Ziewanie — jesień" },
  { f: "hf_20260604_215504_049582bd-41eb-41d2-9b2b-368d3ec1013d", cat: "tematyczne", title: "Ziewanie — księżyc" },

  // — Realne oczy w różnych kolorach + uśmiechy + ziewanie (partia 3) —
  { f: "hf_20260604_220713_e579db93-614d-44a8-870c-64b088f4f209", cat: "klasyczne", title: "Niebieskie oczy — studio" },
  { f: "hf_20260604_220716_f2d5c703-45c5-4f4c-becf-4313c8c964ee", cat: "klasyczne", title: "Brązowe oczy — boho" },
  { f: "hf_20260604_220717_621928b4-abb2-4f94-b698-7f42b829618d", ext: "jpeg", cat: "klasyczne", title: "Zielone oczy — szałwia" },
  { f: "hf_20260604_220722_7ffc0b4b-beb5-484e-8fb8-93a508502a68", cat: "klasyczne", title: "Szare oczy — minimal" },
  { f: "hf_20260604_220724_02f95d95-3a5a-4e9a-b3fc-56d834539ebf", cat: "klasyczne", title: "Ciemne oczy — aksamit" },
  { f: "hf_20260604_220737_5c992ab2-0874-4234-b0b3-f90297fa33e0", cat: "klasyczne", title: "Niebiesko-szare oczy — vintage" },
  { f: "hf_20260604_220719_78ee12a6-0a2f-4ef9-8016-f152d24cf373", cat: "sezonowe", title: "Piwne oczy — wiosna" },
  { f: "hf_20260604_220726_2bdd7aca-58ee-43d9-98c3-07d17169ec3e", cat: "sezonowe", title: "Radosny uśmiech — kwiaty" },
  { f: "hf_20260604_220731_c5505182-4753-4e62-96c5-2c008b5f9ddf", cat: "sezonowe", title: "Uśmiech — święta" },
  { f: "hf_20260604_220728_e5c462ec-ca01-4ee2-b405-782e8c895fd4", cat: "tematyczne", title: "Słodki uśmiech — miś" },
  { f: "hf_20260604_220733_25f13464-7a20-49e0-9772-26206b24e913", cat: "klasyczne", title: "Ziewanie — boho" },
  { f: "hf_20260604_220735_6c14b9a3-da74-4785-898a-7acf1b07c100", cat: "tematyczne", title: "Ziewanie — chmurki" },

  // — Bogate, opowiadające sceny (partia 4) —
  { f: "hf_20260604_221024_a34192a6-95bb-4f70-bdfb-2d6dff6b5eac", cat: "tematyczne", title: "W balonie wśród chmur" },
  { f: "hf_20260604_221031_a660bb35-29ab-4070-bc8c-158d93c9fa0f", cat: "tematyczne", title: "Mały czytelnik" },
  { f: "hf_20260604_221034_98c92f50-2615-48a0-906c-6dd3f64ab9b2", cat: "tematyczne", title: "Mały żeglarz" },
  { f: "hf_20260604_221037_9fa2bcfc-c880-4f94-895d-58a1e8a31031", cat: "tematyczne", title: "Mały muzyk" },
  { f: "hf_20260604_221041_f2044943-6f18-41a9-a03d-eef68c5bf696", cat: "tematyczne", title: "Mała kwiaciarnia" },
  { f: "hf_20260604_221044_b3786cff-ac5c-47b1-bd18-079f4f1f4496", cat: "tematyczne", title: "Mały podróżnik" },
  { f: "hf_20260604_221046_9d2c14ad-bc21-4c4d-90e0-b85a42074265", cat: "tematyczne", title: "Mały piekarz" },
  { f: "hf_20260604_221049_3081ed0d-4780-4c70-91e8-030fc70f97e6", cat: "tematyczne", title: "Leśna baśń" },
  { f: "hf_20260604_221051_614e065c-fab3-4c8c-8126-c61a9a2c46b5", cat: "tematyczne", title: "Mały kosmonauta" },
  { f: "hf_20260604_221026_b554d6c8-d031-4d62-8853-c130a683bb36", cat: "sezonowe", title: "Jesienne zbiory" },
  { f: "hf_20260604_221039_1d6f7300-b723-45aa-ad71-51638c202a84", cat: "sezonowe", title: "Zimowe sanki" },

  // — Uśmiechnięte, jasna karnacja, różne oczy (partia 5) —
  { f: "hf_20260605_180641_6caaba73-3b03-408b-b0fa-127b907d815e", cat: "klasyczne", title: "Uśmiech — klasyczne studio" },
  { f: "hf_20260605_180642_23c9a39b-269f-479c-aeaf-fe63b65321d8", cat: "klasyczne", title: "Uśmiech — biel" },
  { f: "hf_20260605_180645_48d6e4ea-3fbf-4104-bbdd-dcb580b11034", cat: "klasyczne", title: "Uśmiech — minimal beż" },
  { f: "hf_20260605_180647_17dcc78a-8b3f-4510-bbae-1fa9aa197111", cat: "klasyczne", title: "Uśmiech — boho" },
  { f: "hf_20260605_180652_f5dbbb72-329c-4a15-99e1-794893563c42", cat: "klasyczne", title: "Uśmiech — szałwia" },
  { f: "hf_20260605_180656_6417cc5a-83be-47da-93cf-19aeabf9a4f6", cat: "klasyczne", title: "Uśmiech — pudrowy róż" },
  { f: "hf_20260605_180740_4e434a99-1c49-442e-8f87-14b8cca3d709", cat: "klasyczne", title: "Uśmiech — lawenda" },
  { f: "hf_20260605_180741_25fcf287-7069-4ac8-b903-6602cece94c6", cat: "klasyczne", title: "Uśmiech — skandynawski" },
  { f: "hf_20260605_180742_ee965f20-507a-489a-bd80-c884c7298d9f", cat: "klasyczne", title: "Uśmiech — vintage" },
  { f: "hf_20260605_180749_65f5d559-c5c8-4080-8244-2e624bb74dfb", cat: "klasyczne", title: "Uśmiech — pastelowy błękit" },
  { f: "hf_20260605_180656_e122a28f-9aa5-4ac4-ae0c-b2042fbe7f79", cat: "tematyczne", title: "Uśmiech — chmurki" },
  { f: "hf_20260605_180748_c547adb3-9526-4b60-ac9d-697cd44080de", cat: "tematyczne", title: "Uśmiech — miś" },
  { f: "hf_20260605_180650_116c3222-f110-45e8-b68f-1edd0b3dcf80", cat: "sezonowe", title: "Uśmiech — wiosenne kwiaty" },
  { f: "hf_20260605_180743_6c81bf69-b62f-4f74-8845-13e8439feffe", cat: "sezonowe", title: "Uśmiech — jesień" },
  { f: "hf_20260605_180745_87f434f4-4cee-4db9-84c4-efe8b07f5f1e", cat: "sezonowe", title: "Uśmiech — piwonie" },
];

// Pomocnicze URL-e
GALLERY.forEach(g => {
  g.thumb = CDN + g.f + "_min.webp";
  g.full  = CDN + g.f + "." + (g.ext || "png");
});

const CAT_LABELS = {
  wszystkie: "Wszystkie",
  klasyczne: "Klasyczne",
  sezonowe: "Sezonowe",
  tematyczne: "Tematyczne",
};
