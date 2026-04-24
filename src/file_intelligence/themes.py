from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass(slots=True)
class ThemeDecision:
    theme: str
    confidence: float
    reason: str
    needs_api: bool = False
    needs_ocr: bool = False


THEME_RULES: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("Parametros e Configuracao", ("parameter", "parametro", "parametros", "setup", "configuration", "config", "menu", "adjust", "commissioning")),
    ("Manobras e Controladores", ("controller", "control system", "lce", "ucm", "lcb", "board", "pcb", "miconic", "arca", "up870", "up900", "microrreles")),
    ("Variadores e Motores", ("drive", "vvvf", "inverter", "motor", "gearless", "machine", "vf", "ovf", "v3f", "frequency inverter")),
    ("Portas e Operadores", ("door", "operator", "landing door", "car door", "lock", "interlock", "fermator", "selcom", "sematic", "wittur")),
    ("Seguranca e Certificacao", ("safety", "certification", "certificate", "governor", "buffer", "ucmp", "acop", "sil", "fire resistance")),
    ("Instalacao e Montagem", ("installation", "instalacion", "instala", "mounting", "assembly", "commissioning", "startup")),
    ("Manutencao e Diagnostico", ("maintenance", "diagnostic", "fault", "error", "troubleshooting", "service", "repair", "diagnostico")),
    ("Esquemas e Ligacoes", ("wiring", "circuit", "diagram", "connection", "conexiones", "ligacao", "esquema", "ladder", "netlist")),
    ("Catalogos e Pecas", ("catalog", "catalogue", "spare parts", "parts", "repuestos", "datasheet", "product data", "technical sales info")),
    ("Software e Firmware", ("software", "firmware", "flash", "exe", "dll", "dat", "registry", "setup", "tool", "loader")),
    ("Hidraulico", ("hydraulic", "hidraulic", "gmv", "oil", "valve", "piston")),
    ("Guias e Estrutura", ("guide rail", "guide shoe", "counterweight", "shaft", "pit", "cabin", "car sling", "frame")),
    ("Comunicacao e Monitorizacao", ("modem", "monitoring", "telemetry", "canbus", "serial", "rs232", "rs485", "lon", "knx", "network")),
)


WEAK_NAME_PATTERNS = (
    re.compile(r"^\d+$"),
    re.compile(r"^(cover|metadata|manual|document|scan|image|img)(?:\s+dup\d+)?$", re.I),
    re.compile(r"^.{1,5}$"),
)

OCR_SUFFIXES = {".jpg", ".jpeg", ".png", ".tif", ".tiff", ".bmp", ".gif"}
API_SUFFIXES = {".pdf", ".doc", ".docx", ".rtf", ".txt", ".xls", ".xlsx"} | OCR_SUFFIXES
NON_DOCUMENT_SUFFIXES = {
    ".zip", ".rar", ".7z", ".exe", ".dll", ".sys", ".dat", ".db", ".px", ".pif", ".bat", ".com",
    ".opf", ".trm", ".ms", ".hlp", ".y03", ".xml", ".jar", ".class", ".bin",
}


def infer_theme(category: str, filename: str, rel_path: str) -> ThemeDecision:
    name = filename.rsplit(".", 1)[0]
    haystack = f"{filename} {rel_path}".lower()

    scores: list[tuple[float, str, str]] = []
    for theme, keywords in THEME_RULES:
        hits = [kw for kw in keywords if kw.lower() in haystack]
        if hits:
            score = min(0.45 + (0.12 * len(hits)), 0.92)
            scores.append((score, theme, ", ".join(hits[:4])))

    if scores:
        scores.sort(key=lambda item: (-item[0], item[1]))
        score, theme, reason = scores[0]
        return ThemeDecision(theme=theme, confidence=score, reason=reason)

    if category == "Documentacao Tecnica":
        return ThemeDecision(theme="Geral", confidence=0.2, reason="fallback_documentacao", needs_api=True)
    if category == "Manuais":
        return ThemeDecision(theme="Manual Geral", confidence=0.25, reason="fallback_manuais", needs_api=True)
    if category == "Esquemas Eletricos":
        return ThemeDecision(theme="Ligacoes Gerais", confidence=0.3, reason="fallback_esquemas", needs_api=True)
    if category == "Ficheiros de Engenharia":
        return ThemeDecision(theme="Engenharia Geral", confidence=0.22, reason="fallback_engenharia", needs_api=True)
    return ThemeDecision(theme="Geral", confidence=0.2, reason="fallback", needs_api=True)


def is_weak_name(filename: str) -> bool:
    stem = filename.rsplit(".", 1)[0].strip().lower()
    normalized = re.sub(r"[^a-z0-9]+", " ", stem).strip()
    return any(pattern.match(normalized) for pattern in WEAK_NAME_PATTERNS)
