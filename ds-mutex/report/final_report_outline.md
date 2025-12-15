# Final Report Outline — Distributed Mutual Exclusion Explorer (Variant 3)
**Student:** Lei Ding (K21029011)  
**Supervisor:** Angelos Georgoulas  
**Programme/Stage:** BSc Computer Science (Year 3)  
**Project Theme:** Interactive Tools for Learning Distributed Systems Concepts — Variant 3 (Distributed Mutual Exclusion Explorer)  
**Artefact:** Browser-based interactive simulator (Token Ring + Ricart–Agrawala, faults, scripted demos, JSON/PNG export)  
**Prototype Version (at time of writing):** v0.3  

> This file is an outline/template. Replace bracketed placeholders (e.g., `[X]`) with your final content.

---

## Suggested word budget (example)
- Abstract: 200
- Introduction: 800–1200
- Background & Related Work: 1800–2500
- Requirements & Specification: 900–1400
- Design: 1400–2000
- Implementation: 1200–1800
- Verification & Testing: 800–1200
- Evaluation: 1200–2000
- Discussion: 800–1400
- Professional Issues: 700–1200
- Project Management: 500–900
- Conclusion: 300–600  
**Total (excluding appendices):** ~10k–15k (adjust to your module requirement)

---

## Citation plan (30+ citations without forcing)
- Background/Related Work: ~15–20 citations
- Design/Implementation: ~6–8 citations
- Evaluation/Professional Issues: ~8–10 citations
- Total target: 35+ citations (buffer)

> Use BibTeX keys from `report/references.bib`. Each section below includes suggested keys.

---

# Front matter

## Title Page
- Project title, student name, K-number, supervisor, degree programme, submission date
- Word count (if required)

## Abstract (150–250 words)
- Problem: why distributed mutual exclusion (DME) is hard to learn
- Artefact: what you built and for whom
- Methods: how you validated correctness + usability
- Key results and limitation (1 sentence)

**Suggested keys:** `tanenbaum2017distributed`, `coulouris2011distributed`, `ricart1981optimal`

## Acknowledgements (optional)
- Supervisor, participants (if any), anyone who helped with evaluation

## Table of Contents / List of Figures / List of Tables
- Keep figure naming consistent (F1, F2, …) for report evidence

---

# 1. Introduction

## 1.1 Context and motivation
- Distributed systems concepts are abstract due to concurrency + partial failure
- DME as a “classic” teaching topic: safety vs progress, message ordering, failures

**Suggested keys:** `tanenbaum2017distributed`, `coulouris2011distributed`, `tel2000introduction`

## 1.2 Problem statement
- Static textbooks struggle to convey dynamic behaviour
- Need: interactive step-by-step, observable states, repeatable scenarios, fault injection

**Suggested keys:** `naps2002engagement`, `shaffer2010algoviz`, `hundhausen2002meta`

## 1.3 Aim and objectives
- Build an interactive educational tool for DME (Variant 3)
- Implement at least one token-based and one message-based algorithm
- Support faults + recovery and make progress-blocking visible
- Provide reproducible artefacts (JSON demos/state + PNG export)
- Evaluate correctness and usability; reflect on professional issues

**Suggested keys:** `ricart1981optimal`, `suzuki1985distributed`, `lynch1996distributed`

## 1.4 Scope and non-goals
- Scope: teaching-oriented prototype in browser; small N (2–12)
- Non-goals: full network simulation (latency distributions), Byzantine failures, production-grade protocol stack

**Suggested keys:** `chandra1996failure`, `lynch1996distributed`

## 1.5 Contributions (bullet list)
- Token Ring simulator + trace + preview
- Fault scenarios: token loss, crash/recover, token regeneration
- Ricart–Agrawala prototype with explicit message queue + stepwise delivery
- Message loss injection for RA
- Scripted demos: conflict, crash/recovery, tie-break (P2 vs P10)
- Export: JSON state + PNG preview for reproducibility
- Evaluation artefacts: heuristic checklist + scenario-based correctness evidence

## 1.6 Report structure
- One paragraph summarising each chapter

---

# 2. Background and Related Work

> Goal: show you understand (1) DME algorithms, (2) faults/assumptions, (3) educational visualisation, (4) evaluation methods.

## 2.1 Distributed systems fundamentals relevant to DME
- Message passing model; partial failures
- Safety vs liveness, fairness/starvation (state what your prototype focuses on)
- Logical time / ordering concepts used in DME and RA tie-break

**Suggested keys:** `lynch1996distributed`, `attiya2004distributed`, `tel2000introduction`, `lamport1978time`

## 2.2 Distributed mutual exclusion definition and properties
- Mutual exclusion safety (at most one in CS)
- Progress/deadlock and starvation/fairness (define; explain what you demonstrate)
- Performance dimensions: message complexity and latency trade-offs

**Suggested keys:** `garg2002elements`, `attiya2004distributed`, `lynch1996distributed`

## 2.3 Algorithm families overview
### 2.3.1 Token-based mutual exclusion
- Token Ring intuition and educational suitability
- Mention other token approaches for comparison (Suzuki–Kasami)

**Suggested keys:** `suzuki1985distributed`, `garg2002elements`, `tel2000introduction`

### 2.3.2 Message-based mutual exclusion
- Ricart–Agrawala REQUEST/REPLY and deferral logic
- Mention other message-based approaches for positioning (Maekawa, Raymond)

**Suggested keys:** `ricart1981optimal`, `maekawa1985sqrt`, `raymond1989tree`

## 2.4 Faults and recovery assumptions
- Crash/recover model vs Byzantine (clarify what you implement)
- Message loss model in your prototype (drop-next-message)
- Token loss and token regeneration: why external recovery action is needed
- Explain “why progress can block” under faults and what assumptions restore progress

**Suggested keys:** `chandra1996failure`, `fischer1985impossibility`, `lynch1996distributed`

## 2.5 Algorithm visualisation and interactive learning
- Why step-by-step replay and explicit state matter (concurrency comprehension)
- Engagement and learning outcomes of algorithm visualisation
- Cognitive load and why the UI reduces it (trace + queue + preview)

**Suggested keys:**  
- Algorithm visualisation: `naps2002engagement`, `hundhausen2002meta`, `shaffer2010algoviz`, `sorva2013visual`  
- Learning/animation: `tversky2002animation`, `mayer2009multimedia`, `sweller1988cogload`, `kirschner2006minimal`

## 2.6 Usability and accessibility in educational tools
- Usability definition; why usability matters for learning tools
- Heuristic evaluation and SUS as lightweight methods
- Accessibility baseline (WCAG) and practical relevance

**Suggested keys:** `nielsen1994usability`, `brooke1996sus`, `iso9241_11_2018`, `w3c_wcag22`, `w3c_aria12`

## 2.7 Reproducibility and engineering practice
- Why reproducibility matters even for educational prototypes
- Scenarios/state export and evidence capture as reproducibility support
- Version control for traceability

**Suggested keys:** `wilson2014best`, `sandve2013ten`, `wilkinson2016fair`, `chacon2014progit`

---

# 3. Requirements and Specification

## 3.1 Stakeholders and use cases
- Learner (student), instructor/TA, supervisor/assessor
- Use cases: classroom demo, self-study exploration, assessment evidence capture

## 3.2 Functional requirements (FR)
Write as numbered FRs (FR1…FRn), each testable.
- FR1 Configure algorithm + number of processes
- FR2 Interactive request CS / release CS
- FR3 Step / Run / Pause / Reset
- FR4 Trace logging (events and reasons for blocking)
- FR5 Token Ring: token holder display, token passing
- FR6 Token Ring faults: token loss + regeneration
- FR7 Crash/recover of a process
- FR8 RA: explicit message queue + REQUEST/REPLY delivery model
- FR9 RA faults: drop-next-message (disabled when queue empty)
- FR10 Scripted scenario replay via JSON; exit script mode
- FR11 Export JSON state + export PNG preview

**Suggested keys:** `ieee830_1998`

## 3.3 Non-functional requirements (NFR)
Numbered NFRs.
- NFR1 Correctness (mutual exclusion safety)
- NFR2 Pedagogical clarity (state visibility and explanations via trace)
- NFR3 Usability (low friction operation)
- NFR4 Accessibility baseline (labels, readable UI, control feedback)
- NFR5 Privacy (no personal data collection)
- NFR6 Reproducibility (scripted demos + export artefacts)
- NFR7 Sustainability (dependency-free static site)

**Suggested keys:**  
- Usability: `iso9241_11_2018`, `nielsen1994usability`  
- Accessibility: `w3c_wcag22`, `w3c_aria12`  
- Reproducibility: `sandve2013ten`, `wilson2014best`, `wilkinson2016fair`

## 3.4 Success criteria and evaluation mapping
- Table mapping FR/NFR → evidence (demo + screenshots + trace excerpts + exports + checklist + SUS if used)

---

# 4. System Design

## 4.1 Architecture overview
- High-level components:
  - Core model + step engine (algorithm state transitions)
  - UI renderer (process table, message queue table, trace, canvas preview)
  - Import/export (JSON scenario/state, PNG export)
- Separation rationale (maintainability, testability)

**Suggested keys:** `gamma1994design`, `wilson2014best`

## 4.2 State model and invariants
- Model fields: `processes`, `token`, `network.queue`, `metrics`, `trace`, `mode`, `script`
- Invariants:
  - Safety: at most one process in CS
  - Token Ring: CS implies holding token (in your model)
  - RA: CS implies all replies received (for that request)
- What you check at runtime and what you only demonstrate

**Suggested keys:** `lynch1996distributed`, `attiya2004distributed`, `lamport2002specifying` (optional)

## 4.3 Token Ring design
- Process states: idle/requesting/inCS/crashed
- Token movement and entry/release rule
- Faults:
  - token loss
  - crash while holding token
  - crash in CS
- Recovery:
  - token regeneration policy (assumptions and limitations)

**Suggested keys:** `suzuki1985distributed`, `tel2000introduction`, `garg2002elements`

## 4.4 Ricart–Agrawala design
- Local clock and request timestamp
- REQUEST/REPLY messages and deferral conditions
- Tie-break: (timestamp, numeric PID)
- Message queue:
  - why explicit queue helps teaching
  - step semantics = deliver one message per step

**Suggested keys:** `ricart1981optimal`, `lamport1978time`, `lynch1996distributed`

## 4.5 Scripted scenario design (JSON)
- Scenario types:
  - `MutexDemo` with `events` list
  - `MutexState` export format
- Event ops supported per algorithm (requestCS, deliverNext, crash, recover, etc.)
- Catalogue of demos and what each demonstrates:
  - Token Ring basic
  - Token Ring crash/recovery
  - RA conflict
  - RA tie-break
  - RA message drop (limitations)

**Suggested keys:** `sandve2013ten`, `wilson2014best`

## 4.6 UI/visual design rationale
- Why multiple views: table + queue + trace + canvas preview
- Why disable controls in certain contexts (reduce user error)
- Why keep N small by default (clarity)
- What the user can learn from each component (trace vs preview vs queue)

**Suggested keys:** `nielsen1994usability`, `hundhausen2002meta`, `sweller1988cogload`, `mayer2009multimedia`

---

# 5. Implementation

## 5.1 Technology stack and deployment
- Dependency-free HTML/CSS/JS (ES modules)
- Canvas rendering and PNG export
- Local static server and GitHub Pages deployment
- Rationale for minimal dependencies (portability, sustainability)

**Suggested keys:** `wilson2014best`, `chacon2014progit`

## 5.2 Core implementation overview
- Model constructors: Token Ring vs RA
- Dispatch logic for:
  - interactive actions (requestCS/releaseCS)
  - stepOnce (algorithm-dependent)
  - script engine (event replay)
- Trace and metrics design

## 5.3 Token Ring implementation notes
- Ring navigation (next alive)
- Handling crashes (token becomes lost; progress blocked)
- Regeneration strategy (select alive holder)
- Evidence hooks (trace messages aligned to teaching goals)

**Suggested keys:** `suzuki1985distributed`, `tel2000introduction`

## 5.4 RA implementation notes
- Message enqueue/delivery; receiver clock update
- Deferral logic and tie-break correctness
- Message loss injection (drop next message)
- Why queue delivery continues even while someone is in CS (network realism and clarity)

**Suggested keys:** `ricart1981optimal`, `lamport1978time`

## 5.5 Import/export and artefacts
- Export JSON state
- Import scripted demos
- Export PNG preview
- How these support reproducibility

**Suggested keys:** `sandve2013ten`, `wilson2014best`, `wilkinson2016fair`

---

# 6. Verification and Testing

## 6.1 Correctness strategy
- Safety invariant checking (where/how you check)
- Scenario-based regression: “canonical demos” as repeatable tests

**Suggested keys:** `lynch1996distributed`, `attiya2004distributed`

## 6.2 Canonical scripted demos (test cases)
For each demo:
- Purpose
- Expected milestones (trace lines)
- Expected final state (who in CS, queue empty, etc.)
- Screenshots to capture (process table, queue, trace, preview)

Examples:
- Token Ring crash demo: show blocked progress then recovery via regeneration
- RA conflict demo: show deferral and sequential entry
- RA tie-break demo: show P2 enters CS before P10

## 6.3 Known limitations (explicit and justified)
- RA with message loss may block indefinitely (demonstration of liveness sensitivity)
- Crash-in-CS requires external recovery action (teaching model)
- No probabilistic delay model (deterministic step-based simulation)

**Suggested keys:** `fischer1985impossibility`, `chandra1996failure`

---

# 7. Evaluation

## 7.1 Correctness evaluation (evidence)
- Present evidence per demo:
  - trace excerpt screenshot (with step numbers)
  - queue table screenshot (RA)
  - preview PNG export
- Argue safety is preserved; explain progress behaviour under faults

**Suggested keys:** `ricart1981optimal`, `suzuki1985distributed`, `lamport1978time`

## 7.2 Usability evaluation
### 7.2.1 Heuristic evaluation (Nielsen)
- Method: checklist + severity scale
- Results: top issues and fixes (before/after evidence)
- Reflection: remaining minor issues and rationale

**Suggested keys:** `nielsen1994usability`

### 7.2.2 SUS (optional)
- Participants, tasks, procedure
- SUS score + interpretation
- Limitations due to small sample size

**Suggested keys:** `brooke1996sus`, `iso9241_11_2018`

## 7.3 Pedagogical clarity evaluation
- Task-based prompts:
  - “Who currently has access to CS?”
  - “Why is P2 still requesting?”
  - “What blocks progress under this fault?”
  - “What recovery action restores progress?”
- Evidence: participant responses or self-evaluation protocol

**Suggested keys:** `naps2002engagement`, `hundhausen2002meta`, `mayer2009multimedia`, `sweller1988cogload`

## 7.4 Threats to validity
- Sample size and selection bias
- Researcher bias (you are the developer)
- Simplified fault models
- Generalisability to real distributed systems

---

# 8. Discussion

## 8.1 Algorithm comparison through the tool
- Token Ring strengths/weaknesses for learning
- RA strengths/weaknesses for learning
- What “fault injection” teaches about assumptions

**Suggested keys:** `ricart1981optimal`, `suzuki1985distributed`, `maekawa1985sqrt`, `raymond1989tree`

## 8.2 What worked well
- Step model and trace clarity
- Explicit message queue for RA
- Scripted demos for reproducibility and assessment

**Suggested keys:** `shaffer2010algoviz`, `sweller1988cogload`

## 8.3 What could be improved (scoped future work)
- Controlled network delay model (optional)
- Additional algorithms (Suzuki–Kasami / Maekawa) if scope permits
- Tutorial mode / guided explanations
- Stronger accessibility features (ARIA labels, keyboard shortcuts)

**Suggested keys:** `w3c_wcag22`, `w3c_aria12`, `suzuki1985distributed`, `maekawa1985sqrt`

---

# 9. Professional Issues (Accessibility, Privacy, Sustainability)

## 9.1 Accessibility
- What you did: clear controls, disabled states, readable font sizes, consistent labels
- What remains: ARIA roles/labels for key controls (if not done), keyboard navigation improvements

**Suggested keys:** `w3c_wcag22`, `w3c_aria12`

## 9.2 Privacy
- No data collection; local-only JSON import/export
- Risks if adding analytics/AI in future and mitigation ideas

## 9.3 Sustainability and maintainability
- Dependency-free static build
- Core/UI separation
- Version control and traceability
- Simplicity as a sustainability choice

**Suggested keys:** `wilson2014best`, `chacon2014progit`, `gamma1994design`

## 9.4 Reproducibility
- Scripted demos + export state + PNG evidence
- How a third party can reproduce key results (steps)

**Suggested keys:** `sandve2013ten`, `wilson2014best`, `wilkinson2016fair`

---

# 10. Project Management

## 10.1 Plan vs actual timeline
- Planned milestones vs achieved (v0.1 → v0.2 → v0.3)
- Key decisions (adding RA, adding faults, fixing tie-break)
- Evidence: Git tags/releases or commit references (if available)

## 10.2 Risk management
- Scope creep mitigation
- Fault model complexity mitigation
- Evaluation recruitment mitigation (fallback to heuristic + self-test protocol)

**Suggested keys:** `chacon2014progit`

---

# 11. Conclusion
- Restate the problem and what you delivered
- Summarise correctness + usability + clarity outcomes
- State limitations explicitly (fault assumptions)
- Final sentence: how the artefact supports learning DME concepts

---

# References
- Generated from your BibTeX (ensure consistent style: Harvard/IEEE per module requirement)

---

# Appendices (recommended)

## Appendix A — Quick start / user guide
- How to run locally
- How to load each demo
- How to export PNG/JSON

## Appendix B — JSON schema
- `MutexDemo` fields and supported ops
- `MutexState` export format

## Appendix C — Scenario catalogue
- For each demo file:
  - educational goal
  - steps and expected trace milestones

## Appendix D — Evaluation artefacts
- Nielsen checklist filled
- SUS form and results (if used)
- Task script used for participants

## Appendix E — Extra screenshots and trace excerpts
- Full traces for key scenarios (as evidence)
