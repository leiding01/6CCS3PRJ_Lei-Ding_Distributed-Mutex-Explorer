# Figures Plan (Final Report)

This document lists the proposed figures to include in the final report, including file names, captions, where they are used, and what they demonstrate.

> Update file names if you prefer a different naming scheme, but keep consistency.

---

## Figure list

### F01 — Token Ring: CS entry (baseline behaviour)
- **File:** `F01_tokenring_basic_cs_entry_ui.png`
- **Caption (draft):** Token Ring scripted demo: a process enters the critical section while holding the token, illustrating mutual exclusion and token ownership.
- **Report section:** 6 (Verification & Testing) and/or 7.1 (Correctness evaluation)
- **Evidence support:**
  - Trace export: `T01_tokenring_basic_cs_entry_trace.txt`
  - Preview export: `P01_tokenring_basic_cs_entry_preview.png`
- **Scenario:** `examples/token_ring_basic.json`

### F02 — Token Ring: crash blocks progress
- **File:** `F02_tokenring_crash_blocked_ui.png`
- **Caption (draft):** Token Ring fault demo: crash causes token loss / progress blocking, making the recovery assumption explicit.
- **Report section:** 4.3 (Token Ring design), 7.1 (Correctness under faults)
- **Evidence support:**
  - `T02_tokenring_crash_blocked_trace.txt`
  - `P02_tokenring_crash_blocked_preview.png`
- **Scenario:** `examples/token_ring_crash_demo.json`

### F02b — Token Ring: regeneration restores progress
- **File:** `F02b_tokenring_crash_regen_ui.png`
- **Caption (draft):** Token regeneration restores progress after token loss, demonstrating recovery behaviour under the tool’s fault model.
- **Report section:** 7.1 (Correctness under faults), 8.1 (Discussion)
- **Evidence support:** `T02b_tokenring_crash_regen_trace.txt`
- **Scenario:** `examples/token_ring_crash_demo.json`

### F03 — Ricart–Agrawala: deferral with explicit message queue
- **File:** `F03_ra_conflict_defer_ui.png`
- **Caption (draft):** Ricart–Agrawala scripted conflict: the message queue and trace reveal REQUEST/REPLY delivery and a deferred REPLY, explaining why only one process can proceed.
- **Report section:** 4.4 (RA design), 7.1 (Correctness evaluation), 7.3 (Pedagogical clarity)
- **Evidence support:** `T03_ra_conflict_defer_trace.txt` (export after reaching deferral)
- **Scenario:** `examples/ra_conflict_demo.json`

### F04 — Ricart–Agrawala: tie-break correctness (P2 before P10)
- **File:** `F04_ra_tiebreak_p2_first_ui.png`
- **Caption (draft):** Ricart–Agrawala tie-break demo: with equal timestamps, numeric PID ordering is applied; P2 enters the critical section before P10.
- **Report section:** 6 (Verification), 7.1 (Correctness), 8.1 (Algorithm comparison)
- **Evidence support:** `T04_ra_tiebreak_p2_first_trace.txt`
- **Scenario:** `examples/ra_tiebreak_p2_p10.json`

---

## Optional figures (use only if needed)

### F05 — RA: message loss illustrates liveness sensitivity
- **File:** `F05_ra_message_drop_ui.png`
- **Caption:** Dropping a message can block progress in the RA prototype, illustrating dependence on network assumptions (liveness is not guaranteed under message loss).
- **Report section:** 4.4, 6.3 (Limitations), 8.2 (What didn’t work / limitations)
- **Evidence:** trace export showing dropped message + lack of progress

### F06 — Scenario panel (clarity feature)
- **File:** `F06_scenario_panel_ui.png`
- **Caption:** Scenario panel shows demo name/description and next scripted events, supporting guided replay and repeatable demonstrations.
- **Report section:** 4.6 (UI design), 7.3 (Pedagogical clarity), 9 (Professional issues: usability)

---

## Notes for writing captions
- Use “what the reader should learn from this figure” rather than restating UI labels.
- Ensure each caption mentions:
  - algorithm name,
  - milestone (e.g., “defers reply”, “token regenerated”), and
  - what concept it demonstrates (mutual exclusion, progress, fault recovery, etc.).
