from __future__ import annotations

import json
import sys
from copy import deepcopy
from pathlib import Path

import pandas as pd

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from elevator_budget_app.app import MASTER_TYPE_META, default_state
from elevator_budget_app.calculations import MASTER_TYPE_TO_CATALOG, build_alerts, compute_budget
from elevator_budget_app.catalog_loader import load_catalogs
from elevator_budget_app.exporter import build_export_workbook


OUTPUT_DIR = Path(__file__).resolve().parent / "consistency_stress_outputs"


def _op_input(catalogs: dict, code: str, master_type: str, **overrides) -> dict:
    ops = catalogs["operacoes_df"].set_index("codigo")
    row = ops.loc[code]
    return {
        "quantidade": float(overrides.get("quantidade", row.get("quantidade_base", 1.0) or 1.0)),
        "dificuldade": overrides.get("dificuldade", "Normal"),
        "logistica": overrides.get("logistica", MASTER_TYPE_META[master_type]["logistica"]),
        "risco": overrides.get("risco", "Normal"),
        "equipa": overrides.get("equipa", row.get("equipa") or "Oficial"),
        "custo_hora_equipa": float(
            overrides.get("custo_hora_equipa", catalogs["taxas_equipa"].get(row.get("equipa"), 35.0))
        ),
        "material_unitario": float(overrides.get("material_unitario", row.get("material_unitario", 0.0) or 0.0)),
        "desperdicio": float(overrides.get("desperdicio", 0.05)),
        "subcontrato": float(overrides.get("subcontrato", row.get("subcontrato_base", 0.0) or 0.0)),
        "tipo_intervencao": overrides.get("tipo_intervencao", MASTER_TYPE_TO_CATALOG[master_type]),
        "observacoes": overrides.get("observacoes", ""),
    }


def build_scenarios() -> list[dict]:
    return [
        {
            "slug": "stress_reparacao_mas_integral",
            "master_type": "reparacao",
            "project": {
                "cliente": "Teste Stress A",
                "obra": "Classificada como reparação mas muito extensa",
                "local": "Lisboa",
                "numero_proposta": "STRESS-001",
                "observacoes_gerais": "Cenário para forçar alerta de reparação classificada por defeito.",
            },
            "technical": {
                "fabricante": "Otis",
                "gama": "Gen2",
                "sistema": "Tração",
                "sub_sistema": "Máquina",
                "modelo": "Hospitalar 10 paragens",
                "n_pisos": 10,
                "n_paragens": 10,
                "ocupacao_edificio": "Total",
                "distancia_logistica": ">60 km",
                "notas_tecnicas": "Substituições pesadas em vários grupos.",
            },
            "selected_codes": ["OP-109", "OP-108", "OP-122", "OP-131", "OP-149", "OP-150"],
            "operation_inputs": {
                "OP-109": {"material_unitario": 3800, "risco": "Elevado"},
                "OP-108": {"material_unitario": 2200, "risco": "Elevado"},
                "OP-122": {"material_unitario": 7600, "dificuldade": "Muito elevada", "risco": "Muito elevado"},
                "OP-131": {"material_unitario": 3150, "dificuldade": "Elevada"},
                "OP-149": {"material_unitario": 2050},
                "OP-150": {"material_unitario": 940},
            },
            "extra_costs": [],
        },
        {
            "slug": "stress_manutencao_com_substituicao_pesada",
            "master_type": "manutencao_preventiva",
            "project": {
                "cliente": "Teste Stress B",
                "obra": "Preventiva com substituição pesada",
                "local": "Porto",
                "numero_proposta": "STRESS-002",
                "observacoes_gerais": "Cenário para testar manutenção preventiva incoerente.",
            },
            "technical": {
                "fabricante": "Schindler",
                "gama": "3300",
                "sistema": "Portas",
                "sub_sistema": "Porta de cabina",
                "modelo": "MRL 6 paragens",
                "n_pisos": 6,
                "n_paragens": 6,
                "ocupacao_edificio": "Parcial",
                "distancia_logistica": "10-30 km",
                "notas_tecnicas": "Mistura de rotina preventiva com troca de componentes e desmontagem.",
            },
            "selected_codes": ["OP-549", "OP-550", "OP-045", "OP-501", "OP-046"],
            "operation_inputs": {
                "OP-549": {},
                "OP-550": {},
                "OP-045": {"tipo_intervencao": "Reparação"},
                "OP-501": {"material_unitario": 135, "tipo_intervencao": "Reparação"},
                "OP-046": {"tipo_intervencao": "Reparação", "equipa": "Especialista + Oficial", "custo_hora_equipa": 82},
            },
            "extra_costs": [],
        },
        {
            "slug": "stress_integral_mas_localizado",
            "master_type": "modernizacao_integral",
            "project": {
                "cliente": "Teste Stress C",
                "obra": "Integral mas conteúdo local",
                "local": "Coimbra",
                "numero_proposta": "STRESS-003",
                "observacoes_gerais": "Cenário para verificar alerta de integral com âmbito curto.",
            },
            "technical": {
                "fabricante": "Kone",
                "gama": "MonoSpace",
                "sistema": "Portas",
                "sub_sistema": "Porta de cabina",
                "modelo": "630 kg",
                "n_pisos": 5,
                "n_paragens": 5,
                "ocupacao_edificio": "Parcial",
                "distancia_logistica": "Até 10 km",
                "notas_tecnicas": "Só um problema localizado em operador de porta.",
            },
            "selected_codes": ["OP-470", "OP-501", "OP-475"],
            "operation_inputs": {
                "OP-470": {"equipa": "Especialista + Oficial", "custo_hora_equipa": 82},
                "OP-501": {"material_unitario": 145},
                "OP-475": {"quantidade": 1},
            },
            "extra_costs": [],
        },
        {
            "slug": "stress_instalacao_com_existente",
            "master_type": "instalacao_nova",
            "project": {
                "cliente": "Teste Stress D",
                "obra": "Instalação nova com sinais de existente",
                "local": "Braga",
                "numero_proposta": "STRESS-004",
                "observacoes_gerais": "Cenário para testar pistas de modernização num orçamento classificado como instalação nova.",
            },
            "technical": {
                "fabricante": "Genérico",
                "gama": "",
                "sistema": "Controlo",
                "sub_sistema": "Quadro de comando",
                "modelo": "Retrofit disfarçado",
                "n_pisos": 7,
                "n_paragens": 7,
                "ocupacao_edificio": "Sem ocupação",
                "distancia_logistica": "30-60 km",
                "notas_tecnicas": "Inclui levantamento e desmontagem de equipamento existente.",
            },
            "selected_codes": ["OP-005", "OP-046", "OP-047", "OP-109", "OP-108"],
            "operation_inputs": {
                "OP-005": {"tipo_intervencao": "Diagnóstico / levantamento"},
                "OP-046": {"tipo_intervencao": "Reparação", "equipa": "Especialista + Oficial", "custo_hora_equipa": 82},
                "OP-047": {"tipo_intervencao": "Reparação", "equipa": "Especialista + Oficial", "custo_hora_equipa": 82},
                "OP-109": {"material_unitario": 3400},
                "OP-108": {"material_unitario": 1900},
            },
            "extra_costs": [],
        },
        {
            "slug": "stress_parcial_sem_invisiveis",
            "master_type": "modernizacao_parcial",
            "project": {
                "cliente": "Teste Stress E",
                "obra": "Parcial sem invisíveis",
                "local": "Setúbal",
                "numero_proposta": "STRESS-005",
                "observacoes_gerais": "Cenário para testar alerta de invisíveis nulos.",
            },
            "technical": {
                "fabricante": "Genérico",
                "gama": "",
                "sistema": "Controlo",
                "sub_sistema": "Quadro de comando",
                "modelo": "Sistema base",
                "n_pisos": 4,
                "n_paragens": 4,
                "ocupacao_edificio": "Parcial",
                "distancia_logistica": "10-30 km",
                "notas_tecnicas": "Forçamos invisíveis baixos para confirmar warnings.",
            },
            "selected_codes": ["OP-109", "OP-115", "OP-121"],
            "operation_inputs": {
                "OP-109": {"material_unitario": 2500, "desperdicio": 0.0},
                "OP-115": {"equipa": "Especialista", "custo_hora_equipa": 47},
                "OP-121": {"equipa": "Especialista + Oficial", "custo_hora_equipa": 82},
            },
            "extra_costs": [],
        },
    ]


def generate() -> Path:
    catalogs = load_catalogs()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    rows = []
    for scenario in build_scenarios():
        state = default_state(catalogs)
        state["project"].update(scenario["project"])
        state["project"]["tipo_orcamento"] = scenario["master_type"]
        state["technical"].update(scenario["technical"])
        state["selected_codes"] = deepcopy(scenario["selected_codes"])
        state["extra_costs"] = deepcopy(scenario.get("extra_costs", []))
        state["operation_inputs"] = {}
        for code in scenario["selected_codes"]:
            state["operation_inputs"][code] = _op_input(
                catalogs,
                code,
                scenario["master_type"],
                **scenario["operation_inputs"].get(code, {}),
            )
        results = compute_budget(state, catalogs)
        alerts = build_alerts(state, results)

        scenario_dir = OUTPUT_DIR / scenario["slug"]
        scenario_dir.mkdir(parents=True, exist_ok=True)
        (scenario_dir / f"{scenario['slug']}.xlsx").write_bytes(build_export_workbook(state, results, alerts))
        (scenario_dir / "summary.json").write_text(
            json.dumps(
                {
                    "tipo_orcamento": scenario["master_type"],
                    "totals": results["totals"],
                    "alerts": alerts,
                    "selected_codes": scenario["selected_codes"],
                },
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )
        results["operations"].to_csv(scenario_dir / "operations.csv", index=False)
        rows.append(
            {
                "cenario": scenario["slug"],
                "tipo_orcamento": scenario["master_type"],
                "operacoes": len(results["operations"]),
                "horas": round(results["totals"]["horas"], 2),
                "preco_final_eur": round(results["totals"]["total_final"], 2),
                "n_alertas": len(alerts),
                "alertas": " | ".join(f"{a['level']}:{a['text']}" for a in alerts),
            }
        )
    df = pd.DataFrame(rows)
    df.to_csv(OUTPUT_DIR / "resumo_stress.csv", index=False)
    lines = ["# Stress de coerência", ""]
    for row in rows:
        lines.append(f"- `{row['cenario']}` | `{row['tipo_orcamento']}` | {row['n_alertas']} alertas")
    (OUTPUT_DIR / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    return OUTPUT_DIR


if __name__ == "__main__":
    print(generate())
