# Manual de Operação — ILATE ORCS

## Objetivo

O `ILATE ORCS` junta duas capacidades no mesmo ponto de entrada:

- **Orçamentos**: fluxo guiado para classificar, estruturar e exportar propostas técnicas/comerciais.
- **ILATE Assistente**: assistente fundido para wiki/normas, diagnóstico, manutenção e apoio técnico-comercial.

Este manual serve para operar a app no dia a dia sem depender da memória da conversa.

## Arranque

### Arranque normal

```bash
make orcs-open
```

Abre a app local no Mac.

### Arranque manual

```bash
make orcs-local
```

Depois abrir:

- [http://127.0.0.1:8501](http://127.0.0.1:8501)

### Verificação rápida antes de usar

```bash
make orcs-local-check
make orcs-local-smoke
```

## Estrutura da app

No topo existe um dropdown:

- **Área de trabalho**

Opções:

- `Orçamentos`
- `ILATE Assistente`

## Área 1 — Orçamentos

### O que faz

Permite construir um orçamento técnico em 5 etapas:

1. `Enquadramento`
2. `Caracterização técnica`
3. `Operações e kits`
4. `Custos e validação`
5. `Revisão e exportação`

### Navegação

Na sidebar existem:

- cartões de estado das etapas
- botões `Abrir ...`
- dropdown `Ir para etapa`

Usa o dropdown para navegação rápida e os botões quando quiseres saltar diretamente para uma etapa já desbloqueada.

### Fluxo recomendado

#### 1. Enquadramento

Preencher:

- `Cliente`
- `Obra / equipamento`
- `Local`
- `N.º proposta`
- `Data da proposta`
- `Validade`
- `Tipo de orçamento`

Se houver dúvida no tipo de orçamento:

- ativa `Não tenho a certeza — ajudar a classificar`
- responde às 5 perguntas rápidas
- aplica a sugestão se fizer sentido

### Tipos de orçamento disponíveis

- `reparacao`
- `modernizacao_parcial`
- `modernizacao_integral`
- `manutencao_preventiva`
- `instalacao_nova`

### 2. Caracterização técnica

Preencher:

- `Fabricante`
- `Gama / série`
- `Modelo`
- `Sistema`
- `Sub-sistema`
- `Edifício ocupado`
- `N.º pisos`
- `N.º paragens`
- `Raio logístico`
- `Notas técnicas`

Nota prática:

- o `Sub-sistema` depende do `Sistema`
- se mudares o `Sistema`, a lista útil de `Sub-sistema` só estabiliza no rerun seguinte

### 3. Operações e kits

Aqui defines o coração do orçamento.

Campos principais:

- `Pesquisar operações`
- `Selecionar operações`

Para cada operação selecionada podes ajustar:

- quantidade
- equipa
- dificuldade
- logística
- risco
- custo/hora
- material unitário
- desperdício
- subcontrato
- observações

Tens também separadores com apoio:

- `Operações selecionadas`
- `Micro-materiais`
- `Logística`
- `Fabricantes e kits`

### 4. Custos e validação

Definir:

- `Overhead`
- `Contingência`
- `Margem`
- `IVA`

Podes ainda adicionar extras:

- categoria
- item
- quantidade
- custo unitário
- observações

A app calcula em tempo real:

- horas
- custo directo
- subtotal sem IVA
- preço final

### 5. Revisão e exportação

Antes de exportar:

- rever operações
- rever extras
- rever alertas
- marcar a checkbox de confirmação final

Depois:

- `Exportar Excel final`

## Área 2 — ILATE Assistente

### O que faz

Assistente único para:

- normas / wiki
- diagnóstico
- manutenção
- orçamentos
- perguntas híbridas

### Modo do assistente

Dropdown:

- `Universal`
- `Wiki / Normas`
- `Diagnóstico`
- `Manutenção`
- `Orçamentos`

### Quando usar cada modo

#### Universal

Usar quando a pergunta mistura enquadramento, técnica e decisão.

Exemplo:

- “Tenho um elevador que recebe chamada mas não arranca. Como devo enquadrar isto?”

#### Wiki / Normas

Usar para:

- cláusulas
- requisitos
- leitura normativa
- transições entre normas

Exemplo:

- “Como devo ler a transição entre EN 81-20/50 e ISO 8100-1/2:2026?”

#### Diagnóstico

Usar para:

- sintomas
- causa provável
- teste recomendado
- sistema/componente crítico

Exemplo:

- “Há falha de drive/VSD. Qual o sistema e o teste recomendado?”

#### Manutenção

Usar para:

- manutenção corretiva
- manutenção preventiva
- recorrência
- escalada

Exemplo:

- “Que sinais indicam que a manutenção já não chega sozinha?”

#### Orçamentos

Usar para:

- enquadramento técnico-comercial
- risco
- classificação do caso
- leitura de âmbito

Exemplo:

- “Isto aponta para reparação, manutenção preventiva ou modernização parcial?”

### Fluxo normal de utilização

1. escolher `Modo do assistente`
2. escrever no campo `Pedido`
3. opcionalmente escolher uma `Sugestão rápida`
4. ajustar `Profundidade de pesquisa`
5. clicar `Executar consulta ILATE`

### Depois da resposta

A app mostra:

- resposta em texto
- modo interno
- sistema
- componente
- confiança
- normas e referências
- perfil técnico

Também permite:

- `Exportar resposta TXT`
- `Exportar resposta JSON`
- `Limpar histórico`
- `Limpar pedido`

## Boas práticas

### Para perguntas normativas

- usar `Wiki / Normas`
- confirmar sempre a cláusula primária quando a decisão for crítica
- considerar o freeze atual da expansão 2026: a precedência já foi atualizada, mas o corpus oficial completo ainda não entrou

### Para perguntas de diagnóstico

- escrever sintomas observáveis
- dizer se a falha é intermitente ou fixa
- mencionar comando, VSD, portas, travões, selector, etc., quando souberes

### Para manutenção

- dizer se há recorrência
- distinguir preventiva vs corretiva
- indicar se já houve reparações temporárias

### Para orçamento

- indicar se é reparação localizada ou âmbito maior
- mencionar subsistemas afetados
- separar contexto técnico de contexto comercial quando possível

## Testes e debug

### Testes UI

```bash
make orcs-ui-test
```

### Debug pack funcional

```bash
make orcs-debug
make orcs-debug-latest
```

### Plano de testes

- [ORCS_STREAMLIT_TEST_PLAN.md](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/ORCS_STREAMLIT_TEST_PLAN.md)

## Estado atual a ter em conta

- a app local está pronta para uso
- a fusão estrutural do assistente já está feita
- o hosting final continua fora do foco imediato
- a expansão normativa 2026 fora do núcleo continua congelada até entrada do texto oficial completo

## Ficheiros de referência

- [app.py](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/app.py)
- [assistant.py](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/assistant.py)
- [LOCAL_USE_HOME.md](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/LOCAL_USE_HOME.md)
- [ORCS_DEBUG_PACK.md](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/ORCS_DEBUG_PACK.md)
# Manual de Operação — ILATE ORCS

## Objetivo

Usar a app `ILATE ORCS` localmente como:

- hub de `Orçamentos`
- hub do `ILATE Assistente`

Sem depender de domínio, SSH ou servidor remoto.

## Onde arrancar

App:

- [app.py](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/app.py)

Launcher:

- [launch_orcs_mac.sh](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/launch_orcs_mac.sh)

## Arranque rápido

### Via terminal

```bash
make orcs-open
```

ou

```bash
make orcs-local
```

### Verificação rápida

```bash
make orcs-local-check
make orcs-local-smoke
```

## Estrutura da app

### Área de trabalho

No topo da app, escolhes:

- `Orçamentos`
- `ILATE Assistente`

## 1. Operação da área Orçamentos

### Fluxo

A área de orçamentos está organizada em etapas:

1. `Enquadramento`
2. `Caracterização técnica`
3. `Operações e kits`
4. `Custos e validação`
5. `Exportação`

### Como usar

1. preencher enquadramento comercial
2. escolher tipo de orçamento
3. preencher dados técnicos do elevador
4. selecionar operações
5. rever horas, materiais, invisíveis e risco
6. validar
7. exportar Excel

### Navegação

Na sidebar:

- usar `Ir para etapa`
- ou os botões `Abrir ...`

### Regras importantes

- o campo `Tipo de orçamento` governa filtros e sugestões
- a exportação final deve ser feita só depois da revisão
- o checkbox final de revisão bloqueia exportação até haver confirmação explícita

## 2. Operação do ILATE Assistente

### O que é

É um único assistente fundido para:

- normas
- Macpuarsa / macros ILATE
- VSD
- comandos
- diagnóstico
- manutenção
- apoio a orçamentação

### Modos

Os modos disponíveis são:

- `Universal`
- `Wiki / Normas`
- `Diagnóstico`
- `Manutenção`
- `Orçamentos`

### Precedência do conhecimento

A leitura correta do assistente é:

1. norma oficial
2. Macpuarsa / macros ILATE
3. VSD
4. comandos

Isto significa:

- a norma manda no enquadramento oficial
- o resto complementa tecnicamente

### Como usar

1. escolher `Modo do assistente`
2. escolher, se quiseres, `Camada prioritária`
3. escrever a pergunta
4. clicar `Executar consulta ILATE`

### Camada prioritária

Serve para orientar o uso:

- `Auto`
- `Norma`
- `Macpuarsa`
- `VSD`
- `Comandos`

Não substitui o motor.
Serve para:

- acelerar exemplos
- dar contexto
- puxar a formulação certa da pergunta

### Botões rápidos

Existem dois grupos:

- presets por modo:
  - `Norma`
  - `Diagnóstico`
  - `Manutenção`
  - `Orçamento`
- presets por camada:
  - `Auto`
  - `Norma`
  - `Macpuarsa`
  - `VSD`
  - `Comandos`

## 3. Como ler a resposta do assistente

### Separador `Síntese`

Usa para:

- leitura rápida
- sistema
- sub-sistema
- componente
- próxima leitura

### Separador `Normas`

Usa para:

- normas relevantes
- cláusulas / localizações
- excerto técnico principal

### Separador `Perfil técnico`

Usa para:

- diagnóstico
- manutenção
- perfil orçamental
- leitura aplicada

### Separador `Exportar`

Permite:

- exportar resposta `TXT`
- exportar resposta `JSON`

## 4. Casos de uso bons

### Norma

Exemplo:

`Que norma enquadra desnivelamento à paragem?`

### Macpuarsa

Exemplo:

`Que evidência devo pedir quando o dossier técnico está incompleto e o esquema elétrico não reflete a instalação real?`

### VSD

Exemplo:

`O variador disparou. Qual é o primeiro check antes de condenar o drive?`

### Comandos

Exemplo:

`O elevador chama mas não arranca. Como separo comando, safety chain e drive ready?`

### Híbrido

Exemplo:

`Numa modernização com VSD novo e alteração de comando, qual a base normativa e a leitura técnica aplicada?`

## 5. Histórico e limpeza

Na área do assistente tens:

- `Limpar histórico`
- `Limpar pedido`

Usa:

- `Limpar pedido` para recomeçar a pergunta
- `Limpar histórico` para limpar a sessão atual

## 6. Exportação

### Assistente

Exporta:

- `.txt`
- `.json`

### Orçamentos

Exporta:

- Excel final

## 7. Comandos úteis

```bash
make orcs-open
make orcs-local
make orcs-local-check
make orcs-local-smoke
make orcs-ui-test
make orcs-debug
make orcs-debug-latest
make custom-bot-test
make custom-bot-test-latest
```

## 8. Estado atual

- app local: pronta
- assistente fundido: pronto como base funcional
- custom bot: pronto para upload
- testes UI ORCS: verdes
- custom bot test pack: verde

## 9. Ponto de retoma

Se precisares de retomar rápido:

- [LOCAL_USE_HOME.md](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/LOCAL_USE_HOME.md)
- [STATUS_2026-03-27_ORCS_ILATE.md](/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/--%20ILATE%20%20--/AIProjeto/elevator_budget_app/STATUS_2026-03-27_ORCS_ILATE.md)
