# Figures & Evidence Pack (v0.3)

This folder contains screenshots, exported PNG previews, exported traces, and optional exported JSON states used as evidence in the final report.

The goal is that a reader can reproduce every figure by:
1) loading the same scripted scenario,
2) stepping to the specified milestone,
3) exporting the same artefacts (PNG/trace), and
4) capturing a screenshot with a consistent layout.

---

## 1. Recommended folder structure

Keep everything in this folder for report portability:

- `report/figures/`
  - `README.md` (this file)
  - `figures_plan.md` (figure list + captions + where used)
  - `F01_...png` (screenshots used in the report)
  - `F02_...png`
  - `export/` (raw exported artefacts, optional but recommended)
    - `P01_...png` (exported PNG from the tool)
    - `T01_...txt` (exported trace from the tool)
    - `S01_...json` (exported JSON state snapshot)

If you prefer fewer files, you can keep everything in `report/figures/` without the `export/` subfolder.

---

## 2. Naming convention

### 2.1 Report figures (screenshots inserted into the report)
Use:
- `F##_SCENARIO_MILESTONE_VIEW.png`

Examples:
- `F01_tokenring_basic_cs_entry_ui.png`
- `F02_tokenring_crash_regen_ui.png`
- `F03_ra_conflict_defer_queue_ui.png`
- `F04_ra_tiebreak_p2_first_ui.png`

### 2.2 Exported artefacts (reproducibility support)
Use:
- Preview PNG: `P##_SCENARIO_MILESTONE_preview.png`
- Trace text: `T##_SCENARIO_MILESTONE_trace.txt`
- State JSON: `S##_SCENARIO_MILESTONE_state.json`

The tool already exports PNG/trace with timestamps; rename after export for stable report references.

---

## 3. Capture settings (consistency)

- Browser zoom: 100%
- Window size: keep consistent across all screenshots (as close as possible).
- Use PNG for screenshots (not JPEG).
- When a screenshot includes trace text, ensure the trace panel shows the key lines (scroll to bottom before capture).
- For Token Ring, ensure the preview canvas shows the token marker.
- For RA, ensure the message queue table is visible (and the queue is not empty when that is the point of the figure).

---

## 4. Reproducible figure runbook (scripted demos)

The prototype supports scripted demos (JSON) loaded via buttons in the UI.

General rule:
- **Load** only loads the scenario.
- **Step/Run** executes events and produces the trace.

When a milestone says “Step until …”, keep stepping until the trace contains the specified key line(s).

---

### 4.1 Token Ring — Basic behaviour
**Scenario file:** `examples/token_ring_basic.json`  
**Purpose:** demonstrate mutual exclusion, token passing, and a clean enter/release cycle.

**Milestone A — first CS entry**
- Action: Load `Token Ring basic (scripted)` then press Step until the trace shows:
  - `enters the critical section`
- Capture:
  - Screenshot (UI): `F01_tokenring_basic_cs_entry_ui.png`
  - Export preview PNG: `P01_tokenring_basic_cs_entry_preview.png` (Export PNG)
  - Export trace: `T01_tokenring_basic_cs_entry_trace.txt` (Export trace)

**Milestone B — release and token pass**
- Continue stepping until the trace shows:
  - `releases the critical section`
  - `Token passed`
- Capture:
  - `F01b_tokenring_basic_release_ui.png` (optional)
  - `T01b_tokenring_basic_release_trace.txt` (optional)

---

### 4.2 Token Ring — Faults + recovery (crash + token loss + regeneration)
**Scenario file:** `examples/token_ring_crash_demo.json`  
**Purpose:** demonstrate progress blocking and recovery via token regeneration.

**Milestone A — crash causes progress blocked**
- Action: Load crash demo and Step until the trace shows:
  - `crashed`
  - a warning line indicating progress blocked / token lost
- Capture:
  - `F02_tokenring_crash_blocked_ui.png`
  - `T02_tokenring_crash_blocked_trace.txt`
  - `P02_tokenring_crash_blocked_preview.png`

**Milestone B — regeneration restores progress**
- Step until the trace shows:
  - `token regenerated`
  - then a later `enters the critical section` (or another progress indicator)
- Capture:
  - `F02b_tokenring_crash_regen_ui.png` (recommended if it is a different state)
  - `T02b_tokenring_crash_regen_trace.txt`

---

### 4.3 Ricart–Agrawala — Conflict and deferral
**Scenario file:** `examples/ra_conflict_demo.json`  
**Purpose:** show REQUEST/REPLY flow, message queue visibility, and deferred replies.

**Milestone A — after both requests (queue non-empty)**
- Action: Load RA conflict demo and Step until the trace shows:
  - broadcasts REQUEST lines for both processes (or at least the first)
- Capture:
  - `F03_ra_conflict_requests_ui.png`
  - Ensure the message queue table shows entries (queue > 0).

**Milestone B — deferral becomes visible**
- Step until the trace contains:
  - `defers REPLY` (or equivalent)
- Capture:
  - `F03_ra_conflict_defer_ui.png`
  - Include message queue table + trace in the screenshot.

**Milestone C — sequential CS entry**
- Step until the trace shows:
  - `enters the critical section` for the first process
- Then Step until the second process later enters (after release and deferred replies).
- Capture (at least one):
  - `F03b_ra_conflict_cs_entry_ui.png`
  - `T03b_ra_conflict_cs_entry_trace.txt`

---

### 4.4 Ricart–Agrawala — Tie-break correctness (P2 vs P10)
**Scenario file:** `examples/ra_tiebreak_p2_p10.json`  
**Purpose:** demonstrate correct numeric PID tie-break (P2 enters CS before P10).

**Milestone A — scenario loaded**
- Load the tie-break demo.
- Confirm:
  - mode pill shows `script`
  - processes list is exactly `P2` and `P10`
- Capture:
  - `F04_ra_tiebreak_loaded_ui.png` (optional; useful as evidence of setup)

**Milestone B — P2 enters CS first**
- Step until the trace shows:
  - `P2 enters the critical section` appears before any `P10 enters ...`
- Capture:
  - `F04_ra_tiebreak_p2_first_ui.png`
  - `T04_ra_tiebreak_p2_first_trace.txt`

**Milestone C — P10 enters after P2 release**
- Continue stepping until:
  - `P2 releases ...`
  - later `P10 enters ...`
- Capture:
  - `F04b_ra_tiebreak_p10_after_ui.png` (optional)

---

## 5. What to insert into the report

Minimum recommended set (high signal, low noise):
- 1 figure for Token Ring basic CS entry
- 1 figure for Token Ring crash → blocked
- 1 figure for Token Ring regeneration → progress restored
- 1 figure for RA conflict → deferral + message queue visible
- 1 figure for RA tie-break (P2 enters first)

For each, keep a matching exported trace text in `export/` so you can quote 1–2 lines (not entire logs) as supporting evidence.

---

## 6. Quick reproducibility checklist (before submission)

- Every figure file name appears exactly once in `figures_plan.md`.
- For every report figure `F##...`, there is at least one supporting trace export `T##...`.
- For each scenario used in the report, the JSON demo file is committed under `examples/`.
- Captions in the report match what the figure actually shows (algorithm + milestone).
