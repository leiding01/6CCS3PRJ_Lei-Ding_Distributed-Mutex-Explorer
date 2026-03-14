# Evidence Index — v0.3.2

This file maps the formal test cases executed for the freeze baseline `v0.3.2` to their evidence folders.
Each evidence folder contains one or more raw evidence triplets:

- `*_state.json`
- `*_trace.txt`
- `*_preview.png`

These artefacts support the report claims made in Chapters 5 and 6.

---

## Evidence layout

- `evidence/v0.3.2/TR-01_tokenring_mutex/raw/`
- `evidence/v0.3.2/TR-02_token_loss_regen/raw/`
- `evidence/v0.3.2/TR-03_crash_recover/raw/`
- `evidence/v0.3.2/RA-01_basic/raw/`
- `evidence/v0.3.2/RA-02_tiebreak_p2_p10/raw/`
- `evidence/v0.3.2/RA-03_drop_inflight_stall/raw/`
- `evidence/v0.3.2/RA-04_drop_next_send_stall/raw/`

---

## Manual evidence cases

| Case ID | Algorithm | Mode | Scenario | Fault injected | Expected result | Evidence folder | Report use |
|---|---|---|---|---|---|---|---|
| TR-01 | Token Ring | interactive | Basic mutual exclusion | none | At most one process in the critical section at a time; Safety remains OK | `TR-01_tokenring_mutex/raw/` | Supports Testing summary |
| TR-02 | Token Ring | interactive | Token loss and regeneration | token loss + regenerate | Progress halts until the token is regenerated; Safety remains OK | `TR-02_token_loss_regen/raw/` | Figure 6.1 |
| TR-03 | Token Ring | scripted / interactive | Crash and recover | crash + recover | Crash and recovery are visible in state and trace; progress can resume | `TR-03_crash_recover/raw/` | Figure 6.2 |
| RA-01 | RA | interactive | Basic request / entry / release | none | Entry occurs only after all required REPLY messages are received; Safety remains OK | `RA-01_basic/raw/` | Supports Testing summary |
| RA-02 | RA | scripted | Tie-break under equal timestamps | none | Deterministic winner under equal timestamps (numeric PID tie-break) | `RA-02_tiebreak_p2_p10/raw/` | Figure 6.3 |
| RA-03 | RA | interactive | Drop next in-flight message | drop next in-flight msg | Queue may empty while progress stalls; trace explains missing REPLY; Safety remains OK | `RA-03_drop_inflight_stall/raw/` | Figure 6.4 + trace excerpt |
| RA-04 | RA | interactive | Drop-next-send | drop-next-send | Next outgoing message is dropped; trace explains missing REPLY; Safety remains OK | `RA-04_drop_next_send_stall/raw/` | Figure 6.5 + trace excerpt |

---

## Interpretation notes

### Safety
All evidence cases are expected to preserve the safety invariant:
- at most one process in the critical section at any time.

### Liveness
RA-03 and RA-04 are intentionally designed to demonstrate **liveness failure** under message loss.
These cases should therefore be interpreted as:

- **Safety preserved**
- **Progress intentionally stalled**
- **Educationally valuable because the trace makes the reason explicit**

---

## Report cross-reference

For the curated report figures, see:
- `report/figures/FIGURE_INDEX.md`