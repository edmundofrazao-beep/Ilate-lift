from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pandas as pd


ROOT_DIR = Path(__file__).resolve().parent.parent
EXTRACTED_DIR = ROOT_DIR / "data" / "extracted"


def extracted_exists() -> bool:
    return (EXTRACTED_DIR / "parametros_comerciais.json").exists()


def _load_json(name: str) -> Any:
    return json.loads((EXTRACTED_DIR / name).read_text(encoding="utf-8"))


def _load_csv(name: str) -> pd.DataFrame:
    return pd.read_csv(EXTRACTED_DIR / name)


def load_extracted_reference() -> dict[str, Any]:
    if not extracted_exists():
        return {}
    return {
        "parametros": _load_json("parametros_comerciais.json"),
        "tarifas": _load_json("tarifas_mao_obra.json"),
        "categorias": _load_json("categorias_orcamento.json"),
        "resumo": _load_json("resumo_orcamental.json"),
        "linhas_tipo": _load_csv("linhas_tipo_orcamento.csv"),
        "taxonomia_ios": _load_csv("taxonomia_ios.csv"),
        "inventory": _load_json("ekl_workbook_inventory.json"),
    }
