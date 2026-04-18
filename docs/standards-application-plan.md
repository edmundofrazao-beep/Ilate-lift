# ILATE Lift Standards Application Plan

## Purpose
This file turns the extracted standards corpus into a product implementation plan for the ILATE Lift application. It is not a legal substitute for the standards. It is the working map for what the product must support, verify, explain, and export.

## Source Corpus Available
- `ISO 8100-1:2026`
- `ISO 8100-2:2026`
- `EN 81-21:2022`
- `EN 81-28:2022`
- `EN 81-58:2022`
- `EN 81-70:2021+A1:2022`
- `EN 81-71:2022`
- `EN 81-77:2022`
- `ISO 8100-33:2022`

All of the above are available in `MinerU` exports with `full.md`, `content_list_v2.json`, and `layout.json`, which is enough to treat them as the working normative corpus for product design and implementation.

## Product Position
ILATE Lift should behave as a technical engineering cockpit for lift pre-dimensioning, configuration, verification, traceability, and report generation.

The product should not behave like a loose collection of calculators. It should:
- open or create a project
- understand lift context
- derive the relevant normative checks
- guide the user through missing inputs
- show compliance status by clause and subsystem
- generate technical output with traceability

## Current State
The current application already contains useful modules for:
- general project parameters
- traction
- suspension
- guide rails
- safety gear and buffers
- door locking
- seismic
- remote alarms
- hydraulic
- 3D shaft and cabin exploration
- PDF and calculation memory concepts

The current gaps are not mainly visual. The main missing layer is normative orchestration and product completeness.

## Core Functional Gaps
These are the gaps that prevent the product from feeling complete even when individual modules exist.

### 1. Project Workflow Engine
The product still lacks a proper project workflow.

Required:
- project creation
- project save and reopen
- version snapshots
- module completion state
- dependency-aware progression
- missing-input detection
- final readiness state

### 2. Normative Rule Engine
The product needs a formal layer that maps rules to standards, clauses, formulas, and outputs.

Required:
- clause registry
- rule registry
- applicability filters
- pass, warning, fail states
- evidence fields
- explanatory text per rule
- traceability from result back to clause

### 3. Cross-Module Consistency
The product needs consistency checks between modules instead of isolated checks inside each screen.

Required:
- shared project variables
- rule dependencies between geometry, traction, safety, and accessibility
- contextual blocking of irrelevant modules
- change impact propagation

### 4. Technical Deliverables
The product needs serious outputs, not just views.

Required:
- compliance summary
- technical memory
- non-conformity list
- assumptions log
- clause coverage report
- exportable project package

### 5. Data and Component Backbone
The product needs structured normative and technical data.

Required:
- guide rail catalogue
- component presets
- door classes
- alarm configurations
- accessibility presets
- seismic categories
- material and tolerance tables

## Standards To Apply

### ISO 8100-1:2026
Role in product:
- base safety rules for the construction and installation of passenger and goods passenger lifts

Direct product impact:
- project boundary conditions
- shaft and pit logic
- headroom logic
- refuge spaces
- clearances
- building-related conditions
- information for use

Must exist in product:
- hoistway and clearance engine
- pit and headroom validation engine
- building boundary conditions form
- installation condition checklist
- operations overview mapping

Status assessment:
- partially represented
- not yet treated as the governing geometry and installation backbone

### ISO 8100-2:2026
Role in product:
- design rules, calculations, verifications and tests of lift components

Direct product impact:
- main calculation engine
- component verification engine
- test and verification views
- output traceability

Must exist in product:
- clause-based module architecture
- calculations by subsystem
- verification outcomes
- normative explanations
- exportable verification report

Status assessment:
- strongest current coverage
- still lacks complete rule traceability and workflow closure

### EN 81-21:2022
Role in product:
- lifts in existing buildings with reduced clearances and particular protective measures

Direct product impact:
- renovation and constrained-site mode
- reduced headroom and pit logic
- movable stops
- pre-triggered stopping system
- counterweight separation logic

Must exist in product:
- existing-building mode
- reduced-clearance project path
- special protection device registry
- alternate compliance path for constrained buildings

Status assessment:
- functionally missing

### EN 81-28:2022
Role in product:
- remote alarm requirements

Direct product impact:
- alarm module
- power backup checks
- signaling checks
- alarm transmission configuration

Must exist in product:
- alarm workflow
- transmitter and receiver assumptions
- power backup validation
- audible and visible indicator checks
- filtering logic and checklist

Status assessment:
- partially represented
- not yet deep enough to be considered closed

### EN 81-58:2022
Role in product:
- landing door fire resistance tests and classification

Direct product impact:
- landing door specification
- fire class selection
- report annotations

Must exist in product:
- landing door fire-resistance data model
- fire classification fields
- tested-class reference support
- report output for door fire class

Status assessment:
- missing

### EN 81-70:2021+A1:2022
Role in product:
- accessibility

Direct product impact:
- car dimensions
- control device positioning
- signals
- accessibility categories and options

Must exist in product:
- accessibility mode
- car-dimension validation
- control and signal positioning checks
- mirror, handrail, button, signal, and destination-control logic

Status assessment:
- partially represented in the 3D cabin view
- not yet formalized as a normative accessibility engine

### EN 81-71:2022
Role in product:
- vandal resistant lifts

Direct product impact:
- category-based hardening
- landing and car controls
- doors and manipulation resistance
- ventilation and finishes

Must exist in product:
- vandal-resistance category selector
- hardened component requirements
- UI and hardware protection rules
- durable finish and corrosion guidance

Status assessment:
- missing

### EN 81-77:2022
Role in product:
- seismic conditions

Direct product impact:
- seismic category
- design acceleration
- retaining devices
- guide rail proof
- seismic mode logic

Must exist in product:
- seismic project mode
- category and acceleration selection
- retaining device checks
- guide rail proof workflow
- primary wave detection path

Status assessment:
- partially represented
- needs expansion from a module into a cross-project mode

### ISO 8100-33:2022
Role in product:
- T-type guide rails for lift cars and counterweights

Direct product impact:
- rail catalogue
- dimensional and tolerance tables
- fishplate support
- marking and profile selection

Must exist in product:
- normalized guide rail database
- profile designation selection
- dimensional tolerance metadata
- fishplate and fastening support

Status assessment:
- partially represented through rail profiles
- not yet backed by a formal standards-based data catalogue

## Implementation Priorities

### Priority 1: Make The Product Coherent
These items turn the current app into a real product shell.

- project save, load, duplicate, snapshot
- normative clause registry
- applicability engine by project type
- completion tracking by module
- global compliance dashboard

### Priority 2: Close The Existing Modules Properly
These items strengthen what already exists.

- ISO 8100-1 geometry and boundary-condition backbone
- ISO 8100-2 traceability per result
- EN 81-28 deeper alarm workflow
- EN 81-70 formal accessibility checks
- EN 81-77 project-level seismic mode
- ISO 8100-33 guide rail catalogue

### Priority 3: Add Missing Normative Modes
These items extend product breadth.

- EN 81-21 existing-building mode
- EN 81-58 fire resistance support for landing doors
- EN 81-71 vandal-resistant mode

### Priority 4: Turn Results Into Deliverables
These items make the product usable downstream.

- clause coverage report
- non-conformity register
- assumptions ledger
- technical memory with clause references
- project export package

## Required Internal Architecture
This is the minimum architecture required to apply the standards correctly.

### A. Standards Registry
Every clause the product supports should be represented in data.

Each registry entry should contain:
- standard
- clause
- title
- subsystem
- applicability rules
- required inputs
- result type
- explanation text

### B. Rules Registry
Every real check should be declarative where possible.

Each rule should contain:
- id
- standard and clause
- input dependencies
- formula or condition
- threshold logic
- result message templates
- severity

### C. Project Context Model
The project needs a richer context model.

It should include:
- lift type
- building context
- new building or existing building
- accessibility requirements
- vandal-resistance requirements
- seismic conditions
- fire-related requirements

### D. Deliverables Model
Generated outputs should be first-class objects.

It should include:
- rule outcomes
- evidence used
- unresolved warnings
- explicit assumptions
- applicable clauses

## What The 3D Layer Should Become
The 3D layer should support engineering decisions rather than act as isolated visualization.

Required:
- geometry linked to project context
- normative overlays for clearances and protected spaces
- accessibility overlay mode
- seismic overlay mode
- constrained existing-building overlay mode
- door and landing condition overlays

The 3D layer should not become the product core. It should become a verification companion to the rule engine.

## Immediate Build Order
This is the recommended order for implementation.

1. Build the standards registry and rule registry.
2. Introduce project context and applicability logic.
3. Rework overview into a compliance dashboard.
4. Make ISO 8100-1 the geometry and boundary backbone.
5. Make ISO 8100-2 checks traceable by clause.
6. Close EN 81-28, EN 81-70, EN 81-77, and ISO 8100-33.
7. Add EN 81-21, EN 81-58, and EN 81-71 as project modes.
8. Upgrade exports into formal technical deliverables.

## Definition Of Done
The product can be considered structurally complete when it can:
- create and reopen projects reliably
- determine which standards and clauses apply
- guide the user through missing data
- perform clause-linked checks
- show pass, warning, and fail states with reasons
- generate a traceable technical output package

## Working Rule
All future implementation work should be justified against this file. New screens, calculations, data structures, and exports should be mapped to one or more standards and one or more product outcomes.
