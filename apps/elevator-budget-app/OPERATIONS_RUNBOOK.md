# Operations Runbook

## Start manual

```bash
cd /opt/AIProjeto
source .venv/bin/activate
PORT=8501 HOST=127.0.0.1 zsh elevator_budget_app/run_orcs_server.sh
```

## Smoke

```bash
HOST=127.0.0.1 PORT=8501 zsh elevator_budget_app/smoke_orcs_server.sh
```

## systemd

```bash
systemctl status orcs-ilate
systemctl restart orcs-ilate
journalctl -u orcs-ilate -n 100 --no-pager
```

## nginx

```bash
nginx -t
systemctl reload nginx
```

## Ficheiros críticos

- `/opt/AIProjeto/.env`
- `/opt/AIProjeto/knowledge/`
- `/opt/AIProjeto/data/faiss_index.bin`
- `/opt/AIProjeto/data/faiss_metadata.csv`
- `/opt/AIProjeto/data/catalogs/`

## Sintomas típicos

### A app abre mas o assistente falha

Verificar:

- `OPENAI_API_KEY`
- acesso a `knowledge/`
- acesso a `faiss_index.bin`
- acesso a `faiss_metadata.csv`

### O domínio abre mas a app não

Verificar:

- `systemctl status orcs-ilate`
- `smoke_orcs_server.sh`
- config `nginx`

### Respostas lentas

Esperado nas primeiras consultas se a base ILATE ainda estiver a aquecer cache.
