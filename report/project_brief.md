# Automata Educational Web Tool – Minimal, Reproducible, Engineering‑focused

**Live demo:** https://leiding01.github.io/fsm-educational-tool/  
**Repository:** https://github.com/leiding01/fsm-educational-tool

## Summary
A lightweight, teaching‑oriented web tool for finite automata. The current MVP (v0.2) supports DFA construction and execution with a **trace panel**, **Undo**, **delete state**, **preview canvas with PNG export**, and **JSON import/export**. The emphasis is engineering and reproducibility rather than research novelty. The codebase is dependency‑free (HTML/JS/CSS) and deploys on GitHub Pages.

## Scope
**Completed (v0.2):** DFA runner & visualiser; trace; Undo; state/transition management; PNG export; JSON import/export; two worked examples.  

**Planned (v0.3, small & safe):**
1) **NFA** support with **ε‑closure** and **subset construction** (dual NFA↔DFA view).  
2) **Redo** and **keyboard shortcuts** (Ctrl+Z, Del, Enter), with lightweight toast notifications.  
3) One‑click **Export ZIP** (current JSON + PNG).  
4) A small black‑box test pack (≈10 JSON models) and a batch timing script.

## Engineering Components
Deterministic and non‑deterministic state machines; input stepping; validation (prevent duplicate `(state, symbol)` in DFA).  
Pure front‑end architecture; modular `fsm_core.js` (model + algorithms) and `main.js` (UI + controller).  
Exportable artefacts for reproduction (JSON + PNG), plus automation hooks for tests/timing.

## Evaluation
**Correctness:** black‑box examples & expected ACCEPT/REJECT traces.  
**Performance:** simple timing table (render/run) in `eval/fsm_timing.csv`.  
**Usability:** Nielsen heuristic checklist with screenshots as evidence.  
**Reproducibility:** all models and figures stored in repo; GitHub Pages as deployable demo.

## Deliverables
Source code, **deployable prototype**, test artefacts (JSON, CSV), and dissertation (design, implementation, evaluation, reflections).

## Timeline (indicative)
- **Week 1–2:** NFA + ε‑closure; dual view; 3 example NFAs.  
- **Week 3:** Subset construction; test pack; figures.  
- **Week 4:** Redo & shortcuts; toast; ZIP export.  
- **Week 5:** Documentation, evaluation runs, polishing.

## Risks & Mitigations
Scope creep → lock features to v0.3 list; defer extras to v0.4.  
Time pressure → favour simple, explainable implementations over new algorithms.  
Browser quirks → keep zero external deps; test on latest Chrome/Edge.

## Ethics & Professional Issues
No personal data collection. Non‑generative, transparent behaviour; clear error messages.
