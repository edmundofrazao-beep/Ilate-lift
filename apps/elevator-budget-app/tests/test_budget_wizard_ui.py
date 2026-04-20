from __future__ import annotations

from pathlib import Path

from streamlit.testing.v1 import AppTest
from elevator_budget_app.catalog_loader import load_catalogs


ROOT = Path(__file__).resolve().parents[2]
BUDGET_APP_PATH = ROOT / "elevator_budget_app" / "tests" / "streamlit_budget_clean_app.py"
STEP2_APP_PATH = ROOT / "elevator_budget_app" / "tests" / "streamlit_budget_step2_app.py"
CATALOGS = load_catalogs()
TEST_TIMEOUT_SECONDS = 25


def _run_budget_app() -> AppTest:
    at = AppTest.from_file(str(BUDGET_APP_PATH))
    at.run(timeout=TEST_TIMEOUT_SECONDS)
    return at


def _run_step2_budget_app() -> AppTest:
    at = AppTest.from_file(str(STEP2_APP_PATH))
    at.run(timeout=TEST_TIMEOUT_SECONDS)
    return at


def _find_selectbox(at: AppTest, label: str):
    for widget in at.selectbox:
        if widget.label == label:
            return widget
    raise AssertionError(f"Selectbox '{label}' não encontrada.")


def _find_text_input(at: AppTest, label: str):
    for widget in at.text_input:
        if widget.label == label:
            return widget
    raise AssertionError(f"Text input '{label}' não encontrado.")


def _find_button(at: AppTest, label: str):
    for widget in at.button:
        if widget.label == label:
            return widget
    raise AssertionError(f"Botão '{label}' não encontrado.")


def _first_non_empty_option(widget) -> str:
    for option in widget.options:
        if str(option).strip():
            return option
    raise AssertionError(f"Widget '{widget.label}' não tem opção útil.")


def _system_with_subsystems() -> str:
    arquitetura = CATALOGS["arquitetura_df"]
    for system in arquitetura["Sistema"].dropna().astype(str).unique().tolist():
        subs = (
            arquitetura.loc[arquitetura["Sistema"] == system, "Sub-sistema"]
            .dropna()
            .astype(str)
            .tolist()
        )
        if any(item.strip() for item in subs):
            return system
    raise AssertionError("Não foi encontrado nenhum sistema com sub-sistema útil no catálogo.")


def test_budget_wizard_starts_clean_at_step_one() -> None:
    at = _run_budget_app()

    assert not at.exception
    assert [item.value for item in at.subheader] == ["Enquadramento comercial"]
    assert _find_selectbox(at, "Área de trabalho").value == "Orçamentos"
    assert _find_selectbox(at.sidebar, "Ir para etapa").value == "1. Enquadramento"


def test_budget_wizard_can_advance_to_technical_step() -> None:
    at = _run_budget_app()

    _find_text_input(at, "Cliente").set_value("Cliente Teste")
    _find_text_input(at, "Obra / equipamento").set_value("Elevador Bloco A")
    _find_text_input(at, "Local").set_value("Lisboa")
    _find_text_input(at, "N.º proposta").set_value("PT-TEST-001")
    _find_button(at, "Validar e continuar").click()
    at.run(timeout=TEST_TIMEOUT_SECONDS)

    assert not at.exception
    assert [item.value for item in at.subheader] == ["Caracterização técnica"]
    assert _find_selectbox(at.sidebar, "Ir para etapa").value == "2. Caracterização técnica"


def test_budget_wizard_can_reach_operations_step() -> None:
    at = _run_step2_budget_app()

    fabricante = _find_selectbox(at, "Fabricante")
    fabricante.set_value(_first_non_empty_option(fabricante))
    at.run(timeout=TEST_TIMEOUT_SECONDS)

    sistema = _find_selectbox(at, "Sistema")
    sistema.set_value(_system_with_subsystems())
    at.run(timeout=TEST_TIMEOUT_SECONDS)
    at.run(timeout=TEST_TIMEOUT_SECONDS)

    sub_sistema = _find_selectbox(at, "Sub-sistema")
    sub_sistema.set_value(_first_non_empty_option(sub_sistema))
    _find_button(at, "Validar e continuar").click()
    at.run(timeout=TEST_TIMEOUT_SECONDS)

    assert not at.exception
    assert [item.value for item in at.subheader] == ["Catálogo de operações, kits e invisíveis"]
    assert _find_selectbox(at.sidebar, "Ir para etapa").value == "3. Operações e kits"
    assert _find_text_input(at, "Pesquisar operações").label == "Pesquisar operações"
