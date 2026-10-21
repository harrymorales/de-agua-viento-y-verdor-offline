"""Crea la imagen Open Graph WebP desde el PNG actual archivado."""

import io
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
source = ROOT / "src" / "images" / "og-new-2026-10-21.png"
if not source.exists():
    source = ROOT / "og new.png"
target = ROOT / "og.webp"
with Image.open(source) as image:
    if image.size != (1907, 913):
        raise ValueError(f"La imagen OG debe medir 1907x913, mide {image.size}")
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
    if check.size != (1907, 913):
        raise ValueError("Dimensiones de og.webp incorrectas")
if not target.exists() or target.read_bytes() != data:
    target.write_bytes(data)
print(f"OG: {source.stat().st_size // 1024} -> {len(data) // 1024} KiB; calidad {quality}")
