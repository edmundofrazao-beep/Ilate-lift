# ILATE Lift v2.0 Reconstruction Status

## Current Objective

Rebuild the application around functional confidence before visual density:

- guided workflow first
- one owner per input family
- validation gates visible at all times
- report/evidence path explicit
- 3D deferred until the functional model is readable and viable

## Current v2.0 Skeleton

The v2.0 branch now starts from the existing implementation and wraps it in a new product shell:

- left vertical workflow rail
- central active module workspace
- top subnavigation limited to the active workflow step
- right validation/evidence panel
- explicit input owner per module
- process gates per workflow step
- 3D shaft/cabin preserved but parked behind a legacy preview button

## Workflow Gates

Electric flow:

1. Setup
2. Traction
3. Guides
4. Safety
5. Geometry
6. Report

Hydraulic flow:

1. Setup
2. Hydraulic
3. Safety
4. Geometry
5. Report

## Input Ownership Rule

Every section now exposes an edit owner.

Examples:

- Traction Checks read from Traction Setup.
- Suspension Compliance reads from Suspension Setup.
- Guide loads/checks read from Guide Setup.
- Shaft 3D reads from Project Base and Clearances.
- Cabin 3D reads from Project Base and later accessibility rules.
- Export reads from Calculation Memory.

## 3D Policy

The 3D is not deleted.

It is intentionally deferred because the current priority is:

1. functional viability
2. clear engineering ownership
3. reliable validation
4. coherent report output
5. final 3D placement and realism

## Build Status

`npm run build` passes in `/Users/edmundofrazao/Documents/GitHub/Ilate-lift-v2.0`.

## Next Iteration

The next productive step is to split the old dense modules internally:

- input panels
- calculated outputs
- validation/evidence
- report notes

Do this first for:

1. Project Base
2. Traction/Suspension
3. Safety Circuits
4. Buffers
5. Report

