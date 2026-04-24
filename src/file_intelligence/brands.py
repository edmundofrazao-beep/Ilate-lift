from __future__ import annotations

import re
from pathlib import Path


BRAND_ALIASES: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("Schindler", ("schindler",)),
    ("Otis", ("otis", "gen2", "gen 2")),
    ("Kone", ("kone", "monospace", "ecospace")),
    ("Orona", ("orona",)),
    ("TKE", ("tke", "tk elevator", "thyssenkrupp", "thyssen")),
    ("Kleemann", ("kleemann",)),
    ("Wittur", ("wittur", "selcom", "sematic")),
    ("GMV", ("gmv",)),
    ("MP", ("mp lifts", "mplift")),
    ("Sassi", ("alberto sassi", "sassi")),
    ("Montanari", ("montanari",)),
    ("Ziehl-Abegg", ("ziehl-abegg", "ziehl abegg", "zabbeg")),
    ("Sodimas", ("sodimas",)),
    ("Savaria", ("savaria",)),
    ("Hydroware", ("hydroware",)),
    ("Fermator", ("fermator",)),
)


def slugify_folder(text: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "_", text.strip()).strip("_")
    return slug or "Sem_Marca"


def _contains_alias(haystack: str, alias: str) -> bool:
    pattern = r"(?<![a-z0-9])" + re.escape(alias.lower()) + r"(?![a-z0-9])"
    return re.search(pattern, haystack) is not None


def detect_brand(rel_path: str, filename: str, snippet: str = "") -> str | None:
    path_parts = [part.lower() for part in Path(rel_path).parts]
    filename_lower = filename.lower()
    path_text = " / ".join(path_parts)
    snippet_text = snippet[:400].lower()

    for brand, aliases in BRAND_ALIASES:
        for alias in aliases:
            if any(_contains_alias(part, alias) for part in path_parts):
                return brand
            if _contains_alias(filename_lower, alias):
                return brand

    for brand, aliases in BRAND_ALIASES:
        for alias in aliases:
            if _contains_alias(path_text, alias):
                return brand

    for brand, aliases in BRAND_ALIASES:
        for alias in aliases:
            if _contains_alias(snippet_text, alias):
                return brand

    return None
