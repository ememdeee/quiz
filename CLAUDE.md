# CLAUDE.md
> This file is read automatically by Claude Code at the start of every session.

## Plan Folder — Naming Convention

Files in `plan/` are prefixed by purpose:
- `project_*` — development-relevant (structure, tracking, business/brand reference). Always read on start.
- `marketing_*` — marketing copy / ad setup reference. Not relevant to development, excluded from auto-read.

## Plan Folder — Always Read on Start

At the start of every session, read all `.md` files inside the `plan/` folder EXCEPT the ones listed below.

**Excluded files (do not read):**
- `marketing_content.md` — marketing copy, not relevant to development
- `marketing_meta.md` — Facebook ads setup reference, not relevant to development

**Files to always read:**
- Everything else in `plan/` — currently: `project_structure.md`, `project_tracking.md`, `project_business.md`

---

## Keeping Files Up To Date

After every session where code or logic changed, update the relevant file in `plan/`:

| If you changed... | Update this file |
|---|---|
| Project structure, routes, stores, libs, step types | `project_structure.md` |
| Tracking events, pixel setup, GA4, GTM | `project_tracking.md` |
| Business info, brand, audience, funnel links | `project_business.md` |

Always update the `Last Updated` date at the top of any file you modify.

**Rule:** Never end a session that involved structural or tracking changes without updating the relevant `.md` file. The plan folder is the source of truth for this project.

---

## General Rules

- Read `plan/` files first before making any decisions about architecture, tracking, or business logic
- If something in the code contradicts the plan files, flag it and ask before proceeding
- Do not add new plan files without asking first