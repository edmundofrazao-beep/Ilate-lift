from __future__ import annotations

import csv
import math
import re
import sys
from pathlib import Path
from typing import Any

import pandas as pd


ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

OUTPUT_DIR = ROOT_DIR / "data" / "nepg_mobile"
INPUT_FILES = [
    Path("/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/-- ILATE  --/--- Coeficientes ---/01 - NEPG 2020 - WEBSITE - electricalresources.com/500.csv"),
    Path("/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/-- ILATE  --/--- Coeficientes ---/01 - NEPG 2020 - WEBSITE - electricalresources.com/1000.csv"),
    Path("/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/-- ILATE  --/--- Coeficientes ---/01 - NEPG 2020 - WEBSITE - electricalresources.com/1500.csv"),
]


def clean_text(value: Any) -> str:
    if value is None:
        return ""
    text = str(value).replace("\ufeff", "").replace("\n", " ").replace("\r", " ")
    text = text.replace("〇", "0").replace("•", "-").replace("’", "'").replace("“", '"').replace("”", '"')
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def read_rows(path: Path) -> list[list[str]]:
    with path.open("r", encoding="utf-8-sig", errors="replace", newline="") as handle:
        return [[clean_text(cell) for cell in row] for row in csv.reader(handle, delimiter=";")]


def row_nonempty(row: list[str]) -> list[str]:
    return [cell for cell in row if cell]


def is_header_row(row: list[str]) -> bool:
    text = " ".join(row_nonempty(row)).lower()
    if len(row_nonempty(row)) < 4:
        return False
    return any(token in text for token in ["average cost", "suggested resale", "labor", "hours", "cat. no.", "description"])


def is_strong_cost_header(row: list[str]) -> bool:
    text = " ".join(row_nonempty(row)).lower()
    required_groups = [
        any(token in text for token in ["average cost", "average"]),
        any(token in text for token in ["suggested resale", "resale"]),
        "labor" in text,
        "hours" in text or "low" in text or "x-high" in text,
    ]
    return all(required_groups)


def is_data_row(row: list[str]) -> bool:
    cells = row_nonempty(row)
    if len(cells) < 3:
        return False
    numeric_hits = sum(bool(re.search(r"\d", cell)) for cell in cells)
    return numeric_hits >= 2


def is_page_marker(text: str) -> bool:
    normalized = text.strip().lower()
    if re.fullmatch(r"\d{2}-\d{2}-\d{2}", normalized):
        return True
    if re.fullmatch(r"\d{2,4}-\d{1,3}", normalized):
        return True
    if re.fullmatch(r"npg.*", normalized):
        return True
    return False


def is_noise_text(text: str) -> bool:
    lowered = text.lower()
    noise_tokens = [
        "copyright",
        "quick reference guide",
        "electrical resources",
        "service agreement",
        "average cost column is a national average",
        "material prices and labor units",
        "prices based on average",
        "for low end and high end",
        "www.",
        "fax",
        "phone",
    ]
    return any(token in lowered for token in noise_tokens) or is_page_marker(text)


def looks_like_title(text: str) -> bool:
    if not text or is_noise_text(text):
        return False
    if len(text) < 3:
        return False
    if re.search(r"average\s+cost|suggested\s+resale|labor|hours", text.lower()):
        return False
    alpha = re.sub(r"[^A-Za-z]", "", text)
    if len(alpha) < 3:
        return False
    uppercase_ratio = sum(char.isupper() for char in alpha) / len(alpha)
    return uppercase_ratio >= 0.55


def normalize_header_label(value: str, position: int) -> str:
    text = clean_text(value).lower()
    if "description" in text:
        return "description"
    if "cat" in text and "no" in text:
        return "catalog_number"
    if "average" in text and "cost" in text:
        return "average_cost_usd"
    if "suggested" in text and "resale" in text:
        return "suggested_resale_usd"
    if "low" in text or "(0-6" in text or "0-6" in text:
        return "labor_low"
    if "med" in text or "(6-10" in text or "6-10" in text:
        return "labor_medium"
    if "high" in text or "(10-15" in text or "10-15" in text:
        return "labor_high"
    if "x-high" in text or "(15-20" in text or "15-20" in text:
        return "labor_x_high"
    clean = re.sub(r"[^a-z0-9]+", "_", text).strip("_")
    return clean or f"col_{position}"


def normalize_numeric_text(value: str) -> str:
    text = clean_text(value)
    if not text:
        return ""
    text = (
        text.replace("O", "0")
        .replace("o", "0")
        .replace("I", "1")
        .replace("l", "1")
        .replace("S", "5")
    )
    text = text.replace(",", "").replace(" ", "")
    return re.sub(r"[^0-9.\-]", "", text)


def parse_decimal(value: str) -> float | None:
    text = normalize_numeric_text(value)
    text = re.sub(r"[^0-9.\-]", "", text)
    if not text or text in {"-", ".", "-."}:
        return None
    if "." not in text:
        sign = -1 if text.startswith("-") else 1
        digits = text.lstrip("-")
        if len(digits) >= 3:
            text = f"{'-' if sign < 0 else ''}{digits[:-2]}.{digits[-2:]}"
    try:
        return float(text)
    except ValueError:
        return None


def validate_clean_record(record: dict[str, Any]) -> list[str]:
    reasons: list[str] = []
    average_cost = record["average_cost_usd"]
    resale = record["suggested_resale_usd"]
    labor_values = [
        record["labor_low_hh"],
        record["labor_medium_hh"],
        record["labor_high_hh"],
        record["labor_x_high_hh"],
    ]
    populated_labor = [value for value in labor_values if value is not None]

    if average_cost is None or average_cost < 0 or average_cost > 100000:
        reasons.append("average_cost_out_of_range")
    if resale is None or resale < 0 or resale > 200000:
        reasons.append("resale_out_of_range")
    if average_cost is not None and resale is not None:
        if resale < average_cost:
            reasons.append("resale_below_average_cost")
        ratio = resale / average_cost if average_cost else None
        if ratio is not None and ratio > 20:
            reasons.append("resale_ratio_too_high")
    if len(populated_labor) < 2:
        reasons.append("insufficient_labor_columns")
    if any(value is not None and (value < 0 or value > 200) for value in populated_labor):
        reasons.append("labor_out_of_range")
    if len(populated_labor) >= 3 and populated_labor != sorted(populated_labor):
        reasons.append("labor_not_monotonic")
    return reasons


def quality_score(header: list[str], row: list[str]) -> int:
    labels = {normalize_header_label(value, idx) for idx, value in enumerate(header, start=1)}
    score = 0
    if "description" in labels:
        score += 1
    if "average_cost_usd" in labels:
        score += 1
    if "suggested_resale_usd" in labels:
        score += 1
    labor_hits = len([label for label in labels if label.startswith("labor_")])
    score += labor_hits
    cells = row_nonempty(row)
    if cells and parse_decimal(cells[-1]) is not None:
        score += 1
    return score


def parse_tables(path: Path) -> list[dict[str, Any]]:
    rows = read_rows(path)
    tables: list[dict[str, Any]] = []
    last_title = ""
    current: dict[str, Any] | None = None

    for row in rows:
        cells = row_nonempty(row)
        if not cells:
            continue
        if len(cells) == 1 and not is_header_row(row):
            text = cells[0]
            if is_noise_text(text):
                continue
            if looks_like_title(text):
                last_title = text
            continue

        if is_header_row(row):
            if current and current["rows"]:
                tables.append(current)
            current = {
                "source_file": path.name,
                "title": last_title or f"{path.stem}_table_{len(tables)+1}",
                "header": cells,
                "rows": [],
                "header_quality": quality_score(cells, row),
            }
            continue

        if current and is_data_row(row):
            padded = row[: len(current["header"])] + [""] * max(0, len(current["header"]) - len(row))
            current["rows"].append(padded[: len(current["header"])])
            continue

        if len(cells) == 1:
            last_title = cells[0]

    if current and current["rows"]:
        tables.append(current)
    return tables


def normalize_tables(tables: list[dict[str, Any]]) -> tuple[pd.DataFrame, pd.DataFrame]:
    table_rows = []
    item_rows = []
    for idx, table in enumerate(tables, start=1):
        table_id = f"{table['source_file']}::{idx:03d}"
        table_rows.append(
            {
                "table_id": table_id,
                "source_file": table["source_file"],
                "title": table["title"],
                "columns_detected": len(table["header"]),
                "rows_detected": len(table["rows"]),
                "header": " | ".join(table["header"]),
                "header_quality": table.get("header_quality", 0),
            }
        )
        headers = []
        for pos, col in enumerate(table["header"], start=1):
            headers.append(normalize_header_label(col, pos))
        for row in table["rows"]:
            record = {"table_id": table_id, "source_file": table["source_file"], "title": table["title"]}
            for pos, value in enumerate(row[: len(headers)]):
                record[headers[pos]] = value
            item_rows.append(record)
    return pd.DataFrame(table_rows), pd.DataFrame(item_rows)


def select_cost_tables(tables: list[dict[str, Any]]) -> list[dict[str, Any]]:
    selected: list[dict[str, Any]] = []
    for table in tables:
        if not is_strong_cost_header(table["header"]):
            continue
        if len(table["rows"]) < 1:
            continue
        selected.append(table)
    return selected


def extract_clean_catalog(tables: list[dict[str, Any]]) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    table_rows: list[dict[str, Any]] = []
    item_rows: list[dict[str, Any]] = []
    rejected_rows: list[dict[str, Any]] = []
    for idx, table in enumerate(tables, start=1):
        header_labels = [normalize_header_label(col, pos) for pos, col in enumerate(table["header"], start=1)]
        table_id = f"{table['source_file']}::clean::{idx:03d}"
        table_rows.append(
            {
                "table_id": table_id,
                "source_file": table["source_file"],
                "title": table["title"],
                "rows_detected": len(table["rows"]),
                "header": " | ".join(table["header"]),
                "header_quality": table.get("header_quality", 0),
            }
        )
        for row_index, row in enumerate(table["rows"], start=1):
            record_map = {header_labels[pos]: value for pos, value in enumerate(row[: len(header_labels)])}
            description = clean_text(record_map.get("description", ""))
            average_cost = parse_decimal(record_map.get("average_cost_usd", ""))
            resale = parse_decimal(record_map.get("suggested_resale_usd", ""))
            labor_values = {
                "labor_low_hh": parse_decimal(record_map.get("labor_low", "")),
                "labor_medium_hh": parse_decimal(record_map.get("labor_medium", "")),
                "labor_high_hh": parse_decimal(record_map.get("labor_high", "")),
                "labor_x_high_hh": parse_decimal(record_map.get("labor_x_high", "")),
            }
            if not description:
                continue
            item = {
                "table_id": table_id,
                "source_file": table["source_file"],
                "section_title": table["title"],
                "row_number": row_index,
                "description": description,
                "catalog_number": clean_text(record_map.get("catalog_number", "")),
                "average_cost_usd": average_cost,
                "suggested_resale_usd": resale,
                **labor_values,
                "labor_basis": "man_hours",
                "currency": "USD",
                "measurement_system": "US",
            }
            rejection_reasons = validate_clean_record(item)
            if rejection_reasons:
                rejected_rows.append({**item, "rejection_reasons": " | ".join(rejection_reasons)})
                continue
            item_rows.append(item)
    return pd.DataFrame(table_rows), pd.DataFrame(item_rows), pd.DataFrame(rejected_rows)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    all_tables: list[dict[str, Any]] = []
    for path in INPUT_FILES:
        all_tables.extend(parse_tables(path))
    tables_df, items_df = normalize_tables(all_tables)
    clean_tables = select_cost_tables(all_tables)
    clean_table_df, clean_items_df, rejected_items_df = extract_clean_catalog(clean_tables)
    tables_df.to_csv(OUTPUT_DIR / "table_index.csv", index=False)
    items_df.to_csv(OUTPUT_DIR / "catalogo_bruto_unificado.csv", index=False)
    clean_table_df.to_csv(OUTPUT_DIR / "table_index_clean.csv", index=False)
    clean_items_df.to_csv(OUTPUT_DIR / "catalogo_limpo_custos_hh.csv", index=False)
    rejected_items_df.to_csv(OUTPUT_DIR / "catalogo_limpo_rejeitados.csv", index=False)
    summary = pd.DataFrame(
        [
            {
                "source_files": len(INPUT_FILES),
                "tables_detected": len(tables_df),
                "rows_detected": len(items_df),
                "cost_tables_detected": len(clean_table_df),
                "clean_rows_detected": len(clean_items_df),
                "rejected_rows_detected": len(rejected_items_df),
                "avg_table_quality": round(float(tables_df["header_quality"].mean()), 2) if not tables_df.empty else math.nan,
            }
        ]
    )
    summary.to_csv(OUTPUT_DIR / "summary.csv", index=False)
    print(OUTPUT_DIR)


if __name__ == "__main__":
    main()
