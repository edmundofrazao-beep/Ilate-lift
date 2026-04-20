# First Boot VPS

## 1. Estrutura

```bash
mkdir -p /opt/AIProjeto
cd /opt/AIProjeto
```

Copiar para aqui:

- `deploy_bundle_orcs_ilate.zip`
- `knowledge/`
- `data/faiss_index.bin`
- `data/faiss_metadata.csv`
- `data/catalogs/`

## 2. Expandir bundle

```bash
unzip deploy_bundle_orcs_ilate.zip
mkdir -p elevator_budget_app 03_runtime_tools ilate
cp -R deploy_bundle/elevator_budget_app/* elevator_budget_app/
cp -R deploy_bundle/03_runtime_tools/* 03_runtime_tools/
cp -R deploy_bundle/ilate/* ilate/
```

## 3. Runtime Python

```bash
cd /opt/AIProjeto
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r elevator_budget_app/requirements.txt
```

## 4. Ambiente

```bash
cat > /opt/AIProjeto/.env <<'EOF'
OPENAI_API_KEY=...
EOF
```

## 5. Smoke local

```bash
source /opt/AIProjeto/.venv/bin/activate
PORT=8501 HOST=127.0.0.1 zsh /opt/AIProjeto/elevator_budget_app/run_orcs_server.sh
```

Noutra shell:

```bash
HOST=127.0.0.1 PORT=8501 zsh /opt/AIProjeto/elevator_budget_app/smoke_orcs_server.sh
```

## 6. systemd

```bash
cp /opt/AIProjeto/elevator_budget_app/deploy/systemd/orcs-ilate.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable orcs-ilate
systemctl start orcs-ilate
systemctl status orcs-ilate
```

## 7. Nginx

```bash
cp /opt/AIProjeto/elevator_budget_app/deploy/nginx/orcs-ilate.nginx.conf /etc/nginx/sites-available/orcs-ilate.conf
ln -s /etc/nginx/sites-available/orcs-ilate.conf /etc/nginx/sites-enabled/orcs-ilate.conf
nginx -t
systemctl reload nginx
```

## 8. SSL

Depois de o DNS do subdomínio apontar ao VPS:

```bash
certbot --nginx -d orcs.ilate.pt
```
