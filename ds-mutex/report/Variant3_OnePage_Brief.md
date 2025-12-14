# Variant 3 — Distributed Mutual Exclusion Explorer (One-Page Brief)

**Student:** Lei Ding (K21029011)  
**Supervisor:** Dr Angelos Georgoulas  
**Programme/Stage:** BSc Computer Science, Year 3  
**Project theme:** Interactive Tools for Learning Distributed Systems Concepts

## Overview
Distributed mutual exclusion ensures that **at most one process** at a time can enter a **critical section** while coordinating via message passing (or tokens) over a network. The goal of this project is to build an interactive tool that helps students *see* how mutual exclusion algorithms behave under concurrency and faults, rather than only reading static diagrams or pseudocode.

## Technology artefact
A deployable, browser-based educational simulator called the **Distributed Mutual Exclusion Explorer**:
- Users can configure the number of processes and select an algorithm.
- Users can issue requests to enter a critical section and observe algorithm behaviour step-by-step or via playback.
- The interface visualises which process currently holds the shared resource and the status of outstanding requests.
- Fault scenarios such as token loss and process crashes are supported, including teaching-oriented recovery actions.

This satisfies the BCS requirement for substantial practical computing work via the design, implementation, and evaluation of a software artefact.

## Technology stack
- **Front-end:** HTML5 + CSS + modern JavaScript (ES modules)
- **Architecture:** dependency-free, client-side only (no server-side logic required)
- **Deployment:** static hosting (GitHub Pages) and local HTTP server (`python -m http.server`)
- **Artefact outputs:** JSON import/export for scenarios and state; PNG export for the visual preview

## Current progress (prototype v0.2)
Implemented: **Token Ring** mutual exclusion (token-based approach)
- Interactive mode:
  - Configurable process count
  - Per-process actions: request critical section / release
  - Step/run simulation with trace panel
  - Visual preview (ring layout), exportable as PNG
- Fault scenarios and recovery:
  - **Token loss** + **token regeneration**
  - **Process crash** + **process recovery**
- Correctness support:
  - Safety invariant check: detects violations of mutual exclusion (>1 process in CS)

Scripted demonstrations:
- JSON-driven scripted demos (replayable scenarios) for consistent teaching and evaluation evidence.

## Planned next steps
Algorithm coverage:
- Implement **Ricart–Agrawala** (message-based mutual exclusion) to contrast with token-based approaches.
- Provide visualisation of REQUEST/REPLY messages, deferred replies, and waiting conditions.

Fault modelling:
- Add controlled network conditions (message delay/drop) for message-based scenarios.
- Extend fault handling scenarios with clear, teaching-oriented recovery narratives.

Pedagogy and clarity:
- Improve in-tool explanations tied to trace steps (e.g., “why can/can’t this process enter CS now?”).
- Add lightweight metrics (e.g., token passes/messages, waiting time) to illustrate trade-offs.

## Evaluation plan
- **Correctness:** scenario-based checks and invariants (safety; controlled liveness demonstrations under faults)
- **Performance:** compare behaviour under different process counts and fault conditions (token passes/messages, steps to enter CS)
- **Usability & educational value:** heuristic evaluation (Nielsen) + small study tasks (students explain/answer questions after using the tool)

## Professional considerations
- **Accessibility:** avoid colour-only encoding; clear labels; keyboard-friendly controls where feasible
- **Privacy:** no personal data collection; evaluation data anonymised
- **Sustainability:** lightweight, dependency-free static web app suitable for reuse in teaching labs
