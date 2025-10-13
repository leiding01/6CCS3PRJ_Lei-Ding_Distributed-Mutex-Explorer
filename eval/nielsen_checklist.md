# Nielsen Heuristic Checklist — FSM Educational Tool (v0.2)

Mark each item: ✔ Satisfied / △ Partially satisfied / ✖ Issue found  
Add one sentence of evidence and (optionally) a screenshot reference from `report/figures/`.

1. **Visibility of system status** — ✔  
   - After *Run/Step* the tool shows **ACCEPT/REJECT**, highlights the current state, and displays a textual **trace**.  
   - Evidence: `figures/status-visible.png`

2. **Match between system and the real world** — ✔  
   - Uses standard terminology: *state*, *transition*, *start*, *accept*; DFA rules enforced.  
   - Evidence: `figures/real-world-terms.png`

3. **User control and freedom** — △  
   - Provides **Reset** and **Undo** for common actions. Redo is not implemented.  
   - Improvement: add Redo and multi-step history (optional).  
   - Evidence: `figures/reset-undo.png`

4. **Consistency and standards** — ✔  
   - Button labels and behaviour are consistent (Add / Delete / Run / Step / Export).  
   - Evidence: `figures/consistency.png`

5. **Error prevention** — ✔  
   - Prevents duplicate DFA transitions for the same *(state, symbol)*; invalid JSON import is rejected with a clear message.  
   - Evidence: `figures/error-prevention.png`

6. **Recognition rather than recall** — ✔  
   - Start/accept states are visible in lists; the current state is highlighted; the trace shows the path explicitly.  
   - Evidence: `figures/highlight-trace.png`

7. **Flexibility and efficiency of use** — △  
   - No keyboard shortcuts yet; no batch import. Templates/examples are provided.  
   - Improvement: add shortcuts (e.g., Ctrl+Z), quick-add patterns.  
   - Evidence: `figures/flexibility.png`

8. **Aesthetic and minimalist design** — ✔  
   - Clean layout; only essential controls are shown. Preview uses a simple circular layout.  
   - Evidence: `figures/minimal.png`

9. **Help users recognise, diagnose, and recover from errors** — ✔  
   - Missing transition shows a concrete message *(No transition for (q, 'a'))*; **Undo** helps recovery.  
   - Evidence: `figures/error-diagnose.png`

10. **Help and documentation** — △  
   - Basic instructions are present; **README.md** explains JSON schema and how to run.  
   - Improvement: add a short “Quick Start” card in the UI (optional).  
   - Evidence: `figures/help-docs.png`

**Reviewer:** Lei Ding (Kxxxxxxx)  
**Date:** 13/10/2025
