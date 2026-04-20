<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ILATE Monorepo Backup

This repository now serves two purposes:

1. `ILATE LIFT` frontend and deployment via GitHub Actions + FTP.
2. Central backup point for the main `ilate.pt` codebases so the project is not dependent on a single disk.

## Repository Layout

- `src/`, `index.html`, `package.json`
  Main ILATE LIFT Vite/React app currently deployed to `/lift/`.
- `apps/cv-web-autofill`
  Python app and assets for the CV autofill workflow.
- `apps/site`
  Consolidated recovery base for the main `ilate.pt` site.
- `apps/elevator-budget-app`
  ORCS / budgeting Streamlit-Python application, scripts, tests and operational docs.
- `tools/supabase-sync`
  ORCS Supabase sync assets and manifest.
- `archive/ilate-live`
  Live HTML/JSON snapshots and patched variants from the main site.
- `archive/ilate-lift-site`
  Static lift site snapshot.

## Backup Scope

The consolidated folders were copied from the legacy workspace under `ILATE/AIProjeto` with heavy/generated content excluded, including:

- `node_modules`
- virtual environments
- Python caches
- local launcher/runtime logs
- generated test/debug output folders
- deploy zip bundles

This keeps the repo useful as a recovery point instead of a dump of machine-specific artifacts.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the required environment variables in `.env.local`
3. Run the app:
   `npm run dev`
