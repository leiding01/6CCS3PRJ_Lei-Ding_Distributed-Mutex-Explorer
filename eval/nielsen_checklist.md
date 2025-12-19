# Nielsen Heuristic Evaluation Checklist — Distributed Mutual Exclusion Explorer

**Artefact:** Distributed Mutual Exclusion Explorer  
**Version:** v0.2 (Token Ring + token loss + crash/recovery)  
**Evaluator:** (self)  
**Date:** (fill in)  
**Environment:** (browser/OS/device, fill in)

## Scope
This checklist covers the Token Ring explorer UI:
- Configuration (algorithm, process count)
- Controls (step/run/pause/reset; token loss/regeneration)
- Per-process actions (request/release; crash/recover)
- Trace panel and safety indicator
- Preview canvas and PNG export
- JSON export/import and scripted scenario loading

## Evidence
Add screenshots to `report/figures/` and reference them here:
- `report/figures/mutex_v0.2_overview.png` (main UI)
- `report/figures/mutex_v0.2_crash.png` (crash state)
- `report/figures/mutex_v0.2_token_lost.png` (token lost warning)
- `report/figures/mutex_v0.2_script_mode.png` (script replay)

---

## (1) Visibility of system status
**What to check:** Users can quickly see current state and what happened.

- Current status indicators:
  - Trace panel shows step-by-step events
  - “Safety” label shows invariant status
  - Preview labels show token holder and current CS owner
  - Mode pill shows interactive vs script

**Issues / actions:**
- (If needed) Make script mode more obvious (e.g., disable manual actions already done; ensure the mode pill is prominent).
- (If needed) Add a compact “Outstanding requests” summary near the controls.

**Evidence:** (add screenshot references)

---

## (2) Match between system and the real world
**What to check:** Terminology and behaviour match the mental model of mutual exclusion.

- Uses domain terms: token, critical section, request/release, crash/recover.

**Issues / actions:**
- Add a short help text or tooltip describing Token Ring at a high level (one paragraph).
- Ensure fault controls use clear language (e.g., “Drop token” vs “Token lost”).

**Evidence:** (add screenshot references)

---

## (3) User control and freedom
**What to check:** Users can undo or recover from unwanted actions.

- Reset, Clear trace, Exit script mode are available.
- Crash has a corresponding Recover; token loss has Regenerate token.

**Issues / actions:**
- Consider adding a confirmation for Reset if it is easy to click accidentally.
- Optional: add simple Undo for interactive actions (nice-to-have).

**Evidence:** (add screenshot references)

---

## (4) Consistency and standards
**What to check:** Consistent labels, button placement, interaction patterns.

- Buttons use consistent verb phrases (“Request CS”, “Release CS”, “Crash”, “Recover”).
- Similar controls grouped in fieldsets.

**Issues / actions:**
- Ensure naming is consistent across UI and trace (e.g., “critical section” vs “CS”).
- Ensure scripted/interactive buttons are clearly labelled.

**Evidence:** (add screenshot references)

---

## (5) Error prevention
**What to check:** Prevent invalid operations instead of only reporting errors.

- Disables actions when not applicable (e.g., Release disabled unless in CS; Crash disabled if already crashed).

**Issues / actions:**
- Ensure actions are disabled in script mode to avoid mixed semantics (already covered by logic).
- Consider preventing “Regenerate token” when no processes are alive (edge case).

**Evidence:** (add screenshot references)

---

## (6) Recognition rather than recall
**What to check:** Users should not have to remember state between screens.

- Per-process table shows status and token presence.
- Preview shows token marker and CS owner.

**Issues / actions:**
- Consider adding a small “legend” (e.g., R marker, token dot, CS double-circle, crash X).

**Evidence:** (add screenshot references)

---

## (7) Flexibility and efficiency of use
**What to check:** Efficient for repeated use and demos.

- Run mode supports automatic playback with adjustable speed.
- Scripted demos support repeatable teaching examples.

**Issues / actions:**
- Add keyboard shortcuts for Step/Run/Reset (optional).
- Add a one-click “Load crash demo” button (implemented in v0.2 update if included).

**Evidence:** (add screenshot references)

---

## (8) Aesthetic and minimalist design
**What to check:** Not cluttered; information is relevant.

- Layout is clean and grouped.
- Trace is contained in a scrollable panel.

**Issues / actions:**
- If the process count is high, the table and preview may feel crowded; consider soft limits or UI scaling.
- Consider collapsing advanced controls (faults/export) behind a toggle (optional).

**Evidence:** (add screenshot references)

---

## (9) Help users recognize, diagnose, and recover from errors
**What to check:** Warnings are clear and recovery is obvious.

- Warnings appear in trace (token lost; crash).
- Recovery actions exist (Recover; Regenerate token).

**Issues / actions:**
- When stalled (e.g., token lost), consider a more prominent UI prompt such as “No progress: token lost — regenerate token”.
- Consider highlighting the crashed token holder in the table when token is lost due to crash.

**Evidence:** (add screenshot references)

---

## (10) Help and documentation
**What to check:** Minimal, focused help is available.

**Issues / actions:**
- Add a short “How to use” section (3–6 bullets) and a brief Token Ring explanation.
- Add a small “What to observe” section (mutual exclusion safety, progress, effect of faults).

**Evidence:** (add screenshot references)

---

## Summary of key actions for next iteration
- Add concise help text/legend for symbols and concepts.
- Improve stalled-state guidance (token lost / crash in CS).
- Extend evaluation evidence with updated screenshots and scripted crash demo trace captures.
