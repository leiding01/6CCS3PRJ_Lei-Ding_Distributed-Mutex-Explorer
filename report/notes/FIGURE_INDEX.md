# Figure–Evidence Mapping (v0.3.2)

This file links **curated report figures** in `report/figures/` to the corresponding **evidence cases** under `evidence/v0.3.2/`.

For full evidence triplets (state JSON + trace TXT + preview PNG) and test-case descriptions, see:
- `evidence/v0.3.2/EVIDENCE_INDEX.md`

---

## Curated figures → evidence cases

- `fig_tr_token_lost.png` → **TR-02** → `evidence/v0.3.2/TR-02_token_loss_regen/raw/fig_tr_token_lost.png`
- `fig_tr_crash_recover.png` → **TR-03** → `evidence/v0.3.2/TR-03_crash_recover/raw/fig_tr_crash_recover.png`
- `fig_ra_tiebreak.png` → **RA-02** → `evidence/v0.3.2/RA-02_tiebreak_p2_p10/raw/fig_ra_tiebreak.png`
- `fig_ra_drop_inflight_stall.png` → **RA-03** → `evidence/v0.3.2/RA-03_drop_inflight_stall/raw/fig_ra_drop_inflight_stall.png`
- `fig_ra_drop_next_send_stall.png` → **RA-04** → `evidence/v0.3.2/RA-04_drop_next_send_stall/raw/fig_re_drop_next_send_stall.png`

---

## Sanity checks (recommended)

1) Each figure above should have a matching evidence case folder and supporting `*_state.json` + `*_trace.txt`.
2) Avoid duplicates: the RA-03 and RA-04 figures should not be identical screenshots.
