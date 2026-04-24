from __future__ import annotations

import hashlib
import io
import mimetypes
import re
from pathlib import Path

from pypdf import PdfReader

try:
    import pytesseract
except Exception:  # pragma: no cover
    pytesseract = None

try:
    from PIL import Image
except Exception:  # pragma: no cover
    Image = None

try:
    from docx import Document
except Exception:  # pragma: no cover
    Document = None


TEXT_EXTENSIONS = {
    ".txt", ".md", ".csv", ".tsv", ".json", ".jsonl", ".yaml", ".yml", ".xml", ".html",
    ".htm", ".css", ".js", ".ts", ".tsx", ".jsx", ".py", ".java", ".c", ".cpp", ".h",
    ".hpp", ".cs", ".sql", ".ini", ".cfg", ".conf", ".log", ".rtf"
}


def sha1_for_file(path: Path, chunk_size: int = 1024 * 1024) -> str:
    digest = hashlib.sha1()
    with path.open("rb") as handle:
        while chunk := handle.read(chunk_size):
            digest.update(chunk)
    return digest.hexdigest()


def normalize_snippet(text: str, limit: int) -> str:
    compact = re.sub(r"\s+", " ", text or "").strip()
    return compact[:limit]


def extract_text_snippet(path: Path, limit: int) -> tuple[str, str]:
    extension = path.suffix.lower()
    if extension in TEXT_EXTENSIONS:
        return _extract_plain_text(path, limit), "text"
    if extension == ".pdf":
        return _extract_pdf_text(path, limit)
    if extension == ".docx":
        return _extract_docx_text(path, limit)
    if extension in {".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp", ".gif", ".webp"}:
        return _extract_image_ocr(path, limit)
    mime, _ = mimetypes.guess_type(path.name)
    if mime and mime.startswith("text/"):
        return _extract_plain_text(path, limit), "text"
    return "", "binary"


def _extract_plain_text(path: Path, limit: int) -> str:
    for encoding in ("utf-8", "utf-16", "latin-1"):
        try:
            with path.open("r", encoding=encoding, errors="ignore") as handle:
                return normalize_snippet(handle.read(limit * 2), limit)
        except Exception:
            continue
    with path.open("rb") as handle:
        sample = handle.read(limit * 2)
    return normalize_snippet(sample.decode("utf-8", errors="ignore"), limit)


def _extract_pdf_text(path: Path, limit: int) -> tuple[str, str]:
    try:
        if path.stat().st_size > 25 * 1024 * 1024:
            return "", "pdf_too_large"
    except Exception:
        return "", "pdf_unreadable"

    try:
        reader = PdfReader(str(path), strict=False)
        chunks: list[str] = []
        for page in reader.pages[:2]:
            page_text = page.extract_text() or ""
            if page_text:
                chunks.append(page_text)
            if sum(len(chunk) for chunk in chunks) >= limit * 2:
                break
        text = normalize_snippet(" ".join(chunks), limit)
        if text:
            return text, "pdf_text"
    except Exception:
        pass
    return "", "pdf_unreadable"


def _extract_docx_text(path: Path, limit: int) -> tuple[str, str]:
    if Document is None:
        return "", "docx_missing_dependency"
    try:
        document = Document(str(path))
        text = " ".join(paragraph.text for paragraph in document.paragraphs[:80])
        return normalize_snippet(text, limit), "docx"
    except Exception:
        return "", "docx_unreadable"


def _extract_image_ocr(path: Path, limit: int) -> tuple[str, str]:
    if Image is None or pytesseract is None:
        return "", "ocr_unavailable"
    try:
        with Image.open(path) as image:
            text = pytesseract.image_to_string(image, timeout=20)
        return normalize_snippet(text, limit), "ocr"
    except Exception:
        return "", "ocr_failed"
