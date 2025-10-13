# FSM Educational Tool — DFA (v0.2)

A minimal, teaching-oriented web tool to build and run deterministic finite automata (DFA).  
This version adds a **trace panel**, **delete state**, a simple **Undo**, and a **preview canvas with PNG export**.

## Quick start
- Open this folder in VS Code and use *Live Server* or run
  ```bash
  python -m http.server 5500
  ```
  then browse to <http://localhost:5500/index.html>.

## Features
- Create/delete states; set start and accept states.
- Add/delete transitions (DFA: at most one per `(state, symbol)`).
- Run/Step an input string; see **ACCEPT/REJECT** and the **trace**.
- Import/Export JSON.
- Preview canvas (circular layout) and **Export PNG**.
- **Undo** for common actions (add/delete state, add/delete transition, set start/accepts, clear all).

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

## Student
- Name: Lei Ding
- K number: K21029011

