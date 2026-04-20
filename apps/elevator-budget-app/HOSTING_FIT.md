# Hosting Fit

## O que esta app precisa

Esta app não é HTML estático. Precisa de:

- processo Python persistente
- porta local (ex.: `8501`)
- acesso a ficheiros locais relativamente pesados
- `OPENAI_API_KEY`

## Onde encaixa bem

- VPS / cloud server com `systemd`, `supervisor` ou equivalente
- máquina Linux ou macOS sempre ligada
- hosting com suporte real a Python persistente e reverse proxy

## Onde encaixa mal

- alojamento estático puro
- `public_html` simples
- cPanel partilhado sem processo Python persistente / proxy configurável

## Regra prática

Se o servidor só serve HTML/PHP e não te deixa manter um processo Python vivo, esta app não deve ser deployada aí.

Nesse caso há duas saídas boas:

1. mover a app para VPS / instância própria
2. manter o domínio no host atual e apontar subdomínio para o servidor onde a app corre
