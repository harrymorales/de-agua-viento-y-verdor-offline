"""Convierte contenido visual versionado a WebP; admite originales archivados.

Uso: python scripts/optimize-images-webp.py [--sample N | --apply]
El manifiesto generado permite empaquetar WebP en lugar de los originales.
"""

import argparse
import io
import json
import subprocess
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "scripts" / "webp-manifest.json"
RETIRED = ROOT / "scripts" / "retired-images.json"
BRAND_IMAGES = {
    "images/logo cultura.png",
    "images/logo educacion.png",
    "images/portal/cobranding-blanco.png",
    "images/portal/creditos-logos.png",
    "images/logos/logo cultura.png",
    "images/logos/logo educacion.png",
    "images/logos/cobranding-blanco.png",
    "images/logos/creditos-logos.png",
}


def original_path(path):
    source = ROOT / path
    if source.exists():
        return source
    return ROOT / "tmp" / "unused-images" / path


def tracked_images():
    retired_sources = {
        entry["source"] for entry in json.loads(RETIRED.read_text(encoding="utf-8"))
    }
    result = subprocess.check_output(
        ["git", "-c", f"safe.directory={ROOT.as_posix()}", "ls-files", "-z", "images"],
        cwd=ROOT,
    )
    return [
        p.decode("utf-8") for p in result.split(b"\0") if p
        and p.decode("utf-8").lower().endswith((".jpg", ".jpeg", ".png"))
        and p.decode("utf-8") not in BRAND_IMAGES
        and p.decode("utf-8") not in retired_sources
    ]


def convert(path):
    source = original_path(path)
    with Image.open(source) as original:
        if getattr(original, "n_frames", 1) != 1:
            return None
        image = ImageOps.exif_transpose(original)
        if image.mode not in {"RGB", "RGBA"}:
            image = image.convert("RGBA" if "A" in image.getbands() or "transparency" in image.info else "RGB")
        output = io.BytesIO()
        is_png = source.suffix.lower() == ".png"
        options = {"format": "WEBP", "method": 6, "lossless": is_png}
        if not is_png:
            options["quality"] = 85
        if original.info.get("icc_profile"):
            options["icc_profile"] = original.info["icc_profile"]
        image.save(output, **options)
        data = output.getvalue()
        # Verificación: archivo legible, dimensiones y transparencia intactas.
        with Image.open(io.BytesIO(data)) as check:
            check.load()
            if check.size != image.size:
                raise ValueError(f"Dimensiones diferentes: {path}")
            if "A" in image.getbands() and "A" not in check.getbands():
                raise ValueError(f"Transparencia perdida: {path}")
        return data


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sample", type=int, default=0, help="analizar los primeros N archivos sin escribir")
    parser.add_argument("--apply", action="store_true", help="generar los WebP y el manifiesto")
    args = parser.parse_args()
    if args.apply and args.sample:
        parser.error("use --sample o --apply, no ambos")

    existing_targets = {}
    if MANIFEST.exists():
        existing_targets = {
            entry["source"]: entry["target"]
            for entry in json.loads(MANIFEST.read_text(encoding="utf-8"))["converted"]
        }

    paths = tracked_images()
    if args.sample:
        # Mezcla de fotografías e ilustraciones, orden estable.
        photos = [p for p in paths if p.lower().endswith((".jpg", ".jpeg"))]
        illustrations = [p for p in paths if p.lower().endswith(".png")]
        paths = photos[: max(1, args.sample // 2)] + illustrations[: args.sample - max(1, args.sample // 2)]
    converted = []
    skipped = []
    old_total = new_total = 0
    for number, path in enumerate(paths, 1):
        source = original_path(path)
        data = convert(path)
        if data is None or len(data) >= source.stat().st_size:
            skipped.append(path)
            continue
        target = existing_targets.get(path, str(Path(path).with_suffix(".webp")).replace("\\", "/"))
        if args.apply:
            destination = ROOT / target
            if destination.exists() and destination.read_bytes() != data:
                raise FileExistsError(f"Ya existe un WebP distinto: {destination}")
            if not destination.exists():
                destination.write_bytes(data)
        old_total += source.stat().st_size
        new_total += len(data)
        converted.append({"source": path, "target": target, "before": source.stat().st_size, "after": len(data)})
        if number % 50 == 0:
            print(f"Procesadas {number}/{len(paths)} imágenes")
    if args.apply:
        MANIFEST.write_text(json.dumps({"converted": converted, "skipped": skipped}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Convertibles: {len(converted)}; sin ahorro: {len(skipped)}")
    print(f"En archivos convertidos: {old_total / 1048576:.2f} -> {new_total / 1048576:.2f} MiB ({(1 - new_total / old_total) * 100 if old_total else 0:.1f}% menos)")
    for entry in converted[:12]:
        print(f"  {entry['source']}: {entry['before'] // 1024} -> {entry['after'] // 1024} KiB")
    if not args.apply:
        print("Solo análisis; use --apply para crear los archivos.")


if __name__ == "__main__":
    main()
