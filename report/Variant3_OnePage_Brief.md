# Variant 3 — Distributed Mutual Exclusion Explorer (v0.3) — One Page Brief

**Student:** Lei Ding (K21029011)  
**Programme:** BSc Computer Science (Year 3)  
**Supervisor:** Angelos Georgoulas  
**Project theme/title (allocated):** Interactive Tools for Learning Distributed Systems Concepts — Variant 3 (Distributed Mutual Exclusion Explorer)

## Problem
Distributed mutual exclusion (DME) ensures that at most one process accesses a shared critical section at any time in a distributed system. Concepts such as concurrent requests, message ordering, and fault behaviour are abstract and difficult to understand via static lectures alone.

## Proposed artefact and technology stack (BCS practical artefact)
I am producing a **browser-based interactive simulator** that visualises distributed mutual exclusion algorithms and failure scenarios.  
**Stack:** dependency-free **HTML/CSS/JavaScript (ES modules)** running locally (static files) or deployable on **GitHub Pages**, with **Canvas** for visual preview, and **JSON** for scenario/state import-export. No personal data are collected.

## Current status (v0.3)
Implemented two algorithm variants with step-by-step replay and clear visual state:
- **Token Ring (token-based mutual exclusion):** request/release, token passing, scripted scenarios.
- **Faults + recovery (Token Ring):** token loss, process crash/recover, token regeneration.
- **Ricart–Agrawala (prototype, message-based):** explicit message queue visualisation; each Step typically delivers one queued message to show REQUEST/REPLY flow and deferrals.
- **Fault injection (RA):** drop-next-message (disabled when queue empty) to demonstrate loss effects.
- **Reproducibility:** scripted JSON demos + exportable JSON state + PNG export of the preview; trace log as evidence for report figures.

## Evaluation plan
- **Correctness:** safety invariant (mutual exclusion), algorithm trace inspection across scripted demos and interactive exploration.
- **Usability:** Nielsen heuristic checklist + optional small SUS questionnaire with short tasks (if participants available).
- **Pedagogical clarity:** observe whether learners can answer “who holds the resource?”, “why is a reply deferred?”, “what blocks progress under failures?”.

## Next steps
- Write the BSPR with requirements/specification, architecture notes, and risk plan.
- Build a literature base (>=30 citations) covering DME algorithms, algorithm visualisation/CS education, usability evaluation, accessibility, and reproducibility (see `report/references.bib`).
- Capture report figures (screenshots) from each demo (Token Ring basic, crash/recovery, RA conflict, RA tie-break).
- Run a small usability check and record findings/actions.

## Key risks
- Over-scoping beyond a stable educational prototype (mitigation: focus on clarity + evidence + evaluation rather than adding more algorithms).
- Fault modelling complexity (mitigation: explicitly state assumptions and limitations in the report).
