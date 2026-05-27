"""Generator ikon PWA dla MapJob.

Uruchomienie:
    pip install Pillow
    python generate_icons.py

Tworzy:
    icons/icon-192.png
    icons/icon-512.png
    icons/icon-maskable-512.png  (z safe-area 10% na kazdej krawedzi)
"""
from __future__ import annotations

import os

from PIL import Image, ImageDraw

BG = (10, 18, 40, 255)       # #0A1228
ACCENT = (0, 212, 255, 255)  # #00D4FF
DOT = (10, 18, 40, 255)

OUT_DIR = "icons"


def make_icon(size: int, maskable: bool = False) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Maskable = 10% safe-area z kazdej strony (spec W3C)
    pad = int(size * 0.10) if maskable else 0
    box = (pad, pad, size - pad, size - pad)
    inner = size - 2 * pad
    radius = int(inner * 0.22)
    draw.rounded_rectangle(box, radius=radius, fill=BG)

    # Pin w stylu map
    cx = size // 2
    pin_top = pad + int(inner * 0.18)
    pin_w = int(inner * 0.46)
    circle_box = (cx - pin_w // 2, pin_top, cx + pin_w // 2, pin_top + pin_w)
    draw.ellipse(circle_box, fill=ACCENT)

    # Trojkat (spiczasty dol pinu)
    tip_y = pin_top + int(pin_w * 1.35)
    left = (cx - pin_w // 3, pin_top + pin_w // 2)
    right = (cx + pin_w // 3, pin_top + pin_w // 2)
    tip = (cx, tip_y)
    draw.polygon([left, right, tip], fill=ACCENT)

    # Kropka w srodku (kontrast)
    dot_r = pin_w // 6
    dot_cy = pin_top + pin_w // 2
    dot_box = (cx - dot_r, dot_cy - dot_r, cx + dot_r, dot_cy + dot_r)
    draw.ellipse(dot_box, fill=DOT)

    return img


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    for size in (192, 512):
        path = os.path.join(OUT_DIR, f"icon-{size}.png")
        make_icon(size).save(path, optimize=True)
        print(f"OK  {path}  ({size}x{size})")

    mask_path = os.path.join(OUT_DIR, "icon-maskable-512.png")
    make_icon(512, maskable=True).save(mask_path, optimize=True)
    print(f"OK  {mask_path}  (512x512 maskable)")

    apple_path = os.path.join(OUT_DIR, "icon-192.png")
    print(f"\napple-touch-icon: {apple_path}")
    print("\nGotowe. Sprawdz katalog icons/.")


if __name__ == "__main__":
    main()
