from __future__ import annotations

import re
from pathlib import Path


EXTENSION_CATEGORY_RULES = {
    ".jpg": ("Documentacao Tecnica", 0.65, "image_extension"),
    ".jpeg": ("Documentacao Tecnica", 0.65, "image_extension"),
    ".png": ("Documentacao Tecnica", 0.65, "image_extension"),
    ".heic": ("Documentacao Tecnica", 0.60, "image_extension"),
    ".gif": ("Documentacao Tecnica", 0.55, "image_extension"),
    ".dwg": ("Esquemas Eletricos", 0.99, "cad_extension"),
    ".dxf": ("Esquemas Eletricos", 0.99, "cad_extension"),
    ".ifc": ("Ficheiros de Engenharia", 0.98, "bim_extension"),
    ".step": ("Ficheiros de Engenharia", 0.97, "cad_extension"),
    ".stp": ("Ficheiros de Engenharia", 0.97, "cad_extension"),
    ".sldprt": ("Ficheiros de Engenharia", 0.98, "cad_extension"),
    ".sldasm": ("Ficheiros de Engenharia", 0.98, "cad_extension"),
    ".ipt": ("Ficheiros de Engenharia", 0.98, "cad_extension"),
    ".iam": ("Ficheiros de Engenharia", 0.98, "cad_extension"),
    ".pdf": ("Documentacao Tecnica", 0.40, "pdf_neutral"),
    ".doc": ("Documentacao Tecnica", 0.58, "office_extension"),
    ".docx": ("Documentacao Tecnica", 0.65, "office_extension"),
    ".xls": ("Documentacao Tecnica", 0.58, "spreadsheet_extension"),
    ".xlsx": ("Documentacao Tecnica", 0.58, "spreadsheet_extension"),
    ".ppt": ("Documentacao Tecnica", 0.56, "presentation_extension"),
    ".pptx": ("Documentacao Tecnica", 0.56, "presentation_extension"),
    ".eml": ("Documentacao Tecnica", 0.45, "mail_extension"),
}

KEYWORD_RULES = [
    (re.compile(r"\b(schema|schematic|esquema|wiring|netlist|circuit|ladder|unifilar|eletrico|el[eé]trico)\b", re.I), "Esquemas Eletricos", 0.99, "electrical_scheme_keyword"),
    (re.compile(r"\b(manual|user guide|installation guide|service manual|operation manual|opera[cç][aã]o|instala[cç][aã]o|maintenance manual)\b", re.I), "Manuais", 0.99, "manual_keyword"),
    (re.compile(r"\b(norma|standard|en 81|iso 8100|directive|regulation|compliance code|safety standard|seguran[cç]a)\b", re.I), "Normas de Seguranca", 0.99, "safety_standard_keyword"),
    (re.compile(r"\b(datasheet|specification|technical data|documenta[cç][aã]o|manual t[eé]cnico|cat[aá]logo|catalogue)\b", re.I), "Documentacao Tecnica", 0.95, "technical_documentation_keyword"),
    (re.compile(r"\b(step|iges|solidworks|inventor|revit|engineering|calculation|simulation|fea|3d model|modelo 3d)\b", re.I), "Ficheiros de Engenharia", 0.97, "engineering_file_keyword"),
]


def heuristic_classify(path: str, snippet: str = "") -> tuple[str | None, float, str]:
    p = Path(path)
    extension = p.suffix.lower()
    text = f"{p.name} {snippet[:300]}".strip()

    if extension in EXTENSION_CATEGORY_RULES:
        category, confidence, reason = EXTENSION_CATEGORY_RULES[extension]
        if confidence >= 0.95:
            return category, confidence, reason

    for pattern, category, confidence, reason in KEYWORD_RULES:
        if pattern.search(text):
            return category, confidence, reason

    if extension in EXTENSION_CATEGORY_RULES:
        category, confidence, reason = EXTENSION_CATEGORY_RULES[extension]
        return category, confidence, reason
    return None, 0.0, "no_rule"


def normalize_category(category: str | None) -> str:
    if not category:
        return "Documentacao Tecnica"
    known = {
        "Esquemas Eletricos",
        "Manuais",
        "Documentacao Tecnica",
        "Normas de Seguranca",
        "Ficheiros de Engenharia",
    }
    return category if category in known else "Documentacao Tecnica"
