"""Build lightweight WebP assets used by the deep-sea redesign.

Run from the repository root. Original source artwork is intentionally kept so
future edits can be exported again without quality loss.
"""

from pathlib import Path
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
CHARACTER_DIR = ROOT / "assets" / "characters"
BACKGROUND_DIR = ROOT / "assets" / "backgrounds"


def export_webp(source: Path, destination: Path, max_side: int, quality: int) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
        image.save(destination, "WEBP", quality=quality, method=6)


def main() -> None:
    character_names = [
        *(f"naoking-{index}.png" for index in range(1, 8)),
        "naoking-hero.png",
        "naoking-jackpot.png",
        "naoking-laugh.png",
        "naoking-panic.png",
        "naoking-sleepy.png",
    ]
    for name in character_names:
        max_side = 1120 if name == "naoking-hero.png" else 520
        export_webp(ROOT / name, CHARACTER_DIR / f"{Path(name).stem}.webp", max_side, 82)

    for source in sorted((ROOT / "backgrounds").glob("*.jpg")):
        export_webp(source, BACKGROUND_DIR / f"{source.stem}.webp", 1600, 76)


if __name__ == "__main__":
    main()
