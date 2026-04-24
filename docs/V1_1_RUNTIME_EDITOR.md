# ILATE Lift v1.1 Runtime Editor

## Purpose

v1.1 is a bridge between the hardcoded React v1.0 app and the cleaner v2.0 architecture.

React still renders the application, but editable runtime data starts moving into JSON files.

## Local Editor

Run from:

```bash
cd /Users/edmundofrazao/Documents/GitHub/Ilate-lift-v1.1
npm install
npm run runtime:editor
```

Then open:

```text
http://localhost:4177
```

The editor can:

- list JSON files in `public/runtime`
- edit JSON safely
- validate JSON before saving
- commit selected runtime/app bridge files
- push to the `v1.1` branch

## Online v1.1 Page

The GitHub Action `Deploy ILATE Lift v1.1` deploys branch `v1.1` to:

```text
/public_html/lift-1-1/
```

Expected public URL:

```text
https://ilate.pt/lift-1-1/
```

## Safety Rule

The online page consumes runtime JSON.

The online page does not write back to GitHub and does not expose Git credentials.

Runtime edits should be made locally with the editor, committed and pushed.

## Current Runtime Files

- `public/runtime/app-text.json`
- `public/runtime/presets.json`
- `public/runtime/report-blocks.json`
- `public/runtime/validation-notes.json`

## Next Migration Targets

1. Move all display text and labels into `app-text.json`.
2. Move manufacturer presets into `presets.json`.
3. Move validation messages into `validation-notes.json`.
4. Move report sections into `report-blocks.json`.
5. Only after that, extract formulas into a safe calculation runtime.
