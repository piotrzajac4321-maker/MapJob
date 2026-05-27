# -*- coding: utf-8 -*-
# Embed the REAL Żabka logo (zabka-logo.png, transparent green wordmark #006420).
#   LOGO       -> full wordmark (transparent) shown on the white cover box
#   LOGO_MARK  -> green rounded square + white "ż" glyph, used on map pins + offer cards
import base64, json, os
from PIL import Image, ImageDraw

SRC = "zabka-logo.png"          # 196x78 RGBA, transparent bg, wordmark in #006420
MARK_OUT = "zabka-mark.png"
GREEN = (0, 100, 32)            # #006420 Żabka deep green

def build_mark():
    im = Image.open(SRC).convert("RGBA")
    W, H = im.size
    px = im.load()
    # column occupancy -> find the first glyph ("ż") bounded by the first empty column gap
    def colfull(x):
        return any(px[x, y][3] > 40 for y in range(H))
    x = 0
    while x < W and not colfull(x):
        x += 1
    x0 = x
    while x < W and colfull(x):
        x += 1
    x1 = x                       # first gap
    # vertical bounds of that glyph
    ys = [y for y in range(H) for xx in range(x0, x1) if px[xx, y][3] > 40]
    y0, y1 = min(ys), max(ys)
    glyph = im.crop((x0, y0, x1, y1 + 1))
    gw, gh = glyph.size
    # recolour glyph to white, keep alpha
    white = Image.new("RGBA", glyph.size, (255, 255, 255, 0))
    gpx, wpx = glyph.load(), white.load()
    for yy in range(gh):
        for xx in range(gw):
            a = gpx[xx, yy][3]
            if a > 0:
                wpx[xx, yy] = (255, 255, 255, a)
    # green rounded square canvas, glyph centered with padding
    side = int(max(gw, gh) * 2.0)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    mask = Image.new("L", (side, side), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, side - 1, side - 1],
                                           radius=int(side * 0.24), fill=255)
    green = Image.new("RGBA", (side, side), GREEN + (255,))
    canvas.paste(green, (0, 0), mask)
    # scale glyph to ~58% of side height
    target_h = int(side * 0.58)
    scale = target_h / gh
    g2 = white.resize((max(1, int(gw * scale)), target_h), Image.LANCZOS)
    canvas.paste(g2, ((side - g2.width) // 2, (side - g2.height) // 2), g2)
    canvas.save(MARK_OUT)
    print("mark glyph crop:", (x0, y0, x1, y1), "-> canvas", canvas.size)

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

print("embedded Żabka logo: %s (full) + %s (mark)" % (SRC, MARK_OUT))
