from __future__ import annotations

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "extension" / "assets" / "icons" / "icon-source-1024.png"
OUTPUT = ROOT / "extension" / "assets" / "icons"


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    for canvas_size in (16, 32, 48, 128):
        artwork_size = round(canvas_size * 0.75)
        artwork = source.resize((artwork_size, artwork_size), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
        offset = (canvas_size - artwork_size) // 2
        canvas.alpha_composite(artwork, (offset, offset))
        target = OUTPUT / f"icon{canvas_size}.png"
        canvas.save(target, optimize=True)
        print(f"{target.name}: {canvas_size}x{canvas_size}, artwork {artwork_size}x{artwork_size}")


if __name__ == "__main__":
    main()
