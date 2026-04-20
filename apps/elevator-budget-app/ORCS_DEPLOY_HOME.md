# ORCS Deploy Home

## Estado

- app fundida pronta
- `ILATE Assistente` integrado
- uso local em disco pronto
- bundle de código pronto
- bundle de artefactos pronto
- scripts de upload / bootstrap / service / nginx / verify prontos

## Ficheiros-chave

- [DEPLOY_SERVER.md](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/DEPLOY_SERVER.md)
- [LOCAL_USE_HOME.md](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/LOCAL_USE_HOME.md)
- [SERVER_COMMANDS.md](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/SERVER_COMMANDS.md)
- [FIRST_BOOT_VPS.md](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/deploy/FIRST_BOOT_VPS.md)
- [GO_LIVE_PLAN.md](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/GO_LIVE_PLAN.md)
- [GO_LIVE_CHECKLIST.md](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/GO_LIVE_CHECKLIST.md)
- [OPERATIONS_RUNBOOK.md](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/OPERATIONS_RUNBOOK.md)

## Pacotes

- código:
  - [deploy_bundle_orcs_ilate.zip](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/deploy_bundle_orcs_ilate.zip)
- artefactos:
  - [orcs_artifacts_bundle.tar.gz](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/orcs_artifacts_bundle.tar.gz)

## Uso local

```bash
make orcs-open
make orcs-local-check
make orcs-local
make orcs-local-smoke
```

## Comandos Make

```bash
make orcs-preflight
make orcs-bundle
make orcs-artifacts
make orcs-bootstrap TARGET=user@server DEST=/opt/AIProjeto
make orcs-check-remote TARGET=user@server DEST=/opt/AIProjeto
make orcs-enable-service TARGET=user@server DEST=/opt/AIProjeto
make orcs-enable-nginx TARGET=user@server DEST=/opt/AIProjeto
make orcs-verify TARGET=user@server DEST=/opt/AIProjeto URL=https://orcs.ilate.pt
```

## Bloqueio atual

Falta apenas:

- alvo SSH `user@server`
- caminho remoto final
