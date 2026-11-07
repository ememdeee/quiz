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
- Everything else in `plan/` — currently: `project_structure.md`, `project_tracking.md`, `project_business.md`, `project_handover.md`, `project_checklist.md` (short status list, read it fully)
- `project_handover.md` is very large. At the start of a session read its sections **0, 1 and 12** (summary, the rules, and the master checklist with the current phase). Read the other sections when you work on that area (the section numbers are in the file). Appendix A lists every design board.

> The project is being rebuilt from a new design. `project_handover.md` is the plan for that. `project_structure.md` and `project_tracking.md` still describe the OLD app until Phase 1 rewrites them.

---

## Design-first rule (very important)

The UI source of truth is the Claude Design artifact: **https://claude.ai/artifact/FiiBUq7uJaBcXyeqfTKtTw** (private, the owner's account; read boards with the Artifact tool, `action: "read"`, `path: "project/<Board>.dc.html"`).

- Any UI change that is not very minor (typo, a few pixels of spacing, making code match the design) must be **designed in Claude Design first**, approved by the owner, and only then built in code. Never invent a screen, state, field, flow or rule in code.
- If the code needs something that is not in the design, stop, say what is needed, and ask the owner.
- Keep code DRY: each thing lives in one place (routes, strings, tokens, UI primitives, the page-type registry, the quiz schema). See rule R2 in `project_handover.md`.
- Nothing goes to production until `npm run release-check` (including the QC scripts) is green.

---

## Keeping Files Up To Date

After every session where code or logic changed, update the relevant file in `plan/`:

| If you changed... | Update this file |
|---|---|
| Project structure, routes, stores, libs, step types | `project_structure.md` |
| Tracking events, pixel setup, GA4, GTM | `project_tracking.md` |
| Business info, brand, audience, funnel links | `project_business.md` |
| A phase or task finished, a decision made, a new gap or requirement found, the design changed | `project_handover.md` (tick the checklist in section 12, update sections 11 and 13) **and** `project_checklist.md` (tick the same item). Always update both in the same session |

Always update the `Last Updated` date at the top of any file you modify.

**Rule:** Never end a session that involved structural or tracking changes without updating the relevant `.md` file. The plan folder is the source of truth for this project.

---

## General Rules

- Read `plan/` files first before making any decisions about architecture, tracking, or business logic
- If something in the code contradicts the plan files, flag it and ask before proceeding
- Do not add new plan files without asking first