"""Verifica decodificación, dimensiones y transparencia de los WebP generados."""

import json
from pathlib import Path

from PIL import Image, ImageChops, ImageOps


ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / "scripts" / "webp-manifest.json").read_text(encoding="utf-8"))
problems = []
lossless_checked = 0
for entry in manifest["converted"]:
    original_path = ROOT / entry["source"]
    if not original_path.exists():
        original_path = ROOT / "tmp" / "unused-images" / entry["source"]
    with Image.open(original_path) as original, Image.open(ROOT / entry["target"]) as webp:
        image = ImageOps.exif_transpose(original)
        webp.load()
        if image.size != webp.size:
            problems.append(f"dimensiones: {entry['source']}")
        if original.format == "PNG":
            lossless_checked += 1
            backdrop = Image.new("RGBA", image.size, "#f6efe4")
            expected = backdrop.copy()
            actual = backdrop.copy()
            expected.alpha_composite(image.convert("RGBA"))
            actual.alpha_composite(webp.convert("RGBA"))
            if ImageChops.difference(expected, actual).getbbox():
                problems.append(f"diferencia visible: {entry['source']}")
            if "A" in image.getbands() and ImageChops.difference(
                image.getchannel("A"), webp.convert("RGBA").getchannel("A")
            ).getbbox():
                problems.append(f"transparencia: {entry['source']}")

with Image.open(ROOT / "og.webp") as og:
    og.load()
    if og.size != (1907, 913):
        problems.append("dimensiones de og.webp")

print(f"WebP decodificados: {len(manifest['converted'])}; PNG sin diferencia visible: {lossless_checked}; problemas: {len(problems)}")
for problem in problems[:20]:
    print(problem)
if problems:
    raise SystemExit(1)
