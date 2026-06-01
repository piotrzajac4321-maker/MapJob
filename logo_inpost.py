# -*- coding: utf-8 -*-
# PRAWDZIWE logo InPost (inpost_official.png — render SVG z Wikimedia Commons, File:InPost_logo.svg).
#   LOGO       = sam ZNAK marki (słońce + półksiężyc), BEZ wordmarku -> biały box cover
#   LOGO_MARK  = SAME żółte promienie słońca (bez ciemnego półksiężyca, bez napisów) -> piny + karty
import base64, json, os
from PIL import Image

SRC = "inpost_official.png"
COVER_OUT = "inpost-logo-full.png"      # PEŁNE logo: słońce + półksiężyc + wordmark "InPost"
MARK_OUT = "inpost-mark.png"            # same promienie słońca (piny + karty)
SYMBOL_X_END = 132                       # przerwa między znakiem a wordmarkiem

def bbox_alpha(px, W, H, x0=0, x1=None, pred=None):
    if x1 is None:
        x1 = W
    minx, miny, maxx, maxy = W, H, 0, 0
    found = False
    for y in range(H):
        for x in range(x0, x1):
            r, g, b, a = px[x, y]
            if a <= 30:
                continue
            if pred and not pred(r, g, b):
                continue
            found = True
            minx = min(minx, x); maxx = max(maxx, x)
            miny = min(miny, y); maxy = max(maxy, y)
    if not found:
        return None
    return (minx, miny, maxx + 1, maxy + 1)

def square(im):
    w, h = im.size
    side = int(max(w, h) * 1.14)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.alpha_composite(im, ((side - w) // 2, (side - h) // 2))
    return canvas

im = Image.open(SRC).convert("RGBA")
W, H = im.size
px = im.load()

# 1) PEŁNE logo na cover: słońce + półksiężyc + wordmark "InPost" (cała treść, przycięta)
fb = bbox_alpha(px, W, H)
cover = im.crop(fb)
cover.save(COVER_OUT)
print("full logo crop:", fb, "->", cover.size)

# region samego znaku (do wycięcia promieni na sygnet)
sb = bbox_alpha(px, W, H, 0, SYMBOL_X_END)

# 2) SYGNET: tylko żółte promienie słońca (usuń ciemny półksiężyc i wszystko nie-żółte)
def is_yellow(r, g, b):
    return r > 175 and g > 120 and b < 135 and (r - b) > 45

sym = im.crop(sb).convert("RGBA")
spx = sym.load(); sw, sh = sym.size
for y in range(sh):
    for x in range(sw):
        r, g, b, a = spx[x, y]
        if a > 30 and not is_yellow(r, g, b):
            spx[x, y] = (r, g, b, 0)          # wytnij półksiężyc / ciemne piksele
# przytnij do samych promieni i wyśrodkuj na kwadracie
yb = bbox_alpha(spx, sw, sh)
sun = square(sym.crop(yb)) if yb else square(sym)
sun.save(MARK_OUT)
print("sun-only mark -> canvas", sun.size)

MIME = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
        ".webp": "image/webp", ".svg": "image/svg+xml"}

def datauri(path):
    ext = os.path.splitext(path)[1].lower()
    data = open(path, "rb").read()
    return "data:%s;base64,%s" % (MIME[ext], base64.b64encode(data).decode())

with open("_logo_data.js", "w", encoding="utf-8") as f:
    f.write("var LOGO=%s;\n" % json.dumps(datauri(COVER_OUT)))
    f.write("var LOGO_MARK=%s;\n" % json.dumps(datauri(MARK_OUT)))

print("embedded InPost: %s (znak na cover) + %s (same promienie na piny)" % (COVER_OUT, MARK_OUT))
