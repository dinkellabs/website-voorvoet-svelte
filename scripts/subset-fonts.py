#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["fonttools[woff]>=4.55"]
# ///
"""Subset Lato woff2 fonts to Latin + Latin-Extended glyph ranges.

Reads source woff2 files from ``scripts/fonts-source/`` and writes subset
woff2 files to ``static/fonts/``. The unicode ranges chosen here mirror the
Google Fonts ``latin`` + ``latin-ext`` slices, which cover every Western
European language (NL, DE, EN, FR, IT, ES, PT, scandinavian, etc.) plus
common punctuation and currency.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

UNICODES = ",".join(
    [
        "U+0000-00FF",
        "U+0131",
        "U+0152-0153",
        "U+02BB-02BC",
        "U+02C6",
        "U+02DA",
        "U+02DC",
        "U+0100-024F",
        "U+0259",
        "U+1E00-1EFF",
        "U+2000-206F",
        "U+2074",
        "U+20A0-20CF",
        "U+2113",
        "U+2122",
        "U+2191",
        "U+2193",
        "U+2212",
        "U+2215",
        "U+2C60-2C7F",
        "U+A720-A7FF",
        "U+FEFF",
        "U+FFFD",
    ]
)

REPO_ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = REPO_ROOT / "scripts" / "fonts-source"
OUTPUT_DIR = REPO_ROOT / "static" / "fonts"
FONTS = ["lato-regular.woff2", "lato-bold.woff2", "lato-black.woff2"]


def subset_one(src: Path, dst: Path) -> tuple[int, int]:
    """Subset a single woff2 file and return (input_bytes, output_bytes)."""
    before = src.stat().st_size
    cmd = [
        sys.executable,
        "-m",
        "fontTools.subset",
        str(src),
        f"--unicodes={UNICODES}",
        "--layout-features=kern,liga,clig,calt,ccmp,locl,mark,mkmk",
        "--no-hinting",
        "--desubroutinize",
        "--name-IDs=*",
        "--name-legacy",
        "--name-languages=*",
        "--notdef-outline",
        "--recommended-glyphs",
        "--flavor=woff2",
        f"--output-file={dst}",
    ]
    subprocess.run(cmd, check=True)
    after = dst.stat().st_size
    return before, after


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    total_before = total_after = 0
    print(f"{'file':<24}{'before':>12}{'after':>12}{'saved':>10}")
    print("-" * 58)
    for name in FONTS:
        src = SOURCE_DIR / name
        dst = OUTPUT_DIR / name
        if not src.is_file():
            sys.exit(f"missing source: {src}")
        before, after = subset_one(src, dst)
        total_before += before
        total_after += after
        pct = 100 * (1 - after / before)
        print(f"{name:<24}{before/1024:>9.1f} KB{after/1024:>9.1f} KB{pct:>8.1f}%")
    print("-" * 58)
    pct = 100 * (1 - total_after / total_before)
    print(
        f"{'TOTAL':<24}{total_before/1024:>9.1f} KB"
        f"{total_after/1024:>9.1f} KB{pct:>8.1f}%"
    )


if __name__ == "__main__":
    main()
