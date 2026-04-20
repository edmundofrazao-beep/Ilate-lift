from __future__ import annotations

from pathlib import Path

from streamlit.testing.v1 import AppTest


ROOT = Path(__file__).resolve().parents[2]
APP_PATH = ROOT / "elevator_budget_app" / "app.py"
STUB_APP_PATH = ROOT / "elevator_budget_app" / "tests" / "streamlit_stub_app.py"


def _find_selectbox_by_label(at: AppTest, label: str):
    for widget in at.selectbox:
        if widget.label == label:
            return widget
    raise AssertionError(f"Selectbox com label '{label}' não encontrado.")


def _find_button_by_label(at: AppTest, label: str):
    for widget in at.button:
        if widget.label == label:
            return widget
    raise AssertionError(f"Botão com label '{label}' não encontrado.")


def _run_file(path: Path) -> AppTest:
    at = AppTest.from_file(str(path))
    at.run(timeout=10)
    return at


def test_budget_surface_loads_without_streamlit_exceptions() -> None:
    at = _run_file(APP_PATH)

    assert not at.exception
    assert [title.value for title in at.title] == ["ILATE ORCS"]
    assert _find_selectbox_by_label(at, "Área de trabalho").value == "Orçamentos"
    assert _find_selectbox_by_label(at.sidebar, "Ir para etapa").label == "Ir para etapa"


def test_assistant_surface_uses_dropdowns_and_loads() -> None:
    at = _run_file(APP_PATH)

    _find_selectbox_by_label(at, "Área de trabalho").set_value("ILATE Assistente")
    at.run(timeout=10)

    assert not at.exception
    assert [title.value for title in at.title] == ["ILATE ORCS Assistente"]
    assert _find_selectbox_by_label(at, "Modo do assistente").value == "universal"
    assert _find_selectbox_by_label(at, "Sugestão rápida").value == ""
    assert len(at.text_area) == 1


def test_assistant_stub_execution_renders_response_metrics_and_exports() -> None:
    at = _run_file(STUB_APP_PATH)

    _find_selectbox_by_label(at, "Área de trabalho").set_value("ILATE Assistente")
    at.run(timeout=10)
    _find_selectbox_by_label(at, "Modo do assistente").set_value("wiki")
    at.text_area[0].set_value("Que requisito devo priorizar numa revisão normativa futura?")
    _find_button_by_label(at, "Executar consulta ILATE").click()
    at.run(timeout=10)

    assert not at.exception
    assert not at.error
    assert len(at.metric) >= 4
    markdown_values = [item.value for item in at.markdown]
    assert any("Stub de teste para `wiki`" in value for value in markdown_values)
    assert any("Pergunta: Que requisito devo priorizar" in value for value in markdown_values)
    assert len(at.json) >= 3


def test_assistant_quick_preset_switches_mode_and_prefills_query() -> None:
    at = _run_file(STUB_APP_PATH)

    _find_selectbox_by_label(at, "Área de trabalho").set_value("ILATE Assistente")
    at.run(timeout=10)
    _find_button_by_label(at, "Diagnóstico").click()
    at.run(timeout=10)

    assert _find_selectbox_by_label(at, "Modo do assistente").value == "diagnostico"
    assert "triagem técnica provável" in at.text_area[0].value.lower()
