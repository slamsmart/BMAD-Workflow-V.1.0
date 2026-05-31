# SYSTEM_MAP — Project Architecture Reference

> **Template** — Copy file ini ke root project lo sebagai `SYSTEM_MAP.md`, lalu isi sesuai kondisi project.
> File ini WAJIB diupload ke Claude.ai di setiap sesi kerja yang menyentuh arsitektur.

---

## Relationship With AGENTS / bmad-main.md

This file is the architectural navigation map for the current project.

- `SYSTEM_MAP.md` defines architecture, file locations, entrypoints, runtime flow, and module boundaries.
- `bmad-main.md` (section AGENTS) defines agent behavior, editing discipline, safety rules, and response style.

If there is a conflict:
- Follow `SYSTEM_MAP.md` for architecture, file locations, entrypoints, and runtime flow.
- Follow `bmad-main.md` for execution behavior, coding discipline, safety rules, and response style.
- Do not rewrite architecture unless explicitly requested.

---

## Purpose

Use this document to:
- avoid blind code scanning
- minimize token usage
- enable fast analysis using trace-by-entrypoint and trace-by-flow
- keep implementation aligned with the current architecture

---

## How To Use This Map

- Fill this file with current project facts, not guesses.
- Update it whenever entrypoints, flows, or boundaries change.
- Keep it short enough to scan quickly.
- Prefer file paths, modules, routes, services, and data owners over prose.
- Treat this file as the first stop for architecture, tracing, and safe editing.

> **Tip — Auto-fill via codegraph:** kalau MCP `codegraph` aktif (recommended), banyak section di file ini bisa di-bantu isi otomatis:
>
> - **Top-Level Layout** → `codegraph_files()`
> - **Entry Points** → `codegraph_search("router|app|server|main")`
> - **Module Boundaries** → `codegraph_context("module map")`
> - **Runtime Flows** → `codegraph_trace(from, to)` per flow
> - **Key Files** → `codegraph_search()` untuk simbol kritikal
> - **Pre-Edit Trace Note** → `codegraph_impact(symbol)` jawab langsung
>
> Workflow: jalankan `codegraph init -i` di project lo sekali, lalu pakai trigger di atas saat isi SYSTEM_MAP.

---

## Mandatory Map Check

Read `SYSTEM_MAP.md` before work when the task involves:
- architecture or module boundaries
- locating files, entrypoints, or runtime flow
- multi-module debugging or tracing
- refactor planning beyond a local fix
- integration analysis across multiple apps, services, or layers

For small local edits, isolated bugfixes, or single-file content tasks:
- read `SYSTEM_MAP.md` only if it materially helps find the right entrypoint or boundary
- do not force a full architecture read when the task is already localized

When read, use `SYSTEM_MAP.md` as the main architectural reference.

---

## Strict Exclusions

### Dependencies
`node_modules`, `.venv`, `venv`, `env`, `vendor`, `Pods`, `target`, `.gradle`, `bin`, `obj`, `pkg`

### Build / IDE / Cache
`dist`, `build`, `.git`, `.vscode`, `.idea`, `__pycache__`, `tmp`, `coverage`, `.next`, `.nuxt`, `.cache`, `.turbo`

### Artifacts
`out`, `*.log`, `*.lock`, `*.min.*`, `*.map`, generated bundles, compiled assets

---

## Analysis Method

Default tracing flow:

`Trigger / Entry Point`
-> `UI / Route / Handler`
-> `Service / Use Case / Controller`
-> `Repository / Query / Gateway`
-> `DB / API / Queue / File I/O / External Service`

Adapt this flow to the current project type:
- web app
- backend API
- mobile app
- worker / queue system
- monorepo / multi-service system

---

## Rules

- Start from the most likely entrypoint first.
- Read only the smallest relevant context needed.
- Prefer public interfaces, exported modules, and entry handlers before internal details.
- Avoid full file reads when symbol-level tracing is enough.
- Expand search gradually: file -> folder -> module -> wider repo.
- Do not scan the whole repo unless the task is an audit or the root cause is still unknown.

---

## Project Snapshot

- Project name:
- Project type:
- Primary users:
- Primary goal:
- Repo type: single app / monorepo / service / library / other
- Main risks: auth / billing / data integrity / infra / compliance / performance / other
- Stage: MVP / Beta / Production
- Last updated:

---

## Tech Stack

- Frontend:
- Backend:
- Database:
- Auth:
- Storage:
- Queue / Jobs:
- Infra / Hosting:
- Observability:
- Testing:
- External integrations:

---

## Top-Level Layout

- Main app folder:
- API / service folder:
- Shared library folder:
- Infra / deployment folder:
- Scripts / tooling folder:
- Tests folder:
- Generated artifacts to ignore:

---

## Entry Points

- Web app entry:
- API entry:
- Worker entry:
- CLI / scripts entry:
- Auth entry:
- Admin / dashboard entry:
- Public docs entry:
- Runtime config files:

---

## Runtime Flows

### App Bootstrap Flow
- Entry:
- Providers / middleware:
- Config loaded:
- Global side effects:
- Output:

### Auth Flow
- Entry:
- Identity source:
- Session / token storage:
- Guard / middleware:
- Authorization boundary:
- Failure path:

### Main Business Flow
- Trigger:
- UI / route:
- Service / handler:
- Persistence / integration:
- Output:

### Payment / Billing Flow
- Trigger:
- Provider:
- Validation:
- Webhook / callback:
- Data updates:

### Notification Flow
- Trigger:
- Channel:
- Delivery service:
- Retry / failure path:

### Background Job Flow
- Trigger:
- Queue / scheduler:
- Worker:
- Persistence:
- Observability:

---

## Boundaries

- UI / Presentation:
- Client State:
- API / Transport:
- Domain Logic:
- Persistence:
- External Services:
- Shared Utilities:

---

## Ownership Map

- Product / UI owner:
- Backend / API owner:
- Data / schema owner:
- Auth / security owner:
- Infra / deployment owner:
- Observability owner:

---

## Integration Points

- Auth provider:
- Payment provider:
- Email / SMS:
- File storage:
- Search:
- Maps / GIS:
- AI / ML:
- Analytics:
- Third-party APIs:

---

## Key Files

- `bmad-main.md`: agent behavior and safety rules (sudah include AGENTS section)
- `SYSTEM_MAP.md`: architecture navigation map (file ini)
- `PRD.md`: product requirements
- `SRD.md`: system / tech requirements
- `mcp.json`: local MCP server registry for this workspace (opsional)
- `[path/to/root-entry]`: root app or service entry
- `[path/to/api-entry]`: main API/router/controller entry
- `[path/to/auth-entry]`: auth boundary
- `[path/to/data-model]`: schema or model source of truth
- `[path/to/main-service]`: core business logic
- `[path/to/config]`: runtime config source
- `[path/to/tests]`: critical test or fixture location

---

## Data Model Notes

- Core entities:
- Primary relationships:
- High-write areas:
- High-read areas:
- Sensitive data:
- Consistency / transaction constraints:

---

## Critical User Journeys

- User journey 1:
- User journey 2:
- Admin / operator journey:
- Failure recovery journey:

---

## Database Standards

- Minimum I/O
- Efficient indexing
- Avoid N+1 queries
- Optimize joins, filters, and pagination
- Separate transactional paths from reporting paths when needed

---

## Testing Map

- Unit test location:
- Integration test location:
- E2E test location:
- Test data / fixtures:
- Critical flows that must be validated after edits:

---

## Deployment Map

- Environments:
- Deployment platform:
- Build pipeline:
- Secret management:
- Runtime config:
- Rollback path:

---

## File Documentation Rules

For important files, document:

Purpose:
Caller:
Dependencies:
Main Functions:
Side Effects:

Use short source-based statements only.
Do not invent architecture that is not present in code.

---

## Pre-Edit Trace Note

Before substantive edits, note:

Target file:
Entrypoint:
Flow:
Upstream callers:
Downstream dependencies:
Risk:

Prefer one-line notes anchored to actual files, modules, or routes.

> **Auto-fill tip:** kalau codegraph aktif, satu call `codegraph_impact("<target_symbol>", depth=2)` jawab langsung untuk:
> - Upstream callers (siapa yang panggil)
> - Downstream dependencies (apa yang dipanggil)
> - Test files affected
> - Routes affected (kalau pakai framework yang supported)

---

## Change Impact Checklist

- Upstream callers affected:
- Downstream dependencies affected:
- Schema or migration impact:
- Env/config impact:
- Auth/permission impact:
- Performance impact:
- Test impact:
- Docs impact:

---

## Token Optimization Rules

- Do not scan the entire repo by default.
- Start from the target route, service, controller, job, or module.
- Avoid reading generated output unless the task is artifact-specific.
- Prefer targeted retrieval over broad exploration.
- Summarize findings instead of dumping raw context.
- Use this map first when the task needs architecture or flow tracing.

---

## Project-Specific Notes

- Domain terms:
- Compliance / regulatory constraints:
- Security constraints:
- Performance constraints:
- Team conventions:

---

## Open Questions / Known Gaps

- Assumptions currently in use:
- Unknown entrypoints or flows:
- Areas needing runtime verification:
- Areas likely to drift if not updated:

---

## Maintenance Rule

Update `SYSTEM_MAP.md` when any of these change:
- entrypoints
- architecture boundaries
- major runtime flows
- external integrations
- deployment shape
