# Usability / Pedagogical Clarity Tasks (v0.3)

This is a lightweight task script for usability testing or an instructor-led walkthrough.
It can be used with SUS (optional) or as structured self-evaluation evidence when participants are limited.

---

## Session setup (2 minutes)
- Open the tool in a modern browser (Chrome/Edge/Firefox).
- Ensure browser zoom is 100%.
- Explain the UI:
  - Process table shows status (idle/requesting/in CS/crashed).
  - Token Ring uses token ownership.
  - RA uses message queue (REQUEST/REPLY) and a trace log.
  - Step delivers one “unit of progress” (token pass, state change, or one message delivery).

Data to record (minimal):
- time to complete each task,
- errors/confusions,
- one sentence explaining “why” the outcome happened.

---

## Task 1 — Token Ring baseline: identify resource holder
**Goal:** verify the participant can interpret token ownership and CS entry.

1) Click “Load example (scripted)” for Token Ring basic.
2) Press Step until you see “enters the critical section” in the trace.
3) Answer:
   - Which process is in the critical section?
   - Who holds the token?
   - What action is required to allow the next process to enter?

Success criteria:
- Correctly identifies in-CS process and token holder from UI.

---

## Task 2 — Token Ring faults: progress blocked and recovery
**Goal:** verify the participant understands fault impact and recovery assumption.

1) Load “crash demo (scripted)”.
2) Step until the trace indicates crash and progress blocked / token lost.
3) Answer:
   - Why is progress blocked?
   - What recovery action is available in the model?

(Optional interactive extension)
4) Exit script mode.
5) In interactive mode, inject faults:
   - crash a process and drop token,
   - regenerate token,
   - step until progress resumes.
6) Explain in one sentence what the regeneration does.

Success criteria:
- Correctly describes “token lost / crash” as the reason for blocking and identifies regeneration as recovery.

---

## Task 3 — Ricart–Agrawala conflict: explain deferral
**Goal:** verify the participant can use message queue + trace to explain RA behaviour.

1) Select algorithm “Ricart–Agrawala (prototype)”.
2) Load “RA conflict demo (scripted)”.
3) Step until you observe a “defers REPLY” line in the trace.
4) Answer:
   - Which process deferred a reply, and to whom?
   - Why is that reply deferred (in plain words)?
   - What must happen before the waiting process can enter the critical section?

Success criteria:
- Identifies deferral and explains it as a mechanism to preserve mutual exclusion.

---

## Task 4 — Ricart–Agrawala tie-break: verify ordering (P2 vs P10)
**Goal:** verify the participant can interpret tie-break and trust correctness.

1) Load “RA tiebreak demo (scripted)”.
2) Step until a process enters the critical section.
3) Answer:
   - Which enters first, P2 or P10?
   - What is the tie-break rule (timestamp then PID)?
   - What evidence in the trace supports your answer?

Success criteria:
- States that P2 enters first, and points to trace evidence.

---

## Optional SUS (System Usability Scale)
If you run SUS:
- Have the participant complete SUS after tasks 1–4.
- Keep session under 10–12 minutes.

Report note:
- Even 3–5 participants can provide useful formative feedback; if participants are unavailable, document a structured self-evaluation using this script.

---

## Common pitfalls to watch for (record if observed)
- Confusion between “token holder” and “in CS”
- Not understanding that “Load” does not execute events until Step/Run
- Not noticing that Drop-next-message is disabled when queue is empty (good safeguard)
- Difficulty connecting “defer reply” to “why only one process can enter”
