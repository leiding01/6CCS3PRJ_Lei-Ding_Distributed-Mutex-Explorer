# Background and Specification Progress Report (BSPR)
**Project:** Interactive Tools for Learning Distributed Systems Concepts — Variant 3 (Distributed Mutual Exclusion Explorer)  
**Student:** Lei Ding (K21029011)  
**Supervisor:** Angelos Georgoulas  
**Version:** Draft v0.1 (based on prototype v0.3)

## 1. Background and motivation
Distributed systems concepts are difficult to learn because they involve concurrency, non-determinism, and partial failure. Distributed mutual exclusion (DME) is a classic topic that exposes key ideas: message ordering, causal reasoning, safety vs liveness, and recovery assumptions.

This project produces an interactive simulator that makes DME behaviour observable and controllable through step-by-step replay, traces, and fault injection.

## 2. Artefact and technology stack (BCS practical artefact requirement)
**Artefact:** a **web-based interactive simulator** for distributed mutual exclusion, including algorithm visualisation, scripted scenario replay, fault injection, and exportable artefacts for reproducibility.

**Computing/IT technology stack:** dependency-free **HTML/CSS/JavaScript (ES modules)**, **Canvas** for visual preview/export, **JSON** for scenario/state interchange, runnable locally via a static web server and deployable on **GitHub Pages**. Development uses Git for version control and a repository structure that separates core algorithm logic from UI code.

## 3. Objectives
1. Implement a technically correct and teaching-oriented simulator for a token-based DME algorithm (Token Ring).
2. Implement a message-based DME algorithm prototype (Ricart–Agrawala) with explicit message visualisation.
3. Support fault scenarios (crash/recover, token loss/regeneration, basic message loss) and show their impact on progress.
4. Provide reproducible demonstrations (scripted JSON scenarios, exported state, exported figures).
5. Evaluate correctness and usability, and reflect on accessibility, privacy, and sustainability.

## 4. Requirements and specification (initial)
### 4.1 Functional requirements
- Configure number of processes (small N for clarity).
- Interactive actions: request CS, release CS.
- Step-by-step execution and automated Run with adjustable speed.
- Visual state: per-process status; token holder (Token Ring); message queue (RA).
- Fault injection: token loss/regeneration (Token Ring); crash/recover (both); drop-next-message (RA).
- Scripted scenario replay via JSON; ability to exit script mode.
- Export: JSON state and PNG preview.

### 4.2 Non-functional requirements
- Correctness: enforce or detect mutual exclusion safety violations.
- Pedagogical clarity: UI should make “who holds the resource” and “what blocks progress” explicit.
- Reproducibility: scenarios and exports enable exact replay of demonstrations.
- Accessibility: basic keyboard navigation and readable UI; align with WCAG guidance.
- Privacy: no collection of personal data; scenarios are synthetic.
- Sustainability: dependency-free static site; long-term runnable in a modern browser.

## 5. Current progress (as of v0.3 prototype)
- Implemented Token Ring mutual exclusion with step/run and trace logging.
- Implemented scripted scenario replay and export (JSON state, PNG preview).
- Implemented fault injection and recovery (token loss/regeneration; crash/recover).
- Implemented Ricart–Agrawala (prototype) with explicit message queue and stepwise delivery.
- Implemented RA message loss injection (drop next message) with UI safeguards.

## 6. Planned evaluation
### 6.1 Correctness evaluation
- Safety: check mutual exclusion invariant across interactive use and scripted demos.
- Fault cases: show progress limitations under crash-in-CS and token-loss, and recovery via regeneration.
- RA: demonstrate REQUEST/REPLY flow, deferral, tie-break behaviour, and the effect of message loss.

### 6.2 Usability evaluation
- Heuristic walkthrough using Nielsen’s heuristics.
- Optional lightweight SUS questionnaire with 3–5 participants if possible (short tasks + score).
- Evidence: screenshots of states and traces before/after improvements.

### 6.3 Reproducibility evidence
- Include scenario JSON files for each demo.
- Exported PNG figures used in report.
- A short “how to run” section for local server and GitHub Pages.

## 7. Professional issues: accessibility, privacy, sustainability
- Accessibility: review contrast, font sizes, focus order, and meaningful labels.
- Privacy: no personal data stored; imported JSON files are local-only.
- Sustainability: static site; minimal dependencies; simple build/run process.

## 8. Risks and mitigation
- Scope creep: avoid adding more algorithms; prioritise clarity, evidence, evaluation.
- Fault modelling ambiguity: document assumptions explicitly (crash model, message loss model, recovery model).
- Evaluation participants: prepare a fallback evaluation (expert heuristic + self-test protocol) if recruitment is limited.

## 9. Immediate next steps (next 2–3 weeks)
- Consolidate literature and integrate at least 30 references into the final report (see `report/references.bib`).
- Capture report figures from each demo scenario and store with consistent naming.
- Run heuristic evaluation and record fixes as an audit trail.
- Start writing the main report sections (background, design, evaluation, reflection).
