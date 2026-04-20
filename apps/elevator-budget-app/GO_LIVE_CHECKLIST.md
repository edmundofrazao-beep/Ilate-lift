# Go Live Checklist

## Infra

- [ ] VPS disponível
- [ ] Python 3.11+ disponível
- [ ] `nginx` instalado
- [ ] `certbot` disponível

## DNS

- [ ] subdomínio `orcs.ilate.pt` criado
- [ ] DNS aponta para o VPS

## Código

- [ ] `deploy_bundle_orcs_ilate.zip` copiado
- [ ] bundle expandido em `/opt/AIProjeto`
- [ ] `knowledge/` copiado
- [ ] `data/faiss_index.bin` copiado
- [ ] `data/faiss_metadata.csv` copiado
- [ ] `data/catalogs/` copiado

## Ambiente

- [ ] `.venv` criado
- [ ] `pip install -r elevator_budget_app/requirements.txt`
- [ ] `.env` criado
- [ ] `OPENAI_API_KEY` definida

## Serviço

- [ ] app arranca em `127.0.0.1:8501`
- [ ] `smoke_orcs_server.sh` responde `OK`
- [ ] `systemd` ativo
- [ ] `nginx -t` sem erros
- [ ] reverse proxy ativo
- [ ] SSL emitido

## Produto

- [ ] Orçamentos abre
- [ ] Assistente modo Universal responde
- [ ] Assistente modo Wiki / Normas responde
- [ ] Assistente modo Diagnóstico responde
- [ ] Assistente modo Manutenção responde
- [ ] Assistente responde sobre VSDs / comandos

## Pós-lançamento

- [ ] guardar URL final
- [ ] guardar procedimento de restart
- [ ] guardar localização dos logs
