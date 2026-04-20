# Local Use Home

## Objetivo

Usar `ILATE ORCS` localmente, a partir do disco, sem depender de domínio, VPS ou SSH.

## App

- [app.py](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/app.py)

Áreas:

- `Orçamentos`
- `ILATE Assistente`

## Arranque rápido

### Via launcher Mac

- [launch_orcs_mac.sh](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/launch_orcs_mac.sh)

### Via terminal

```bash
make orcs-local
```

## Verificação

```bash
make orcs-local-check
make orcs-local-smoke
```

## Atalhos

```bash
make orcs-open
make orcs-local-check
make orcs-local
make orcs-local-smoke
make orcs-debug
make orcs-debug-latest
```

## Debug pack

- [ORCS_DEBUG_PACK.md](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/ORCS_DEBUG_PACK.md)

## Dependências críticas

- `.env` com `OPENAI_API_KEY`
- `knowledge/`
- `data/faiss_index.bin`
- `data/faiss_metadata.csv`
- `data/catalogs/`

## Estado assumido

- hosting: congelado
- SSH: congelado
- uso local: ativo
