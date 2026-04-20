# Legal Bot Test Pack

## Objetivo

Validar a camada legal PT/EU do assistente sem a confundir com:

- norma técnica
- diagnóstico puro
- interpretação comercial

## O que testa

- precedência entre lei e norma
- prudência legal portuguesa
- enquadramento UE
- AI Act
- RGPD
- método:
  - Defesa
  - Acusação
  - Juiz

## Comandos

```bash
make legal-bot-test
make legal-bot-test-latest
```

## Outputs

Cada run cria uma pasta em:

- `elevator_budget_app/legal_bot_test_runs/`

Com:

- `summary.md`
- `summary.json`
- `results.json`

## Leitura esperada

- não deve tratar norma técnica como substituto automático de lei
- deve distinguir enquadramento legal de leitura técnica
- deve mostrar prudência em inspeção, responsabilidade e administração
- deve reconhecer RGPD e AI Act como camadas de governação, não como norma de elevadores
- quando pedido, deve conseguir estruturar:
  - Defesa
  - Acusação
  - Juiz
