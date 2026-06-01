# -*- coding: utf-8 -*-
# Embed the REAL ZETKAMA logo files as base64 data URIs.
#   zetkama-mark.png  -> LOGO_MARK (map pins + every offer card)
#   zetkama-logo.webp -> LOGO      (main profile cover lockup)
import base64, json, os

MARK_FILE = "zetkama-mark.png"   # blue emblem only
FULL_FILE = "zetkama-logo-trim.png"  # emblem + ZETKAMA wordmark (trimmed)

MIME = {".png": "image/png", ".webp": "image/webp",
        ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml"}

def datauri(path):
    ext = os.path.splitext(path)[1].lower()
    data = open(path, "rb").read()
    return "data:%s;base64,%s" % (MIME[ext], base64.b64encode(data).decode())

with open("_logo_data.js", "w", encoding="utf-8") as f:
    f.write("var LOGO=%s;\n" % json.dumps(datauri(FULL_FILE)))
    f.write("var LOGO_MARK=%s;\n" % json.dumps(datauri(MARK_FILE)))

print("embedded real ZETKAMA logo: %s (mark) + %s (full)" % (MARK_FILE, FULL_FILE))
