# Formal Test Plan (v0.3.x)

This document defines a **reproducible** test plan for the *Distributed Mutual Exclusion Explorer* (Variant 3).
It is designed to support:
- correctness arguments (especially **mutual exclusion / safety**),
- fault + recovery demonstrations,
- repeatable evidence capture for the final report.

> Scope: UI + core simulation behaviour for Token Ring (implemented) and Ricart–Agrawala (prototype).

---

## 1. Test environment

- Browser: Chrome / Edge latest (desktop).
- Local server: `python -m http.server 5500` (or VS Code Live Server).
- URL: `http://localhost:5500/ds-mutex/index.html`
- Run speed: 350ms (default) unless stated.

---

## 2. Definitions / expected properties

### 2.1 Safety (must hold)
- **Mutual exclusion**: at most one process is in the critical section (CS) at any time.
- Safety indicator in UI should remain **OK** in normal runs.

### 2.2 Liveness (may not hold under faults)
- In fault-free runs, requesting processes should eventually enter CS.
- Under **message loss** (RA), liveness may fail (expected teaching outcome).

---

## 3. Evidence policy

For each test:
1. Capture a short trace segment (copy/paste or export).
2. Export evidence when relevant:
   - **Export evidence (JSON+trace+PNG)**.
3. Use curated PNGs in `report/figures/` (not `report/figures/export/`).

---

## 4. Manual UI test cases

### TR-01: Token Ring — basic mutual exclusion
**Setup**
- Algorithm: Token Ring
- Processes: 4
- Mode: interactive

**Steps**
1. Click `Request CS` on P1.
2. Click `Run` until P1 enters CS (or `Step` until it happens).
3. While P1 is in CS, click `Request CS` on P2.
4. Click `Step` 3–5 times (do not release P1 yet).
5. Confirm P2 does **not** enter CS while P1 is still in CS.
6. Click `Release CS` on P1.
7. Click `Run` / `Step` until P2 enters CS.

**Expected**
- Safety: OK throughout.
- Exactly one process in CS at a time.
- Trace includes entries and token passes.

---

### TR-02: Token Ring — token loss stalls progress, regeneration recovers
**Setup**
- Algorithm: Token Ring
- Processes: 4

**Steps**
1. Click `Drop token`.
2. Click `Request CS` on P1.
3. Click `Step` 2–3 times (no entry should occur).
4. Click `Regenerate token`.
5. Click `Step` / `Run` until P1 enters CS.

**Expected**
- Before regeneration: no progress due to lost token.
- After regeneration: progress resumes and P1 can enter CS.
- Safety: OK.

---

### TR-03: Token Ring — crash + recovery (demonstration)
**Setup**
- Algorithm: Token Ring
- Processes: 4

**Steps**
1. Click `Crash` on the current token holder (commonly P1 after reset).
2. Observe token loss / stalled behaviour.
3. Click `Recover` for the crashed process.
4. Click `Regenerate token`.
5. Click `Request CS` on any live process and confirm the system can progress again.

**Expected**
- Demonstrates fault + recovery path.
- Safety: OK (or clearly explained if crash in CS produces a warning/violation state in your implementation).

---

### RA-01: Ricart–Agrawala — basic request/reply and CS entry
**Setup**
- Algorithm: Ricart–Agrawala
- Processes: 4
- Mode: interactive

**Steps**
1. Click `Request CS` on P1.
2. Click `Step` repeatedly to deliver messages until P1 enters CS.
3. Click `Release CS` on P1.
4. Confirm deferred replies (if any) are sent and the queue drains.

**Expected**
- Trace shows REQUEST broadcast, REPLY messages, and CS entry.
- Safety: OK.

---

### RA-02: Ricart–Agrawala — tie-break by process ID (same timestamp)
**Setup**
- Algorithm: Ricart–Agrawala
- Processes: 2
- Mode: interactive

**Steps**
1. Click `Request CS` on P1.
2. Immediately click `Request CS` on P2.
3. Click `Step` until one process enters CS.

**Expected**
- With same logical timestamp, smaller numeric PID wins: **P1 enters before P2**.
- Safety: OK.
- Trace makes the tie-break visible (or is explained in report).

---

### RA-03: RA fault — Drop next in-flight message (queue head)
**Purpose**
Demonstrate that message loss can break liveness without breaking safety.

**Setup**
- Algorithm: Ricart–Agrawala
- Processes: 4

**Steps**
1. Click `Request CS` on P1.
2. Click `Step` once or twice until queue is non-empty.
3. Click `Drop next in-flight msg`.
4. Continue clicking `Step` until the queue becomes empty.

**Expected**
- Safety: OK.
- If the dropped message was a required REQUEST/REPLY, P1 may never enter CS.
- Trace should explicitly explain who is waiting for whom (stalled reason).

---

### RA-04: RA fault — drop-next-send (drop next outgoing message)
**Setup**
- Algorithm: Ricart–Agrawala
- Processes: 4

**Steps**
1. Click `Arm drop-next-send`.
2. Click `Request CS` on P1.
3. Click `Step` until queue drains.

**Expected**
- Safety: OK.
- Progress may stall due to a missing message.
- Trace clearly states the waiting condition (e.g., “P1 is waiting for REPLY from P2”).

---

## 5. Optional automated smoke tests (recommended)

Run locally:
```bash
cd ds-mutex
npm test
```

This runs `tools/smoke_tests.mjs` (no dependencies) and validates:
- basic mutual exclusion sequences for Token Ring,
- RA tie-break ordering (2 processes),
- RA “drop-next-send” produces a stalled state (expected).

CI runs the same tests via GitHub Actions (see `.github/workflows/ci.yml`).
