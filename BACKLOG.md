# File Intelligence Backlog

## Current Rule

`runtime/organized_v7` is the final output tree. Do not create `organized_v8`, `organized_v9`, or parallel final trees during normal refinement. New batches enter through `runtime/inbox_next_batch` and are merged into `organized_v7`.

## Target Categories

- `01. Documentacao Tecnica`
- `02. Esquemas Eletricos`
- `20. Ficheiros de Engenharia`
- `60. Normas de Seguranca`
- `80. Manuais`
- `99. duplicates`

## Learned Detection Rules

### Electrical Schematic Signals

Strong filename/content signals:
- `esquema`, `esquemas`, `esquema electrico`, `esquema eletrico`
- `schematic`, `schematics`
- `electrical drawing`, `electrical drawings`
- `wiring`, `field wiring`, `controller wiring`, `panel wiring`
- `circuit diagram`, `safe circuit diagram`, `brake circuit diagram`
- `loom`
- `bornes`, `ligacoes`, `ligacoes`, `connection`, `connections`
- `EE-###`, especially with Hidral files
- `ESQ`, especially with MacPuarsa, FAIN, CIASA, CTA, Galaxy, Diplomat
- sheet tables containing `SCHEMATICS`, `Power feed`, `Safety circuit`, `Travel control`, `Operating stations`, `Door drive`
- drawing/page references such as `S4xxxxx`

### Weak Or Ambiguous Signals

Do not automatically classify as schematic when only these appear:
- `electrical braking`
- `installation electrical`
- `electric shock`
- `technical bulletin`
- `quick start`
- `guide`
- `manual`
- `service`
- `maintenance`
- `datasheet`
- `catalogue`
- `test report`
- `short circuit test`
- `programacao`
- `leitura/interpretaçao de esquemas`
- `indice de esquemas`

These can mention electrical content without being useful electrical schematics.

## Brand Inference Rules

### Strong Brand Patterns

- Otis: `OTIS`, `MCS`, `GEN2`, `UMV`, `GVF`
- TKE: `THYSSEN`, `THYSSENKRUPP`, `TKE`, `TCM`, `TCI`, `CMC`, `CENIA`, `ISOSTOP`
- Kone: `KONE`, `MONOSPACE`, `ECODISC`, `V3F`
- Schindler: `SCHINDLER`, `MICONIC`, `INVENTIO`, `S4xxxxx`
- Orona: `ORONA`, `ARCA`
- GMV: `GMV`
- Hydroware: `HYDROWARE`, `HYDROELITE`
- Wittur: `WITTUR`, `SELCOM`, `SEMATIC`, `P730`, `CHLH`, `PVLH`, `PHLH`, `CB29`
- Arkel: `ARKEL`, `ARL 500`
- Aybey: `AYBEY`
- Cibes: `CIBES`, `A5000`
- MacPuarsa: `MACPUARSA`, `PUARSA`, `MICROBASIC`, `MICROSIMPLEX`, `MP` only when supported by more context
- Hidral: `HIDRAL`, `HIDASL`, `EE-###`
- FAIN: `FAIN`
- CTA: `CTA`
- CIASA: `CIASA`, `BRAUN`
- Bucher: `BUCHER`
- LiftControl: `LIFT CONTROL`, `LIFTCONTROL`
- Carlos Silva: `CARLOS SILVA`, `HIDRA`
- Eninter: `ENINTER`
- Fuji Electric: `FUJI ELECTRIC`, `FRENIC`
- Express: `EXPRESS`, `EVANS`
- Aritco: `ARITCO`

### Brand Inference Caution

`MP` alone is weak. It caused false confidence when it appeared as a generic token in drawings or tables. Only treat `MP` as MacPuarsa when the filename/content also contains `MacPuarsa`, `Puarsa`, `MicroBasic`, `Microsimplex`, `MP/11`, or other controller context.

## Duplicate Policy

`99. duplicates` is quarantine, not confirmed trash.

Reason:
- The pipeline can mark duplicates by hash, but some canonical paths point to older `original` paths that are no longer visible in the current final tree.
- When recovering valuable schematics from `99. duplicates`, copy them into `02. Esquemas Eletricos` and leave the original duplicate file in quarantine.
- Do not delete `99. duplicates` until a ledger/hash report confirms each file has a visible canonical copy in the final tree.

## Backlog Tasks

1. Add a reusable schematic detector using the learned strong and weak signals above.
2. Add a reusable brand detector with weighted evidence and weak-token handling.
3. Add a `refine-schematics` CLI command that:
   - scans `01. Documentacao Tecnica`
   - scans `99. duplicates`
   - copies or moves confirmed schematics into `02. Esquemas Eletricos`
   - logs every operation to TSV/JSONL
4. Add a `normalize-schematic-brands` CLI command for `02. Esquemas Eletricos/Sem_Marca`.
5. Add duplicate audit output:
   - duplicate path
   - SHA1
   - canonical path from DB
   - whether canonical exists in `organized_v7`
   - recommended action: keep, recovered, review
6. Generate an index for `02. Esquemas Eletricos`:
   - brand
   - filename
   - extension
   - size
   - SHA1
   - source category
   - recovery log
   - confidence
7. Before final commit/push, exclude runtime-heavy/generated data unless intentionally versioning reports only.

## Latest Manual Refinement Logs

- `runtime/data/recovered_schematics_2026-04-23.tsv`
- `runtime/data/recovered_schematics_2026-04-24.tsv`
- `runtime/data/recovered_schematics_deep_2026-04-24.tsv`
- `runtime/data/recovered_schematics_from_duplicates_2026-04-24.tsv`
- `runtime/data/schematic_sem_marca_brand_normalization_2026-04-24.tsv`
- `runtime/data/schematic_sem_marca_content_brand_candidates_2026-04-24.tsv`
- `runtime/data/schematic_sem_marca_content_brand_moves_2026-04-24.tsv`
- `runtime/data/sem_marca_brand_normalization_2026-04-24.tsv`
- `runtime/data/sem_marca_brand_normalization_deep_2026-04-24.tsv`

