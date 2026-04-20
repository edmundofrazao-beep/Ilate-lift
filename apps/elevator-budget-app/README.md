# Orçamentação Técnica de Elevadores

Web app Streamlit para orçamentação técnica de elevadores em Português de Portugal, com:

- fluxo guiado por etapas e bloqueio de progressão
- ajuda contextual em todos os campos
- leitura de catálogos reais a partir do Excel base
- cálculo de horas, mão de obra, materiais, invisíveis, IVA e preço final
- autosave local em JSON
- alertas automáticos e revisão final antes de exportar
- exportação Excel estável com resumo, operações, extras e configuração
- área `ILATE Assistente` embutida na mesma app para consultas de wiki/normas, diagnóstico, manutenção e apoio a orçamentação

## Executar

```bash
pip install -r elevator_budget_app/requirements.txt
streamlit run elevator_budget_app/app.py
```

## ILATE Assistente

A própria app `app.py` passa a servir como hub único:

- `Orçamentos`
- `ILATE Assistente`

Na área do assistente existem modos rápidos:

- `Universal`
- `Orçamentos`
- `Wiki / Normas`
- `Diagnóstico`
- `Manutenção`

Pré-requisitos:

- `OPENAI_API_KEY` definida no ambiente ou em `.env`
- pasta `knowledge/`
- `data/faiss_index.bin`
- `data/faiss_metadata.csv`

## EKL ORC Web App

Para o workbook `EKL-ORC_BASE_V1.6.xlsx` existe uma app dedicada:

```bash
pip install -r elevator_budget_app/requirements.txt
streamlit run elevator_budget_app/ekl_orc_app.py
```

Por omissão a app lê:

`/Users/edmundofrazao/Downloads/EKL-ORC_BASE_V1.6.xlsx`

Capacidades:

- resumo rápido das folhas principais do orçamento
- edição guiada dos metadados do projeto, margens e tarifas de mão de obra
- overrides livres por célula para qualquer aba do workbook
- browser de todas as folhas em modo fórmulas ou valores
- exportação de uma cópia `.xlsx` com recálculo forçado ao abrir no Excel

## Dependência crítica

O ficheiro base tem de existir neste caminho:

`/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/-- ILATE  --/Orçamentação_Global_de_Elevadores_detalhada_PT_v15_fabricantes_proposta.xlsx`

## Autosave

O autosave é guardado em:

`elevator_budget_app/.autosave/orcamentacao_elevadores_autosave.json`
