# Autonomous File Intelligence

Production-grade, resumable filesystem intelligence and migration engine for large file collections.

## Workspace model

The system expects a dedicated local workspace, outside cloud sync:

```text
<workspace>/
  original/          # put source files here, untouched by the pipeline
  organized_v1/      # generated output
  organized_v2/      # future generated output
  data/
  logs/
  state/
  cache/
```

The source files are never modified in place. Every operation is logged and reversible.

## Recommended local path

```text
/Users/edmundofrazao/Codex/autonomous_file_intelligence/runtime
```

Put the files to organize into:

```text
/Users/edmundofrazao/Codex/autonomous_file_intelligence/runtime/original
```

## Installation

```bash
cd /Users/edmundofrazao/Codex/autonomous_file_intelligence
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
```

Optional OCR dependencies:

- `tesseract` CLI for OCR on images
- a PDF rasterizer if image-based PDF OCR is required externally

## OpenAI setup

Set your API key before classification:

```bash
export OPENAI_API_KEY="..."
```

Default models:

- Stage 1: `gpt-5.4-nano`
- Stage 2: `gpt-5.4-mini`

## CLI

### Scan

```bash
file-intel --workspace-root /Users/edmundofrazao/Codex/autonomous_file_intelligence/runtime --scan --resume
```

### Classify

```bash
file-intel --workspace-root /Users/edmundofrazao/Codex/autonomous_file_intelligence/runtime --classify --resume
```

### Cluster

```bash
file-intel --workspace-root /Users/edmundofrazao/Codex/autonomous_file_intelligence/runtime --cluster --resume
```

### Dedupe

```bash
file-intel --workspace-root /Users/edmundofrazao/Codex/autonomous_file_intelligence/runtime --dedupe --resume
```

### Organize

Dry-run is the default:

```bash
file-intel --workspace-root /Users/edmundofrazao/Codex/autonomous_file_intelligence/runtime --organize --resume
```

Execute generated copy operations:

```bash
file-intel --workspace-root /Users/edmundofrazao/Codex/autonomous_file_intelligence/runtime --organize --resume --execute
```

Limit apply to selected categories:

```bash
file-intel --workspace-root /Users/edmundofrazao/Codex/autonomous_file_intelligence/runtime --organize --execute --categories Esquemas\ Eletricos,Documentacao\ Tecnica
```

### Rollback

```bash
file-intel --workspace-root /Users/edmundofrazao/Codex/autonomous_file_intelligence/runtime --rollback --execute
```

## Logs and data

- `logs/scan.log`
- `logs/classification.log`
- `logs/errors.log`
- `data/scan_records.jsonl`
- `data/classifications.jsonl`
- `data/dedupe_relations.jsonl`
- `data/clusters.jsonl`
- `logs/moves.jsonl`
- `state/pipeline.db`

## Safety

- originals are untouched
- default mode is dry-run
- every generated file operation is logged
- rollback removes generated artifacts in reverse order
- re-runs are resumable through SQLite state + JSONL append logs
