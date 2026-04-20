from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP_DIR = ROOT / "elevator_budget_app"
RUNS_DIR = APP_DIR / "legal_bot_test_runs"

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from elevator_budget_app.assistant import MODE_LABELS, run_assistant_query


TEST_CASES = [
    {
        "case_id": "legal_pt_1",
        "mode": "wiki",
        "query": "Em Portugal, quem enquadra a responsabilidade de inspeção e exploração de elevadores em serviço: a norma técnica ou o decreto-lei aplicável?",
        "expect": ["decreto", "lei", "dl", "norm", "legal"],
    },
    {
        "case_id": "legal_pt_2",
        "mode": "universal",
        "query": "Posso afirmar conformidade legal de uma instalação só porque cumpre tecnicamente a EN 81-20?",
        "expect": ["legal", "norm", "não", "decreto", "conform"],
    },
    {
        "case_id": "legal_pt_3",
        "mode": "manutencao",
        "query": "Num elevador em serviço com falha recorrente e documentação incompleta, o que é diagnóstico técnico e o que já toca em dever legal do proprietário?",
        "expect": ["document", "propriet", "legal", "diagn", "inspe"],
    },
    {
        "case_id": "legal_eu_1",
        "mode": "wiki",
        "query": "Qual é o papel da Diretiva 2014/33/EU no enquadramento legal face às normas ISO 8100 e EN 81?",
        "expect": ["2014/33", "diret", "norm", "legal", "iso"],
    },
    {
        "case_id": "legal_ai_1",
        "mode": "wiki",
        "query": "Ao usar este assistente técnico, como entram o AI Act e o RGPD na governação da resposta?",
        "expect": ["ai act", "rgpd", "gdpr", "dados", "governa"],
    },
    {
        "case_id": "legal_hybrid_1",
        "mode": "diagnostico",
        "query": "Tenho uma modernização com firmware novo, comando alterado e dúvida sobre obrigação documental. Faz defesa, acusação e juiz.",
        "expect": ["defesa", "acusa", "juiz", "document", "firmware"],
    },
    {
        "case_id": "legal_escalator_1",
        "mode": "wiki",
        "query": "Para escadas mecânicas e tapetes rolantes em Portugal, a EN 115 substitui a Portaria 1196/92 ou a portaria continua a ser a base legal?",
        "expect": ["portaria", "1196", "en 115", "legal", "não"],
    },
    {
        "case_id": "legal_escalator_2",
        "mode": "universal",
        "query": "Em escadas mecânicas, como separo lei portuguesa, EN 115 e interpretação técnica aplicada?",
        "expect": ["lei", "portaria", "en 115", "técn", "legal"],
    },
    {
        "case_id": "legal_escalator_3",
        "mode": "manutencao",
        "query": "Numa inspeção municipal a uma escada mecânica, o que é obrigação legal e o que é só boa prática técnica?",
        "expect": ["municip", "inspe", "legal", "técn", "obriga"],
    },
]


def write_json(path: Path, payload: object) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2, default=str), encoding="utf-8")


def normalize(text: str) -> str:
    return (text or "").lower()


def run_cases() -> list[dict]:
    rows = []
    for case in TEST_CASES:
        mode = case["mode"]
        query = case["query"]
        expect = case["expect"]
        try:
            payload = run_assistant_query(mode, query, top_k=5)
            answer = payload.get("answer", "")
            norm = normalize(answer)
            hits = [term for term in expect if term.lower() in norm]
            rows.append(
                {
                    "case_id": case["case_id"],
                    "mode": mode,
                    "mode_label": MODE_LABELS.get(mode, mode),
                    "query": query,
                    "ok": True,
                    "expected_terms": expect,
                    "matched_terms": hits,
                    "match_score": len(hits),
                    "answer_preview": answer[:1500],
                    "raw": payload,
                }
            )
        except Exception as exc:  # pragma: no cover
            rows.append(
                {
                    "case_id": case["case_id"],
                    "mode": mode,
                    "mode_label": MODE_LABELS.get(mode, mode),
                    "query": query,
                    "ok": False,
                    "error": str(exc),
                }
            )
    return rows


def build_summary_md(run_dir: Path, rows: list[dict]) -> None:
    ok_count = sum(1 for row in rows if row.get("ok"))
    fail_count = len(rows) - ok_count
    lines = [
        "# Legal Bot Test Pack",
        "",
        f"- run: `{run_dir.name}`",
        f"- cases ok: `{ok_count}`",
        f"- cases failed: `{fail_count}`",
        "",
    ]
    for row in rows:
        marker = "OK" if row.get("ok") else "FAIL"
        lines.extend(
            [
                f"## {marker} {row['case_id']} ({row['mode_label']})",
                "",
                f"**Pergunta**: {row['query']}",
                "",
            ]
        )
        if row.get("ok"):
            lines.extend(
                [
                    f"**Matched terms**: `{row.get('match_score', 0)}` -> {', '.join(row.get('matched_terms', [])) or '-'}",
                    "",
                    "**Preview**",
                    "",
                    row.get("answer_preview", "").strip() or "_sem preview_",
                    "",
                ]
            )
        else:
            lines.extend([f"**Erro**: {row.get('error', 'unknown')}", ""])
    (run_dir / "summary.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    run_dir = RUNS_DIR / timestamp
    run_dir.mkdir(parents=True, exist_ok=True)
    rows = run_cases()
    write_json(run_dir / "results.json", rows)
    write_json(
        run_dir / "summary.json",
        {
            "run": timestamp,
            "ok": sum(1 for row in rows if row.get("ok")),
            "failed": sum(1 for row in rows if not row.get("ok")),
        },
    )
    build_summary_md(run_dir, rows)
    print(str(run_dir))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
