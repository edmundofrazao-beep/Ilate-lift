# Upload Server

## Pacotes

### 1. Código

Ficheiro:

- `elevator_budget_app/deploy_bundle_orcs_ilate.zip`

Peso aproximado:

- `66 KB`

### 2. Artefactos pesados

Têm de ser copiados à parte:

- `knowledge/` -> `17 MB`
- `data/faiss_index.bin` -> `177 MB`
- `data/faiss_metadata.csv` -> `15 MB`
- `data/catalogs/` -> `68 KB`

## Estrutura esperada no servidor

```text
AIProjeto/
  elevator_budget_app/
  03_runtime_tools/
  ilate/
  knowledge/
  data/
    faiss_index.bin
    faiss_metadata.csv
    catalogs/
```

## Exemplo com scp

```bash
scp elevator_budget_app/deploy_bundle_orcs_ilate.zip user@server:/caminho/AIProjeto/
scp -r knowledge user@server:/caminho/AIProjeto/
scp data/faiss_index.bin user@server:/caminho/AIProjeto/data/
scp data/faiss_metadata.csv user@server:/caminho/AIProjeto/data/
scp -r data/catalogs user@server:/caminho/AIProjeto/data/
```

## Opção compacta

Podes também gerar um bundle único dos artefactos pesados:

```bash
zsh elevator_budget_app/package_orcs_artifacts.sh
```

Saída atual:

- `elevator_budget_app/orcs_artifacts_bundle.tar.gz`

Peso aproximado:

- `148 MB`

Upload:

```bash
scp elevator_budget_app/orcs_artifacts_bundle.tar.gz user@server:/caminho/AIProjeto/
```

No servidor:

```bash
cd /caminho/AIProjeto
tar -xzf orcs_artifacts_bundle.tar.gz
```

## No servidor

```bash
cd /caminho/AIProjeto
unzip deploy_bundle_orcs_ilate.zip
cp -R deploy_bundle/elevator_budget_app/* elevator_budget_app/
cp -R deploy_bundle/03_runtime_tools/* 03_runtime_tools/
cp -R deploy_bundle/ilate/* ilate/
```

Depois:

```bash
zsh elevator_budget_app/install_server_runtime.sh
cp elevator_budget_app/.env.example .env
```

Editar `.env` com a `OPENAI_API_KEY`.

Arranque:

```bash
source .venv/bin/activate
PORT=8501 HOST=0.0.0.0 zsh elevator_budget_app/run_orcs_server.sh
```
