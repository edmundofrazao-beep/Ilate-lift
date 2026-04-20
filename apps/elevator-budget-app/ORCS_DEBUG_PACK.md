# ORCS Debug Pack

## Objetivo

Testar a app `ILATE ORCS` como produto, separando:

- smoke técnico
- perguntas por modo
- outputs de orçamento
- checklist manual de UI
- regressões

## Comandos

```bash
make orcs-local-check
make orcs-local
make orcs-debug
make orcs-debug-latest
```

## O que gera

Cada run cria uma pasta em:

- `elevator_budget_app/orcs_debug_runs/`

Com:

- `preflight.json`
- `health.json`
- `assistant_results.json`
- `summary.json`
- `summary.md`
- `manual_ui_checklist.md`

## Cobertura

### Automático

- preflight do runtime local
- health endpoint
- duas perguntas por modo do assistente
- geração de outputs de orçamento
- geração de stress outputs

### Manual

- navegação da UI
- legibilidade
- exportações
- regressões visuais

## Nota

Isto é um debugger pack da app, não do custom chat e não do runtime brain remoto.
