from __future__ import annotations

from typing import Any

import pandas as pd


OCCUPANCY_FACTORS = {
    "Sem ocupação": 0.95,
    "Parcial": 1.05,
    "Total": 1.12,
}

RISK_FACTORS = {
    "Baixo": 0.97,
    "Normal": 1.0,
    "Elevado": 1.08,
    "Muito elevado": 1.15,
}

MASTER_TYPE_TO_CATALOG = {
    "reparacao": "Reparação",
    "modernizacao_parcial": "Modernização parcial",
    "modernizacao_integral": "Modernização integral",
    "manutencao_preventiva": "Manutenção preventiva",
    "instalacao_nova": "Instalação nova",
}


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _lookup_manufacturer_kit(
    kits_df: pd.DataFrame,
    manufacturer: str,
    subsystem: str,
) -> dict[str, float]:
    if kits_df.empty:
        return {"micro": 0.0, "logistica": 0.0, "aux": 0.0}
    candidates = kits_df[
        (kits_df["Fabricante"].fillna("").astype(str) == manufacturer)
        & (kits_df["Sub-sistema"].fillna("").astype(str) == subsystem)
    ]
    if candidates.empty:
        candidates = kits_df[
            (kits_df["Fabricante"].fillna("").astype(str) == "Genérico")
            & (kits_df["Sub-sistema"].fillna("").astype(str) == subsystem)
        ]
    if candidates.empty:
        return {"micro": 0.0, "logistica": 0.0, "aux": 0.0}
    row = candidates.iloc[0]
    return {
        "micro": _safe_float(row.get("Micro materiais (€)")),
        "logistica": _safe_float(row.get("Logística (€)")),
        "aux": _safe_float(row.get("Meios auxiliares (€)")),
    }


def compute_budget(state: dict[str, Any], catalogs: dict[str, Any]) -> dict[str, Any]:
    operations_df: pd.DataFrame = catalogs["operacoes_df"]
    selected_codes = state["selected_codes"]
    rows: list[dict[str, Any]] = []
    totals = {
        "horas": 0.0,
        "mao_obra": 0.0,
        "materiais": 0.0,
        "invisiveis": 0.0,
        "directo": 0.0,
        "subtotal_sem_iva": 0.0,
        "iva": 0.0,
        "total_final": 0.0,
    }
    for code in selected_codes:
        op_row = operations_df.loc[operations_df["codigo"] == code]
        if op_row.empty:
            continue
        op = op_row.iloc[0].to_dict()
        cfg = state["operation_inputs"].get(code, {})
        quantity = max(_safe_float(cfg.get("quantidade"), op.get("quantidade_base", 1.0)), 0.0)
        difficulty_level = cfg.get("dificuldade") or "Normal"
        logistics_level = cfg.get("logistica") or "Normal"
        risk_level = cfg.get("risco") or "Normal"
        team = cfg.get("equipa") or op.get("equipa") or "Oficial"
        team_rate = _safe_float(cfg.get("custo_hora_equipa"), catalogs["taxas_equipa"].get(team, 0.0))
        master_type = state["project"]["tipo_orcamento"]
        default_type_label = MASTER_TYPE_TO_CATALOG.get(master_type, "Modernização parcial")
        type_label = cfg.get("tipo_intervencao") or op.get("tipo_intervencao") or default_type_label
        type_factor = catalogs["tipo_fatores"].get(type_label, 1.0)
        difficulty_factor = catalogs["dificuldade_fatores"].get(difficulty_level, 1.0)
        logistics_factor = catalogs["logistica_fatores"].get(logistics_level, 1.0)
        occupancy_factor = OCCUPANCY_FACTORS.get(state["technical"]["ocupacao_edificio"], 1.0)
        risk_factor = RISK_FACTORS.get(risk_level, 1.0)

        base_hours = _safe_float(op.get("tempo_fixo")) + _safe_float(op.get("tempo_variavel")) * quantity
        adjusted_hours = base_hours * difficulty_factor * logistics_factor * occupancy_factor * type_factor * risk_factor
        labour_cost = adjusted_hours * team_rate

        manufacturer_kit = _lookup_manufacturer_kit(
            catalogs["kits_fabricante_df"],
            state["technical"]["fabricante"],
            str(op.get("sub_sistema") or state["technical"]["sub_sistema"]),
        )

        material_unit = _safe_float(cfg.get("material_unitario"), op.get("material_unitario"))
        consumables = _safe_float(op.get("consumiveis_fixos"))
        suggested_micro = _safe_float(op.get("micro_sugerido"))
        suggested_logistics = _safe_float(op.get("logistica_sugerida"))
        suggested_aux = _safe_float(op.get("meios_auxiliares_sugeridos"))
        waste = max(_safe_float(cfg.get("desperdicio"), state["costs"]["desperdicio_padrao"]), 0.0)

        materials = (
            (material_unit * quantity)
            + consumables
            + suggested_micro
            + manufacturer_kit["micro"]
        ) * (1 + waste)
        transport = _safe_float(op.get("transporte_base")) + suggested_logistics + manufacturer_kit["logistica"]
        auxiliary = _safe_float(op.get("equipamento_auxiliar_base")) + suggested_aux + manufacturer_kit["aux"]
        subcontract = _safe_float(cfg.get("subcontrato"), op.get("subcontrato_base"))
        invisible_costs = suggested_micro + suggested_logistics + suggested_aux + sum(manufacturer_kit.values())
        direct_cost = labour_cost + materials + transport + auxiliary + subcontract

        overhead = direct_cost * _safe_float(state["costs"]["overhead"])
        contingency = direct_cost * _safe_float(state["costs"]["contingencia"])
        margin = direct_cost * _safe_float(state["costs"]["margem"])
        subtotal = direct_cost + overhead + contingency + margin
        vat = subtotal * _safe_float(state["costs"]["iva"])
        total = subtotal + vat

        rows.append(
            {
                "codigo": code,
                "fase": op.get("fase"),
                "operacao": op.get("operacao"),
                "tipo_intervencao": type_label,
                "sistema": op.get("sistema"),
                "sub_sistema": op.get("sub_sistema"),
                "equipa": team,
                "quantidade": quantity,
                "horas": adjusted_hours,
                "custo_hora_equipa": team_rate,
                "mao_obra": labour_cost,
                "materiais": materials,
                "transportes": transport,
                "meios_auxiliares": auxiliary,
                "subcontratos": subcontract,
                "invisiveis": invisible_costs,
                "directo": direct_cost,
                "subtotal_sem_iva": subtotal,
                "iva": vat,
                "total_final": total,
                "dificuldade": difficulty_level,
                "logistica": logistics_level,
                "risco": risk_level,
                "notas": cfg.get("observacoes") or op.get("observacoes") or "",
            }
        )
        totals["horas"] += adjusted_hours
        totals["mao_obra"] += labour_cost
        totals["materiais"] += materials
        totals["invisiveis"] += invisible_costs
        totals["directo"] += direct_cost
        totals["subtotal_sem_iva"] += subtotal
        totals["iva"] += vat
        totals["total_final"] += total

    extras_rows = []
    for idx, extra in enumerate(state["extra_costs"], start=1):
        qty = max(_safe_float(extra.get("quantidade"), 1.0), 0.0)
        unit_cost = max(_safe_float(extra.get("custo_unitario"), 0.0), 0.0)
        direct_cost = qty * unit_cost
        subtotal = direct_cost * (
            1
            + _safe_float(state["costs"]["overhead"])
            + _safe_float(state["costs"]["contingencia"])
            + _safe_float(state["costs"]["margem"])
        )
        vat = subtotal * _safe_float(state["costs"]["iva"])
        total = subtotal + vat
        extras_rows.append(
            {
                "codigo": f"EXTRA-{idx:02d}",
                "categoria": extra.get("categoria") or "Extra",
                "item": extra.get("item") or "Custo adicional",
                "quantidade": qty,
                "custo_unitario": unit_cost,
                "directo": direct_cost,
                "subtotal_sem_iva": subtotal,
                "iva": vat,
                "total_final": total,
                "notas": extra.get("observacoes") or "",
            }
        )
        totals["directo"] += direct_cost
        totals["subtotal_sem_iva"] += subtotal
        totals["iva"] += vat
        totals["total_final"] += total
        if extra.get("categoria") == "Logística":
            totals["invisiveis"] += direct_cost

    operations_result = pd.DataFrame(rows)
    extras_result = pd.DataFrame(extras_rows)
    return {
        "operations": operations_result,
        "extras": extras_result,
        "totals": totals,
    }


def validate_step(state: dict[str, Any], step: int) -> list[str]:
    errors: list[str] = []
    project = state["project"]
    technical = state["technical"]
    costs = state["costs"]
    selected_codes = state["selected_codes"]
    operation_inputs = state["operation_inputs"]
    if step == 1:
        required = {
            "Cliente": project["cliente"],
            "Obra / equipamento": project["obra"],
            "Local": project["local"],
            "Tipo de orçamento": project["tipo_orcamento"],
            "N.º proposta": project["numero_proposta"],
        }
        errors.extend([f"{label} é obrigatório." for label, value in required.items() if not str(value).strip()])
    if step == 2:
        required = {
            "Fabricante": technical["fabricante"],
            "Sistema": technical["sistema"],
            "Sub-sistema": technical["sub_sistema"],
        }
        errors.extend([f"{label} é obrigatório." for label, value in required.items() if not str(value).strip()])
        if _safe_float(technical["n_pisos"], 0.0) < 1:
            errors.append("O número de pisos tem de ser pelo menos 1.")
        if _safe_float(technical["n_paragens"], 0.0) < 1:
            errors.append("O número de paragens tem de ser pelo menos 1.")
    if step == 3:
        if not selected_codes:
            errors.append("Selecione pelo menos uma operação.")
        for code in selected_codes:
            quantity = _safe_float(operation_inputs.get(code, {}).get("quantidade"), 0.0)
            if quantity <= 0:
                errors.append(f"A operação {code} tem quantidade inválida.")
    if step == 4:
        for label in ("overhead", "contingencia", "margem", "iva"):
            value = _safe_float(costs[label], -1.0)
            if value < 0:
                errors.append(f"O campo {label} não pode ser negativo.")
        if _safe_float(costs["iva"], 0.0) > 1:
            errors.append("O IVA deve ser introduzido como taxa decimal, por exemplo 0,23.")
    return errors


def build_alerts(state: dict[str, Any], results: dict[str, Any]) -> list[dict[str, str]]:
    alerts: list[dict[str, str]] = []
    operations = results["operations"]
    totals = results["totals"]
    master_type = state["project"]["tipo_orcamento"]
    if operations.empty:
        alerts.append({"level": "error", "text": "Sem operações selecionadas. O orçamento não pode ser exportado."})
        return alerts
    if totals["horas"] > 120:
        alerts.append({"level": "warning", "text": "Carga horária elevada. Confirme planeamento, equipas e produtividade."})
    if totals["invisiveis"] <= 0 and master_type != "manutencao_preventiva":
        alerts.append({"level": "warning", "text": "Custos invisíveis nulos. Rever kits, logística e micro-materiais."})
    if _safe_float(state["costs"]["margem"]) < 0.1:
        alerts.append({"level": "warning", "text": "Margem comercial abaixo de 10%. Confirmar política comercial."})
    if state["technical"]["ocupacao_edificio"] == "Total" and results["extras"].empty:
        alerts.append({"level": "info", "text": "Edifício ocupado a tempo inteiro. Considere custos logísticos adicionais."})
    missing_kit = operations[
        (operations["sub_sistema"].fillna("").astype(str) != "")
        & (operations["invisiveis"].fillna(0.0) <= 0.0)
    ]
    if not missing_kit.empty:
        alerts.append({"level": "info", "text": "Existem operações sem reforço invisível relevante. Validar fabricante/kits."})
    affected_subsystems = operations["sub_sistema"].fillna("").astype(str)
    subsystem_count = len([item for item in affected_subsystems.unique().tolist() if item])
    op_names = " | ".join(operations["operacao"].fillna("").astype(str).tolist()).lower()
    has_major_replacement = any(token in op_names for token in ["máquina", "cabos", "quadro", "drive", "porta", "portas"])
    if master_type == "reparacao" and (subsystem_count >= 3 or has_major_replacement):
        alerts.append({"level": "warning", "text": "O conteúdo parece mais abrangente do que uma reparação. Rever classificação do orçamento."})
    if master_type == "modernizacao_parcial" and subsystem_count >= 4 and has_major_replacement:
        alerts.append({"level": "warning", "text": "Há vários subsistemas e substituições principais. Pode tratar-se de modernização integral."})
    if master_type == "modernizacao_integral" and subsystem_count <= 2 and not has_major_replacement:
        alerts.append({"level": "info", "text": "O âmbito parece limitado para modernização integral. Confirmar se não será parcial."})
    if master_type == "manutencao_preventiva" and any(
        token in op_names for token in ["substitui", "desmontagem", "instala", "moderniza"]
    ):
        alerts.append({"level": "warning", "text": "Há operações de substituição ou instalação incompatíveis com manutenção preventiva."})
    if master_type == "instalacao_nova" and any(
        token in op_names for token in ["existente", "desmontagem", "levantamento do quadro elétrico existente"]
    ):
        alerts.append({"level": "info", "text": "Foram detetadas referências a equipamento existente. Confirmar se não é uma modernização."})
    return alerts
