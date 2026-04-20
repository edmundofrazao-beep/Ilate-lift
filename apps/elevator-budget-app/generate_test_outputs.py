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


OUTPUT_DIR = Path(__file__).resolve().parent / "test_outputs"


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


def build_scenarios(catalogs: dict) -> list[dict]:
    return [
        {
            "slug": "teste_reparacao_porta",
            "master_type": "reparacao",
            "project": {
                "cliente": "Condomínio Atlântico",
                "obra": "Elevador Bloco B",
                "local": "Lisboa",
                "numero_proposta": "TESTE-REP-001",
                "observacoes_gerais": "Avaria localizada em porta de cabina com impacto no serviço.",
            },
            "technical": {
                "fabricante": "Otis",
                "gama": "Gen2",
                "sistema": "Portas",
                "sub_sistema": "Porta de cabina",
                "modelo": "630 kg MRL",
                "n_pisos": 6,
                "n_paragens": 6,
                "ocupacao_edificio": "Total",
                "distancia_logistica": "10-30 km",
                "notas_tecnicas": "Intervenção em edifício habitado, janela curta e necessidade de repetição de testes.",
            },
            "selected_codes": ["OP-045", "OP-470", "OP-501", "OP-475", "OP-282"],
            "operation_inputs": {
                "OP-045": {"quantidade": 1, "material_unitario": 0},
                "OP-470": {"quantidade": 1, "equipa": "Especialista + Oficial", "custo_hora_equipa": 82},
                "OP-501": {"quantidade": 1, "material_unitario": 145, "desperdicio": 0.03},
                "OP-475": {"quantidade": 2},
                "OP-282": {"quantidade": 1, "material_unitario": 0},
            },
            "extra_costs": [
                {"categoria": "Logística", "item": "Estacionamento técnico", "quantidade": 1, "custo_unitario": 18, "observacoes": "Centro urbano"},
            ],
        },
        {
            "slug": "teste_modernizacao_parcial_comando",
            "master_type": "modernizacao_parcial",
            "project": {
                "cliente": "Hotel Miradouro",
                "obra": "Ascensor panorâmico",
                "local": "Porto",
                "numero_proposta": "TESTE-MODP-001",
                "observacoes_gerais": "Substituição do comando com melhoria de fiabilidade e integração parcial.",
            },
            "technical": {
                "fabricante": "Kone",
                "gama": "MonoSpace",
                "sistema": "Controlo",
                "sub_sistema": "Quadro de comando",
                "modelo": "MRL 8 paragens",
                "n_pisos": 8,
                "n_paragens": 8,
                "ocupacao_edificio": "Parcial",
                "distancia_logistica": "30-60 km",
                "notas_tecnicas": "Retrofit de quadro, drive e botoneiras com reaproveitamento parcial de cablagem.",
            },
            "selected_codes": ["OP-019", "OP-021", "OP-109", "OP-108", "OP-113", "OP-114", "OP-115", "OP-121", "OP-176", "OP-177"],
            "operation_inputs": {
                "OP-019": {"quantidade": 1},
                "OP-021": {"quantidade": 2, "material_unitario": 0},
                "OP-109": {"quantidade": 1, "material_unitario": 2850, "desperdicio": 0.02, "risco": "Elevado"},
                "OP-108": {"quantidade": 1, "material_unitario": 1650, "desperdicio": 0.02, "risco": "Elevado"},
                "OP-113": {"quantidade": 1, "equipa": "Especialista + Oficial", "custo_hora_equipa": 82},
                "OP-114": {"quantidade": 8, "equipa": "Especialista + Oficial", "custo_hora_equipa": 82},
                "OP-115": {"quantidade": 1, "equipa": "Especialista", "custo_hora_equipa": 47},
                "OP-121": {"quantidade": 1, "equipa": "Especialista + Oficial", "custo_hora_equipa": 82},
                "OP-176": {"quantidade": 1, "material_unitario": 420},
                "OP-177": {"quantidade": 8, "material_unitario": 115},
            },
            "extra_costs": [
                {"categoria": "Micro-materiais", "item": "Etiquetas técnicas e consumíveis de parametrização", "quantidade": 1, "custo_unitario": 45, "observacoes": "Integração e identificação"},
                {"categoria": "Resíduos", "item": "Gestão de resíduos elétricos", "quantidade": 1, "custo_unitario": 65, "observacoes": "Drive e periféricos antigos"},
            ],
        },
        {
            "slug": "teste_manutencao_preventiva",
            "master_type": "manutencao_preventiva",
            "project": {
                "cliente": "Centro Empresarial Tejo",
                "obra": "Plano mensal elevador principal",
                "local": "Setúbal",
                "numero_proposta": "TESTE-MAN-001",
                "observacoes_gerais": "Rotina preventiva mensal com foco em disponibilidade e redução de falhas.",
            },
            "technical": {
                "fabricante": "Schindler",
                "gama": "3300",
                "sistema": "",
                "sub_sistema": "",
                "modelo": "630 kg 7 paragens",
                "n_pisos": 7,
                "n_paragens": 7,
                "ocupacao_edificio": "Parcial",
                "distancia_logistica": "Até 10 km",
                "notas_tecnicas": "Contrato preventivo com checklist e pequenas afinações incluídas.",
            },
            "selected_codes": ["OP-549", "OP-550", "OP-551", "OP-556", "OP-559", "OP-560"],
            "operation_inputs": {
                "OP-549": {"quantidade": 1},
                "OP-550": {"quantidade": 1},
                "OP-551": {"quantidade": 1},
                "OP-556": {"quantidade": 1},
                "OP-559": {"quantidade": 1, "equipa": "Especialista + Oficial", "custo_hora_equipa": 82},
                "OP-560": {"quantidade": 1, "equipa": "Especialista + Oficial", "custo_hora_equipa": 82},
            },
            "extra_costs": [
                {"categoria": "Outro", "item": "Relatório técnico mensal", "quantidade": 1, "custo_unitario": 22, "observacoes": "Fecho documental"},
            ],
        },
        {
            "slug": "teste_modernizacao_integral",
            "master_type": "modernizacao_integral",
            "project": {
                "cliente": "Hospital Serra Norte",
                "obra": "Elevador macas torre sul",
                "local": "Coimbra",
                "numero_proposta": "TESTE-MODI-001",
                "observacoes_gerais": "Renovação técnica extensa com máquina, cabos, quadro, drive e portas.",
            },
            "technical": {
                "fabricante": "Otis",
                "gama": "Gen2",
                "sistema": "Tração",
                "sub_sistema": "Máquina",
                "modelo": "Elevador macas 1600 kg",
                "n_pisos": 10,
                "n_paragens": 10,
                "ocupacao_edificio": "Total",
                "distancia_logistica": ">60 km",
                "notas_tecnicas": "Obra crítica em ambiente hospitalar com forte coordenação e janelas noturnas.",
            },
            "selected_codes": ["OP-021", "OP-023", "OP-109", "OP-108", "OP-122", "OP-123", "OP-131", "OP-133", "OP-149", "OP-150", "OP-169"],
            "operation_inputs": {
                "OP-021": {"quantidade": 4, "material_unitario": 0, "logistica": "Condicionada"},
                "OP-023": {"quantidade": 1, "material_unitario": 55, "desperdicio": 0.07},
                "OP-109": {"quantidade": 1, "material_unitario": 3900, "desperdicio": 0.03, "risco": "Elevado"},
                "OP-108": {"quantidade": 1, "material_unitario": 2250, "desperdicio": 0.03, "risco": "Elevado"},
                "OP-122": {"quantidade": 1, "material_unitario": 7800, "dificuldade": "Muito elevada", "risco": "Muito elevado"},
                "OP-123": {"quantidade": 1, "dificuldade": "Muito elevada"},
                "OP-131": {"quantidade": 1, "material_unitario": 3200, "dificuldade": "Elevada"},
                "OP-133": {"quantidade": 1, "dificuldade": "Elevada"},
                "OP-149": {"quantidade": 1, "material_unitario": 2100},
                "OP-150": {"quantidade": 1, "material_unitario": 980},
                "OP-169": {"quantidade": 1},
            },
            "extra_costs": [
                {"categoria": "Logística", "item": "Janelas noturnas e coordenação hospitalar", "quantidade": 3, "custo_unitario": 180, "observacoes": "Acesso condicionado"},
                {"categoria": "Subcontrato", "item": "Elevação auxiliar temporária", "quantidade": 1, "custo_unitario": 850, "observacoes": "Movimentação pesada"},
            ],
        },
        {
            "slug": "teste_instalacao_nova",
            "master_type": "instalacao_nova",
            "project": {
                "cliente": "Residencial Vale Verde",
                "obra": "Novo elevador bloco C",
                "local": "Braga",
                "numero_proposta": "TESTE-INST-001",
                "observacoes_gerais": "Cenário de instalação nova com uso de operações compatíveis do catálogo atual.",
            },
            "technical": {
                "fabricante": "Orona",
                "gama": "3G",
                "sistema": "Controlo",
                "sub_sistema": "Quadro de comando",
                "modelo": "630 kg 5 paragens",
                "n_pisos": 5,
                "n_paragens": 5,
                "ocupacao_edificio": "Sem ocupação",
                "distancia_logistica": "30-60 km",
                "notas_tecnicas": "O catálogo atual não tem linhas explícitas de instalação nova; cenário de teste usa operações equivalentes.",
            },
            "selected_codes": ["OP-019", "OP-021", "OP-025", "OP-109", "OP-108", "OP-122", "OP-131", "OP-149", "OP-150", "OP-176", "OP-177"],
            "operation_inputs": {
                "OP-019": {"quantidade": 1},
                "OP-021": {"quantidade": 3},
                "OP-025": {"quantidade": 1, "material_unitario": 110},
                "OP-109": {"quantidade": 1, "material_unitario": 3600},
                "OP-108": {"quantidade": 1, "material_unitario": 2100},
                "OP-122": {"quantidade": 1, "material_unitario": 7200, "dificuldade": "Elevada"},
                "OP-131": {"quantidade": 1, "material_unitario": 2900},
                "OP-149": {"quantidade": 1, "material_unitario": 1950},
                "OP-150": {"quantidade": 1, "material_unitario": 920},
                "OP-176": {"quantidade": 1, "material_unitario": 390},
                "OP-177": {"quantidade": 5, "material_unitario": 108},
            },
            "extra_costs": [
                {"categoria": "Logística", "item": "Grua ligeira e descarga em obra", "quantidade": 1, "custo_unitario": 420, "observacoes": "Montagem inicial"},
                {"categoria": "Outro", "item": "Dossier técnico de entrega", "quantidade": 1, "custo_unitario": 95, "observacoes": "Encerramento documental"},
            ],
        },
    ]


def generate() -> Path:
    catalogs = load_catalogs()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    summary_rows = []
    for scenario in build_scenarios(catalogs):
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

        workbook_bytes = build_export_workbook(state, results, alerts)
        (scenario_dir / f"{scenario['slug']}.xlsx").write_bytes(workbook_bytes)
        (scenario_dir / "state.json").write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
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
        results["extras"].to_csv(scenario_dir / "extras.csv", index=False)

        summary_rows.append(
            {
                "cenario": scenario["slug"],
                "tipo_orcamento": scenario["master_type"],
                "cliente": state["project"]["cliente"],
                "obra": state["project"]["obra"],
                "operacoes": len(results["operations"]),
                "horas": round(results["totals"]["horas"], 2),
                "custo_directo_eur": round(results["totals"]["directo"], 2),
                "subtotal_sem_iva_eur": round(results["totals"]["subtotal_sem_iva"], 2),
                "iva_eur": round(results["totals"]["iva"], 2),
                "preco_final_eur": round(results["totals"]["total_final"], 2),
                "alertas": " | ".join(f"{a['level']}:{a['text']}" for a in alerts),
            }
        )

    summary_df = pd.DataFrame(summary_rows)
    summary_df.to_csv(OUTPUT_DIR / "resumo_testes.csv", index=False)
    summary_df.to_json(OUTPUT_DIR / "resumo_testes.json", orient="records", force_ascii=False, indent=2)
    lines = ["# Outputs de teste", ""]
    for row in summary_rows:
        lines.append(
            f"- `{row['cenario']}` | `{row['tipo_orcamento']}` | {row['horas']} h | {row['preco_final_eur']} EUR"
        )
    (OUTPUT_DIR / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    return OUTPUT_DIR


if __name__ == "__main__":
    out = generate()
    print(out)
