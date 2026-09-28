from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "public"
SOURCE = ROOT / "logo.png"
BACKGROUND = (12, 11, 9, 255)


def make_square(source: Image.Image, size: int, fit: float) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), BACKGROUND)
    logo = source.copy()
    box = max(1, int(size * fit))
    logo.thumbnail((box, box), Image.Resampling.LANCZOS)
    x = (size - logo.width) // 2
    y = (size - logo.height) // 2
    canvas.paste(logo, (x, y), logo)
    return canvas.convert("RGB")


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    outputs = {
        "pwa-192x192.png": (192, 0.88),
        "pwa-512x512.png": (512, 0.88),
        "pwa-512x512-maskable.png": (512, 0.70),
        "apple-touch-icon.png": (180, 0.88),
        "favicon-32x32.png": (32, 0.90),
    }
    for name, (size, fit) in outputs.items():
        make_square(source, size, fit).save(ROOT / name, "PNG", optimize=True)
        print(f"gerado {name}")


if __name__ == "__main__":
    main()
