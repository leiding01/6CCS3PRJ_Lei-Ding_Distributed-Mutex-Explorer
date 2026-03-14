# Figure Index — Final Report Figures

This file maps each curated report figure to its corresponding evidence case and raw evidence folder.

## Figure-to-evidence mapping

### Figure 4.1
- **File:** `fig_ui_overview.png`
- **Used in:** Chapter 4 (Implementation)
- **Purpose:** UI overview / architecture-in-use screenshot
- **Source:** final interface overview captured from the stable artefact state
- **Evidence note:** this figure is illustrative rather than tied to one specific manual fault case

---

### Figure 6.1
- **File:** `fig_tr_token_lost.png`
- **Used in:** Chapter 6 (Evaluation)
- **Case ID:** `TR-02`
- **Purpose:** demonstrate Token Ring token-loss behaviour and halted progress
- **Raw evidence folder:** `evidence/v0.3.2/TR-02_token_loss_regen/raw/`

### Figure 6.2
- **File:** `fig_tr_crash_recover.png`
- **Used in:** Chapter 6 (Evaluation)
- **Case ID:** `TR-03`
- **Purpose:** demonstrate crash/recover behaviour in Token Ring
- **Raw evidence folder:** `evidence/v0.3.2/TR-03_crash_recover/raw/`

### Figure 6.3
- **File:** `fig_ra_tiebreak.png`
- **Used in:** Chapter 6 (Evaluation)
- **Case ID:** `RA-02`
- **Purpose:** show deterministic tie-break under equal timestamps
- **Raw evidence folder:** `evidence/v0.3.2/RA-02_tiebreak_p2_p10/raw/`

### Figure 6.4
- **File:** `fig_ra_drop_inflight_stall.png`
- **Used in:** Chapter 6 (Evaluation)
- **Case ID:** `RA-03`
- **Purpose:** show stalled global state after dropping an in-flight message
- **Raw evidence folder:** `evidence/v0.3.2/RA-03_drop_inflight_stall/raw/`
- **Interpretation note:** must be read together with the trace excerpt in the text to identify the missing REPLY dependency

### Figure 6.5
- **File:** `fig_ra_drop_next_send_stall.png`
- **Used in:** Chapter 6 (Evaluation)
- **Case ID:** `RA-04`
- **Purpose:** show stalled global state after send-side message loss
- **Raw evidence folder:** `evidence/v0.3.2/RA-04_drop_next_send_stall/raw/`
- **Interpretation note:** must be read together with the trace excerpt in the text to identify the missing REPLY dependency