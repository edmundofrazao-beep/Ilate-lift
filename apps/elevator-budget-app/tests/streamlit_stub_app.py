from __future__ import annotations

from elevator_budget_app import app as orcs_app


def _fake_run_assistant_query(mode: str, query: str, top_k: int = 5) -> dict:
    mode_map = {
        "universal": ("universal mode", "Contexto geral", "Questão aberta"),
        "wiki": ("normative mode", "Normas e conformidade", "Cláusula principal"),
        "diagnostico": ("diagnostic mode", "Elétrica e controlo", "Comando / manobra"),
        "manutencao": ("intervention mode", "Inspection & Maintenance", "Maintenance Strategy"),
        "orcamentos": ("intervention mode", "Comercial técnico", "Classificação da intervenção"),
    }
    result_type, system, component = mode_map.get(mode, mode_map["universal"])
    return {
        "answer": (
            f"Stub de teste para `{mode}`.\n\n"
            f"Pergunta: {query}\n"
            f"Top K: {top_k}\n"
            "Este output serve para validar render, métricas, histórico e exportações sem depender da API real."
        ),
        "result": {
            "result_type": result_type,
            "system": system,
            "component": component,
            "confidence_level": "high",
            "relevant_standards": ["ISO 8100-1:2026", "ISO 8100-2:2026"],
            "clause_locations": ["Stub clause 1", "Stub clause 2"],
            "diagnostic_result": {"test": "stub_diagnostic_test", "query": query},
            "maintenance_signal": {"signal": "stub_maintenance_signal"},
            "budget_profile": {"profile": "stub_budget_profile"},
        },
    }


orcs_app.run_assistant_query = _fake_run_assistant_query
orcs_app.main()
