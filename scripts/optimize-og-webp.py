"""Crea una imagen Open Graph WebP desde el PNG original archivado."""

import io
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
source = ROOT / "og.png"
if not source.exists():
    source = ROOT / "tmp" / "unused-images" / "og.png"
target = ROOT / "og.webp"
with Image.open(source) as image:
    if image.size != (1200, 630):
        raise ValueError(f"og.png debe medir 1200x630, mide {image.size}")
    if image.mode not in {"RGB", "RGBA"}:
        image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
    for quality in (92, 90, 88, 85, 82, 80):
        stream = io.BytesIO()
        image.save(stream, format="WEBP", quality=quality, method=6)
        data = stream.getvalue()
        if len(data) <= 500 * 1024:
            break
    else:
        raise ValueError("og.webp no alcanza el límite de 500 KiB sin más cambios")
with Image.open(io.BytesIO(data)) as check:
    check.load()
    if check.size != (1200, 630):
        raise ValueError("Dimensiones de og.webp incorrectas")
if target.exists() and target.read_bytes() != data:
    raise FileExistsError("og.webp ya existe con otro contenido")
if not target.exists():
    target.write_bytes(data)
print(f"OG: {source.stat().st_size // 1024} -> {len(data) // 1024} KiB; calidad {quality}")
