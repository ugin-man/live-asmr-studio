from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
STORE = ROOT / "store-assets"
BACKGROUND = STORE / "source" / "promo-background.png"
ICON = ROOT / "extension" / "assets" / "icons" / "icon-source-1024.png"
SCREENSHOTS = ROOT / "output" / "playwright"
FONT_REGULAR = Path(r"C:\Windows\Fonts\segoeui.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\segoeuib.ttf")


def font(size: int, *, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_BOLD if bold else FONT_REGULAR), size)


def cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    return ImageOps.fit(image.convert("RGB"), size, method=Image.Resampling.LANCZOS)


def add_readability_gradient(canvas: Image.Image, strength: int = 205) -> None:
    width, height = canvas.size
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    pixels = overlay.load()
    for x in range(width):
        ratio = x / max(1, width - 1)
        alpha = int(strength * max(0, 1 - ratio * 1.45))
        for y in range(height):
            pixels[x, y] = (3, 7, 22, alpha)
    canvas.alpha_composite(overlay)


def rounded_panel(image: Image.Image, size: tuple[int, int], radius: int = 24) -> Image.Image:
    fitted = ImageOps.fit(
        image.convert("RGB"),
        size,
        method=Image.Resampling.LANCZOS,
        centering=(0.5, 0.0),
    )
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius, fill=255)
    result = Image.new("RGBA", size, (0, 0, 0, 0))
    result.paste(fitted, (0, 0), mask)
    return result


def draw_brand(draw: ImageDraw.ImageDraw, x: int, y: int, size: int) -> int:
    icon = Image.open(ICON).convert("RGBA").resize((size, size), Image.Resampling.LANCZOS)
    draw._image.alpha_composite(icon, (x, y))
    draw.text((x + size + 18, y + 4), "LIVE ASMR STUDIO", font=font(21, bold=True), fill="#F7FAFF")
    draw.text((x + size + 18, y + 34), "OPEN-SOURCE BINAURAL AUDIO", font=font(13, bold=True), fill="#75D9FF")
    return y + size


def build_listing_screenshot(source_name: str, output_name: str, title: str, subtitle: str) -> None:
    background = Image.open(BACKGROUND)
    canvas = cover(background, (1280, 800)).convert("RGBA")
    add_readability_gradient(canvas)
    draw = ImageDraw.Draw(canvas)
    draw_brand(draw, 72, 60, 72)
    draw.multiline_text((72, 240), title, font=font(50, bold=True), fill="#FFFFFF", spacing=4)
    draw.multiline_text((74, 390), subtitle, font=font(23), fill="#C8D5E8", spacing=8)
    draw.text((74, 666), "Spatial ASMR for ChatGPT Voice Live", font=font(19, bold=True), fill="#70D8FF")
    draw.text((74, 706), "Audio stays in your browser.", font=font(17), fill="#AEBBD0")

    screenshot = Image.open(SCREENSHOTS / source_name)
    panel_size = (440, 704)
    panel = rounded_panel(screenshot, panel_size, 22)
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    x, y = 780, 48
    shadow_draw.rounded_rectangle(
        (x - 8, y - 8, x + panel_size[0] + 8, y + panel_size[1] + 8),
        30,
        fill=(0, 0, 0, 170),
    )
    canvas.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(18)))
    canvas.alpha_composite(panel, (x, y))
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle(
        (x - 1, y - 1, x + panel_size[0], y + panel_size[1]),
        23,
        outline="#41597B",
        width=2,
    )
    canvas.convert("RGB").save(STORE / output_name, quality=95)


def build_small_promo() -> None:
    canvas = cover(Image.open(BACKGROUND), (440, 280)).convert("RGBA")
    overlay = Image.new("RGBA", canvas.size, (2, 6, 19, 48))
    canvas.alpha_composite(overlay)
    icon = Image.open(ICON).convert("RGBA").resize((78, 78), Image.Resampling.LANCZOS)
    canvas.alpha_composite(icon, (32, 32))
    canvas.convert("RGB").save(STORE / "promo-small-440x280.png", quality=95)


def build_marquee() -> None:
    canvas = cover(Image.open(BACKGROUND), (1400, 560)).convert("RGBA")
    icon = Image.open(ICON).convert("RGBA").resize((126, 126), Image.Resampling.LANCZOS)
    canvas.alpha_composite(icon, (100, 217))
    canvas.convert("RGB").save(STORE / "promo-marquee-1400x560.png", quality=95)


def main() -> None:
    STORE.mkdir(parents=True, exist_ok=True)
    build_listing_screenshot(
        "ui-session.png",
        "screenshot-1-session-1280x800.png",
        "Build an ASMR\nsession in seconds",
        "Choose a mode, authored flow, voice style,\nand content depth when it applies.",
    )
    build_listing_screenshot(
        "ui-spatial.png",
        "screenshot-2-spatial-1280x800.png",
        "Place the voice\naround you",
        "Drag the source, choose a distance,\nthen tune close-to-far motion in seconds.",
    )
    build_listing_screenshot(
        "ui-texture.png",
        "screenshot-3-texture-1280x800.png",
        "Tune the texture,\nnot just the volume",
        "Blend body, near-ear detail, sibilance\ncontrol, and low-band pressure.",
    )
    build_small_promo()
    build_marquee()
    Image.open(ROOT / "extension" / "assets" / "icons" / "icon128.png").convert("RGBA").save(
        STORE / "icon-128.png"
    )
    for path in sorted(STORE.glob("*.png")):
        with Image.open(path) as image:
            print(f"{path.name}: {image.width}x{image.height}")


if __name__ == "__main__":
    main()
