from __future__ import annotations

import os
from pathlib import Path

APP_DIR = Path(__file__).resolve().parent
ROOT_DIR = APP_DIR.parent


def _candidate_workbooks() -> list[Path]:
    env_path = os.environ.get("ORCS_SOURCE_WORKBOOK")
    candidates: list[Path] = []
    if env_path:
        candidates.append(Path(env_path).expanduser())

    candidates.extend(
        [
            ROOT_DIR / "Orcamentacao_Elevadores_v16_engenharia_comissionamento.xlsx",
            ROOT_DIR.parent / "Orcamentacao_Elevadores_v16_engenharia_comissionamento.xlsx",
            Path(
                "/Users/edmundofrazao/Library/Mobile Documents/com~apple~CloudDocs/01. WIP/Orcamentacao_Elevadores_v16_engenharia_comissionamento.xlsx"
            ),
            Path(
                "/Users/edmundofrazao/Library/Mobile Documents/com~apple~CloudDocs/01. WIP/--- Coeficientes ---/ORC SANDBOX/EKL-ORC_BASE_V1.6.xlsx"
            ),
            ROOT_DIR.parent / "Orçamentação_Global_de_Elevadores_detalhada_PT_v15_fabricantes_proposta.xlsx",
        ]
    )
    return candidates


def _resolve_source_workbook() -> Path:
    candidates = _candidate_workbooks()
    for candidate in candidates:
        if candidate.exists():
            return candidate
    searched = "\n - ".join(str(item) for item in candidates)
    raise FileNotFoundError(
        "Nenhum workbook de catálogo foi encontrado. Procurado em:\n - " + searched
    )


SOURCE_WORKBOOK = _resolve_source_workbook()
AUTOSAVE_DIR = APP_DIR / ".autosave"
AUTOSAVE_FILE = AUTOSAVE_DIR / "orcamentacao_elevadores_autosave.json"
EXPORT_PREFIX = "orcamento_elevadores"
DEFAULT_IVA = 0.23
STEP_TITLES = [
    "1. Enquadramento",
    "2. Caracterização técnica",
    "3. Operações e kits",
    "4. Custos e validação",
    "5. Revisão e exportação",
]
