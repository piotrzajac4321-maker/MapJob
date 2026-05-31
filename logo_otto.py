# -*- coding: utf-8 -*-
# Embed the REAL OTTO Work Force logo as base64 data URIs.
#   otto-logo.jpg  -> LOGO       (full lockup: OTTO box + workforce.eu) on the cover
#   otto-mark.png  -> LOGO_MARK  (just the OTTO box, auto-cropped) for map pins + offer cards
import base64, json, os
from PIL import Image

SRC = "otto-logo.jpg"
MARK_OUT = "otto-mark.png"

def build_mark():
    im = Image.open(SRC).convert("RGB")
    W, H = im.size
    px = im.load()
    def nonwhite(x, y):
        r, g, b = px[x, y]
        return not (r > 238 and g > 238 and b > 238)
    # rows that contain real content
    row_nw = [sum(1 for x in range(W) if nonwhite(x, y)) for y in range(H)]
    thr = W * 0.04
    content = [y for y in range(H) if row_nw[y] > thr]
    # group consecutive content rows
    groups, cur = [], []
    for y in content:
        if cur and y - cur[-1] > 2:
            groups.append((cur[0], cur[-1])); cur = []
        cur.append(y)
    if cur:
        groups.append((cur[0], cur[-1]))
    # the OTTO box is the tallest group (workforce.eu line is short)
    box = max(groups, key=lambda g: g[1] - g[0])
    y0, y1 = box
    # horizontal bbox within the box rows
    xs = [x for y in range(y0, y1 + 1) for x in range(W) if nonwhite(x, y)]
    x0, x1 = min(xs), max(xs)
    crop = im.crop((x0, y0, x1 + 1, y1 + 1))
    cw, ch = crop.size
    pad = max(cw, ch) // 12
    side = max(cw, ch) + pad * 2
    canvas = Image.new("RGB", (side, side), (255, 255, 255))
    canvas.paste(crop, ((side - cw) // 2, (side - ch) // 2))
    canvas.save(MARK_OUT)
    print("mark cropped:", (x0, y0, x1, y1), "-> canvas", canvas.size)

build_mark()

MIME = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
        ".webp": "image/webp", ".svg": "image/svg+xml"}

def datauri(path):
    ext = os.path.splitext(path)[1].lower()
    data = open(path, "rb").read()
    return "data:%s;base64,%s" % (MIME[ext], base64.b64encode(data).decode())

with open("_logo_data.js", "w", encoding="utf-8") as f:
    f.write("var LOGO=%s;\n" % json.dumps(datauri(SRC)))
    f.write("var LOGO_MARK=%s;\n" % json.dumps(datauri(MARK_OUT)))

print("embedded OTTO logo: %s (full) + %s (mark)" % (SRC, MARK_OUT))
