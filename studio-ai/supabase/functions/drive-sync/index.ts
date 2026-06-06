// BoboFoto — auto-zapis zdjęć z nowego zamówienia na Google Drive.
// Uruchamiana automatycznie przez Database Webhook (INSERT na public.zamowienia).
//
// Wymagane sekrety (Supabase → Edge Functions → Secrets):
//   SB_URL                 = https://juqlhorodqvczoqkvkim.supabase.co
//   SB_SERVICE_ROLE_KEY    = (Settings → API → service_role  — TAJNE!)
//   GOOGLE_SA_EMAIL        = konto-usługowe@projekt.iam.gserviceaccount.com
//   GOOGLE_SA_PRIVATE_KEY  = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
//   GDRIVE_PARENT_ID       = ID folderu na Dysku Współdzielonym (Shared Drive)
//
// Szczegóły konfiguracji: docs/google-drive-auto.md

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BUCKET = "zdjecia-klientow";

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}
function b64url(data: ArrayBuffer | Uint8Array | string): string {
  let bin = "";
  if (typeof data === "string") bin = data;
  else {
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Token OAuth2 dla konta usługowego (RS256 JWT → access_token)
async function getGoogleToken(): Promise<string> {
  const email = Deno.env.get("GOOGLE_SA_EMAIL")!;
  const key = (Deno.env.get("GOOGLE_SA_PRIVATE_KEY") || "").replace(/\\n/g, "\n");
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({
    iss: email,
    scope: "https://www.googleapis.com/auth/drive",
    aud: "https://oauth2.googleapis.com/token",
    iat: now, exp: now + 3600,
  }));
  const signingInput = `${header}.${claim}`;
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8", pemToArrayBuffer(key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(signingInput));
  const jwt = `${signingInput}.${b64url(sig)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  const j = await res.json();
  if (!j.access_token) throw new Error("Google token error: " + JSON.stringify(j));
  return j.access_token as string;
}

async function driveCreateFolder(token: string, name: string, parent: string): Promise<string> {
  const res = await fetch("https://www.googleapis.com/drive/v3/files?supportsAllDrives=true", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder", parents: [parent] }),
  });
  const j = await res.json();
  if (!j.id) throw new Error("Folder error: " + JSON.stringify(j));
  return j.id as string;
}

async function driveUpload(token: string, name: string, parent: string, blob: Blob): Promise<void> {
  const meta = JSON.stringify({ name, parents: [parent] });
  const boundary = "bf" + crypto.randomUUID();
  const head = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: ${blob.type || "application/octet-stream"}\r\n\r\n`;
  const tail = `\r\n--${boundary}--`;
  const body = new Blob([head, blob, tail], { type: `multipart/related; boundary=${boundary}` });
  const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
  if (!res.ok) throw new Error("Upload error: " + (await res.text()));
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const row = payload.record || payload; // webhook → { record: {...} }
    const pliki: string[] = Array.isArray(row.pliki) ? row.pliki : [];
    if (!pliki.length) return new Response(JSON.stringify({ ok: true, info: "brak plików" }), { status: 200 });

    const sb = createClient(Deno.env.get("SB_URL")!, Deno.env.get("SB_SERVICE_ROLE_KEY")!);
    const token = await getGoogleToken();

    const stamp = new Date().toISOString().slice(0, 16).replace("T", "_").replace(/:/g, "");
    const who = String(row.imie || "klient").replace(/[^\w]+/g, "_");
    const folderName = `${stamp}_${who}_${row.id ?? ""}`;
    const folderId = await driveCreateFolder(token, folderName, Deno.env.get("GDRIVE_PARENT_ID")!);

    for (let i = 0; i < pliki.length; i++) {
      const { data, error } = await sb.storage.from(BUCKET).download(pliki[i]);
      if (error || !data) continue;
      const name = (i + 1) + "-" + (pliki[i].split("/").pop() || "plik");
      await driveUpload(token, name, folderId, data);
    }

    return new Response(JSON.stringify({ ok: true, folder: folderName, plikow: pliki.length }), {
      headers: { "Content-Type": "application/json" }, status: 200,
    });
  } catch (e) {
    console.error("drive-sync:", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      headers: { "Content-Type": "application/json" }, status: 500,
    });
  }
});
