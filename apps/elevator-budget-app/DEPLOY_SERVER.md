# Deploy ORCS + ILATE Assistente

Esta app passa a ser o ponto único de entrada para:

- Orçamentos
- Wiki / normas
- Diagnóstico
- Manutenção

## Pré-requisitos

Entrada rápida:

- [ORCS_DEPLOY_HOME.md](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/ORCS_DEPLOY_HOME.md)

- Python 3.11+ com `pip`
- `OPENAI_API_KEY` disponível no ambiente ou num `.env` na raiz do projeto
- estes caminhos presentes no servidor:
  - `knowledge/`
  - `data/faiss_index.bin`
  - `data/faiss_metadata.csv`
  - `data/catalogs/`

## Instalação

```bash
cd "/caminho/para/AIProjeto"
zsh elevator_budget_app/preflight_orcs_deploy.sh
zsh elevator_budget_app/install_server_runtime.sh
source .venv/bin/activate
cp elevator_budget_app/.env.example .env
```

Editar `.env`:

```bash
OPENAI_API_KEY=...
```

## Arranque

```bash
cd "/caminho/para/AIProjeto"
source .venv/bin/activate
./elevator_budget_app/run_orcs_server.sh
```

Variáveis úteis:

```bash
PORT=8501
HOST=0.0.0.0
```

Exemplo:

```bash
PORT=8501 HOST=0.0.0.0 ./elevator_budget_app/run_orcs_server.sh
```

## Smoke test

```bash
HOST=127.0.0.1 PORT=8501 zsh elevator_budget_app/smoke_orcs_server.sh
```

## O que validar

1. A app abre
2. A área `Orçamentos` continua operacional
3. A área `ILATE Assistente` responde nos modos:
   - Universal
   - Orçamentos
   - Wiki / Normas
   - Diagnóstico
   - Manutenção

## Nota

Se quiseres pôr isto atrás de domínio/subdomínio, o mais simples é correr a app atrás de reverse proxy.

Para a subida de ficheiros, ver também:

- [UPLOAD_SERVER.md](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/UPLOAD_SERVER.md)
- [HOSTING_FIT.md](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/HOSTING_FIT.md)
- [FIRST_BOOT_VPS.md](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/deploy/FIRST_BOOT_VPS.md)
- [GO_LIVE_PLAN.md](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/GO_LIVE_PLAN.md)
- [GO_LIVE_CHECKLIST.md](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/GO_LIVE_CHECKLIST.md)
- [OPERATIONS_RUNBOOK.md](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/OPERATIONS_RUNBOOK.md)
- [preflight_orcs_deploy.sh](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/preflight_orcs_deploy.sh)
- [upload_orcs_to_server.sh](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/upload_orcs_to_server.sh)
- [bootstrap_remote_orcs.sh](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/bootstrap_remote_orcs.sh)
- [check_remote_orcs_runtime.sh](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/check_remote_orcs_runtime.sh)
- [enable_remote_orcs_service.sh](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/enable_remote_orcs_service.sh)
- [enable_remote_orcs_nginx.sh](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/enable_remote_orcs_nginx.sh)
- [SERVER_COMMANDS.md](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/SERVER_COMMANDS.md)
- [package_orcs_artifacts.sh](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/package_orcs_artifacts.sh)
- [verify_remote_orcs.sh](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/verify_remote_orcs.sh)
