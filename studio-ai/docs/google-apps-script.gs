/**
 * BoboFoto — zapis zdjęć z zamówień na Twój Google Drive.
 * Wklej to w https://script.google.com (Nowy projekt), zapisz, a potem
 * Wdróż → Nowe wdrożenie → Aplikacja internetowa (instrukcja w google-drive-setup.md).
 *
 * Tworzy folder „BoboFoto — zamówienia", a w nim podfolder na każde zamówienie
 * z danymi (zamowienie.txt) i przesłanymi zdjęciami w pełnej jakości.
 */

var SECRET = "bobofoto_082190e1db39cf796386ed5af4742b954e71"; // ten sam co na stronie — nie zmieniaj
var ROOT_FOLDER_NAME = "BoboFoto — zamówienia";
var MAX_FILES = 20;                 // limit plików na zamówienie (anty-spam)
var MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB / plik

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents || "{}");
    if (data.secret !== SECRET) return json({ ok: false, error: "unauthorized" });

    var root = getOrCreateFolder(DriveApp.getRootFolder(), ROOT_FOLDER_NAME);
    var stamp = Utilities.formatDate(new Date(), "GMT+2", "yyyy-MM-dd_HH-mm");
    var who = String(data.imie || "klient").replace(/[^\wąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+/g, "_").slice(0, 40);
    var folder = root.createFolder(stamp + "_" + who);

    folder.createFile("zamowienie.txt", buildNote(data), "text/plain");

    var pliki = (data.pliki || []).slice(0, MAX_FILES);
    var saved = 0;
    for (var i = 0; i < pliki.length; i++) {
      var f = pliki[i];
      if (!f || !f.b64) continue;
      var bytes = Utilities.base64Decode(f.b64);
      if (bytes.length > MAX_FILE_BYTES) continue;
      var name = (i + 1) + "-" + (f.name || "zdjecie");
      folder.createFile(Utilities.newBlob(bytes, f.type || "application/octet-stream", name));
      saved++;
    }
    return json({ ok: true, folder: folder.getName(), zapisano: saved });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function buildNote(d) {
  var L = [];
  L.push("ZAMÓWIENIE BoboFoto");
  L.push("Data: " + new Date().toLocaleString("pl-PL"));
  L.push("");
  L.push("Imię:    " + (d.imie || "—"));
  L.push("E-mail:  " + (d.email || "—"));
  L.push("Telefon: " + (d.telefon || "—"));
  L.push("Pakiet:  " + (d.pakiet || "—"));
  L.push("");
  L.push("Opis / życzenia:");
  L.push(d.opis || "—");
  if (d.stylizacje && d.stylizacje.length) {
    L.push("");
    L.push("Wybrane stylizacje:");
    d.stylizacje.forEach(function (s) {
      L.push(" • " + (s.styl || "") + (s.coZmienic ? "  → " + s.coZmienic : ""));
    });
  }
  return L.join("\n");
}

function getOrCreateFolder(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
