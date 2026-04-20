from __future__ import annotations

from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any

import pandas as pd
import streamlit as st

from elevator_budget_app.ekl_orc_workbook import (
    build_change_report,
    CLIENT_SHEET,
    DEFAULT_WORKBOOK_PATH,
    GUIDED_FIELDS,
    MODEL_SHEET,
    export_with_overrides,
    extract_guided_defaults,
    extract_summary,
    load_workbook_bytes,
    open_workbook,
    parse_override_rows,
    preview_sheet,
    quantity_rows,
    source_label,
    workbook_exists,
)


st.set_page_config(page_title="EKL ORC Web App", layout="wide")


def format_value(value: Any) -> str:
    if isinstance(value, float):
        return f"{value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    if value is None:
        return ""
    return str(value)


def bootstrap_state(defaults: dict[str, Any], workbook_name: str) -> None:
    signature = f"{workbook_name}:{len(defaults)}"
    if st.session_state.get("ekl_signature") == signature:
        return
    st.session_state["ekl_signature"] = signature
    st.session_state["ekl_guided_values"] = defaults.copy()
    st.session_state["ekl_manual_rows"] = pd.DataFrame(
        [{"sheet": CLIENT_SHEET, "cell": "", "value": ""}],
        columns=["sheet", "cell", "value"],
    )


@st.cache_resource(show_spinner=False)
def cached_workbooks(raw_bytes: bytes) -> tuple[Any, Any]:
    formula_book = open_workbook(raw_bytes, data_only=False)
    value_book = open_workbook(raw_bytes, data_only=True)
    return formula_book, value_book


def guided_sections() -> dict[str, list[Any]]:
    sections: dict[str, list[Any]] = defaultdict(list)
    for field in GUIDED_FIELDS:
        sections[field.section].append(field)
    return sections


def render_header(workbook_name: str) -> None:
    st.title("EKL ORC Web App")
    st.caption(
        "Camada web para o workbook inteiro: edição guiada, edição livre por célula, navegação de abas e exportação de uma cópia recalculável."
    )
    st.caption(f"Workbook ativo: {workbook_name}")


def render_summary(value_book: Any) -> None:
    st.subheader("Resumo")
    project_cols = st.columns(4)
    project_cols[0].metric("Empresa", format_value(value_book[CLIENT_SHEET]["A1"].value))
    project_cols[1].metric("Cliente", format_value(value_book[CLIENT_SHEET]["A2"].value))
    project_cols[2].metric("Empreitada", format_value(value_book[CLIENT_SHEET]["A3"].value))
    project_cols[3].metric("Documento", format_value(value_book[CLIENT_SHEET]["A6"].value))

    summary_frame = pd.DataFrame(extract_summary(value_book))
    st.dataframe(summary_frame, use_container_width=True, hide_index=True)
    st.info(
        "Os valores acima são os últimos caches do Excel. A cópia exportada é gravada com recálculo forçado ao abrir no Excel ou LibreOffice."
    )


def render_guided_editor(defaults: dict[str, Any]) -> dict[str, Any]:
    st.subheader("Edição guiada")
    st.caption("Campos operacionais do projeto, parâmetros principais do modelo e tarifas de mão de obra.")

    current = st.session_state["ekl_guided_values"]
    for section, fields in guided_sections().items():
        with st.expander(section, expanded=True):
            for field in fields:
                current_value = current.get(field.key, defaults.get(field.key))
                if field.input_type == "number":
                    numeric_value = float(current_value or 0.0)
                    current[field.key] = st.number_input(
                        field.label,
                        value=numeric_value,
                        step=field.step or 1.0,
                        key=f"guided::{field.key}",
                        help=field.help_text or None,
                    )
                else:
                    current[field.key] = st.text_input(
                        field.label,
                        value="" if current_value is None else str(current_value),
                        key=f"guided::{field.key}",
                        help=field.help_text or None,
                    )
    return dict(current)


def render_quantities(value_book: Any) -> None:
    st.subheader("Quantidades do mapa cliente")
    frame = quantity_rows(value_book)
    if frame.empty:
        st.warning("Não foram encontradas linhas de quantidade numéricas na folha cliente.")
        return
    st.dataframe(frame, use_container_width=True, hide_index=True)


def render_quantity_editor(value_book: Any) -> dict[str, Any]:
    st.subheader("Editar quantidades")
    st.caption("Editor focado nas linhas com quantidades numéricas da folha cliente.")
    frame = quantity_rows(value_book).copy()
    if frame.empty:
        return {}
    editable = frame[["item", "descricao", "unidade", "quantidade", "cell"]].copy()
    edited = st.data_editor(
        editable,
        use_container_width=True,
        hide_index=True,
        disabled=["item", "descricao", "unidade", "cell"],
        column_config={
            "quantidade": st.column_config.NumberColumn("Quantidade", step=1.0),
            "cell": st.column_config.TextColumn("Célula"),
        },
        key="quantity_editor",
    )
    overrides: dict[str, Any] = {}
    for row in edited.to_dict("records"):
        overrides[f"{CLIENT_SHEET}!{row['cell']}"] = row["quantidade"]
    return overrides


def render_manual_editor(sheet_names: list[str]) -> dict[str, Any]:
    st.subheader("Edição livre por célula")
    st.caption("Adicione overrides no formato folha + célula + valor para qualquer input fora da edição guiada.")
    current = st.session_state["ekl_manual_rows"]
    editor_seed = pd.DataFrame(current, columns=["sheet", "cell", "value"])
    edited = st.data_editor(
        editor_seed,
        num_rows="dynamic",
        use_container_width=True,
        hide_index=True,
        column_config={
            "sheet": st.column_config.SelectboxColumn("Folha", options=sheet_names, required=True),
            "cell": st.column_config.TextColumn("Célula", help="Ex.: D22 ou AV10"),
            "value": st.column_config.TextColumn("Valor"),
        },
        key="manual_editor",
    )
    st.session_state["ekl_manual_rows"] = edited
    return parse_override_rows(edited)


def render_browser(formula_book: Any, value_book: Any) -> None:
    st.subheader("Browser de folhas")
    col1, col2, col3 = st.columns(3)
    sheet_name = col1.selectbox("Folha", formula_book.sheetnames, index=formula_book.sheetnames.index(MODEL_SHEET))
    mode = col2.radio("Modo", ["Fórmulas", "Valores"], horizontal=True)
    max_rows = col3.slider("Linhas", 20, 200, 80, 20)
    max_cols = st.slider("Colunas", 8, 40, 18, 2)
    workbook = formula_book if mode == "Fórmulas" else value_book
    st.dataframe(
        preview_sheet(workbook, sheet_name, max_rows=max_rows, max_cols=max_cols),
        use_container_width=True,
        hide_index=True,
    )


def download_name(workbook_name: str) -> str:
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    stem = Path(workbook_name).stem
    return f"{stem}_webapp_{stamp}.xlsx"


def build_report_text(
    workbook_name: str,
    overrides: dict[str, Any],
    summary_frame: pd.DataFrame,
    changes_frame: pd.DataFrame,
) -> str:
    lines = [
        "# Relatorio de refinamentos EKL ORC Web App",
        "",
        f"- Workbook: {workbook_name}",
        f"- Gerado em: {datetime.now().isoformat(timespec='seconds')}",
        f"- Total de alteracoes preparadas: {len(overrides)}",
        "",
        "## Resumo monitorizado",
    ]
    for row in summary_frame.to_dict("records"):
        lines.append(f"- {row['label']} ({row['sheet']}!{row['cell']}): {format_value(row['value'])}")
    lines.extend(["", "## Alteracoes preparadas"])
    if changes_frame.empty:
        lines.append("- Sem alteracoes.")
    else:
        for row in changes_frame.to_dict("records"):
            lines.append(
                f"- {row['sheet']}!{row['cell']}: {format_value(row['current_value'])} -> {format_value(row['new_value'])}"
            )
    lines.extend(
        [
            "",
            "## Notas",
            "- A app preserva todas as folhas e formulas do workbook original.",
            "- O recálculo completo é forçado ao abrir o ficheiro exportado no Excel ou LibreOffice.",
            "- Os resumos dentro da app refletem os valores em cache existentes no workbook carregado.",
        ]
    )
    return "\n".join(lines)


def main() -> None:
    uploaded = st.file_uploader("Opcional: usar outra cópia do workbook", type=["xlsx"])
    if uploaded is None and not workbook_exists():
        st.error(f"Workbook base não encontrado em {DEFAULT_WORKBOOK_PATH}")
        st.stop()

    raw_bytes = load_workbook_bytes(uploaded.getvalue() if uploaded else None)
    workbook_name = source_label(uploaded.name if uploaded else None)
    formula_book, value_book = cached_workbooks(raw_bytes)
    defaults = extract_guided_defaults(value_book)
    bootstrap_state(defaults, workbook_name)

    render_header(workbook_name)

    tab_summary, tab_guided, tab_quantities, tab_manual, tab_browser = st.tabs(
        ["Resumo", "Entradas guiadas", "Quantidades", "Overrides livres", "Folhas"]
    )

    with tab_summary:
        render_summary(value_book)
        render_quantities(value_book)

    with tab_guided:
        guided_overrides = render_guided_editor(defaults)

    with tab_quantities:
        quantity_overrides = render_quantity_editor(value_book)

    with tab_manual:
        manual_overrides = render_manual_editor(formula_book.sheetnames)
        st.caption("Sugestões úteis: `2020 - Ex ORC Cliente.!D22`, `2020 - EKL ORC MODEL 0.5!O21`, `2020 - EKL ORC MODEL 0.5!AV10`.")

    with tab_browser:
        render_browser(formula_book, value_book)

    overrides = {}
    overrides.update(guided_overrides)
    overrides.update(quantity_overrides)
    overrides.update(manual_overrides)
    summary_frame = pd.DataFrame(extract_summary(value_book))
    changes_frame = build_change_report(value_book, overrides)

    st.subheader("Alterações preparadas")
    if changes_frame.empty:
        st.caption("Sem alterações além dos valores originais carregados.")
    else:
        st.dataframe(changes_frame, use_container_width=True, hide_index=True)

    export_bytes = export_with_overrides(raw_bytes, overrides)
    report_text = build_report_text(workbook_name, overrides, summary_frame, changes_frame)
    st.download_button(
        "Descarregar workbook editado",
        data=export_bytes,
        file_name=download_name(workbook_name),
        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        use_container_width=True,
    )
    st.download_button(
        "Descarregar relatório de alterações",
        data=report_text.encode("utf-8"),
        file_name=f"{Path(workbook_name).stem}_relatorio_webapp.md",
        mime="text/markdown",
        use_container_width=True,
    )
    st.caption(
        "A exportação preserva todas as abas e fórmulas do ficheiro original e marca o workbook para recálculo total ao abrir."
    )


if __name__ == "__main__":
    main()
