# ORCS Streamlit Test Plan

## Objetivo

Fechar um plano de testes prático para a app `ILATE ORCS`, cobrindo:

- fluxo base da UI Streamlit;
- troca entre `Orçamentos` e `ILATE Assistente`;
- execução do assistente sem depender da API real;
- regressões futuras ligadas a novas normas, comandos, VSDs e componentes.

## Camadas

### 1. Smoke local

Valida:

- preflight;
- arranque local;
- health endpoint;
- ficheiros críticos.

Comandos:

```bash
make orcs-local-check
make orcs-local-smoke
```

### 2. UI Streamlit automatizada

Valida com `streamlit.testing.v1`:

- app abre sem exceptions;
- `Área de trabalho` usa dropdown;
- `Modo do assistente` usa dropdown;
- assistente responde com harness stub;
- quick presets continuam a funcionar;
- exportações continuam visíveis.

Comando:

```bash
make orcs-ui-test
```

### 3. Debug pack funcional

Valida:

- consultas por modo com motor real;
- outputs de orçamento;
- regressões funcionais;
- casos adicionais para futuras atualizações de normas, comandos e VSDs.

Comando:

```bash
make orcs-debug
```

### 4. Checklist manual

Valida:

- UX real da página;
- legibilidade do tema claro;
- dropdowns;
- ausência de erros visíveis após cliques simples;
- consistência de outputs.

Última checklist:

- `elevator_budget_app/orcs_debug_runs/<timestamp>/manual_ui_checklist.md`

## Casos de regressão futura

Os testes devem continuar a cobrir estas famílias mesmo quando entrarem dados novos:

- transição `EN 81-20/50 -> ISO 8100-1/2:2026`;
- novas revisões normativas futuras;
- comandos / controlador;
- VSD / drive;
- componentes críticos;
- manutenção recorrente vs escalada;
- enquadramento técnico-comercial em orçamentos híbridos.

## Regra prática

Antes de mexer em comportamento:

```bash
make orcs-ui-test
make orcs-debug
```

Depois da alteração:

```bash
make orcs-ui-test
make orcs-debug-latest
```
