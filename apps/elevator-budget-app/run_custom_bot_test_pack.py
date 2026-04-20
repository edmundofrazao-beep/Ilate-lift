from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP_DIR = ROOT / "elevator_budget_app"
RUNS_DIR = APP_DIR / "custom_bot_test_runs"

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from elevator_budget_app.assistant import MODE_LABELS, run_assistant_query


TEST_CASES = [
    {
        "case_id": "macro_1",
        "mode": "wiki",
        "query": "Que evidência devo pedir quando o dossier técnico está incompleto e o esquema elétrico não reflete a instalação real?",
        "expect": ["evidência", "dossier", "esquema", "document"],
    },
    {
        "case_id": "macro_2",
        "mode": "wiki",
        "query": "Como enquadro uma alteração substancial não documentada e uma atualização de firmware sem rastreabilidade?",
        "expect": ["alteração", "firmware", "rastre", "retrofit"],
    },
    {
        "case_id": "vsd_1",
        "mode": "diagnostico",
        "query": "O variador disparou. Qual é o primeiro check antes de condenar o drive?",
        "expect": ["drive", "histó", "fault", "encoder"],
    },
    {
        "case_id": "vsd_2",
        "mode": "manutencao",
        "query": "Fica fora de piso e depois acerta. O que parece e o que devo validar primeiro?",
        "expect": ["encoder", "feedback", "piso", "valid"],
    },
    {
        "case_id": "cmd_1",
        "mode": "diagnostico",
        "query": "O elevador chama mas não arranca. Como separo comando, safety chain e drive ready?",
        "expect": ["comando", "safety", "drive", "permiss"],
    },
    {
        "case_id": "cmd_2",
        "mode": "orcamentos",
        "query": "Como enquadro comercialmente uma reparação de botoneira, I/O e command-chain correction?",
        "expect": ["botoneira", "i/o", "command", "repair"],
    },
    {
        "case_id": "hybrid_1",
        "mode": "wiki",
        "query": "Numa modernização com VSD novo e alteração de comando, qual a base normativa e a leitura técnica aplicada?",
        "expect": ["norm", "técn", "VSD", "comando"],
    },
    {
        "case_id": "hybrid_2",
        "mode": "universal",
        "query": "Tenho lacunas documentais, falha de drive e comandos bloqueados. Como devo estruturar a triagem?",
        "expect": ["document", "drive", "comando", "triag"],
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
                    "answer_preview": answer[:1200],
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
        "# Custom Bot Test Pack",
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
