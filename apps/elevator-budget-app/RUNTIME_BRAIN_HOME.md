# Runtime Brain Home

## Objetivo

Replicar o cérebro completo da app `ILATE ORCS`, não apenas o custom chat.

Isto inclui:

- runtime da app
- assistente fundido
- knowledge base
- índices
- catálogos
- regras YAML
- dependências Python

## Diferença para custom chat

### Custom chat

Leva apenas:

- instruções
- perfil
- conhecimento compacto para upload

### Runtime brain

Leva:

- código da app
- código do motor ILATE
- `knowledge/`
- `data/`
- `requirements.txt`
- `.env.example`
- manifesto de runtime

## Ficheiros principais

- [RUNTIME_BRAIN_MANIFEST.yaml](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/RUNTIME_BRAIN_MANIFEST.yaml)
- [package_runtime_brain.sh](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/package_runtime_brain.sh)
- [orcs_runtime_brain_bundle.tar.gz](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/orcs_runtime_brain_bundle.tar.gz)

## Componentes críticas

- app: `elevator_budget_app/`
- motor: `03_runtime_tools/`
- corpus: `knowledge/`
- dados: `data/`
- ambiente: `.env.example`

## Estado

- pronto para replicação local / futura migração
- separado do pack de custom chat
- independente de hosting por agora
