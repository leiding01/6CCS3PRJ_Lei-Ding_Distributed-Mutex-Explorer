# Distributed Mutual Exclusion Explorer (Variant 3)

A dependency-free, browser-based interactive tool for learning **Distributed Mutual Exclusion** concepts.
It visualises how *token-based* and *message-based* algorithms enforce exclusive access to a critical section, and how **faults** affect safety and liveness.

This repository is structured as a single artefact (the `index.html` app) plus evaluation and report materials.

---

## What this artefact is

**Technology artefact:** an interactive web simulator/visualiser for distributed mutual exclusion (educational tool).  
**Stack:** plain HTML/CSS/JavaScript (no framework, no external dependencies), runs locally or on GitHub Pages.

---

## Implemented / supported

### Algorithms
- **Token Ring** (implemented)
- **Ricart–Agrawala** (prototype)

### Interactions
- Configure number of processes (small n recommended for teaching clarity)
- Issue **Request CS** / **Release CS**
- Step / Run execution
- Scripted demo replays via JSON scenarios

### Fault injection + recovery (teaching-oriented)
- Token Ring: token loss + token regeneration
- Token Ring / RA: process crash + recover
- Ricart–Agrawala: message faults
  - **Drop next in-flight message** (drops the queue head)
  - **Drop-next-send** (arm/disarm; drops the next outgoing message)

Notes:
- In Ricart–Agrawala, message loss can break **liveness** (progress) while preserving **safety**. This is intentional and used as a teaching point (e.g., “waiting for REPLY from …”).

---

## Quick start (local)

From the repository root:

```bash
python -m http.server 5500
```

Open:

- http://localhost:5500/

Windows users can also run a `.bat` server script if included in the repo.

---

## How to use (typical)

1. Choose an algorithm (Token Ring or Ricart–Agrawala)
2. Set **Processes** (try 3–8 for readability), click **Apply (reset)**
3. Use **Request CS** for one or more processes
4. Click **Step** (or **Run**) to observe token passing or message delivery
5. Use faults to demonstrate:
   - Token loss → no progress → regenerate
   - Crash/recover behaviour
   - RA message drop → stalled waiting for missing REPLY (liveness failure)

---

## Evidence exports (keeping the repo clean)

The tool supports exporting:
- **State JSON**
- **Trace TXT**
- **Preview PNG**
- **Evidence bundle** (JSON + trace + PNG)

Generated exports should go into:

- `report/figures/export/`

This folder is **ignored by git** so the repository stays clean.  
If a figure is referenced in the final report, copy it into:

- `report/figures/`

and reference that curated file instead.

---

## Repository layout

- `index.html` — UI shell
- `mutex_main.js` — UI wiring, rendering, exports
- `mutex_core.js` — algorithm models + step logic (Token Ring + RA prototype)
- `examples/` — scripted demo scenarios (JSON)
- `eval/` — evaluation materials (e.g., heuristics checklist, test plan)
- `report/` — report drafts, figures, and curated evidence

---

## Testing (recommended)

### Manual test plan
See:

- `eval/test_plan.md`

This contains repeatable test cases with expected behaviours (Token Ring safety, token loss/recovery, crash/recover, RA conflict/tiebreak, RA message-loss stall).

### Optional automated smoke tests
If you add the lightweight Node-based smoke tests:

```bash
cd ds-mutex
npm test
```

(Only include this section if your repo actually contains the `package.json` + test runner.)

---

## Versioning and freeze policy (recommended for dissertation evidence)

- Use tags (e.g., `v0.3.1`) to freeze behaviour and exported evidence.
- Only do bug fixes after a freeze; avoid feature churn that invalidates report screenshots/traces.

---

## Licence

Add a licence if required by your course / publication method (e.g., MIT). If not, state “All rights reserved” by default.
