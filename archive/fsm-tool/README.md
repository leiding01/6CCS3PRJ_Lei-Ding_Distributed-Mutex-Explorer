Live demo: https://leiding01.github.io/fsm-educational-tool/  
Focus: Minimal, reproducible educational tool. Planned: NFA + ε-closure and subset construction; keyboard shortcuts; tutorial mode.

# FSM Educational Tool — DFA (v0.2)

[![Live demo](https://img.shields.io/badge/demo-GitHub%20Pages-blue)](https://leiding01.github.io/fsm-educational-tool/)

A minimal, teaching-oriented web tool to build and run deterministic finite automata (DFA).  
This version adds a **trace panel**, **delete state**, a simple **Undo**, and a **preview canvas with PNG export**.  
The codebase is dependency-free (HTML/JS/CSS) and runs locally or on GitHub Pages.

## Highlights (engineering-focused)
- Deterministic finite automata (DFA) **visualiser**: trace panel, delete state, Undo, preview canvas with **Export PNG**, **JSON import/export**.
- Defensive UI: prevents duplicate `(state, symbol)` transitions; clear error messages (e.g. missing δ-transition).
- Reproducible set-up: one-click local server scripts, example models, black-box tests, a timing CSV, and a Nielsen heuristic checklist.
- Clean, dependency-free front-end that works offline and on GitHub Pages.

## Roadmap (v0.3 — planned, small and safe)
- **NFA** support with **ε-closure**, plus **subset construction** view (NFA→DFA) and dual-view toggle.
- **Redo** and keyboard shortcuts (Ctrl+Z, Del, Enter), with lightweight toast notifications.
- One-click **Export ZIP** (current JSON + PNG preview).
- Small test pack (≈10 JSON models) + batch timing; **Tutorial mode** (short guided steps) if time allows.

> The roadmap will be tracked as GitHub Issues for transparency and scope control.

## Evaluation & reproducibility
- Black-box examples in `examples/`, expected behaviours in `tests/spec_fsm_core.md`.
- Timing sheet: `eval/fsm_timing.csv`; usability checklist: `eval/nielsen_checklist.md`.
- Figures/screenshots in `report/figures/` (used as evidence in the checklist).  
- Exportable artefacts: JSON models and PNG previews enable exact reproduction.

---

## Quick start
- Open this folder in VS Code and use *Live Server* **or** run:
  ```bash
  python -m http.server 5500
  ```
  then visit <http://localhost:5500/index.html>.

- Windows: `start_server.bat`  
- macOS/Linux: `start_server.sh`

## Features
- Create/delete states; set start and accept states.
- Add/delete transitions (**DFA rule**: at most one per `(state, symbol)`).
- Run/Step an input string; see **ACCEPT/REJECT** and the **trace**.
- Import/Export JSON.
- Preview canvas (circular layout) and **Export PNG**.
- **Undo** common actions (add/delete state, add/delete transition, set start/accepts, clear all).

## JSON schema (simplified)
```json
{
  "states": ["q0", "q1"],
  "alphabet": ["a", "b"],
  "start": "q0",
  "accepts": ["q1"],
  "transitions": [
    {"from": "q0", "symbol": "a", "to": "q1"}
  ],
  "type": "DFA"
}
```

## Notes
- The preview uses a simple circular layout; it is sufficient for small to medium graphs.
- Self-loops are drawn above the state; multiple symbols between two states are merged with comma-separated labels.
- No personal data are collected; examples are synthetic.

---

not part of final artefact

## Student
- Name: **Lei Ding**  
- K number: **K21029011**