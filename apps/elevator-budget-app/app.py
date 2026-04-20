from __future__ import annotations

from datetime import date
import json
from pathlib import Path
from typing import Any

import pandas as pd
import streamlit as st

from elevator_budget_app.assistant import MODE_LABELS, run_assistant_query
from elevator_budget_app.calculations import MASTER_TYPE_TO_CATALOG, build_alerts, compute_budget, validate_step
from elevator_budget_app.catalog_loader import load_catalogs
from elevator_budget_app.config import EXPORT_PREFIX, SOURCE_WORKBOOK, STEP_TITLES
from elevator_budget_app.extracted_loader import load_extracted_reference
from elevator_budget_app.exporter import build_export_workbook
from elevator_budget_app.persistence import load_autosave, save_autosave, snapshot_hash

MASTER_TYPE_META = {
    "reparacao": {
        "label": "reparacao",
        "titulo": "Reparação",
        "definicao": "Correção localizada com impacto limitado num ou poucos pontos.",
        "exemplo": "Ex.: troca de botoneira, operador de porta ou ajuste pontual.",
        "logistica": "Normal",
        "blocos": ["Diagnóstico", "Intervenção localizada", "Ensaios finais"],
    },
    "modernizacao_parcial": {
        "label": "modernizacao_parcial",
        "titulo": "Modernização parcial",
        "definicao": "Retrofit de alguns subsistemas com integração parcial.",
        "exemplo": "Ex.: quadro + drive, portas + comando, cabina + botoneiras.",
        "logistica": "Condicionada",
        "blocos": ["Levantamento", "Mobilização", "Substituição por subsistema", "Ensaios"],
    },
    "modernizacao_integral": {
        "label": "modernizacao_integral",
        "titulo": "Modernização integral",
        "definicao": "Intervenção extensa com forte renovação técnica do elevador.",
        "exemplo": "Ex.: máquina, cabos, quadro, drive e portas tratados em conjunto.",
        "logistica": "Condicionada",
        "blocos": ["Levantamento", "Planeamento alargado", "Desmontagem", "Instalação", "Comissionamento"],
    },
    "manutencao_preventiva": {
        "label": "manutencao_preventiva",
        "titulo": "Manutenção preventiva",
        "definicao": "Atividade periódica para prevenir falhas e manter desempenho.",
        "exemplo": "Ex.: limpeza, lubrificação, verificações e pequenas afinações.",
        "logistica": "Fácil",
        "blocos": ["Rotina periódica", "Verificações", "Registo técnico"],
    },
    "instalacao_nova": {
        "label": "instalacao_nova",
        "titulo": "Instalação nova",
        "definicao": "Montagem integral de um sistema novo.",
        "exemplo": "Ex.: elevador novo em edifício novo ou substituição total tipo greenfield.",
        "logistica": "Condicionada",
        "blocos": ["Engenharia", "Mobilização", "Montagem integral", "Comissionamento"],
    },
}

ASSISTANT_SUGGESTIONS = {
    "universal": [
        "Tenho um elevador que recebe chamada mas não arranca. Como devo enquadrar isto?",
        "Que norma e teste devo consultar para desnivelamento à paragem?",
        "Este caso parece manutenção, reparação ou modernização parcial?",
    ],
    "wiki": [
        "Que norma enquadra desnivelamento à paragem?",
        "Que requisitos existem para proteção das mãos nas portas?",
        "Como devo ler a transição entre EN 81-20/50 e ISO 8100-1/2:2026?",
    ],
    "diagnostico": [
        "O elevador recebe chamada mas não arranca. Qual a triagem técnica provável?",
        "A porta fecha sobre o passageiro. Qual a falha provável e que teste devo fazer?",
        "Há falha de drive/VSD. Qual o sistema e o teste recomendado?",
    ],
    "manutencao": [
        "Este caso deve ficar em manutenção corretiva, preventiva ou escalada?",
        "Uma avaria recorrente deve continuar em manutenção ou subir para intervenção maior?",
        "Que sinais indicam que a manutenção já não chega sozinha?",
    ],
    "orcamentos": [
        "Isto aponta para reparação, manutenção preventiva ou modernização parcial?",
        "Como enquadro comercialmente uma intervenção extensa em vários subsistemas?",
        "Que risco técnico devo assumir neste caso para orçamento?",
    ],
}

ASSISTANT_MODE_DESCRIPTIONS = {
    "universal": "Usa o motor ILATE sem restringir demasiado o contexto. Bom para perguntas mistas ou pouco definidas.",
    "wiki": "Foca enquadramento normativo, cláusulas, testes, requisitos e leitura técnica das normas.",
    "diagnostico": "Foca sintomas, causa provável, teste recomendado, intervenção provável e criticidade.",
    "manutencao": "Foca triagem operacional, recorrência, escalada, manutenção corretiva/preventiva e ação seguinte.",
    "orcamentos": "Foca classificação da intervenção, âmbito, risco técnico-comercial e apoio ao enquadramento do orçamento.",
}

ASSISTANT_LAYER_GUIDES = {
    "auto": {
        "label": "Auto",
        "summary": "Deixa o assistente decidir a precedência com base na pergunta.",
        "examples": [
            "Tenho falha de drive e lacunas documentais. Como devo estruturar a triagem?",
            "Numa modernização com VSD novo e alteração de comando, qual a base normativa e a leitura técnica aplicada?",
        ],
    },
    "norma": {
        "label": "Norma oficial",
        "summary": "Camada principal. Deve mandar em cláusulas, requisitos, aplicabilidade e transições normativas.",
        "examples": [
            "Que norma enquadra desnivelamento à paragem e que teste devo usar?",
            "Como devo ler a transição entre EN 81-20/50 e ISO 8100-1/2:2026?",
        ],
    },
    "macpuarsa": {
        "label": "Macpuarsa / macros ILATE",
        "summary": "Primeira camada técnica complementar. Útil para documentação, evidência, severidade, retrofit e rastreabilidade.",
        "examples": [
            "Que evidência devo pedir quando o dossier técnico está incompleto e o esquema elétrico não reflete a instalação real?",
            "Como enquadro uma alteração substancial não documentada e uma atualização de firmware sem rastreabilidade?",
        ],
    },
    "vsd": {
        "label": "VSD",
        "summary": "Segunda camada técnica complementar. Útil para variadores, feedback, encoder, brake supervision e fault logs.",
        "examples": [
            "O variador disparou. Qual é o primeiro check antes de condenar o drive?",
            "Fica fora de piso e depois acerta. O que parece e o que devo validar primeiro?",
        ],
    },
    "comandos": {
        "label": "Comandos",
        "summary": "Terceira camada técnica complementar. Útil para comando, manobra, safety chain, permissivas, I/O, COP e LOP.",
        "examples": [
            "O elevador chama mas não arranca. Como separo comando, safety chain e drive ready?",
            "Como enquadro comercialmente uma reparação de botoneira, I/O e command-chain correction?",
        ],
    },
    "legal": {
        "label": "Legal / governance",
        "summary": "Camada jurídica e de governação. Útil para separar lei, norma, inspeção, responsabilidade, AI Act e RGPD.",
        "examples": [
            "Para escadas mecânicas em Portugal, a EN 115 substitui a Portaria 1196/92 ou a portaria continua a ser a base legal?",
            "Ao usar este assistente técnico, como entram o AI Act e o RGPD na governação da resposta?",
        ],
    },
}

ILATE_ACTIVE_OBJECTIVES = [
    "Consolidar o AIProjeto como núcleo operacional em Codex e produto local.",
    "Subir e testar o ILATE bot na plataforma real.",
    "Fechar hosting sério para a ORCS app e resolver a frente SSH/infraestrutura.",
    "Transformar a blindagem legal transversal e específica num programa estruturado.",
    "Usar o ilate.pt como eixo organizador do ecossistema ILATE.",
]

ILATE_EXECUTIVE_SCHEDULE = [
    ("AIProjeto", "Forte, em consolidação", "Curto prazo", "Fechar fontes oficiais críticas e validar custom bot real", "Alta"),
    ("ILATE bot", "Pronto para integração/teste", "Curto prazo", "Subir e testar na plataforma", "Alta"),
    ("Blindagem legal transversal + específica", "Arquitetura bem definida", "Médio prazo", "Transformar em programa estruturado por frentes", "Alta"),
    ("ilate.pt", "Definido", "Médio prazo", "Usar como eixo organizador quando houver estrutura", "Média"),
    ("SSH / hosting", "Bloqueado ou incompleto", "Curto prazo", "Definir hosting e acesso adequados", "Alta"),
    ("ORCS app em servidor decente", "Necessidade clara", "Curto prazo", "Escolher solução de hosting séria", "Alta"),
]



def apply_assistant_preset(mode: str, query: str) -> None:
    st.session_state["ilate_assistant_mode"] = mode
    st.session_state["ilate_assistant_query"] = query


def clear_assistant_history() -> None:
    st.session_state["ilate_assistant_history"] = []


def clear_assistant_query() -> None:
    st.session_state["ilate_assistant_query"] = ""


def classify_budget_type(answers: dict[str, Any]) -> tuple[str | None, str]:
    if not answers:
        return None, ""
    exists = answers.get("elevador_existe")
    preventive = answers.get("objetivo_manutencao")
    subsystems = answers.get("subsistemas_afetados")
    principal = answers.get("componentes_principais")
    extent = answers.get("extensao")
    if exists == "nao":
        return "instalacao_nova", "Foi indicada inexistência de elevador atual, o que aponta para instalação nova."
    if preventive == "sim":
        return "manutencao_preventiva", "O objetivo principal descrito é periódico e preventivo."
    if principal == "sim_conjunto" or subsystems == "4_ou_mais" or extent == "extensa":
        return "modernizacao_integral", "O âmbito é alargado e inclui substituições principais ou vários subsistemas."
    if principal == "sim_alguns" or subsystems == "2_ou_3" or extent == "intermedia":
        return "modernizacao_parcial", "Há integração relevante, mas sem sinais claros de renovação integral."
    if exists == "sim":
        return "reparacao", "O cenário parece localizado sobre equipamento existente."
    return None, ""


def filter_operations_for_budget_type(frame: pd.DataFrame, master_type: str) -> pd.DataFrame:
    catalog_type = MASTER_TYPE_TO_CATALOG.get(master_type, "Modernização parcial")
    allowed_labels = {catalog_type}
    if master_type in {"reparacao", "modernizacao_parcial", "modernizacao_integral", "instalacao_nova"}:
        allowed_labels.add("Diagnóstico / levantamento")
    if master_type in {"modernizacao_parcial", "modernizacao_integral", "instalacao_nova"}:
        allowed_labels.add("Modernização parcial")
        allowed_labels.add("Modernização integral")
    if master_type == "manutencao_preventiva":
        allowed_labels.add("Manutenção programada")
    return frame[frame["tipo_intervencao"].fillna("").isin(allowed_labels)].copy()


def suggested_blocks(master_type: str) -> str:
    return " -> ".join(MASTER_TYPE_META[master_type]["blocos"])


def default_state(catalogs: dict[str, Any]) -> dict[str, Any]:
    parametros = catalogs["parametros"]
    return {
        "project": {
            "cliente": "",
            "obra": "",
            "local": "",
            "numero_proposta": "PT-ORC-001",
            "data_proposta": str(date.today()),
            "validade_dias": 30,
            "tipo_orcamento": "modernizacao_parcial",
            "observacoes_gerais": "",
        },
        "technical": {
            "fabricante": "Genérico",
            "gama": "",
            "sistema": "",
            "sub_sistema": "",
            "modelo": "",
            "n_pisos": 5,
            "n_paragens": 5,
            "ocupacao_edificio": "Parcial",
            "distancia_logistica": "10-30 km",
            "notas_tecnicas": "",
        },
        "costs": {
            "overhead": float(parametros.get("Overhead base", 0.15)),
            "contingencia": float(parametros.get("Contingência técnica", 0.08)),
            "margem": float(parametros.get("Margem comercial", 0.2)),
            "iva": float(parametros.get("IVA", 0.23)),
            "desperdicio_padrao": 0.05,
        },
        "selected_codes": [],
        "operation_inputs": {},
        "extra_costs": [],
        "current_step": 1,
        "autosave_hash": "",
        "autosave_timestamp": "",
        "review_confirmed": False,
        "operation_search": "",
        "classification_mode": False,
        "classification_answers": {},
    }


def bootstrap_state(catalogs: dict[str, Any]) -> None:
    if "budget_state" in st.session_state:
        return
    saved = load_autosave()
    if saved and saved.get("payload"):
        st.session_state["budget_state"] = saved["payload"]
        st.session_state["budget_state"]["autosave_hash"] = saved.get("hash", "")
        st.session_state["budget_state"]["autosave_timestamp"] = saved.get("saved_at", "")
    else:
        st.session_state["budget_state"] = default_state(catalogs)


def sync_operation_defaults(state: dict[str, Any], catalogs: dict[str, Any]) -> None:
    ops = catalogs["operacoes_df"].set_index("codigo")
    logistic_default = MASTER_TYPE_META[state["project"]["tipo_orcamento"]]["logistica"]
    for code in state["selected_codes"]:
        op = ops.loc[code]
        state["operation_inputs"].setdefault(
            code,
            {
                "quantidade": float(op["quantidade_base"] or 1.0),
                "dificuldade": "Normal",
                "logistica": logistic_default,
                "risco": "Normal",
                "equipa": op["equipa"] or "Oficial",
                "custo_hora_equipa": float(catalogs["taxas_equipa"].get(op["equipa"], 0.0)),
                "material_unitario": float(op["material_unitario"] or 0.0),
                "desperdicio": float(state["costs"]["desperdicio_padrao"]),
                "subcontrato": float(op["subcontrato_base"] or 0.0),
                "tipo_intervencao": op["tipo_intervencao"] or MASTER_TYPE_TO_CATALOG[state["project"]["tipo_orcamento"]],
                "observacoes": "",
            },
        )
    for code in list(state["operation_inputs"].keys()):
        if code not in state["selected_codes"]:
            del state["operation_inputs"][code]


def persist_if_changed(state: dict[str, Any]) -> None:
    payload = {
        key: value
        for key, value in state.items()
        if key not in {"autosave_hash", "autosave_timestamp"}
    }
    new_hash = snapshot_hash(payload)
    if new_hash != state.get("autosave_hash"):
        saved_at = save_autosave(payload)
        state["autosave_hash"] = new_hash
        state["autosave_timestamp"] = saved_at


def compute_step_unlock(state: dict[str, Any]) -> int:
    max_step = 1
    for step in range(1, 5):
        if validate_step(state, step):
            break
        max_step = step + 1
    return min(max_step, 5)


def format_eur(value: float) -> str:
    return f"{value:,.2f} €".replace(",", "X").replace(".", ",").replace("X", ".")


def render_sidebar(state: dict[str, Any], unlocked_step: int) -> None:
    with st.sidebar:
        st.markdown("## Orçamentação Técnica")
        st.caption("Fluxo guiado, validação rigorosa e exportação Excel robusta.")
        visible_step_limit = max(unlocked_step, int(state.get("current_step", 1)))
        available_steps = {STEP_TITLES[idx - 1]: idx for idx in range(1, visible_step_limit + 1)}
        selected_step_label = st.selectbox(
            "Ir para etapa",
            options=list(available_steps.keys()),
            index=max(0, min(int(state.get("current_step", 1)), visible_step_limit) - 1),
            help="Dropdown rápido para navegar pelas etapas já desbloqueadas. A etapa atual é preservada durante reruns.",
        )
        selected_step = available_steps[selected_step_label]
        if selected_step != state["current_step"]:
            state["current_step"] = selected_step
        for idx, title in enumerate(STEP_TITLES, start=1):
            locked = idx > unlocked_step
            status = "Concluída" if idx < unlocked_step else "Em curso" if idx == state["current_step"] else "Bloqueada" if locked else "Disponível"
            st.markdown(f'<div class="step-card"><strong>{title}</strong><br>{status}</div>', unsafe_allow_html=True)
            st.button(
                f"Abrir {title}",
                width="stretch",
                disabled=locked,
                key=f"goto_{idx}",
                on_click=lambda step=idx: state.__setitem__("current_step", step),
            )
        if state.get("autosave_timestamp"):
            st.caption(f"Autosave: {state['autosave_timestamp']}")
        st.caption(f"Catálogo base: {SOURCE_WORKBOOK.name}")
        extracted = st.session_state.get("ekl_extracted_reference", {})
        if extracted:
            with st.expander("Referência EKL extraída", expanded=False):
                st.caption("Artefactos extraídos do workbook legado, consumidos sem depender do Excel inteiro.")
                st.write(
                    f"{len(extracted['inventory'])} folhas inventariadas | "
                    f"{len(extracted['categorias']['taxonomia_custos'])} categorias de custo | "
                    f"{len(extracted['linhas_tipo'])} linhas tipo"
                )
                tarifas = pd.DataFrame(extracted["tarifas"]["tarifas_modelo"]).head(5)
                st.dataframe(tarifas, width="stretch", hide_index=True)
                categorias = pd.DataFrame(extracted["categorias"]["secoes_servico"]).head(6)
                st.dataframe(categorias, width="stretch", hide_index=True)


def render_program_status() -> None:
    with st.expander("Objetivos ativos e cronograma executivo", expanded=False):
        st.markdown("### Objetivos ativos")
        for item in ILATE_ACTIVE_OBJECTIVES:
            st.write(f"- {item}")

        schedule_df = pd.DataFrame(
            ILATE_EXECUTIVE_SCHEDULE,
            columns=["Bloco", "Estado", "Horizonte", "Próximo passo", "Prioridade"],
        )
        st.markdown("### Cronograma executivo")
        st.dataframe(schedule_df, width="stretch", hide_index=True)


def render_enquadramento(state: dict[str, Any]) -> None:
    st.subheader("Enquadramento comercial")
    col1, col2 = st.columns(2)
    with col1:
        state["project"]["cliente"] = st.text_input(
            "Cliente",
            value=state["project"]["cliente"],
            help="Identificação comercial do cliente final ou instalador.",
            key="project_cliente",
        )
        state["project"]["obra"] = st.text_input(
            "Obra / equipamento",
            value=state["project"]["obra"],
            help="Nome interno do equipamento, prédio ou obra.",
            key="project_obra",
        )
        state["project"]["local"] = st.text_input(
            "Local",
            value=state["project"]["local"],
            help="Morada ou referência de localização para logística e proposta.",
            key="project_local",
        )
        state["project"]["numero_proposta"] = st.text_input(
            "N.º proposta",
            value=state["project"]["numero_proposta"],
            help="Código documental da proposta. Deve ser único e rastreável.",
            key="project_numero_proposta",
        )
    with col2:
        state["project"]["data_proposta"] = str(
            st.date_input(
                "Data da proposta",
                value=date.fromisoformat(state["project"]["data_proposta"]),
                help="Data formal do documento a exportar.",
                key="project_data_proposta",
            )
        )
        state["project"]["validade_dias"] = int(
            st.number_input(
                "Validade (dias)",
                min_value=1,
                value=int(state["project"]["validade_dias"]),
                help="Prazo de validade comercial em dias corridos.",
                key="project_validade_dias",
            )
        )
        state["project"]["tipo_orcamento"] = st.selectbox(
            "Tipo de orçamento",
            options=list(MASTER_TYPE_META.keys()),
            index=list(MASTER_TYPE_META.keys()).index(state["project"]["tipo_orcamento"]),
            format_func=lambda key: f"{MASTER_TYPE_META[key]['label']} — {MASTER_TYPE_META[key]['titulo']}",
            help="Campo mestre obrigatório que governa filtros, sugestões, alertas, proposta final e validações.",
            key="project_tipo_orcamento",
        )
    st.markdown("### Definições rápidas")
    defs_cols = st.columns(len(MASTER_TYPE_META))
    for col, key in zip(defs_cols, MASTER_TYPE_META.keys()):
        meta = MASTER_TYPE_META[key]
        with col:
            st.caption(meta["label"])
            st.write(f"**{meta['titulo']}**")
            st.write(meta["definicao"])
            st.caption(meta["exemplo"])

    state["classification_mode"] = st.checkbox(
        "Não tenho a certeza — ajudar a classificar",
        value=state.get("classification_mode", False),
        help="Mostra 5 perguntas rápidas para sugerir o tipo mais provável. A confirmação final continua a ser manual.",
        key="project_classification_mode",
    )
    if state["classification_mode"]:
        answers = state.setdefault("classification_answers", {})
        q1, q2, q3, q4, q5 = st.columns(5)
        with q1:
            answers["elevador_existe"] = st.selectbox(
                "1) O elevador já existe?",
                options=["", "sim", "nao"],
                index=["", "sim", "nao"].index(answers.get("elevador_existe", "")),
                help="Se não existir equipamento atual, a tendência é instalação nova.",
                key="class_elevador_existe",
            )
        with q2:
            answers["objetivo_manutencao"] = st.selectbox(
                "2) O objetivo principal é manutenção periódica e prevenção?",
                options=["", "sim", "nao"],
                index=["", "sim", "nao"].index(answers.get("objetivo_manutencao", "")),
                help="Se sim, a classificação tende para manutenção preventiva.",
                key="class_objetivo_manutencao",
            )
        with q3:
            answers["subsistemas_afetados"] = st.selectbox(
                "3) Quantos subsistemas são afetados?",
                options=["", "1", "2_ou_3", "4_ou_mais"],
                index=["", "1", "2_ou_3", "4_ou_mais"].index(answers.get("subsistemas_afetados", "")),
                format_func=lambda value: {"": "Escolher", "1": "1", "2_ou_3": "2-3", "4_ou_mais": "4 ou mais"}[value],
                help="Quanto maior o número de subsistemas, maior a probabilidade de modernização.",
                key="class_subsistemas_afetados",
            )
        with q4:
            answers["componentes_principais"] = st.selectbox(
                "4) Há substituição de componentes principais em conjunto?",
                options=["", "nao", "sim_alguns", "sim_conjunto"],
                index=["", "nao", "sim_alguns", "sim_conjunto"].index(answers.get("componentes_principais", "")),
                format_func=lambda value: {"": "Escolher", "nao": "Não", "sim_alguns": "Sim, alguns", "sim_conjunto": "Sim, em conjunto"}[value],
                help="Máquina, cabos, quadro, drive ou portas em conjunto puxam para modernização integral.",
                key="class_componentes_principais",
            )
        with q5:
            answers["extensao"] = st.selectbox(
                "5) A intervenção é localizada ou extensa?",
                options=["", "localizada", "intermedia", "extensa"],
                index=["", "localizada", "intermedia", "extensa"].index(answers.get("extensao", "")),
                format_func=lambda value: {"": "Escolher", "localizada": "Localizada", "intermedia": "Intermédia", "extensa": "Extensa"}[value],
                help="Uma intervenção extensa tende para modernização integral.",
                key="class_extensao",
            )
        suggestion, rationale = classify_budget_type(answers)
        if suggestion:
            st.info(f"Sugestão automática: `{suggestion}`. {rationale}")
            st.caption("Pode manter a sugestão ou confirmar manualmente outro tipo, se tiver melhor enquadramento técnico/comercial.")
            if st.button("Aplicar sugestão de classificação", use_container_width=False):
                state["project"]["tipo_orcamento"] = suggestion
                st.rerun()
    st.success(
        f"Tipo ativo: `{state['project']['tipo_orcamento']}` | blocos sugeridos: {suggested_blocks(state['project']['tipo_orcamento'])}"
    )
    state["project"]["observacoes_gerais"] = st.text_area(
        "Observações gerais",
        value=state["project"]["observacoes_gerais"],
        help="Notas comerciais, exclusões, pressupostos ou condicionantes globais.",
        height=110,
        key="project_observacoes_gerais",
    )


def render_tecnica(state: dict[str, Any], catalogs: dict[str, Any]) -> None:
    st.subheader("Caracterização técnica")
    fabricantes = sorted(set(catalogs["fabricantes_df"]["Fabricante"].dropna().astype(str).tolist() + ["Genérico"]))
    arquitetura = catalogs["arquitetura_df"]
    sistemas = sorted(arquitetura["Sistema"].dropna().astype(str).unique().tolist())
    subsistemas = sorted(
        arquitetura.loc[arquitetura["Sistema"] == state["technical"]["sistema"], "Sub-sistema"].dropna().astype(str).unique().tolist()
    )

    col1, col2, col3 = st.columns(3)
    with col1:
        state["technical"]["fabricante"] = st.selectbox(
            "Fabricante",
            options=fabricantes,
            index=max(fabricantes.index(state["technical"]["fabricante"]), 0) if state["technical"]["fabricante"] in fabricantes else 0,
            help="Usado para sugerir kits invisíveis por fabricante e série.",
            key="technical_fabricante",
        )
        state["technical"]["gama"] = st.text_input(
            "Gama / série",
            value=state["technical"]["gama"],
            help="Série do fabricante. Mantém rastreabilidade técnica e futura análise estatística.",
            key="technical_gama",
        )
        state["technical"]["modelo"] = st.text_input(
            "Modelo / designação interna",
            value=state["technical"]["modelo"],
            help="Campo livre para identificar a configuração específica do elevador.",
            key="technical_modelo",
        )
    with col2:
        state["technical"]["sistema"] = st.selectbox(
            "Sistema",
            options=[""] + sistemas,
            index=([""] + sistemas).index(state["technical"]["sistema"]) if state["technical"]["sistema"] in ([""] + sistemas) else 0,
            help="Sistema técnico dominante da intervenção.",
            key="technical_sistema",
        )
        state["technical"]["sub_sistema"] = st.selectbox(
            "Sub-sistema",
            options=[""] + subsistemas,
            index=([""] + subsistemas).index(state["technical"]["sub_sistema"]) if state["technical"]["sub_sistema"] in ([""] + subsistemas) else 0,
            help="Sub-sistema específico para refinar catálogo e kits.",
            key="technical_sub_sistema",
        )
        state["technical"]["ocupacao_edificio"] = st.selectbox(
            "Edifício ocupado",
            options=["Sem ocupação", "Parcial", "Total"],
            index=["Sem ocupação", "Parcial", "Total"].index(state["technical"]["ocupacao_edificio"]),
            help="Afeta produtividade, logística e risco operacional.",
            key="technical_ocupacao_edificio",
        )
    with col3:
        state["technical"]["n_pisos"] = int(
            st.number_input(
                "N.º pisos",
                min_value=1,
                value=int(state["technical"]["n_pisos"]),
                help="Informação técnica útil para validar escala e esforço previsto.",
                key="technical_n_pisos",
            )
        )
        state["technical"]["n_paragens"] = int(
            st.number_input(
                "N.º paragens",
                min_value=1,
                value=int(state["technical"]["n_paragens"]),
                help="Número de paragens servidas pelo equipamento.",
                key="technical_n_paragens",
            )
        )
        state["technical"]["distancia_logistica"] = st.selectbox(
            "Raio logístico",
            options=["Até 10 km", "10-30 km", "30-60 km", ">60 km"],
            index=["Até 10 km", "10-30 km", "30-60 km", ">60 km"].index(state["technical"]["distancia_logistica"]),
            help="Apoia a inclusão de deslocações e custos invisíveis logísticos.",
            key="technical_distancia_logistica",
        )
    state["technical"]["notas_tecnicas"] = st.text_area(
        "Notas técnicas",
        value=state["technical"]["notas_tecnicas"],
        help="Condições de obra, limitações físicas, normas específicas ou pressupostos de engenharia.",
        height=120,
        key="technical_notas_tecnicas",
    )


def render_operations(state: dict[str, Any], catalogs: dict[str, Any]) -> None:
    st.subheader("Catálogo de operações, kits e invisíveis")
    base_operations_df = filter_operations_for_budget_type(catalogs["operacoes_df"].copy(), state["project"]["tipo_orcamento"])
    operations_df = base_operations_df.copy()
    if state["technical"]["sistema"]:
        operations_df = operations_df[
            (operations_df["sistema"] == state["technical"]["sistema"])
            | (operations_df["sistema"].fillna("") == "")
            | (operations_df["sistema"] == "Manutenção")
        ]
    if state["technical"]["sub_sistema"]:
        operations_df = operations_df[
            (operations_df["sub_sistema"] == state["technical"]["sub_sistema"])
            | (operations_df["sub_sistema"].fillna("") == "")
        ]

    if operations_df.empty:
        operations_df = base_operations_df.copy()
        st.warning(
            "Os filtros técnicos ficaram demasiado restritivos. Mostro o catálogo do tipo de orçamento para não bloquear a seleção de operações."
        )

    search = st.text_input(
        "Pesquisar operações",
        value=state.get("operation_search", ""),
        help="Filtre por código, fase, operação ou sub-sistema para reduzir o catálogo.",
        key="operations_search",
    )
    state["operation_search"] = search
    if search:
        mask = operations_df.apply(lambda col: col.astype(str).str.contains(search, case=False, na=False))
        operations_df = operations_df[mask.any(axis=1)]

    preview = operations_df[
        ["codigo", "fase", "operacao", "tipo_intervencao", "equipa", "tempo_fixo", "material_unitario", "invisiveis_sugeridos"]
    ].head(50)
    st.caption(
        f"Filtro mestre `{state['project']['tipo_orcamento']}` ativo. Intensidade logística sugerida: {MASTER_TYPE_META[state['project']['tipo_orcamento']]['logistica']}."
    )
    st.caption(f"Blocos sugeridos para este tipo: {suggested_blocks(state['project']['tipo_orcamento'])}")
    st.dataframe(preview, width="stretch", hide_index=True)

    available_codes = sorted(set(operations_df["codigo"].tolist() + state["selected_codes"]))
    labels = catalogs["operacoes_df"].set_index("codigo")["operacao"].to_dict()
    selected = st.multiselect(
        "Selecionar operações",
        options=available_codes,
        default=[code for code in state["selected_codes"] if code in available_codes],
        format_func=lambda code: f"{code} | {labels.get(code, code)}",
        help="Escolha as operações que entram no orçamento. Só estas seguem para cálculo e exportação.",
    )
    state["selected_codes"] = selected
    sync_operation_defaults(state, catalogs)

    tabs = st.tabs(["Operações selecionadas", "Micro-materiais", "Logística", "Fabricantes e kits"])
    with tabs[0]:
        if not state["selected_codes"]:
            st.info("Selecione operações para configurar quantidades, equipas e fatores.")
        ops_lookup = catalogs["operacoes_df"].set_index("codigo")
        for code in state["selected_codes"]:
            op = ops_lookup.loc[code]
            cfg = state["operation_inputs"][code]
            with st.expander(f"{code} | {op['operacao']}", expanded=False):
                c1, c2, c3 = st.columns(3)
                with c1:
                    cfg["quantidade"] = st.number_input(
                        f"Quantidade {code}",
                        min_value=0.1,
                        value=float(cfg["quantidade"]),
                        step=0.1,
                        help="Quantidade a aplicar na operação selecionada.",
                        key=f"qty_{code}",
                    )
                    cfg["equipa"] = st.selectbox(
                        f"Equipa {code}",
                        options=list(catalogs["taxas_equipa"].keys()),
                        index=list(catalogs["taxas_equipa"].keys()).index(cfg["equipa"]) if cfg["equipa"] in catalogs["taxas_equipa"] else 0,
                        help="Equipa principal considerada no cálculo de mão de obra.",
                        key=f"team_{code}",
                    )
                with c2:
                    cfg["dificuldade"] = st.selectbox(
                        f"Dificuldade {code}",
                        options=["Baixa", "Normal", "Elevada", "Muito elevada"],
                        index=["Baixa", "Normal", "Elevada", "Muito elevada"].index(cfg["dificuldade"]),
                        help="Fator técnico que ajusta horas planeadas.",
                        key=f"diff_{code}",
                    )
                    cfg["logistica"] = st.selectbox(
                        f"Logística {code}",
                        options=["Fácil", "Normal", "Condicionada"],
                        index=["Fácil", "Normal", "Condicionada"].index(cfg["logistica"]),
                        help="Condicionantes de acesso, movimentação e contexto de obra.",
                        key=f"log_{code}",
                    )
                with c3:
                    cfg["risco"] = st.selectbox(
                        f"Risco {code}",
                        options=["Baixo", "Normal", "Elevado", "Muito elevado"],
                        index=["Baixo", "Normal", "Elevado", "Muito elevado"].index(cfg["risco"]),
                        help="Risco técnico/comercial adicional com impacto em horas.",
                        key=f"risk_{code}",
                    )
                    cfg["custo_hora_equipa"] = st.number_input(
                        f"Custo hora {code}",
                        min_value=0.0,
                        value=float(cfg["custo_hora_equipa"]),
                        help="Taxa horária da equipa. Ajuste apenas quando houver exceção real.",
                        key=f"rate_{code}",
                    )
                c4, c5, c6 = st.columns(3)
                with c4:
                    cfg["material_unitario"] = st.number_input(
                        f"Material unitário {code}",
                        min_value=0.0,
                        value=float(cfg["material_unitario"]),
                        help="Custo unitário base do componente principal desta operação.",
                        key=f"mat_{code}",
                    )
                with c5:
                    cfg["desperdicio"] = st.number_input(
                        f"Desperdício {code}",
                        min_value=0.0,
                        max_value=1.0,
                        value=float(cfg["desperdicio"]),
                        step=0.01,
                        help="Taxa decimal de desperdício aplicada a materiais e consumíveis.",
                        key=f"waste_{code}",
                    )
                with c6:
                    cfg["subcontrato"] = st.number_input(
                        f"Subcontrato {code}",
                        min_value=0.0,
                        value=float(cfg["subcontrato"]),
                        help="Usar quando uma parcela da operação é executada por terceiro.",
                        key=f"subc_{code}",
                    )
                cfg["observacoes"] = st.text_area(
                    f"Observações {code}",
                    value=cfg["observacoes"],
                    help="Notas específicas desta operação para revisão interna e exportação.",
                    height=80,
                    key=f"notes_{code}",
                )
                st.caption(
                    f"Kits sugeridos: micro '{op['kit_micro'] or 'n/d'}' | logística '{op['kit_logistica'] or 'n/d'}' | invisíveis base {format_eur(float(op['invisiveis_sugeridos']))}"
                )
    with tabs[1]:
        st.dataframe(catalogs["micro_df"].head(50), width="stretch", hide_index=True)
    with tabs[2]:
        st.dataframe(catalogs["logistica_df"], width="stretch", hide_index=True)
    with tabs[3]:
        st.dataframe(catalogs["fabricantes_df"], width="stretch", hide_index=True)
        st.dataframe(catalogs["kits_fabricante_df"], width="stretch", hide_index=True)


def render_costs(state: dict[str, Any], results: dict[str, Any], alerts: list[dict[str, str]]) -> None:
    st.subheader("Custos globais, extras e validação")
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        state["costs"]["overhead"] = st.number_input(
            "Overhead",
            min_value=0.0,
            max_value=1.0,
            value=float(state["costs"]["overhead"]),
            step=0.01,
            help="Taxa decimal para custos indirectos de estrutura.",
        )
    with col2:
        state["costs"]["contingencia"] = st.number_input(
            "Contingência",
            min_value=0.0,
            max_value=1.0,
            value=float(state["costs"]["contingencia"]),
            step=0.01,
            help="Reserva técnica para imprevistos e risco de integração.",
        )
    with col3:
        state["costs"]["margem"] = st.number_input(
            "Margem",
            min_value=0.0,
            max_value=1.0,
            value=float(state["costs"]["margem"]),
            step=0.01,
            help="Margem comercial pretendida antes de IVA.",
        )
    with col4:
        state["costs"]["iva"] = st.number_input(
            "IVA",
            min_value=0.0,
            max_value=1.0,
            value=float(state["costs"]["iva"]),
            step=0.01,
            help="Taxa decimal de IVA a aplicar. Em Portugal, tipicamente 0,23.",
        )

    st.markdown("### Custos adicionais")
    extra_categories = ["Logística", "Micro-materiais", "Resíduos", "Subcontrato", "Outro"]
    cols = st.columns([1, 2, 1, 1, 1])
    new_extra = {
        "categoria": cols[0].selectbox("Categoria", extra_categories, help="Tipologia do custo adicional.", key="extra_cat"),
        "item": cols[1].text_input("Item", help="Descrição curta e objetiva do custo.", key="extra_item"),
        "quantidade": cols[2].number_input("Qtd.", min_value=1.0, value=1.0, step=1.0, help="Quantidade do item.", key="extra_qty"),
        "custo_unitario": cols[3].number_input("Custo unitário", min_value=0.0, value=0.0, step=1.0, help="Valor unitário sem margem nem IVA.", key="extra_cost"),
        "observacoes": cols[4].text_input("Obs.", help="Justificação resumida do extra.", key="extra_obs"),
    }
    if st.button("Adicionar custo extra", width="stretch"):
        if new_extra["item"].strip():
            state["extra_costs"].append(new_extra.copy())
            st.rerun()
    if state["extra_costs"]:
        st.dataframe(pd.DataFrame(state["extra_costs"]), width="stretch", hide_index=True)

    st.markdown("### Alertas automáticos")
    if not alerts:
        st.success("Sem alertas críticos.")
    for alert in alerts:
        if alert["level"] == "error":
            st.error(alert["text"])
        elif alert["level"] == "warning":
            st.warning(alert["text"])
        else:
            st.info(alert["text"])

    st.markdown("### Indicadores em tempo real")
    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Horas", f"{results['totals']['horas']:.2f} h")
    m2.metric("Custo directo", format_eur(results["totals"]["directo"]))
    m3.metric("Subtotal s/ IVA", format_eur(results["totals"]["subtotal_sem_iva"]))
    m4.metric("Preço final", format_eur(results["totals"]["total_final"]))
    extracted = st.session_state.get("ekl_extracted_reference", {})
    if extracted:
        st.markdown("### Benchmarks EKL extraídos")
        benchmark_df = pd.DataFrame(extracted["tarifas"]["benchmarks_2020"]).head(7)
        st.dataframe(benchmark_df, width="stretch", hide_index=True)


def render_review(state: dict[str, Any], results: dict[str, Any], alerts: list[dict[str, str]]) -> None:
    st.subheader("Revisão final antes da exportação")
    cols = st.columns(4)
    cols[0].metric("Operações", str(len(results["operations"])))
    cols[1].metric("Horas totais", f"{results['totals']['horas']:.2f} h")
    cols[2].metric("IVA", format_eur(results["totals"]["iva"]))
    cols[3].metric("Preço final", format_eur(results["totals"]["total_final"]))

    st.markdown('<div class="summary-card">', unsafe_allow_html=True)
    st.markdown("**Checklist de revisão**")
    st.write(
        f"Confirme consistência técnica, classificação `{state['project']['tipo_orcamento']}`, kits invisíveis, condições de obra, taxas de custo e alertas."
    )
    st.caption(f"Proposta final orientada por blocos: {suggested_blocks(state['project']['tipo_orcamento'])}")
    st.dataframe(results["operations"], width="stretch", hide_index=True)
    if not results["extras"].empty:
        st.dataframe(results["extras"], width="stretch", hide_index=True)
    st.markdown("</div>", unsafe_allow_html=True)

    for alert in alerts:
        if alert["level"] == "error":
            st.error(alert["text"])
        elif alert["level"] == "warning":
            st.warning(alert["text"])
        else:
            st.info(alert["text"])

    state["review_confirmed"] = st.checkbox(
        "Confirmo que revi horas, materiais, invisíveis, IVA e preço final antes de exportar.",
        value=state["review_confirmed"],
        help="Bloqueia a exportação até existir uma revisão final explícita.",
    )

    export_disabled = any(alert["level"] == "error" for alert in alerts) or not state["review_confirmed"]
    export_bytes = build_export_workbook(state, results, alerts)
    file_name = f"{EXPORT_PREFIX}_{state['project']['numero_proposta']}.xlsx".replace(" ", "_")
    st.download_button(
        "Exportar Excel final",
        data=export_bytes,
        file_name=file_name,
        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        type="primary",
        disabled=export_disabled,
        help="Gera um Excel estável com resumo, dados do projeto, operações, extras e configuração detalhada.",
    )


def render_ilate_assistant() -> None:
    st.title("ILATE ORCS Assistente")
    st.caption("Assistente único para normas, consultas, diagnóstico, manutenção e apoio a orçamentação.")
    st.markdown(
        """
        <div class="hero-card">
          <strong>Como usar</strong><br>
          Faz a pergunta em linguagem normal. O assistente tenta responder no modo certo e devolve norma, sistema, componente, criticidade e próxima linha de ação quando aplicável.
        </div>
        """,
        unsafe_allow_html=True,
    )

    default_mode = st.session_state.get("ilate_assistant_mode", "universal")
    mode_options = list(MODE_LABELS.keys())
    mode = st.selectbox(
        "Modo do assistente",
        options=mode_options,
        index=mode_options.index(default_mode) if default_mode in MODE_LABELS else 0,
        format_func=lambda key: MODE_LABELS[key],
        key="ilate_assistant_mode",
        help="Escolhe o foco principal da resposta. O modo universal continua disponível para perguntas híbridas.",
    )
    st.markdown(
        f"""
        <div class="summary-card">
          <strong>Modo ativo: {MODE_LABELS.get(mode, mode)}</strong><br>
          {ASSISTANT_MODE_DESCRIPTIONS.get(mode, "")}
        </div>
        """,
        unsafe_allow_html=True,
    )
    layer_key = st.selectbox(
        "Camada prioritária",
        options=list(ASSISTANT_LAYER_GUIDES.keys()),
        format_func=lambda key: ASSISTANT_LAYER_GUIDES[key]["label"],
        index=0,
        help="Não força o motor; serve para orientar a formulação da pergunta e acelerar exemplos úteis.",
    )
    layer_guide = ASSISTANT_LAYER_GUIDES[layer_key]
    st.markdown(
        f"""
        <div class="summary-card">
          <strong>Precedência atual</strong><br>
          Norma oficial → Macpuarsa / macros ILATE → VSD → comandos<br>
          <span style="opacity:0.9">Legal / governance atua como camada transversal de controlo e prudência.</span><br><br>
          <strong>Camada selecionada: {layer_guide['label']}</strong><br>
          {layer_guide['summary']}
        </div>
        """,
        unsafe_allow_html=True,
    )
    query = st.text_area(
        "Pedido",
        value=st.session_state.get("ilate_assistant_query", ""),
        height=140,
        placeholder="Ex.: Que norma enquadra desnivelamento à paragem? | Este sintoma aponta para quê? | Isto é manutenção ou modernização parcial?",
    )
    st.session_state["ilate_assistant_query"] = query
    top_k = st.slider("Profundidade de pesquisa", min_value=3, max_value=8, value=5, step=1)
    st.caption("Nota: respostas normativas e de conformidade crítica devem ser confirmadas na cláusula primária aplicável.")

    suggestions = list(ASSISTANT_SUGGESTIONS.get(mode, ASSISTANT_SUGGESTIONS["universal"]))
    for example in layer_guide["examples"]:
        if example not in suggestions:
            suggestions.append(example)
    selected_suggestion = st.selectbox(
        "Sugestão rápida",
        options=[""] + suggestions,
        index=0,
        help="Escolhe uma pergunta sugerida para preencher rapidamente o pedido.",
    )
    if selected_suggestion and selected_suggestion != st.session_state.get("ilate_assistant_query", ""):
        st.session_state["ilate_assistant_query"] = selected_suggestion
        st.rerun()

    guide_cols = st.columns(4)
    guides = [
        ("Wiki / Normas", "Perguntas sobre requisitos, cláusulas, testes e enquadramento técnico."),
        ("Diagnóstico", "Sintomas, causa provável, teste recomendado e intervenção mais provável."),
        ("Manutenção", "Triagem operacional, recorrência, escalada e próxima ação recomendada."),
        ("Orçamentos", "Classificação do caso, âmbito, risco e impacto técnico-comercial."),
    ]
    for col, (title, body) in zip(guide_cols, guides):
        with col:
            st.markdown(
                f"""
                <div class="mode-card">
                  <strong>{title}</strong><br><br>
                  <span>{body}</span>
                </div>
                """,
                unsafe_allow_html=True,
            )

    quick_cols = st.columns(4)
    presets = [
        ("Norma", "wiki", "Que norma e teste enquadram desnivelamento à paragem?"),
        ("Diagnóstico", "diagnostico", "O elevador recebe chamada mas não arranca. Qual a triagem técnica provável?"),
        ("Manutenção", "manutencao", "Este caso deve ficar em manutenção corretiva, preventiva ou escalada?"),
        ("Orçamento", "orcamentos", "Isto aponta para reparação, manutenção preventiva ou modernização parcial?"),
    ]
    for col, (label, preset_mode, preset_query) in zip(quick_cols, presets):
        with col:
            st.button(
                label,
                width="stretch",
                on_click=apply_assistant_preset,
                args=(preset_mode, preset_query),
            )

    layer_cols = st.columns(6)
    layer_presets = [
        ("Auto", "universal", ASSISTANT_LAYER_GUIDES["auto"]["examples"][0]),
        ("Norma", "wiki", ASSISTANT_LAYER_GUIDES["norma"]["examples"][0]),
        ("Macpuarsa", "wiki", ASSISTANT_LAYER_GUIDES["macpuarsa"]["examples"][1]),
        ("VSD", "diagnostico", ASSISTANT_LAYER_GUIDES["vsd"]["examples"][0]),
        ("Comandos", "diagnostico", ASSISTANT_LAYER_GUIDES["comandos"]["examples"][0]),
        ("Legal", "wiki", ASSISTANT_LAYER_GUIDES["legal"]["examples"][0]),
    ]
    for col, (label, preset_mode, preset_query) in zip(layer_cols, layer_presets):
        with col:
            st.button(
                label,
                width="stretch",
                key=f"layer_preset_{label}",
                on_click=apply_assistant_preset,
                args=(preset_mode, preset_query),
            )

    action_cols = st.columns([1, 1, 2])
    with action_cols[0]:
        st.button("Limpar histórico", width="stretch", on_click=clear_assistant_history)
    with action_cols[1]:
        st.button("Limpar pedido", width="stretch", on_click=clear_assistant_query)

    if st.session_state.get("ilate_assistant_mode") and st.session_state["ilate_assistant_mode"] != mode:
        mode = st.session_state["ilate_assistant_mode"]

    run_clicked = st.button("Executar consulta ILATE", type="primary", width="stretch")
    if not run_clicked:
        history = st.session_state.get("ilate_assistant_history", [])
        if history:
            with st.expander("Histórico recente", expanded=False):
                for entry in reversed(history[-6:]):
                    st.markdown(f"**{entry['mode_label']}**")
                    st.write(entry["query"])
                    st.caption(entry["summary"])
        else:
            st.info("Ainda não há consultas nesta sessão. Usa um dos exemplos rápidos ou escreve um pedido livre.")
        return
    if not query.strip():
        st.warning("Escreve um pedido antes de executar.")
        return

    try:
        with st.spinner("A consultar a base ILATE..."):
            payload = run_assistant_query(mode=mode, query=query, top_k=top_k)
    except Exception as exc:
        st.error(f"Falha no assistente ILATE: {exc}")
        return

    result = payload["result"]
    st.markdown("### Resposta")
    st.markdown(
        f"""
        <div class="summary-card">
          <strong>{MODE_LABELS.get(mode, mode)}</strong><br>
          Pergunta: {query.strip()}<br><br>
          <strong>Leitura dominante</strong>: {result.get("result_type", "n/d")}<br>
          <strong>Camada orientadora</strong>: {layer_guide['label']}
        </div>
        """,
        unsafe_allow_html=True,
    )

    history = st.session_state.setdefault("ilate_assistant_history", [])
    history.append(
        {
            "mode": mode,
            "mode_label": MODE_LABELS.get(mode, mode),
            "query": query.strip(),
            "summary": str(result.get("result_type", "n/d")),
        }
    )
    st.session_state["ilate_assistant_history"] = history[-12:]
    st.session_state["ilate_last_payload"] = {
        "mode": mode,
        "mode_label": MODE_LABELS.get(mode, mode),
        "query": query.strip(),
        "answer": payload["answer"],
        "result": result,
    }

    info_cols = st.columns(4)
    info_cols[0].metric("Modo interno", str(result.get("result_type", "n/d")))
    info_cols[1].metric("Sistema", str(result.get("system", "n/d")))
    info_cols[2].metric("Componente", str(result.get("component", "n/d")))
    info_cols[3].metric("Confiança", str(result.get("confidence_level", "n/d")))

    tabs = st.tabs(["Síntese", "Normas", "Perfil técnico", "Exportar"])
    with tabs[0]:
        st.markdown(
            f"""
            <div class="result-card">
              <strong>Síntese operacional</strong><br>
              Sistema: {result.get("system", "n/d")}<br>
              Sub-sistema: {result.get("subsystem", "n/d")}<br>
              Componente: {result.get("component", "n/d")}<br><br>
              Próxima leitura: {result.get("verification_note", "n/d")}
            </div>
            """,
            unsafe_allow_html=True,
        )
        st.write(payload["answer"])

    with tabs[1]:
        standards = result.get("relevant_standards") or []
        clauses = result.get("clause_locations") or []
        technical_requirement = result.get("technical_requirement")
        if standards:
            st.markdown("**Normas relevantes**")
            for item in standards:
                st.write(f"- {item}")
        if clauses:
            st.markdown("**Cláusulas / localizações**")
            for item in clauses:
                st.write(f"- {item}")
        if technical_requirement and technical_requirement != "requires_human_review":
            st.markdown("**Excerto técnico principal**")
            st.caption(technical_requirement)

    with tabs[2]:
        diag = result.get("diagnostic_result") or {}
        maintenance = result.get("maintenance_signal") or {}
        budget = result.get("budget_profile") or {}
        engineering = result.get("engineering_implication") or []
        if engineering:
            st.markdown("**Leitura aplicada**")
            for item in engineering:
                st.write(f"- {item}")
        if diag:
            st.markdown("**Diagnóstico**")
            st.json(diag)
        if maintenance:
            st.markdown("**Manutenção**")
            st.json(maintenance)
        if budget:
            st.markdown("**Perfil orçamental**")
            st.json(budget)

    with tabs[3]:
        export_cols = st.columns(2)
        export_text = (
            f"Modo: {MODE_LABELS.get(mode, mode)}\n"
            f"Pergunta: {query.strip()}\n\n"
            f"{payload['answer']}"
        )
        export_json = json.dumps(st.session_state["ilate_last_payload"], ensure_ascii=False, indent=2)
        with export_cols[0]:
            st.download_button(
                "Exportar resposta TXT",
                data=export_text,
                file_name="ilate_assistente_resposta.txt",
                mime="text/plain",
                width="stretch",
            )
        with export_cols[1]:
            st.download_button(
                "Exportar resposta JSON",
                data=export_json,
                file_name="ilate_assistente_resposta.json",
                mime="application/json",
                width="stretch",
            )

    with st.expander("Histórico recente", expanded=False):
        for entry in reversed(st.session_state.get("ilate_assistant_history", [])[-6:]):
            st.markdown(f"**{entry['mode_label']}**")
            st.write(entry["query"])
            st.caption(entry["summary"])


def main() -> None:
    st.set_page_config(page_title="ILATE ORCS", page_icon="📐", layout="wide")
    css_path = Path(__file__).with_name("styles.css")
    st.markdown(f"<style>{css_path.read_text(encoding='utf-8')}</style>", unsafe_allow_html=True)

    st.markdown(
        """
        <div class="hero-card">
          <strong>ILATE ORCS</strong><br>
          Hub único para orçamentos e assistência técnica ILATE. A área de Orçamentos mantém o fluxo guiado; a área de Assistente funde wiki, diagnóstico, manutenção e apoio técnico-comercial.
        </div>
        """,
        unsafe_allow_html=True,
    )
    render_program_status()

    app_mode = st.selectbox(
        "Área de trabalho",
        options=["Orçamentos", "ILATE Assistente"],
        index=0 if st.session_state.get("ilate_app_mode", "Orçamentos") == "Orçamentos" else 1,
        key="ilate_app_mode",
        help="Alterna entre o fluxo operacional de orçamentos e o assistente técnico fundido.",
    )
    if app_mode == "ILATE Assistente":
        render_ilate_assistant()
        return

    @st.cache_data(show_spinner=False)
    def _catalogs():
        return load_catalogs()

    catalogs = _catalogs()
    if "ekl_extracted_reference" not in st.session_state:
        st.session_state["ekl_extracted_reference"] = load_extracted_reference()
    bootstrap_state(catalogs)
    state = st.session_state["budget_state"]
    sync_operation_defaults(state, catalogs)

    unlocked_step = compute_step_unlock(state)
    state["current_step"] = max(1, min(int(state.get("current_step", 1)), 5))
    results = compute_budget(state, catalogs)
    alerts = build_alerts(state, results)
    render_sidebar(state, unlocked_step)

    st.title("ILATE ORCS")
    st.caption("Orçamentação técnica de elevadores em PT-PT com apoio operacional e exportação robusta.")

    if state.get("autosave_timestamp"):
        st.info(f"Autosave ativo. Última gravação automática: {state['autosave_timestamp']}")

    step = state["current_step"]
    if step == 1:
        render_enquadramento(state)
    elif step == 2:
        render_tecnica(state, catalogs)
    elif step == 3:
        render_operations(state, catalogs)
    elif step == 4:
        render_costs(state, results, alerts)
    else:
        render_review(state, results, alerts)

    errors = validate_step(state, step)
    nav1, nav2 = st.columns([1, 1])
    with nav1:
        if step > 1 and st.button("Voltar", width="stretch"):
            state["current_step"] = step - 1
            st.rerun()
    with nav2:
        if step < 5:
            if st.button("Validar e continuar", type="primary", width="stretch"):
                if errors:
                    for error in errors:
                        st.error(error)
                else:
                    state["current_step"] = min(step + 1, 5)
                    st.rerun()

    persist_if_changed(state)


if __name__ == "__main__":
    main()
