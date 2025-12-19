# Evaluation Plan — Distributed Mutual Exclusion Explorer (v0.3)

## 1. Goals
Evaluate the prototype along three dimensions:
1) **Correctness** (safety + expected behaviour under faults)  
2) **Usability** (learners can operate the tool and understand states)  
3) **Pedagogical clarity** (learners can explain why outcomes occur)

## 2. Correctness evaluation
### 2.1 Safety invariant
- Mutual exclusion: at most one process in the critical section at any time.
- Evidence:
  - Scripted demos should never violate safety.
  - Interactive exploration should not allow invalid transitions.

### 2.2 Scenario-based validation (regression-style)
Maintain a small set of canonical scripted demos:
- Token Ring basic: request → enter CS → release → token pass
- Token Ring crash/recovery: crash holder / crash in CS; regenerate token; recover process
- RA conflict: concurrent requests; deferral; sequential CS entry
- RA tie-break: P2 vs P10; numeric PID ordering; P2 enters first
- RA message loss: drop next message and observe blocked progress (document limitation)

For each demo:
- Save screenshots of:
  - process table
  - message queue (RA)
  - trace excerpt showing key events
  - preview canvas
- Save exported PNG for the report figure folder.

## 3. Usability evaluation
### 3.1 Heuristic walkthrough
Perform a Nielsen-style heuristic review and record:
- issue description
- severity (0–4)
- evidence screenshot
- fix commit/notes

### 3.2 Optional SUS
If participants are available (even 3–5), run a short session:
- Tasks (5–7 minutes):
  1) Load RA conflict demo and explain why a reply is deferred.
  2) Trigger a fault (drop a message) and describe what blocks progress.
  3) Load Token Ring crash demo and recover progress using regeneration.
- Collect SUS and one open-ended comment.

## 4. Pedagogical clarity checks
Observation prompts:
- “Who holds the resource right now?”
- “Why is P2 still requesting?”
- “What must happen for the system to make progress under this fault?”
Record whether the UI supports accurate answers using the trace + message queue + preview.

## 5. Reporting
In the final report:
- Present correctness evidence via scenario traces.
- Summarise usability findings and changes made.
- Discuss limitations (fault models and assumptions) and future improvements.
