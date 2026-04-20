# Custom Bot Test Pack

## Objetivo

Validar o assistente fundido depois da expansão de:

1. Macpuarsa
2. VSD
3. comandos

## O que testa

- perguntas normativas com apoio técnico
- perguntas Macpuarsa puras
- perguntas VSD puras
- perguntas de comandos puras
- perguntas híbridas

## Comandos

```bash
make custom-bot-test
make custom-bot-test-latest
```

## Outputs

Cada run cria uma pasta em:

- `elevator_budget_app/custom_bot_test_runs/`

Com:

- `summary.md`
- `summary.json`
- `results.json`

## Leitura esperada

### Macpuarsa

- deve falar de evidência, severidade, dossier, retrofit e rastreabilidade
- não deve inventar cláusulas

### VSD

- deve distinguir drive culpado de drive a reagir
- deve puxar encoder, brake e permissivos quando fizer sentido

### Comandos

- deve distinguir registo da chamada de autorização de marcha
- deve verificar safety chain, drive ready, I/O e bus antes de condenar o controlador

### Híbridos

- deve separar:
  - base normativa
  - leitura técnica aplicada
