from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Any

import streamlit as st
from openai import OpenAI

APP_DIR = Path(__file__).resolve().parent
ROOT = APP_DIR.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

TOOL_PATH_CANDIDATES = [
    APP_DIR / '03_runtime_tools',
    APP_DIR / 'deploy_bundle' / '03_runtime_tools',
    ROOT / '03_runtime_tools',
]
for tool_dir in TOOL_PATH_CANDIDATES:
    if tool_dir.exists() and str(tool_dir) not in sys.path:
        sys.path.insert(0, str(tool_dir))

from env_loader import load_dotenv
from ilate_copilot import analyze_query, format_normative_output, load_faiss, load_knowledge

DEFAULT_KNOWLEDGE_DIR = ROOT / 'knowledge'
DEFAULT_INDEX = ROOT / 'data' / 'faiss_index.bin'
DEFAULT_METADATA = ROOT / 'data' / 'faiss_metadata.csv'
DEFAULT_REQUEST_TIMEOUT = 60.0

MODE_HINTS = {
    'universal': 'Responder como assistente ILATE universal. Se a pergunta for normativa, priorizar normas e enquadramento. Se for falha, priorizar diagnóstico técnico e ação. Se for manutenção, priorizar triagem operacional e próxima intervenção. Se for orçamento, priorizar enquadramento técnico-comercial.',
    'orcamentos': 'Contexto de orçamentação de elevadores. Priorizar classificação da intervenção, enquadramento técnico-comercial, riscos, escopo provável e impacto em custos/planeamento.',
    'wiki': 'Consulta de wiki técnica e normativa. Priorizar normas, enquadramento técnico, requisitos, testes e linguagem clara.',
    'diagnostico': 'Diagnóstico técnico de elevadores. Priorizar sintomas, causa provável, teste recomendado, intervenção provável e criticidade.',
    'manutencao': 'Contexto de manutenção de elevadores. Priorizar triagem de manutenção, recorrência, corretiva vs preventiva, sinal de escalada e próxima ação operacional.',
}

MODE_LABELS = {
    'universal': 'Universal',
    'orcamentos': 'Orçamentos',
    'wiki': 'Wiki / Normas',
    'diagnostico': 'Diagnóstico',
    'manutencao': 'Manutenção',
}

FORCED_RESULT_TYPE = {
    'universal': None,
    'orcamentos': 'intervention mode',
    'wiki': 'normative mode',
    'diagnostico': 'diagnostic mode',
    'manutencao': 'intervention mode',
}


def build_mode_query(mode: str, query: str) -> str:
    return query.strip()


@st.cache_resource(show_spinner=False)
def load_assistant_resources() -> dict[str, Any]:
    load_dotenv(ROOT)
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        raise RuntimeError('OPENAI_API_KEY não definida no ambiente nem em .env')
    client = OpenAI(timeout=DEFAULT_REQUEST_TIMEOUT, max_retries=1, api_key=api_key)
    knowledge = load_knowledge(DEFAULT_KNOWLEDGE_DIR)
    index, metadata = load_faiss(DEFAULT_INDEX, DEFAULT_METADATA)
    return {
        'client': client,
        'knowledge': knowledge,
        'index': index,
        'metadata': metadata,
    }


def run_assistant_query(mode: str, query: str, top_k: int = 5) -> dict[str, Any]:
    resources = load_assistant_resources()
    merged_query = build_mode_query(mode, query)
    result = analyze_query(
        query=merged_query,
        display_query=query.strip(),
        forced_result_type=FORCED_RESULT_TYPE.get(mode),
        knowledge=resources['knowledge'],
        client=resources['client'],
        index=resources['index'],
        metadata=resources['metadata'],
        top_k=top_k,
    )
    answer = format_normative_output(result)
    return {
        'answer': answer,
        'result': result,
    }
