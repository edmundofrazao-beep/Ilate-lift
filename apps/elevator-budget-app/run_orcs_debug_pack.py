from __future__ import annotations

import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import URLError
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
APP_DIR = ROOT / "elevator_budget_app"
RUNS_DIR = APP_DIR / "orcs_debug_runs"
HEALTH_URL = "http://127.0.0.1:8501/_stcore/health"

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from elevator_budget_app.assistant import MODE_LABELS, run_assistant_query
from elevator_budget_app.generate_consistency_stress_outputs import generate as generate_stress_outputs
from elevator_budget_app.generate_test_outputs import generate as generate_budget_outputs


MODE_CASES = {
    "universal": [
        "Tenho um elevador que recebe chamada mas não arranca. Como devo enquadrar isto?",
        "Este caso parece manutenção, reparação ou modernização parcial?",
        "Tenho dúvidas entre comando, manutenção e norma aplicável. Como deves estruturar a resposta?",
    ],
    "wiki": [
        "Que norma enquadra desnivelamento à paragem?",
        "Como devo ler a transição entre EN 81-20/50 e ISO 8100-1/2:2026?",
        "Se entrar uma revisão normativa futura, como devo priorizar a edição mais recente e indicar correlação?",
    ],
    "diagnostico": [
        "O elevador recebe chamada mas não arranca. Qual a triagem técnica provável?",
        "Há falha de drive/VSD. Qual o sistema e o teste recomendado?",
        "Há falha intermitente no quadro de comando e o variador entra em trip. Qual a linha de diagnóstico?",
    ],
    "manutencao": [
        "Este caso deve ficar em manutenção corretiva, preventiva ou escalada?",
        "Que sinais indicam que a manutenção já não chega sozinha?",
        "Há reincidência em comandos e VSD. Quando devo escalar para intervenção maior?",
    ],
    "orcamentos": [
        "Isto aponta para reparação, manutenção preventiva ou modernização parcial?",
        "Que risco técnico devo assumir neste caso para orçamento?",
        "Como enquadro comercialmente uma intervenção com comandos, VSD e atualização normativa em paralelo?",
    ],
}


def run_preflight() -> dict:
    proc = subprocess.run(
        ["/bin/zsh", "elevator_budget_app/preflight_orcs_deploy.sh"],
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
    )
    payload = {}
    if proc.stdout.strip():
        try:
            payload = json.loads(proc.stdout)
        except json.JSONDecodeError:
            payload = {"raw_stdout": proc.stdout}
    payload["exit_code"] = proc.returncode
    if proc.stderr.strip():
        payload["stderr"] = proc.stderr
    return payload


def check_health() -> dict:
    try:
        with urlopen(HEALTH_URL, timeout=5) as resp:
            body = resp.read().decode("utf-8", errors="replace")
            return {"url": HEALTH_URL, "ok": resp.status == 200 and "ok" in body.lower(), "status": resp.status, "body": body}
    except URLError as exc:
        return {"url": HEALTH_URL, "ok": False, "error": str(exc)}


def run_assistant_cases() -> list[dict]:
    rows: list[dict] = []
    for mode, prompts in MODE_CASES.items():
        for idx, prompt in enumerate(prompts, start=1):
            try:
                payload = run_assistant_query(mode, prompt, top_k=5)
                answer = payload.get("answer", "")
                result = payload.get("result", {})
                rows.append(
                    {
                        "mode": mode,
                        "mode_label": MODE_LABELS.get(mode, mode),
                        "case_id": f"{mode}_{idx}",
                        "query": prompt,
                        "ok": True,
                        "answer_preview": answer[:700],
                        "raw": payload,
                        "result_keys": sorted(result.keys()) if isinstance(result, dict) else [],
                    }
                )
            except Exception as exc:  # pragma: no cover
                rows.append(
                    {
                        "mode": mode,
                        "mode_label": MODE_LABELS.get(mode, mode),
                        "case_id": f"{mode}_{idx}",
                        "query": prompt,
                        "ok": False,
                        "error": str(exc),
                    }
                )
    return rows


def write_json(path: Path, payload: object) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2, default=str), encoding="utf-8")


def build_summary_md(
    run_dir: Path,
    preflight: dict,
    health: dict,
    assistant_rows: list[dict],
    budget_summary: Path,
    stress_summary: Path,
) -> None:
    ok_count = sum(1 for row in assistant_rows if row.get("ok"))
    fail_count = len(assistant_rows) - ok_count
    lines = [
        "# ORCS Debug Pack",
        "",
        f"- run: `{run_dir.name}`",
        f"- preflight ok: `{preflight.get('exit_code') == 0}`",
        f"- local health ok: `{health.get('ok', False)}`",
        f"- assistant cases ok: `{ok_count}`",
        f"- assistant cases failed: `{fail_count}`",
        "",
        "## Assistant Modes",
        "",
    ]
    for row in assistant_rows:
        marker = "OK" if row.get("ok") else "FAIL"
        lines.extend(
            [
                f"### {marker} {row['case_id']} ({row['mode_label']})",
                "",
                f"**Pergunta**: {row['query']}",
                "",
            ]
        )
        if row.get("ok"):
            lines.extend(
                [
                    "**Preview**",
                    "",
                    row.get("answer_preview", "").strip() or "_sem preview_",
                    "",
                ]
            )
        else:
            lines.extend(
                [
                    f"**Erro**: {row.get('error', 'unknown')}",
                    "",
                ]
            )
    lines.extend(
        [
            "## Budget Outputs",
            "",
            f"- test outputs: [{budget_summary.name}]({budget_summary})",
            f"- stress outputs: [{stress_summary.name}]({stress_summary})",
            "",
            "## Manual UI Checklist",
            "",
            f"- ver [{(run_dir / 'manual_ui_checklist.md').name}]({run_dir / 'manual_ui_checklist.md'})",
        ]
    )
    (run_dir / "summary.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def build_manual_checklist(run_dir: Path) -> None:
    lines = [
        "# Manual UI Checklist",
        "",
        "## Core",
        "",
        "- [ ] App abre sem erro visual",
        "- [ ] Troca entre `Orçamentos` e `ILATE Assistente` funciona",
        "- [ ] Hero/header estão legíveis",
        "",
        "## Assistente",
        "",
        "- [ ] Modos `Universal`, `Wiki / Normas`, `Diagnóstico`, `Manutenção`, `Orçamentos` trocam sem quebrar",
        "- [ ] Sugestões rápidas aparecem",
        "- [ ] Pergunta manual responde",
        "- [ ] Mudar `Área de trabalho` por dropdown funciona",
        "- [ ] Mudar `Modo do assistente` por dropdown funciona",
        "- [ ] Export TXT funciona",
        "- [ ] Export JSON funciona",
        "- [ ] Limpar histórico funciona",
        "- [ ] Limpar pedido funciona",
        "- [ ] Não surgem erros novos ao mudar dropdowns ou executar consulta",
        "",
        "## Orçamentos",
        "",
        "- [ ] Formulário abre",
        "- [ ] Defaults parecem coerentes",
        "- [ ] Dropdown `Ir para etapa` funciona na sidebar",
        "- [ ] Geração de orçamento não quebra",
        "- [ ] Alertas aparecem quando aplicável",
        "",
        "## Regressões",
        "",
        "- [ ] Nenhum erro novo óbvio na consola da app",
        "- [ ] Nenhum texto principal ficou truncado",
        "- [ ] Tema claro continua legível em páginas longas",
        "- [ ] Casos com novas normas, comandos e VSD continuam coerentes",
        "- [ ] Fluxo continua utilizável do princípio ao fim",
    ]
    (run_dir / "manual_ui_checklist.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    run_dir = RUNS_DIR / timestamp
    run_dir.mkdir(parents=True, exist_ok=True)

    preflight = run_preflight()
    health = check_health()
    assistant_rows = run_assistant_cases()
    budget_summary = generate_budget_outputs()
    stress_summary = generate_stress_outputs()

    write_json(run_dir / "preflight.json", preflight)
    write_json(run_dir / "health.json", health)
    write_json(run_dir / "assistant_results.json", assistant_rows)
    write_json(
        run_dir / "summary.json",
        {
            "run": timestamp,
            "preflight": preflight,
            "health": health,
            "assistant_ok": sum(1 for row in assistant_rows if row.get("ok")),
            "assistant_failed": sum(1 for row in assistant_rows if not row.get("ok")),
            "budget_summary": str(budget_summary),
            "stress_summary": str(stress_summary),
        },
    )
    build_manual_checklist(run_dir)
    build_summary_md(run_dir, preflight, health, assistant_rows, budget_summary, stress_summary)

    print(str(run_dir))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
