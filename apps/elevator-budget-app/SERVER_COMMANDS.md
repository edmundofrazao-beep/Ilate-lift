# Server Commands

Assumindo:

- alvo SSH: `user@server`
- destino remoto: `/opt/AIProjeto`
- subdomínio: `orcs.ilate.pt`

## 1. Pré-validação local

```bash
cd "/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/-- ILATE  --/AIProjeto"
zsh elevator_budget_app/preflight_orcs_deploy.sh
```

## 2. Bootstrap remoto

```bash
cd "/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/-- ILATE  --/AIProjeto"
zsh elevator_budget_app/bootstrap_remote_orcs.sh user@server /opt/AIProjeto
```

## 3. Editar `.env` no servidor

```bash
ssh user@server
cd /opt/AIProjeto
nano .env
```

Conteúdo mínimo:

```bash
OPENAI_API_KEY=...
```

## 4. Ativar serviço

```bash
cd "/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/-- ILATE  --/AIProjeto"
zsh elevator_budget_app/enable_remote_orcs_service.sh user@server /opt/AIProjeto
```

## 5. Ativar nginx

```bash
cd "/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/-- ILATE  --/AIProjeto"
zsh elevator_budget_app/enable_remote_orcs_nginx.sh user@server /opt/AIProjeto
```

## 6. SSL

```bash
ssh user@server
sudo certbot --nginx -d orcs.ilate.pt
```

## 7. Smoke final

```bash
ssh user@server
cd /opt/AIProjeto
HOST=127.0.0.1 PORT=8501 zsh elevator_budget_app/smoke_orcs_server.sh
```

## 8. Logs úteis

```bash
ssh user@server
sudo systemctl status orcs-ilate --no-pager
journalctl -u orcs-ilate -n 100 --no-pager
```
